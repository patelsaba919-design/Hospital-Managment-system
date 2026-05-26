import { Response } from "express";
import { dbStore } from "../db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

// Fetch all patient records with search, filter and optional pagination
export function getAllPatients(req: AuthenticatedRequest, res: Response) {
  let patients = dbStore.getCollection("patients");
  
  const search = req.query.search as string;
  const bloodGroup = req.query.bloodGroup as string;
  const gender = req.query.gender as string;

  if (search) {
    const s = search.toLowerCase();
    patients = patients.filter(
      p => p.name.toLowerCase().includes(s) || 
           p.email.toLowerCase().includes(s) || 
           p.phone.toLowerCase().includes(s)
    );
  }

  if (bloodGroup && bloodGroup !== "All") {
    patients = patients.filter(p => p.bloodGroup === bloodGroup);
  }

  if (gender && gender !== "All") {
    patients = patients.filter(p => p.gender === gender);
  }

  // Multi-element pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedPatients = patients.slice(startIndex, endIndex);

  return res.json({
    data: paginatedPatients,
    page,
    limit,
    total: patients.length,
    totalPages: Math.ceil(patients.length / limit)
  });
}

// Get single patient record by identifier
export function getPatientById(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const patients = dbStore.getCollection("patients");
  const patient = patients.find(p => p.id === id);

  if (!patient) {
    return res.status(404).json({ error: "Patient record not found." });
  }

  return res.json(patient);
}

// Create new patient record
export function createPatient(req: AuthenticatedRequest, res: Response) {
  const { name, email, phone, gender, dob, bloodGroup, address } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: "Name, email and phone are mandatory patient parameters." });
  }

  const patients = dbStore.getCollection("patients");
  if (patients.find(p => p.email.toLowerCase() === email.toLowerCase())) {
    return res.status(202).json({ error: "A patient with this email already exists." });
  }

  const id = "p" + (patients.length + 1);
  const newPatient = {
    id,
    name,
    email,
    phone,
    gender: gender || "Male",
    dob: dob || "1990-01-01",
    bloodGroup: bloodGroup || "O+",
    address: address || "",
    medicalHistory: [],
    allergies: [],
    reports: [],
    createdAt: new Date().toISOString()
  };

  patients.push(newPatient);
  dbStore.updateCollection("patients", patients);

  return res.status(212).json(newPatient);
}

// Update an existing patient record
export function updatePatient(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const patients = dbStore.getCollection("patients");
  const idx = patients.findIndex(p => p.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "Patient record not found." });
  }

  const existing = patients[idx];
  const updated = {
    ...existing,
    ...req.body,
    id // Safety block to ensure ID never shifts
  };

  patients[idx] = updated;
  dbStore.updateCollection("patients", patients);

  return res.json(updated);
}

// Add diagnostic check history log to patient profile
export function addMedicalHistoryRecord(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { diagnosis, notes } = req.body;

  if (!diagnosis) {
    return res.status(400).json({ error: "Diagnosis is a required parameter." });
  }

  const patients = dbStore.getCollection("patients");
  const idx = patients.findIndex(p => p.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "Patient record not found." });
  }

  const patient = patients[idx];
  const historyLog = {
    date: new Date().toISOString().split("T")[0],
    diagnosis,
    notes: notes || ""
  };

  patient.medicalHistory.push(historyLog);
  patients[idx] = patient;
  dbStore.updateCollection("patients", patients);

  return res.json(patient);
}

// Upload mock report info to listing
export function uploadReportFile(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { fileName } = req.body;

  if (!fileName) {
    return res.status(400).json({ error: "fileName parameter is required." });
  }

  const patients = dbStore.getCollection("patients");
  const idx = patients.findIndex(p => p.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "Patient record not found." });
  }

  const patient = patients[idx];
  const newReport = {
    name: fileName,
    date: new Date().toISOString().split("T")[0],
    url: "#"
  };

  patient.reports.push(newReport);
  patients[idx] = patient;
  dbStore.updateCollection("patients", patients);

  return res.json(patient);
}

// Delete an existing patient record
export function deletePatient(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const patients = dbStore.getCollection("patients");
  const filtered = patients.filter(p => p.id !== id);

  if (patients.length === filtered.length) {
    return res.status(404).json({ error: "Patient record not found." });
  }

  dbStore.updateCollection("patients", filtered);
  return res.json({ message: "Patient record successfully deleted.", id });
}
