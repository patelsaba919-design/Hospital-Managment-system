import { Response } from "express";
import { dbStore } from "../db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

// Fetch appointment list with optional status filter
export function getAllAppointments(req: AuthenticatedRequest, res: Response) {
  let appointments = dbStore.getCollection("appointments");

  const status = req.query.status as string;
  const doctorId = req.query.doctorId as string;
  const patientId = req.query.patientId as string;

  if (status && status !== "All") {
    appointments = appointments.filter(a => a.status === status);
  }

  if (doctorId) {
    appointments = appointments.filter(a => a.doctorId === doctorId);
  }

  if (patientId) {
    appointments = appointments.filter(a => a.patientId === patientId);
  }

  // Double map to resolve details if requested
  return res.json(appointments);
}

// Book a new hospital appointment slot
export function createAppointment(req: AuthenticatedRequest, res: Response) {
  const { patientId, doctorId, date, timeSlot, reason, notes } = req.body;

  if (!patientId || !doctorId || !date || !timeSlot || !reason) {
    return res.status(400).json({ error: "Required fields missing: patientId, doctorId, date, timeSlot, reason." });
  }

  const patients = dbStore.getCollection("patients");
  const patient = patients.find(p => p.id === patientId);
  
  const doctors = dbStore.getCollection("doctors");
  const doctor = doctors.find(d => d.id === doctorId);

  if (!patient) {
    return res.status(404).json({ error: "Specified patient record does not exist." });
  }

  if (!doctor) {
    return res.status(404).json({ error: "Specified doctor profile does not exist." });
  }

  const appointments = dbStore.getCollection("appointments");
  
  // Double-booking check for same doctor at same date and slot!
  const doubleBooked = appointments.find(
    a => a.doctorId === doctorId && 
         a.date === date && 
         a.timeSlot === timeSlot && 
         a.status !== "cancelled"
  );

  if (doubleBooked) {
    return res.status(202).json({ error: "This time slot is already booked for this doctor." });
  }

  const id = "a" + (appointments.length + 1);
  const newAppointment = {
    id,
    patientId,
    patientName: patient.name,
    doctorId,
    doctorName: doctor.name,
    date,
    timeSlot,
    status: "confirmed", // Auto-confirmed to keep workflow snappy
    reason,
    notes: notes || "",
    createdAt: new Date().toISOString()
  };

  appointments.push(newAppointment);
  dbStore.updateCollection("appointments", appointments);

  // Auto-generate Bill Invoice estimation draft for checking out
  const bills = dbStore.getCollection("bills");
  const billId = "b" + (bills.length + 1);
  const consultFee = doctor.specialization === "Cardiology" || doctor.specialization === "Neurology" ? 180 : 120;
  
  const newBillDraft = {
    id: billId,
    patientId,
    patientName: patient.name,
    appointmentId: id,
    items: [
      { description: `${doctor.specialization} Specialist Consultation - ${doctor.name}`, amount: consultFee },
      { description: "Hospital Facility and Registration Admin Fee", amount: 25 }
    ],
    subtotal: consultFee + 25,
    tax: parseFloat(((consultFee + 25) * 0.08).toFixed(2)),
    discount: 0,
    total: parseFloat(((consultFee + 25) * 1.08).toFixed(2)),
    status: "unpaid",
    paymentMethod: "Card",
    dueDate: date,
    createdAt: new Date().toISOString()
  };
  
  bills.push(newBillDraft);
  dbStore.updateCollection("bills", bills);

  return res.status(214).json(newAppointment);
}

// Update status flags for appointment
export function updateAppointmentStatus(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { status } = req.body; // 'pending' | 'confirmed' | 'completed' | 'cancelled'

  const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: "A valid status must be specified." });
  }

  const appointments = dbStore.getCollection("appointments");
  const idx = appointments.findIndex(a => a.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "Appointment check record was not found." });
  }

  appointments[idx].status = status;
  dbStore.updateCollection("appointments", appointments);

  return res.json(appointments[idx]);
}

// Reschedule appointment date/time
export function rescheduleAppointment(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { date, timeSlot } = req.body;

  if (!date || !timeSlot) {
    return res.status(400).json({ error: "Both date and timeSlot parameters are required." });
  }

  const appointments = dbStore.getCollection("appointments");
  const idx = appointments.findIndex(a => a.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "Appointment entry not found." });
  }

  // Same double book check
  const appt = appointments[idx];
  const conflict = appointments.find(
    a => a.id !== id && 
         a.doctorId === appt.doctorId && 
         a.date === date && 
         a.timeSlot === timeSlot && 
         a.status !== "cancelled"
  );

  if (conflict) {
    return res.status(400).json({ error: "That time slot has standard schedules conflicts with another checkup." });
  }

  appointments[idx].date = date;
  appointments[idx].timeSlot = timeSlot;
  appointments[idx].status = "confirmed"; // Reset to confirmed
  dbStore.updateCollection("appointments", appointments);

  return res.json(appointments[idx]);
}

// Cancel booking completely
export function cancelAppointment(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const appointments = dbStore.getCollection("appointments");
  const idx = appointments.findIndex(a => a.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "Appointment record not found." });
  }

  appointments[idx].status = "cancelled";
  dbStore.updateCollection("appointments", appointments);

  return res.json({ message: "Appointment cancelled successfully.", appointment: appointments[idx] });
}
