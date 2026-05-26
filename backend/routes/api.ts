import { Router } from "express";
import { authenticateUser, checkRole } from "../middleware/auth.js";

// Import Controllers
import * as authCtrl from "../controllers/authController.js";
import * as ptCtrl from "../controllers/patientController.js";
import * as docCtrl from "../controllers/doctorController.js";
import * as apptCtrl from "../controllers/appointmentController.js";
import * as billCtrl from "../controllers/billController.js";
import * as medCtrl from "../controllers/medicineController.js";
import * as aiCtrl from "../controllers/aiController.js";

const router = Router();

// ==========================================
// 1. PUBLIC AUTHENTICATION ENDPOINTS
// ==========================================
router.post("/auth/login", authCtrl.login);
router.post("/auth/signup", authCtrl.signup);
router.post("/auth/forgot-password", authCtrl.forgotPassword);

// ==========================================
// 2. PATIENT MANAGEMENT ENDPOINTS (PROTECTED)
// ==========================================
router.get("/patients", authenticateUser, ptCtrl.getAllPatients);
router.get("/patients/:id", authenticateUser, ptCtrl.getPatientById);
router.post("/patients", authenticateUser, checkRole(["admin", "doctor"]), ptCtrl.createPatient);
router.put("/patients/:id", authenticateUser, ptCtrl.updatePatient);
router.delete("/patients/:id", authenticateUser, checkRole(["admin"]), ptCtrl.deletePatient);
router.post("/patients/:id/medical-history", authenticateUser, checkRole(["admin", "doctor"]), ptCtrl.addMedicalHistoryRecord);
router.post("/patients/:id/upload-report", authenticateUser, ptCtrl.uploadReportFile);

// ==========================================
// 3. DOCTOR ALIGNMENTS ENDPOINTS (PROTECTED)
// ==========================================
router.get("/doctors", authenticateUser, docCtrl.getAllDoctors);
router.get("/doctors/:id", authenticateUser, docCtrl.getDoctorById);
router.post("/doctors", authenticateUser, checkRole(["admin"]), docCtrl.createDoctor);
router.put("/doctors/:id", authenticateUser, docCtrl.updateDoctor);
router.patch("/doctors/:id/status", authenticateUser, checkRole(["admin"]), docCtrl.setDoctorStatus);

// ==========================================
// 4. APPOINTMENT RESERVATIONS ENDPOINTS (PROTECTED)
// ==========================================
router.get("/appointments", authenticateUser, apptCtrl.getAllAppointments);
router.post("/appointments", authenticateUser, apptCtrl.createAppointment);
router.patch("/appointments/:id/status", authenticateUser, apptCtrl.updateAppointmentStatus);
router.patch("/appointments/:id/reschedule", authenticateUser, apptCtrl.rescheduleAppointment);
router.post("/appointments/:id/cancel", authenticateUser, apptCtrl.cancelAppointment);

// ==========================================
// 5. BILLING & INVOICES ENDPOINTS (PROTECTED)
// ==========================================
router.get("/bills", authenticateUser, billCtrl.getAllBills);
router.get("/bills/analytics", authenticateUser, checkRole(["admin"]), billCtrl.getRevenueAnalytics);
router.get("/bills/:id", authenticateUser, billCtrl.getBillById);
router.post("/bills", authenticateUser, checkRole(["admin"]), billCtrl.createBill);
router.patch("/bills/:id/pay", authenticateUser, billCtrl.payBill);

// ==========================================
// 6. MEDICINES INVENTORY ENDPOINTS (PROTECTED)
// ==========================================
router.get("/medicines", authenticateUser, medCtrl.getAllMedicines);
router.get("/medicines/:id", authenticateUser, medCtrl.getMedicineById);
router.post("/medicines", authenticateUser, checkRole(["admin"]), medCtrl.createMedicine);
router.patch("/medicines/:id/stock", authenticateUser, checkRole(["admin"]), medCtrl.updateStockAmount);
router.delete("/medicines/:id", authenticateUser, checkRole(["admin"]), medCtrl.deleteMedicine);

// ==========================================
// 7. AI INTUITIVE CLINICAL DEPT SUGGESTOR (PROTECTED)
// ==========================================
router.post("/ai/suggest", authenticateUser, aiCtrl.suggestDepartment);

export default router;
