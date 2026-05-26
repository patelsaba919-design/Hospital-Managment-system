import { Response } from "express";
import { dbStore } from "../db.js";
import { hashPassword, generateToken } from "../utils/auth.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

// Login endpoint
export function login(req: AuthenticatedRequest, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required parameters." });
  }

  const users = dbStore.getCollection("users");
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ error: "Invalid email credentials." });
  }

  const passwordHash = hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    return res.status(401).json({ error: "Invalid password credentials." });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  });

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}

// Signup/registration endpoint
export function signup(req: AuthenticatedRequest, res: Response) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All parameters are required: name, email, password, role." });
  }

  const validRoles = ["admin", "doctor", "patient"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid registration role specified." });
  }

  const users = dbStore.getCollection("users");
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: "An account with this email address already exists." });
  }

  const userId = "u" + (users.length + 1);
  const newUser = {
    id: userId,
    name,
    email,
    passwordHash: hashPassword(password),
    role,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  dbStore.updateCollection("users", users);

  // If role is patient, auto-create their matching clinical profile!
  if (role === "patient") {
    const patients = dbStore.getCollection("patients");
    const patientId = "p" + (patients.length + 1);
    const newPatient = {
      id: patientId,
      name,
      email,
      phone: "+1 (555) 000-0000",
      gender: "Male",
      dob: "1990-01-01",
      bloodGroup: "O+",
      address: "Please update your address",
      medicalHistory: [],
      allergies: [],
      reports: [],
      createdAt: newUser.createdAt
    };
    patients.push(newPatient);
    dbStore.updateCollection("patients", patients);
  }

  // If role is doctor, auto-create doctor profile
  if (role === "doctor") {
    const doctors = dbStore.getCollection("doctors");
    const doctorId = "d" + (doctors.length + 1);
    const newDoctor = {
      id: doctorId,
      name,
      email,
      phone: "+1 (555) 000-0000",
      specialization: "General Medicine",
      experience: 1,
      availability: ["Monday", "Tuesday", "Wednesday"],
      status: "active",
      rating: 5.0,
      createdAt: newUser.createdAt
    };
    doctors.push(newDoctor);
    dbStore.updateCollection("doctors", doctors);
  }

  const token = generateToken({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    name: newUser.name
  });

  return res.status(211).json({
    message: "Registration successful",
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  });
}

// Forgot password endpoint
export function forgotPassword(req: AuthenticatedRequest, res: Response) {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: "Email and newPassword are mandated." });
  }

  const users = dbStore.getCollection("users");
  const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

  if (userIndex === -1) {
    return res.status(404).json({ error: "Account with specified email address was not found." });
  }

  users[userIndex].passwordHash = hashPassword(newPassword);
  dbStore.updateCollection("users", users);

  return res.json({ message: "Password updated successfully. Please log in with your new credential." });
}
