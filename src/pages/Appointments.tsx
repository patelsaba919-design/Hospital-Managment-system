import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { 
  Plus, 
  Calendar, 
  X, 
  Check, 
  Clock, 
  Video, 
  AlertCircle,
  CalendarDays,
  User,
  PlusSquare,
  Activity,
  FileSpreadsheet
} from "lucide-react";
import { Appointment, Doctor, Patient } from "../types.js";

export default function Appointments() {
  const { user, apiFetch } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  
  const [statusFilter, setStatusFilter] = useState("All");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form Booking parameters
  const [bookPatId, setBookPatId] = useState("");
  const [bookDocId, setBookDocId] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [bookTime, setBookTime] = useState("09:00 AM");
  const [bookReason, setBookReason] = useState("");
  const [bookNotes, setBookNotes] = useState("");

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadData = async () => {
    try {
      const url = statusFilter === "All" ? "/api/appointments" : `/api/appointments?status=${statusFilter}`;
      const appts = await apiFetch(url);
      setAppointments(appts);

      const docs = await apiFetch("/api/doctors?status=active");
      setDoctors(docs);

      if (user?.role === "admin" || user?.role === "doctor") {
        const pts = await apiFetch("/api/patients");
        setPatients(pts.data);
      }
    } catch (err: any) {
      triggerToast(err.message || "Failed retrieving scheduled appointments.");
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Resolve patientId if logged as patient
    const patientIdResolved = user?.role === "patient" ? "p1" : bookPatId; // Default fallback index
    
    if (!patientIdResolved || !bookDocId || !bookDate || !bookTime || !bookReason) {
      return triggerToast("All parameters are mandatory to schedule an appointment slots.");
    }

    const payload = {
      patientId: patientIdResolved,
      doctorId: bookDocId,
      date: bookDate,
      timeSlot: bookTime,
      reason: bookReason,
      notes: bookNotes
    };

    try {
      const response = await apiFetch("/api/appointments", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (response.error) {
        triggerToast(`Conflict: ${response.error}`);
      } else {
        triggerToast("Appointment scheduled and draft invoice generated!");
        setIsFormOpen(false);
        setBookReason("");
        setBookNotes("");
        loadData();
      }
    } catch (err: any) {
      triggerToast(err.message || "Conflict registering booking slots.");
    }
  };

  const handleStatusChange = async (id: string, nextStatus: string) => {
    try {
      await apiFetch(`/api/appointments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus })
      });
      triggerToast(`Appointment record is now: ${nextStatus}!`);
      loadData();
    } catch (err: any) {
      triggerToast(err.message || "Status change failed.");
    }
  };

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-100 p-1 md:p-6 select-none relative">
      
      {/* Toast Alert popup popup */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 px-5 py-3.5 rounded-xl bg-slate-900 border border-emerald-500/25 text-emerald-400 font-bold text-xs shadow-2xl flex items-center gap-2.5 z-50 animate-slide-in">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Active Appointments Board</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Comprehensive Clinic Schedule Managers</p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4.5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Book Appointment Slot</span>
        </button>
      </div>

      {/* Filter tab buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80">
          {["All", "pending", "confirmed", "completed", "cancelled"].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4.5 py-2 rounded-lg text-xs font-bold capitalize transition-all
                ${statusFilter === st 
                  ? "bg-slate-800 text-emerald-400" 
                  : "text-slate-500 hover:text-slate-300"}`}
            >
              {st}
            </button>
          ))}
        </div>

        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
          Double-Booking Prevention Engine Active
        </span>
      </div>

      {/* Appointment schedules lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.length > 0 ? (
          appointments.map(appt => (
            <div 
              key={appt.id} 
              className={`bg-slate-900 border rounded-2xl p-5.5 space-y-4 group hover:scale-[1.012] hover:shadow-lg transition-all duration-300 relative overflow-hidden
                ${appt.status === "cancelled" ? "border-slate-850 opacity-50" : "border-slate-800 hover:border-slate-700"}`}
            >
              {/* Colored tag based on triage status */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 
                ${appt.status === "confirmed" ? "bg-emerald-500" : 
                  appt.status === "pending" ? "bg-amber-500" : 
                  appt.status === "completed" ? "bg-indigo-500" : "bg-red-500"}`} 
              />

              <div className="flex items-start justify-between pb-3 border-b border-slate-800/80">
                <div>
                  <h4 className="text-xs text-slate-500 font-extrabold uppercase tracking-widest select-all">Invoice Reference: {appt.id}</h4>
                  <p className="text-sm font-bold text-slate-100 mt-1 truncate">{appt.patientName}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Treated by: {appt.doctorName}</p>
                </div>

                <span className={`text-[9px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-lg border
                  ${appt.status === "confirmed" ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/25 animate-pulse" : 
                    appt.status === "pending" ? "text-amber-400 bg-amber-500/5 border-amber-500/25" : 
                    appt.status === "completed" ? "text-indigo-400 bg-indigo-500/5 border-indigo-500/25" : "text-red-400 bg-red-400/5 border-red-400/25"}`}
                >
                  {appt.status}
                </span>
              </div>

              {/* Schedules slot metadata */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl text-xs">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block">Calendar Date</span>
                  <span className="text-slate-300 font-medium block mt-0.5">{appt.date}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block">Triage Slot</span>
                  <span className="text-slate-300 font-medium block mt-0.5">{appt.timeSlot}</span>
                </div>
              </div>

              {/* Consultation Symptoms details */}
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block mb-1">Symptoms Narrative</span>
                <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/50 leading-relaxed truncate">{appt.reason}</p>
              </div>

              {/* State Controls Actions */}
              {appt.status !== "cancelled" && appt.status !== "completed" && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  
                  {/* Doctor or staff may mark treatment complete */}
                  {(user?.role === "admin" || user?.role === "doctor") && (
                    <button
                      onClick={() => handleStatusChange(appt.id, "completed")}
                      className="flex-1 py-2 px-3 border border-indigo-500/25 hover:bg-indigo-500/5 hover:border-indigo-500 text-indigo-400 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Complete check</span>
                    </button>
                  )}

                  {/* Anyone can cancel */}
                  <button
                    onClick={() => handleStatusChange(appt.id, "cancelled")}
                    className="py-2 px-3 border border-red-500/15 hover:bg-red-500/5 text-red-400 hover:text-red-300 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel booking</span>
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
            <CalendarDays className="w-12 h-12 text-slate-800 mx-auto" />
            <p className="text-slate-400 text-sm mt-4 font-semibold">No active clinic booking records matched.</p>
          </div>
        )}
      </div>

      {/* MODAL: APPOINTMENT SCHEDULER FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-2xl space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <PlusSquare className="w-5 h-5 text-emerald-400" />
              <span>Book Appointment Slot</span>
            </h3>

            <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
              
              {/* Patient Selector (Admin or Doctor) */}
              {user?.role !== "patient" ? (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Select Inpatient profile *</label>
                  <select
                    required
                    value={bookPatId}
                    onChange={(e) => setBookPatId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-emerald-500 bg-slate-950"
                  >
                    <option value="">-- Choose patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">BOOKING ACCOUNT PATIENT</span>
                  <span className="font-bold text-slate-300 block mt-1">{user?.name} (Medical Card O+)</span>
                </div>
              )}

              {/* Specialist Clinician Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Select active clinician specialist *</label>
                <select
                  required
                  value={bookDocId}
                  onChange={(e) => setBookDocId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-emerald-500 bg-slate-950"
                >
                  <option value="">-- Choose Doctor Specialists --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} -- Specialist {d.specialization}</option>
                  ))}
                </select>
              </div>

              {/* Date and Slot */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Calendar Date *</label>
                  <input
                    type="date"
                    required
                    value={bookDate}
                    onChange={(e) => setBookDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-emerald-500 bg-slate-950 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Triage Slot *</label>
                  <select
                    value={bookTime}
                    onChange={(e) => setBookTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-emerald-500 bg-slate-950"
                  >
                    {timeSlots.map(ts => <option key={ts} value={ts}>{ts}</option>)}
                  </select>
                </div>
              </div>

              {/* Symptom Reason text line */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Symptoms Narrative *</label>
                <input
                  type="text"
                  required
                  value={bookReason}
                  onChange={(e) => setBookReason(e.target.value)}
                  placeholder="e.g. Recurrent midnight heart palpitations, skin allergies"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4.5 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold uppercase tracking-wider hover:scale-[1.01] transition-all"
                >
                  Confirm Reservation Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
