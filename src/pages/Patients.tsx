import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  FileText, 
  Clipboard, 
  AlertCircle, 
  UserPlus, 
  Check, 
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  FolderOpen
} from "lucide-react";
import { Patient } from "../types.js";

export default function Patients() {
  const { user, apiFetch } = useAuth();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [bloodGroup, setBloodGroup] = useState("All");
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Modals / Form toggles
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Medical log inputs
  const [newDiagnosis, setNewDiagnosis] = useState("");
  const [newLogNotes, setNewLogNotes] = useState("");

  // Report file upload mock inputs
  const [newReportName, setNewReportName] = useState("");

  // Form states input
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formGender, setFormGender] = useState("Male");
  const [formDob, setFormDob] = useState("");
  const [formBlood, setFormBlood] = useState("O+");
  const [formAddress, setFormAddress] = useState("");
  const [formAllergies, setFormAllergies] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const url = `/api/patients?search=${search}&bloodGroup=${bloodGroup}`;
      const res = await apiFetch(url);
      setPatients(res.data);
      if (res.data.length > 0 && !selectedPatient) {
        setSelectedPatient(res.data[0]);
      }
    } catch (e: any) {
      triggerToast(e.message || "Failed patient load checks.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [search, bloodGroup]);

  const handleCreateOrUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formName,
      email: formEmail,
      phone: formPhone,
      gender: formGender,
      dob: formDob,
      bloodGroup: formBlood,
      address: formAddress,
      allergies: formAllergies.split(",").map(s => s.trim()).filter(s => s !== "")
    };

    try {
      if (isEditMode && selectedPatient) {
        const res = await apiFetch(`/api/patients/${selectedPatient.id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        triggerToast("Patient file successfully synchronized!");
        setSelectedPatient(res);
      } else {
        const res = await apiFetch("/api/patients", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        if (res.error) {
          triggerToast(res.error);
        } else {
          triggerToast("Clinical patient record logged!");
          setSelectedPatient(res);
        }
      }
      setIsFormOpen(false);
      loadPatients();
    } catch (err: any) {
      triggerToast(err.message || "Validation Error.");
    }
  };

  const handleDeletePatient = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this patient from health enterprise records?")) return;
    try {
      await apiFetch(`/api/patients/${id}`, { method: "DELETE" });
      triggerToast("Patient record purged successfully.");
      setSelectedPatient(null);
      loadPatients();
    } catch (err: any) {
      triggerToast(err.message || "Failed record purging.");
    }
  };

  const handleAddDiagnosticsNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !newDiagnosis) return;
    try {
      const res = await apiFetch(`/api/patients/${selectedPatient.id}/medical-history`, {
        method: "POST",
        body: JSON.stringify({ diagnosis: newDiagnosis, notes: newLogNotes })
      });
      setSelectedPatient(res);
      setNewDiagnosis("");
      setNewLogNotes("");
      triggerToast("Clinical medical ledger entry logged!");
      loadPatients();
    } catch (err: any) {
      triggerToast(err.message || "Failed notes saving.");
    }
  };

  const handleMockPdfReportUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !newReportName) return;
    try {
      const res = await apiFetch(`/api/patients/${selectedPatient.id}/upload-report`, {
        method: "POST",
        body: JSON.stringify({ fileName: newReportName + ".pdf" })
      });
      setSelectedPatient(res);
      setNewReportName("");
      triggerToast("Lab Test PDF placeholder annexed!");
      loadPatients();
    } catch (err: any) {
      triggerToast(err.message || "Upload Error.");
    }
  };

  const openFormForEdit = () => {
    if (!selectedPatient) return;
    setIsEditMode(true);
    setFormName(selectedPatient.name);
    setFormEmail(selectedPatient.email);
    setFormPhone(selectedPatient.phone);
    setFormGender(selectedPatient.gender);
    setFormDob(selectedPatient.dob);
    setFormBlood(selectedPatient.bloodGroup);
    setFormAddress(selectedPatient.address);
    setFormAllergies(selectedPatient.allergies.join(", "));
    setIsFormOpen(true);
  };

  const openFormForAdd = () => {
    setIsEditMode(false);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormGender("Male");
    setFormDob("1990-01-01");
    setFormBlood("O+");
    setFormAddress("");
    setFormAllergies("");
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100 p-1 md:p-6 select-none relative">
      
      {/* Absolute floating Toast alert notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 px-5 py-3.5 rounded-xl bg-slate-900 border border-emerald-500/25 text-emerald-400 font-bold text-xs shadow-2xl flex items-center gap-2.5 z-50 animate-slide-in">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header operations bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Clinical Patients Directory</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Secure HIPAA Health Records System</p>
        </div>
        
        {/* Only Admin or Doctor may add patients */}
        {(user?.role === "admin" || user?.role === "doctor") && (
          <button
            onClick={openFormForAdd}
            className="px-4.5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Admit Clinical Patient</span>
          </button>
        )}
      </div>

      {/* Action Filters and Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* COLUMN 1: Search Directory Ledger */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Patient Inward Register</h3>
            <span className="text-[10px] text-teal-400 font-bold px-2.5 py-0.5 bg-teal-500/10 border border-teal-500/20 rounded">
              {patients.length} Active
            </span>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Blood Group quick filtering selectors */}
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-1.5">Blood Registry Group</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500 bg-slate-950"
            >
              <option value="All">All Blood Groups</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>

          {/* Patients Item lists */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {patients.length > 0 ? (
              patients.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between group
                    ${selectedPatient?.id === p.id 
                      ? "bg-slate-800/80 border-slate-700/80 shadow-md" 
                      : "bg-slate-950/40 border-slate-900 hover:bg-slate-800/25"}`}
                >
                  <div className="truncate pr-2">
                    <p className={`text-xs font-bold leading-none truncate 
                      ${selectedPatient?.id === p.id ? "text-emerald-400" : "text-slate-300"}`}
                    >
                      {p.name}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 truncate">{p.email}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-[9px] font-extrabold text-teal-400 bg-teal-400/5 border border-teal-400/20 px-2 py-0.5 rounded uppercase">
                      {p.bloodGroup}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))
            ) : (
              <p className="text-slate-600 text-xs py-10 text-center font-medium">No clinical patients match filters.</p>
            )}
          </div>
        </div>

        {/* COLUMN 2 & 3: Detailed Chart Profile View */}
        <div className="lg:col-span-2 space-y-6">
          {selectedPatient ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              
              {/* Detailed credentials list */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 md:col-span-1">
                <div className="text-center pb-4 border-b border-slate-800">
                  <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 text-slate-400 flex items-center justify-center text-xl font-black mx-auto mb-3">
                    {selectedPatient.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <h4 className="text-sm font-bold text-white">{selectedPatient.name}</h4>
                  <p className="text-[10px] text-emerald-400 mt-1 font-semibold tracking-wider">ID: {selectedPatient.id}</p>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Email Address</span>
                    <span className="text-slate-300 font-semibold block mt-0.5 text-xs truncate">{selectedPatient.email}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Phone Number</span>
                    <span className="text-slate-300 font-semibold block mt-0.5">{selectedPatient.phone}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Date of Birth</span>
                    <span className="text-slate-300 font-medium block mt-0.5">{selectedPatient.dob} ({selectedPatient.gender})</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Home Address</span>
                    <span className="text-slate-300 font-medium block mt-0.5 leading-relaxed">{selectedPatient.address || "No address documented"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Known Allergies</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedPatient.allergies.length > 0 ? (
                        selectedPatient.allergies.map(alg => (
                          <span key={alg} className="text-[9px] font-bold text-red-400 bg-red-400/5 border border-red-400/20 px-2 py-0.5 rounded">
                            {alg}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">No allergies documented</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Operations buttons */}
                <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
                  <button
                    onClick={openFormForEdit}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-800 hover:border-teal-500/20 hover:bg-teal-500/5 text-slate-400 hover:text-teal-400 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Synchronize Patient Profile</span>
                  </button>
                  
                  {/* Purging allowed only for root admin */}
                  {user?.role === "admin" && (
                    <button
                      onClick={() => handleDeletePatient(selectedPatient.id)}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-800 hover:border-red-500/20 hover:bg-red-500/5 text-slate-400 hover:text-red-400 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Purge Clinical Record</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Patient timeline medical history & uploaded report sheets */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Clinical History Cards */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clipboard className="w-5 h-5 text-emerald-400" />
                    <span>Clinical Consultation History timeline</span>
                  </h3>

                  <div className="space-y-4 max-h-56 overflow-y-auto pr-1">
                    {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 ? (
                      selectedPatient.medicalHistory.map((history, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl relative">
                          <span className="absolute top-3 right-3 text-[9px] text-slate-500 font-bold uppercase">{history.date}</span>
                          <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest block">Diagnosis Case</span>
                          <p className="text-xs font-bold text-white mt-1">{history.diagnosis}</p>
                          <p className="text-xs text-slate-400 mt-2 leading-relaxed bg-slate-900/30 p-2 rounded-lg border border-slate-800/40">{history.notes}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-xs py-6 text-center italic">No consultation entries recorded for patient.</p>
                    )}
                  </div>

                  {/* Add medical clinical history notes */}
                  {(user?.role === "admin" || user?.role === "doctor") && (
                    <form onSubmit={handleAddDiagnosticsNote} className="space-y-3.5 pt-4 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Add New Consultant Entry</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          value={newDiagnosis}
                          onChange={(e) => setNewDiagnosis(e.target.value)}
                          placeholder="Diagnosis (e.g. Hypertension, Diabetes)"
                          className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder-slate-600 focus:outline-none focus:border-emerald-500 w-full"
                        />
                        <input
                          type="text"
                          value={newLogNotes}
                          onChange={(e) => setNewLogNotes(e.target.value)}
                          placeholder="Care plan notes instructions..."
                          className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder-slate-600 focus:outline-none focus:border-emerald-500 w-full"
                        />
                      </div>
                      <button
                        type="submit"
                        className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-bold text-xs transition-all w-full cursor-pointer flex items-center justify-center gap-1.5 border border-transparent"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Log Clinical Diagnosis Case</span>
                      </button>
                    </form>
                  )}
                </div>

                {/* Patient Diagnostic reports annex */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-400" />
                    <span>Lab Test files & PDF Reports metadata</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-40 overflow-y-auto">
                    {selectedPatient.reports && selectedPatient.reports.length > 0 ? (
                      selectedPatient.reports.map((rep, idx) => (
                        <div key={idx} className="p-3 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between group">
                          <div className="truncate pr-2">
                            <span className="text-xs font-semibold text-slate-300 block truncate group-hover:text-teal-400 transition-colors">{rep.name}</span>
                            <span className="text-[9px] text-slate-500 block mt-0.5">Uploaded: {rep.date}</span>
                          </div>
                          <span className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0 cursor-pointer text-[10px] font-bold uppercase tracking-wider">
                            Download
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="col-span-2 text-slate-500 text-xs py-4 text-center italic">No files upload indexes annexed to patient chart.</p>
                    )}
                  </div>

                  {/* Add mock report */}
                  <form onSubmit={handleMockPdfReportUpload} className="pt-4 border-t border-slate-800/80 flex gap-2.5">
                    <input
                      type="text"
                      required
                      value={newReportName}
                      onChange={(e) => setNewReportName(e.target.value)}
                      placeholder="e.g. Lipids Panel Diagnostic, Urinalysis Result"
                      className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder-slate-600 focus:outline-none focus:border-teal-500"
                    />
                    <button
                      type="submit"
                      className="px-4 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs hover:bg-teal-500 hover:text-slate-950 border border-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Annect file metadata</span>
                    </button>
                  </form>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <FolderOpen className="w-12 h-12 text-slate-700 mx-auto" />
              <p className="text-slate-400 text-sm mt-4 font-semibold">Please select or register a patient clinical chart profile to access comprehensive histories.</p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL / BOTTOM SHEET FORM FOR CREATE / UPDATE PATIENTS */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg p-6 rounded-2xl space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              <span>{isEditMode ? "Synchronize Patient Record" : "Admit New Clinical Patient"}</span>
            </h3>

            <form onSubmit={handleCreateOrUpdateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Jonathan Doe"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. doe@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Gender</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500 bg-slate-950"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={formDob}
                    onChange={(e) => setFormDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500 bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Blood Group</label>
                  <select
                    value={formBlood}
                    onChange={(e) => setFormBlood(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500 bg-slate-950"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Home Address</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Street and City coordinates..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-medium">Top Allergies (Comma-separated)</label>
                <input
                  type="text"
                  value={formAllergies}
                  onChange={(e) => setFormAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts, Lactose"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4.5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:scale-[1.01] transition-all"
                >
                  Confirm Admit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
