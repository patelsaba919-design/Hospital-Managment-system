export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "doctor" | "patient" | "staff";
}

export interface MedicalRecord {
  date: string;
  diagnosis: string;
  notes: string;
}

export interface PDFReport {
  name: string;
  date: string;
  url: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  bloodGroup: string;
  address: string;
  medicalHistory: MedicalRecord[];
  allergies: string[];
  reports: PDFReport[];
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: "Cardiology" | "Neurology" | "Pediatrics" | "Orthopedics" | "Dermatology" | "General Medicine" | "Oncology" | string;
  experience: number;
  availability: string[];
  status: "active" | "inactive";
  rating: number;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  timeSlot: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  reason: string;
  notes: string;
  createdAt: string;
}

export interface BillItem {
  description: string;
  amount: number;
}

export interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: "paid" | "unpaid";
  paymentMethod: "Card" | "Cash" | "Insurance";
  dueDate: string;
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  category: "Antibiotics" | "Cardiology" | "Analgesic" | "Antiviral" | "Neurology" | "Others" | string;
  stock: number;
  minStockAlert: number;
  expiryDate: string;
  price: number;
  dosage: string;
  createdAt: string;
  isLowStock?: boolean;
  isNearExpiry?: boolean;
  daysUntilExpiry?: number;
}
