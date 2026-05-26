import fs from "fs";
import path from "path";
import crypto from "crypto";

// Absolute path for the JSON database file
const DB_FILE = path.join(process.cwd(), "hospital_database.json");

// Default initial database content
const INITIAL_DATABASE = {
  users: [
    {
      id: "u1",
      name: "Dr. Amanda Ross",
      email: "doctor@hospital.com",
      passwordHash: crypto.createHash("sha256").update("password123").digest("hex"),
      role: "doctor",
      createdAt: "2026-01-10T08:00:00Z"
    },
    {
      id: "u2",
      name: "Saba Patel",
      email: "patient@hospital.com",
      passwordHash: crypto.createHash("sha256").update("password123").digest("hex"),
      role: "patient",
      createdAt: "2026-02-15T12:30:00Z"
    },
    {
      id: "u3",
      name: "Chief Admin Sarah Jones",
      email: "admin@hospital.com",
      passwordHash: crypto.createHash("sha256").update("admin123").digest("hex"),
      role: "admin",
      createdAt: "2026-01-01T09:00:00Z"
    }
  ],
  patients: [
    {
      id: "p1",
      name: "Saba Patel",
      email: "patient@hospital.com",
      phone: "+1 (555) 732-8811",
      gender: "Female",
      dob: "1994-08-14",
      bloodGroup: "O+",
      address: "142 Skyview Terraces, Chicago, IL",
      medicalHistory: [
        { date: "2026-02-10", diagnosis: "Chronic Hypertension", notes: "Stable, advised low-sodium diet and daily amlodipine." },
        { date: "2026-03-04", diagnosis: "Allergic Rhinitis", notes: "Prescribed Cetirizine 10mg." }
      ],
      allergies: ["Penicillin", "Peanuts"],
      reports: [
        { name: "Complete Blood Count.pdf", date: "2026-04-12", url: "#" },
        { name: "Lipid Panel Results.pdf", date: "2026-05-01", url: "#" }
      ],
      createdAt: "2026-02-15T12:30:00Z"
    },
    {
      id: "p2",
      name: "Arthur Pendelton",
      email: "arthur.p@gmail.com",
      phone: "+1 (555) 341-2354",
      gender: "Male",
      dob: "1968-11-23",
      bloodGroup: "A-",
      address: "89 Orchard Glen Rd, Evanston, IL",
      medicalHistory: [
        { date: "2025-11-12", diagnosis: "Type 2 Diabetes Mellitus", notes: "HbA1c is 7.4%. Keep on Metformin 500mg BID." },
        { date: "2026-01-04", diagnosis: "Mild Osteoarthritis", notes: "Physical therapy exercises prescribed." }
      ],
      allergies: [],
      reports: [
        { name: "Hba1C Report.pdf", date: "2026-01-15", url: "#" }
      ],
      createdAt: "2026-01-04T10:00:00Z"
    },
    {
      id: "p3",
      name: "Olivia Vance",
      email: "olivia.vance@yahoo.com",
      phone: "+1 (555) 902-1132",
      gender: "Female",
      dob: "2018-05-19",
      bloodGroup: "B+",
      address: "24 Maple Avenue, Oak Park, IL",
      medicalHistory: [
        { date: "2025-12-01", diagnosis: "Childhood Asthma", notes: "Use Albuterol inhaler PRN." }
      ],
      allergies: ["Lactose"],
      reports: [],
      createdAt: "2025-12-01T15:45:00Z"
    },
    {
      id: "p4",
      name: "Marcus Aurelius",
      email: "marcus.a@rome.com",
      phone: "+1 (555) 762-9812",
      gender: "Male",
      dob: "1982-04-26",
      bloodGroup: "AB+",
      address: "10 Capitol Hill, Washington, DC",
      medicalHistory: [
        { date: "2026-03-12", diagnosis: "Migraine with Aura", notes: "Prescribed Sumatriptan for acute episodes." }
      ],
      allergies: ["Sulfa drugs"],
      reports: [],
      createdAt: "2026-03-12T09:00:00Z"
    }
  ],
  doctors: [
    {
      id: "d1",
      name: "Dr. Amanda Ross",
      email: "doctor@hospital.com",
      phone: "+1 (555) 123-4567",
      specialization: "Cardiology",
      experience: 12,
      availability: ["Monday", "Wednesday", "Friday"],
      status: "active",
      rating: 4.9,
      createdAt: "2026-01-10T08:00:00Z"
    },
    {
      id: "d2",
      name: "Dr. Eugene Vance",
      email: "eugene.vance@hospital.com",
      phone: "+1 (555) 987-6543",
      specialization: "Neurology",
      experience: 15,
      availability: ["Tuesday", "Thursday"],
      status: "active",
      rating: 4.8,
      createdAt: "2026-01-12T08:00:00Z"
    },
    {
      id: "d3",
      name: "Dr. Sarah Patel",
      email: "sarah.p@hospital.com",
      phone: "+1 (555) 456-7890",
      specialization: "Pediatrics",
      experience: 8,
      availability: ["Monday", "Tuesday", "Wednesday"],
      status: "active",
      rating: 4.7,
      createdAt: "2026-01-15T08:00:00Z"
    },
    {
      id: "d4",
      name: "Dr. Christopher Diaz",
      email: "diaz.dermatology@hospital.com",
      phone: "+1 (555) 234-5678",
      specialization: "Dermatology",
      experience: 10,
      availability: ["Wednesday", "Thursday", "Friday"],
      status: "active",
      rating: 4.9,
      createdAt: "2026-01-20T08:00:00Z"
    }
  ],
  appointments: [
    {
      id: "a1",
      patientId: "p1",
      patientName: "Saba Patel",
      doctorId: "d1",
      doctorName: "Dr. Amanda Ross",
      date: "2026-05-28",
      timeSlot: "09:30 AM",
      status: "confirmed",
      reason: "Monthly Cardiac Arrhythmia Checkup",
      notes: "Patient states mild palpitations late at night. EKG scheduled.",
      createdAt: "2026-05-20T10:15:00Z"
    },
    {
      id: "a2",
      patientId: "p2",
      patientName: "Arthur Pendelton",
      doctorId: "d2",
      doctorName: "Dr. Eugene Vance",
      date: "2026-05-29",
      timeSlot: "11:00 AM",
      status: "pending",
      reason: "Followup on peripheral neuropathy pain",
      notes: "Reviewing dosage of Gabapentin.",
      createdAt: "2026-05-22T14:30:00Z"
    },
    {
      id: "a3",
      patientId: "p3",
      patientName: "Olivia Vance",
      doctorId: "d3",
      doctorName: "Dr. Sarah Patel",
      date: "2026-05-26",
      timeSlot: "02:00 PM",
      status: "completed",
      reason: "Routine Physical and Seasonal Asthma Check",
      notes: "Inhalation therapy working great. Growth charts normalized.",
      createdAt: "2026-05-21T09:00:00Z"
    },
    {
      id: "a4",
      patientId: "p1",
      patientName: "Saba Patel",
      doctorId: "d4",
      doctorName: "Dr. Christopher Diaz",
      date: "2026-06-02",
      timeSlot: "04:30 PM",
      status: "confirmed",
      reason: "Skin allergy evaluation",
      notes: "Pruritus over hands and fingers for the last week.",
      createdAt: "2026-05-25T11:00:00Z"
    }
  ],
  bills: [
    {
      id: "b1",
      patientId: "p1",
      patientName: "Saba Patel",
      appointmentId: "a1",
      items: [
        { description: "Specialist Cardiac Consultation", amount: 150 },
        { description: "Lead EKG Setup & Diagnostic Scan", amount: 120 },
        { description: "Hypertension Amlodipine Supply", amount: 35 }
      ],
      subtotal: 305,
      tax: 24.4,
      discount: 30,
      total: 299.4,
      status: "paid",
      paymentMethod: "Insurance",
      dueDate: "2026-06-05",
      createdAt: "2026-05-20T11:00:00Z"
    },
    {
      id: "b2",
      patientId: "p3",
      patientName: "Olivia Vance",
      appointmentId: "a3",
      items: [
        { description: "Pediatric Wellness Consult", amount: 100 },
        { description: "Asthma Nebulizer Assessment", amount: 75 }
      ],
      subtotal: 175,
      tax: 14,
      discount: 0,
      total: 189,
      status: "paid",
      paymentMethod: "Cash",
      dueDate: "2026-05-26",
      createdAt: "2026-05-26T14:30:00Z"
    },
    {
      id: "b3",
      patientId: "p2",
      patientName: "Arthur Pendelton",
      appointmentId: "a2",
      items: [
        { description: "Neurology Specialist Assessment", amount: 180 }
      ],
      subtotal: 180,
      tax: 14.4,
      discount: 10,
      total: 184.4,
      status: "unpaid",
      paymentMethod: "Card",
      dueDate: "2026-06-12",
      createdAt: "2026-05-22T15:00:00Z"
    }
  ],
  medicines: [
    {
      id: "m1",
      name: "Amoxicillin 500mg",
      category: "Antibiotics",
      stock: 350,
      minStockAlert: 50,
      expiryDate: "2027-10-15",
      price: 15.5,
      dosage: "1 capsule 3 times a day",
      createdAt: "2026-01-10T09:00:00Z"
    },
    {
      id: "m2",
      name: "Amlodipine Besylate 5mg",
      category: "Cardiology",
      stock: 42,
      minStockAlert: 80, // Trigger low stock alert!
      expiryDate: "2028-04-20",
      price: 18.0,
      dosage: "1 tablet daily in the morning",
      createdAt: "2026-01-10T09:00:00Z"
    },
    {
      id: "m3",
      name: "Ibuprofen 400mg",
      category: "Analgesic",
      stock: 500,
      minStockAlert: 100,
      expiryDate: "2027-12-01",
      price: 8.5,
      dosage: "1 tablet every 6 hours PRN for pain",
      createdAt: "2026-01-10T09:00:00Z"
    },
    {
      id: "m4",
      name: "Gabapentin 300mg",
      category: "Neurology",
      stock: 8,
      minStockAlert: 40, // Trigger low stock alert!
      expiryDate: "2026-09-18", // Trigger nearly expired check!
      price: 45.0,
      dosage: "1 capsule with dinner",
      createdAt: "2026-01-15T09:00:00Z"
    },
    {
      id: "m5",
      name: "Cetirizine Hydrochloride 10mg",
      category: "Others",
      stock: 220,
      minStockAlert: 30,
      expiryDate: "2027-02-14",
      price: 12.0,
      dosage: "1 tablet nightly",
      createdAt: "2026-02-01T09:00:00Z"
    }
  ]
};

// Generic type for DB structure
export type HospitalDatabase = typeof INITIAL_DATABASE;

class DatabaseStore {
  private data: HospitalDatabase;

  constructor() {
    this.data = INITIAL_DATABASE;
    this.load();
  }

  // Load database from disk
  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(fileContent);
      } else {
        this.save();
      }
    } catch (e) {
      console.error("Failed to load hospital database, using default schema data:", e);
      this.data = INITIAL_DATABASE;
    }
  }

  // Save database to disk
  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to persist hospital database details:", e);
    }
  }

  // Collection getter
  public getCollection<K extends keyof HospitalDatabase>(name: K): HospitalDatabase[K] {
    return this.data[name];
  }

  // Update whole collection
  public updateCollection<K extends keyof HospitalDatabase>(name: K, newValue: HospitalDatabase[K]) {
    this.data[name] = newValue;
    this.save();
  }

  // Clear or seed DB
  public resetToDefaults() {
    this.data = JSON.parse(JSON.stringify(INITIAL_DATABASE));
    this.save();
  }
}

export const dbStore = new DatabaseStore();
