import { Response } from "express";
import { dbStore } from "../db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

// Retrieve list of bills/invoices
export function getAllBills(req: AuthenticatedRequest, res: Response) {
  let bills = dbStore.getCollection("bills");
  const status = req.query.status as string; // 'paid' | 'unpaid'
  const patientId = req.query.patientId as string;

  if (status && status !== "All") {
    bills = bills.filter(b => b.status === status);
  }

  if (patientId) {
    bills = bills.filter(b => b.patientId === patientId);
  }

  return res.json(bills);
}

// Fetch single bill invoice details
export function getBillById(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const bills = dbStore.getCollection("bills");
  const bill = bills.find(b => b.id === id);

  if (!bill) {
    return res.status(404).json({ error: "Invoice/Bill not found." });
  }

  return res.json(bill);
}

// Create custom invoice
export function createBill(req: AuthenticatedRequest, res: Response) {
  const { patientId, items, discount, paymentMethod, dueDate } = req.body;

  if (!patientId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Required fields missing: patientId and items array containing at least one item." });
  }

  const patients = dbStore.getCollection("patients");
  const patient = patients.find(p => p.id === patientId);

  if (!patient) {
    return res.status(404).json({ error: "Patient record does not exist." });
  }

  const bills = dbStore.getCollection("bills");
  
  // Crunch total amounts
  const subtotal = items.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const tax = parseFloat((subtotal * 0.08).toFixed(2)); // 8% sales tax
  const discValue = parseFloat(discount) || 0;
  const total = parseFloat((subtotal + tax - discValue).toFixed(2));

  const id = "b" + (bills.length + 1);
  const newBill = {
    id,
    patientId,
    patientName: patient.name,
    appointmentId: req.body.appointmentId || "direct-invoice",
    items,
    subtotal,
    tax,
    discount: discValue,
    total,
    status: req.body.status || "unpaid",
    paymentMethod: paymentMethod || "Cash",
    dueDate: dueDate || new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString()
  };

  bills.push(newBill);
  dbStore.updateCollection("bills", bills);

  return res.status(215).json(newBill);
}

// Pay Invoice / change status flags
export function payBill(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { paymentMethod } = req.body; // 'Card' | 'Cash' | 'Insurance'

  const bills = dbStore.getCollection("bills");
  const idx = bills.findIndex(b => b.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "Bill record not found." });
  }

  bills[idx].status = "paid";
  if (paymentMethod) {
    bills[idx].paymentMethod = paymentMethod;
  }
  
  dbStore.updateCollection("bills", bills);
  return res.json(bills[idx]);
}

// Generate general finance analytics reports
export function getRevenueAnalytics(req: AuthenticatedRequest, res: Response) {
  const bills = dbStore.getCollection("bills");

  const totalRevenue = bills
    .filter(b => b.status === "paid")
    .reduce((acc, curr) => acc + curr.total, 0);

  const pendingRevenue = bills
    .filter(b => b.status === "unpaid")
    .reduce((acc, curr) => acc + curr.total, 0);

  // Group revenue by date schedules
  const reportsByDate: { [key: string]: number } = {};
  bills.filter(b => b.status === "paid").forEach(b => {
    const d = b.createdAt.split("T")[0];
    reportsByDate[d] = (reportsByDate[d] || 0) + b.total;
  });

  const dailyHistory = Object.keys(reportsByDate).map(date => ({
    date,
    revenue: parseFloat(reportsByDate[date].toFixed(2))
  })).sort((a,b) => a.date.localeCompare(b.date));

  return res.json({
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    pendingRevenue: parseFloat(pendingRevenue.toFixed(2)),
    billCount: bills.length,
    paidCount: bills.filter(b => b.status === "paid").length,
    dailyHistory
  });
}
