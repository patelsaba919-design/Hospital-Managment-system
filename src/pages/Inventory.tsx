import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { 
  Plus, 
  Search, 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  Check, 
  PlusSquare,
  Activity,
  Package,
  Layers,
  ShoppingBag
} from "lucide-react";
import { Medicine } from "../types.js";

export default function Inventory() {
  const { user, apiFetch } = useAuth();

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form parameters
  const [formName, setFormName] = useState("");
  const [formCat, setFormCat] = useState("Antibiotics");
  const [formStock, setFormStock] = useState("100");
  const [formAlert, setFormAlert] = useState("20");
  const [formExp, setFormExp] = useState("");
  const [formPrice, setFormPrice] = useState("10.0");
  const [formDosage, setFormDosage] = useState("As directed");

  // Restock action parameters
  const [stockActionMedId, setStockActionMedId] = useState<string | null>(null);
  const [stockActionAmt, setStockActionAmt] = useState("25");
  const [stockActionOp, setStockActionOp] = useState<"add" | "subtract">("add");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadMedicines = async () => {
    try {
      const url = `/api/medicines?search=${search}&category=${categoryFilter}`;
      const res = await apiFetch(url);
      setMedicines(res);
    } catch (err: any) {
      triggerToast(err.message || "Failed inventory sync.");
    }
  };

  useEffect(() => {
    loadMedicines();
  }, [search, categoryFilter]);

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formName,
      category: formCat,
      stock: parseInt(formStock) || 0,
      minStockAlert: parseInt(formAlert) || 20,
      expiryDate: formExp || "2027-12-31",
      price: parseFloat(formPrice) || 5.0,
      dosage: formDosage
    };

    try {
      await apiFetch("/api/medicines", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      triggerToast("Pharmaceutical stock and supply catalog ledgered!");
      setIsFormOpen(false);
      
      // Reset
      setFormName("");
      setFormStock("100");
      setFormPrice("10.0");
      loadMedicines();
    } catch (err: any) {
      triggerToast(err.message || "Credential creation failed.");
    }
  };

  const handleUpdateStockAmount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockActionMedId) return;

    try {
      await apiFetch(`/api/medicines/${stockActionMedId}/stock`, {
        method: "PATCH",
        body: JSON.stringify({
          quantity: parseInt(stockActionAmt) || 10,
          operation: stockActionOp
        })
      });
      triggerToast(`Pharmaceutical ledger stock adjusted successfully!`);
      setStockActionMedId(null);
      loadMedicines();
    } catch (err: any) {
      triggerToast(err.message || "Ledger adjustment failed.");
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this medicine entry from inventory records?")) return;
    try {
      await apiFetch(`/api/medicines/${id}`, { method: "DELETE" });
      triggerToast("Medicine entry removed from database.");
      loadMedicines();
    } catch (err: any) {
      triggerToast(err.message || "Removal operations failed.");
    }
  };

  const categories = ["All", "Antibiotics", "Cardiology", "Analgesic", "Antiviral", "Neurology", "Others"];

  return (
    <div className="space-y-6 animate-fade-in text-slate-100 p-1 md:p-6 select-none relative">
      
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 px-5 py-3.5 bg-slate-900 border border-emerald-500/25 text-emerald-400 font-bold text-xs shadow-2xl flex items-center gap-2.5 z-50 animate-slide-in">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Medicine & Supplies Inventory</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Pharmaceutical & Commodities Stock Loggers</p>
        </div>

        {user?.role === "admin" && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4.5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Add Medicine</span>
          </button>
        )}
      </div>

      {/* Search and filtering toolbars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900 p-4.5 rounded-2xl border border-slate-800">
        
        {/* Search */}
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pharmaceutical name or specifications..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Categories filters */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500 bg-slate-950"
        >
          {categories.map(c => (
            <option key={c} value={c}>{c} division</option>
          ))}
        </select>

      </div>

      {/* Inventory table rendering block */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
                <th className="px-6 py-4.5">Chemical / Drug Formula</th>
                <th className="px-6 py-4.5">Classification</th>
                <th className="px-6 py-4.5">Unit Rate</th>
                <th className="px-6 py-4.5">Stock balance</th>
                <th className="px-6 py-4.5">Security Expiry</th>
                {user?.role === "admin" && <th className="px-6 py-4.5 text-right">Actions Operations</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {medicines.length > 0 ? (
                medicines.map(med => (
                  <tr key={med.id} className="hover:bg-slate-950/20 transition-all group">
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors text-sm block">{med.name}</span>
                        <span className="text-[10px] text-slate-500 block mt-1">Dosage: {med.dosage}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-400">{med.category}</td>
                    <td className="px-6 py-4 font-extrabold text-slate-300">${med.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className={`text-xs font-black px-2.5 py-1 rounded
                          ${med.isLowStock 
                            ? "bg-red-400/10 text-red-400 border border-red-400/20 animate-pulse font-extrabold" 
                            : "bg-slate-950 text-slate-300"}`}
                        >
                          {med.stock} Units
                        </span>
                        {med.isLowStock && (
                          <span className="flex items-center gap-1 text-[10px] text-red-400 font-bold bg-red-400/5 px-1.5 py-0.5 rounded border border-red-400/10">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Low supply warns</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-slate-300 block font-medium">{med.expiryDate}</span>
                        {med.isNearExpiry && (
                          <span className="text-[9px] text-amber-400 font-bold bg-amber-400/5 px-1.5 py-0.5 mt-1 border border-amber-400/10 rounded inline-block">
                            Expiry risk alerts
                          </span>
                        )}
                      </div>
                    </td>
                    {user?.role === "admin" && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-xs">
                          <button
                            onClick={() => setStockActionMedId(med.id)}
                            className="px-3 py-1.5 rounded-lg border border-slate-800 hover:border-emerald-500/20 bg-slate-950/40 hover:bg-emerald-500/5 text-emerald-400 font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Restock / Dispense
                          </button>
                          <button
                            onClick={() => handleDeleteMedicine(med.id)}
                            className="p-1.5 rounded-lg border border-slate-800 hover:border-red-500/20 hover:bg-red-500/5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <Package className="w-12 h-12 text-slate-800 mx-auto" />
                    <p className="text-slate-400 text-sm mt-4 font-semibold">No pharmaceutical stock logs tracked index.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CREATE MEDICINE FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-2xl space-y-4 shadow-2xl relative">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <PlusSquare className="w-5 h-5 text-emerald-400" />
              <span>Catalog New Pharmaceutical Item</span>
            </h3>

            <form onSubmit={handleCreateMedicine} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 col-span-2">Chemical / Drug Formula Formula *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Amoxicillin Trihydrate 500mg"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Classification</label>
                  <select
                    value={formCat}
                    onChange={(e) => setFormCat(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 bg-slate-950"
                  >
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Analgesic">Analgesic</option>
                    <option value="Antiviral">Antiviral</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Unit Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Starting Stock Units *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Min Alert level *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formAlert}
                    onChange={(e) => setFormAlert(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 col-span-2">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formExp}
                    onChange={(e) => setFormExp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Usage / Dosage Instructs</label>
                  <input
                    type="text"
                    value={formDosage}
                    onChange={(e) => setFormDosage(e.target.value)}
                    placeholder="e.g. 1 cap TID"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
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
                  Confirm Catalog Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORM: RESTOCK / DISPENSE SLIP MODAL */}
      {stockActionMedId && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm p-6 rounded-2xl space-y-4 shadow-2xl relative">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-emerald-400" />
              <span>Adjust Stock levels Ledger</span>
            </h3>

            <form onSubmit={handleUpdateStockAmount} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Action operation *</label>
                  <select
                    value={stockActionOp}
                    onChange={(e) => setStockActionOp(e.target.value as "add" | "subtract")}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none bg-slate-950"
                  >
                    <option value="add">Restock (+) supply</option>
                    <option value="subtract">Dispense (-) supply</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Add Units Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={stockActionAmt}
                    onChange={(e) => setStockActionAmt(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStockActionMedId(null)}
                  className="px-4.5 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold uppercase tracking-wider hover:scale-[1.01]"
                >
                  Confirm adjustments
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
