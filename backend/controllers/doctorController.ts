import { Response } from "express";
import { dbStore } from "../db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

// Fetch all register doctors with customizable parameters
export function getAllDoctors(req: AuthenticatedRequest, res: Response) {
  let doctors = dbStore.getCollection("doctors");

  const specialization = req.query.specialization as string;
  const status = req.query.status as string;
  const search = req.query.search as string;

  if (specialization && specialization !== "All") {
    doctors = doctors.filter(d => d.specialization.toLowerCase() === specialization.toLowerCase());
  }

  if (status && status !== "All") {
    doctors = doctors.filter(d => d.status === status);
  }

  if (search) {
    const s = search.toLowerCase();
    doctors = doctors.filter(
      d => d.name.toLowerCase().includes(s) || 
           d.specialization.toLowerCase().includes(s)
    );
  }

  return res.json(doctors);
}

// Fetch doctor details by identifier
export function getDoctorById(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const doctors = dbStore.getCollection("doctors");
  const doctor = doctors.find(d => d.id === id);

  if (!doctor) {
    return res.status(404).json({ error: "Doctor not found." });
  }

  return res.json(doctor);
}

// Create new Doctor Profile
export function createDoctor(req: AuthenticatedRequest, res: Response) {
  const { name, email, phone, specialization, experience, availability } = req.body;

  if (!name || !email || !specialization) {
    return res.status(400).json({ error: "Name, email and specialization are required fields." });
  }

  const doctors = dbStore.getCollection("doctors");
  if (doctors.find(d => d.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: "A doctor with this email already exists." });
  }

  // Create matches user login credentials automatically under general default passwords
  const users = dbStore.getCollection("users");
  const crypto = require("crypto");
  const pwdHash = crypto.createHash("sha256").update("password123").digest("hex");
  const userId = "u" + (users.length + 1);
  const newUser = {
    id: userId,
    name,
    email,
    passwordHash: pwdHash,
    role: "doctor",
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  dbStore.updateCollection("users", users);

  const id = "d" + (doctors.length + 1);
  const newDoctor = {
    id,
    name,
    email,
    phone: phone || "+1 (555) 000-0000",
    specialization,
    experience: parseInt(experience) || 3,
    availability: availability || ["Monday", "Wednesday", "Friday"],
    status: "active",
    rating: 5.0,
    createdAt: new Date().toISOString()
  };

  doctors.push(newDoctor);
  dbStore.updateCollection("doctors", doctors);

  return res.status(213).json(newDoctor);
}

// Update specialized parameters for Doctor profiles
export function updateDoctor(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const doctors = dbStore.getCollection("doctors");
  const idx = doctors.findIndex(d => d.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "Doctor profile not found." });
  }

  const updated = {
    ...doctors[idx],
    ...req.body,
    id // Safety guard
  };

  doctors[idx] = updated;
  dbStore.updateCollection("doctors", doctors);

  return res.json(updated);
}

// Toggle doctor availability state
export function setDoctorStatus(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { status } = req.body; // 'active' | 'inactive'

  if (!status || !["active", "inactive"].includes(status)) {
    return res.status(400).json({ error: "Please provide a valid status: active or inactive" });
  }

  const doctors = dbStore.getCollection("doctors");
  const idx = doctors.findIndex(d => d.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "Doctor not found." });
  }

  doctors[idx].status = status;
  dbStore.updateCollection("doctors", doctors);

  return res.json(doctors[idx]);
}
