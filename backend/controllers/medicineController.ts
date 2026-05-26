import { Response } from "express";
import { dbStore } from "../db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

// List all medicines inside the inventory
export function getAllMedicines(req: AuthenticatedRequest, res: Response) {
  let medicines = dbStore.getCollection("medicines");
  const category = req.query.category as string;
  const search = req.query.search as string;

  if (category && category !== "All") {
    medicines = medicines.filter(m => m.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const s = search.toLowerCase();
    medicines = medicines.filter(m => m.name.toLowerCase().includes(s) || m.category.toLowerCase().includes(s));
  }

  // Inject computed field for immediate client-side notifications
  const responseData = medicines.map(m => {
    const isLowStock = m.stock <= m.minStockAlert;
    
    // Check expiry inside 120 days
    const expiry = new Date(m.expiryDate).getTime();
    const today = new Date().getTime();
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    const isNearExpiry = daysUntilExpiry <= 120;

    return {
      ...m,
      isLowStock,
      isNearExpiry,
      daysUntilExpiry
    };
  });

  return res.json(responseData);
}

// Fetch single medicine detail
export function getMedicineById(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const medicines = dbStore.getCollection("medicines");
  const medicine = medicines.find(m => m.id === id);

  if (!medicine) {
    return res.status(404).json({ error: "Medicine not found in inventory ledger." });
  }

  return res.json(medicine);
}

// Add new drug / stock allocation to inventory list
export function createMedicine(req: AuthenticatedRequest, res: Response) {
  const { name, category, stock, minStockAlert, expiryDate, price, dosage } = req.body;

  if (!name || !category || stock === undefined || !expiryDate || !price) {
    return res.status(400).json({ error: "Required fields missing: name, category, stock, expiryDate, price." });
  }

  const medicines = dbStore.getCollection("medicines");
  const id = "m" + (medicines.length + 1);

  const newMedicine = {
    id,
    name,
    category,
    stock: parseInt(stock) || 0,
    minStockAlert: parseInt(minStockAlert) || 20,
    expiryDate,
    price: parseFloat(price) || 0.0,
    dosage: dosage || "As prescribed",
    createdAt: new Date().toISOString()
  };

  medicines.push(newMedicine);
  dbStore.updateCollection("medicines", medicines);

  return res.status(216).json(newMedicine);
}

// Dispense or Restock supplies
export function updateStockAmount(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { quantity, operation } = req.body; // quantity, operation: 'add' | 'subtract'

  if (quantity === undefined || !operation || !["add", "subtract"].includes(operation)) {
    return res.status(400).json({ error: "Required parameters: quantity (number), operation ('add' | 'subtract')." });
  }

  const medicines = dbStore.getCollection("medicines");
  const idx = medicines.findIndex(m => m.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "Medicine record not found." });
  }

  const amt = parseInt(quantity) || 0;
  if (operation === "add") {
    medicines[idx].stock += amt;
  } else {
    if (medicines[idx].stock < amt) {
      return res.status(400).json({ error: `Insufficient stock. Current inventory level is only ${medicines[idx].stock}.` });
    }
    medicines[idx].stock -= amt;
  }

  dbStore.updateCollection("medicines", medicines);
  return res.json(medicines[idx]);
}

// Delete inventory entry
export function deleteMedicine(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const medicines = dbStore.getCollection("medicines");
  const filtered = medicines.filter(m => m.id !== id);

  if (medicines.length === filtered.length) {
    return res.status(404).json({ error: "Medicine entry not found." });
  }

  dbStore.updateCollection("medicines", filtered);
  return res.json({ message: "Medicine ledger item successfully deleted." });
}
