import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { 
  Plus, 
  Receipt, 
  CreditCard, 
  Printer, 
  Check, 
  Eye, 
  AlertCircle,
  FileSpreadsheet,
  X,
  PlusSquare,
  DollarSign
} from "lucide-react";
import { Bill, Patient } from "../types.js";

export default function Billing() {
  const { user, apiFetch } = useAuth();

  const [bills, setBills] = useState<Bill[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  
  const [statusFilter, setStatusFilter] = useState("All");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form parameters
  const [newPatId, setNewPatId] = useState("");
  const [newDescInput, setNewDescInput] = useState("");
  const [newDescAmount, setNewDescAmount] = useState("");
  const [newItemsList, setNewItemsList] = useState<{ description: string; amount: number }[]>([]);
  const [newDiscount, setNewDiscount] = useState("0");
  const [newMethod, setNewMethod] = useState("Card");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    try {
      const url = statusFilter === "All" ? "/api/bills" : `/api/bills?status=${statusFilter}`;
      const list = await apiFetch(url);
      setBills(list);
      if (list.length > 0 && !selectedBill) {
        setSelectedBill(list[0]);
      }

      if (user?.role === "admin") {
        const pts = await apiFetch("/api/patients");
        setPatients(pts.data);
      }
    } catch (err: any) {
      triggerToast(err.message || "Failed billing collection.");
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const addItemToDraftList = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newDescInput || !newDescAmount) return;
    setNewItemsList(prev => [
      ...prev,
      { description: newDescInput, amount: parseFloat(newDescAmount) || 0 }
    ]);
    setNewDescInput("");
    setNewDescAmount("");
  };

  const handleCreateBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatId || newItemsList.length === 0) {
      return triggerToast("Choose inpatient profile and enter item description parameters.");
    }

    const payload = {
      patientId: newPatId,
      items: newItemsList,
      discount: parseFloat(newDiscount) || 0,
      paymentMethod: newMethod,
      dueDate: new Date().toISOString().split("T")[0]
    };

    try {
      const res = await apiFetch("/api/bills", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      triggerToast("Custom diagnostic and hospital fee invoice generated!");
      setIsFormOpen(false);
      
      // Reset
      setNewItemsList([]);
      setNewDiscount("0");
      setSelectedBill(res);
      loadData();
    } catch (err: any) {
      triggerToast(err.message || "Invoice saving failed.");
    }
  };

  const handlePayBill = async (id: string, selectMethod: string) => {
    try {
      const res = await apiFetch(`/api/bills/${id}/pay`, {
        method: "PATCH",
        body: JSON.stringify({ paymentMethod: selectMethod })
      });
      triggerToast("Bill receipt successfully cleared!");
      setSelectedBill(res);
      loadData();
    } catch (err: any) {
      triggerToast(err.message || "Clearing failed.");
    }
  };

  // Launch browser native print dialog for the selected invoice
  const triggerPrintInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100 p-1 md:p-6 select-none relative print:bg-white print:text-black">
      
      {/* Toast popup alerts */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 px-5 py-3.5 bg-slate-900 border border-emerald-500/25 text-emerald-400 font-bold text-xs shadow-2xl flex items-center gap-2.5 z-50 animate-slide-in print:hidden">
          <div className="w-2 h-2 bg-emerald-400 rounded-full" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Finance & Billing ledger</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Invoices & Cleared Revenues Registries</p>
        </div>

        {user?.role === "admin" && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4.5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Generate Invoices</span>
          </button>
        )}
      </div>

      {/* Grid of invoice listings & print card details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* COLUMN 1: Invoice register records */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 print:hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Invoices List</h3>
            <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-850">
              {["All", "paid", "unpaid"].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold capitalize transition-all
                    ${statusFilter === st ? "bg-slate-800 text-emerald-400" : "text-slate-500"}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {bills.length > 0 ? (
              bills.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBill(b)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between group
                    ${selectedBill?.id === b.id 
                      ? "bg-slate-800/80 border-slate-700/80 shadow-md" 
                      : "bg-slate-950/40 border-slate-900 hover:bg-slate-800/25"}`}
                >
                  <div>
                    <h5 className="text-[10px] text-slate-500 font-extrabold group-hover:text-amber-400 transition-colors uppercase leading-none">Inv: #{b.id}</h5>
                    <p className="text-xs font-bold text-slate-200 mt-1.5 truncate">{b.patientName}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Due: {b.dueDate}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-extrabold text-white">${b.total.toFixed(2)}</p>
                    <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border inline-block mt-1.5
                      ${b.status === "paid" 
                        ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" 
                        : "text-red-400 bg-red-400/5 border-red-400/10"}`}
                    >
                      {b.status}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-slate-600 text-xs py-10 text-center font-medium">No invoice records generated matching query.</p>
            )}
          </div>
        </div>

        {/* COLUMN 2 & 3: Detailed printable invoice slip */}
        <div className="lg:col-span-2">
          {selectedBill ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6.5 space-y-6 relative overflow-hidden print:border-none print:p-0">
              
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-indigo-500/5 rounded-full blur-2xl pointer-events-none print:hidden" />

              {/* Printable Header row */}
              <div className="flex justify-between items-start pb-6 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 print:hidden">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white print:text-black">MedSaaS Clinical Corporation</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest font-bold">Billing operations & Diagnostic fees</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block leading-none">INVOICE NUMBER</span>
                  <span className="text-sm font-bold text-white print:text-black block mt-1">#INV-{selectedBill.id}</span>
                </div>
              </div>

              {/* Bill summary meta lists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">PATIENT DEBTOR</span>
                  <p className="text-slate-200 print:text-black font-extrabold text-sm block mt-1">{selectedBill.patientName}</p>
                  <p className="text-slate-400 print:text-slate-600 text-[10px] block mt-1">Reference profile ID: {selectedBill.patientId}</p>
                </div>
                <div className="sm:text-right">
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">DATES AND DEADLINES</span>
                  <p className="text-slate-300 print:text-black block mt-1">Issued Date: {new Date(selectedBill.createdAt).toLocaleDateString()}</p>
                  <p className="text-slate-300 print:text-black block mt-1 text-red-400">Due Date: {selectedBill.dueDate}</p>
                </div>
              </div>

              {/* Ledger Items Table */}
              <div className="space-y-2">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Itemized clinical Fee listings</span>
                <div className="bg-slate-950/40 print:bg-white rounded-xl border border-slate-900 print:border-black overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-900 bg-slate-950 print:bg-slate-100 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                        <th className="px-4 py-3">Description of Diagnostic Services</th>
                        <th className="px-4 py-3 text-right">Fee Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 print:divide-slate-200">
                      {selectedBill.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/10 transition-colors">
                          <td className="px-4 py-3.5 text-slate-300 print:text-black font-medium">{it.description}</td>
                          <td className="px-4 py-3.5 text-right font-extrabold text-slate-100 print:text-black">${it.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dynamic Subtotals calculations summary */}
              <div className="flex flex-col sm:items-end space-y-2 pt-4 border-t border-slate-800/80">
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs font-semibold">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="text-right text-slate-300 print:text-black font-extrabold">${selectedBill.subtotal.toFixed(2)}</span>
                  
                  <span className="text-slate-500">Sales Tax (8%):</span>
                  <span className="text-right text-slate-300 print:text-black font-extrabold">${selectedBill.tax.toFixed(2)}</span>
                  
                  {selectedBill.discount > 0 && (
                    <>
                      <span className="text-slate-500">Discount promo adjustment:</span>
                      <span className="text-right text-red-400 font-extrabold">-${selectedBill.discount.toFixed(2)}</span>
                    </>
                  )}

                  <span className="text-base text-white print:text-black font-extrabold border-t border-slate-800 pt-2.5">Total Amount due:</span>
                  <span className="text-base text-emerald-400 print:text-black font-black border-t border-slate-800 text-right pt-2.5">${selectedBill.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout processing controls */}
              <div className="pt-4 border-t border-slate-800/85 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Operational Status:</span>
                  <span className={`text-[10px] font-bold tracking-widest uppercase border px-2.5 py-0.5 rounded
                    ${selectedBill.status === "paid" 
                      ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/25" 
                      : "text-red-400 bg-red-400/5 border-red-400/25 animate-pulse"}`}
                  >
                    {selectedBill.status} via {selectedBill.paymentMethod}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  {selectedBill.status === "unpaid" && (
                    <button
                      onClick={() => handlePayBill(selectedBill.id, "Card")}
                      className="flex-1 sm:flex-initial px-4.5 py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-transparent"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Settle Receipt Invoice</span>
                    </button>
                  )}

                  <button
                    onClick={triggerPrintInvoice}
                    className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Invoice</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 font-semibold">
              <Eye className="w-12 h-12 text-slate-800 mx-auto" />
              <p className="mt-4">Please select any record to explore complete fee statements.</p>
            </div>
          )}
        </div>

      </div>

      {/* FORM: GENERATE BILL Invoice MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-2xl space-y-4 shadow-2xl relative">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <PlusSquare className="w-5 h-5 text-emerald-400" />
              <span>Generate Invoices</span>
            </h3>

            <form onSubmit={handleCreateBillSubmit} className="space-y-4 text-xs">
              
              {/* Patient */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 col-span-2">Select Debtors Clinical Profile *</label>
                <select
                  required
                  value={newPatId}
                  onChange={(e) => setNewPatId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-emerald-500 bg-slate-950"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                  ))}
                </select>
              </div>

              {/* Items compilations */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Diagnostic items details *</label>
                <div className="flex gap-2 text-xs">
                  <input
                    type="text"
                    value={newDescInput}
                    onChange={(e) => setNewDescInput(e.target.value)}
                    placeholder="e.g. Lead MRI Scan"
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                  <input
                    type="number"
                    min="1"
                    value={newDescAmount}
                    onChange={(e) => setNewDescAmount(e.target.value)}
                    placeholder="Fee $"
                    className="w-20 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                  <button
                    onClick={addItemToDraftList}
                    className="px-3 bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-800 font-bold rounded-xl transition-all"
                  >
                    Add
                  </button>
                </div>

                {/* Lists drafts items */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850/60 max-h-24 overflow-y-auto space-y-1.5">
                  {newItemsList.length > 0 ? (
                    newItemsList.map((item, id) => (
                      <div key={id} className="flex justify-between text-[11px] font-bold text-slate-400">
                        <span>{item.description}</span>
                        <span>${item.amount.toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-600 italic block py-2 text-center">List is empty. Enter items details above.</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Promo Discount ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Payment Method *</label>
                  <select
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-emerald-500 bg-slate-950"
                  >
                    <option value="Card">Card Settle</option>
                    <option value="Cash">Cash Settle</option>
                    <option value="Insurance">Insurance Claims</option>
                  </select>
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
                  Confirm Invoicing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
