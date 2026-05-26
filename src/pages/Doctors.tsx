import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { 
  Plus, 
  Search, 
  Check, 
  X, 
  Star, 
  Clock, 
  Video, 
  MapPin, 
  FolderLock,
  UserPlus2,
  Stethoscope,
  HeartPulse
} from "lucide-react";
import { Doctor } from "../types.js";

export default function Doctors() {
  const { user, apiFetch } = useAuth();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("All");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formSpec, setFormSpec] = useState("General Medicine");
  const [formExp, setFormExp] = useState("5");
  const [formAvail, setFormAvail] = useState<string[]>(["Monday", "Wednesday"]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadDoctors = async () => {
    try {
      const url = `/api/doctors?search=${search}&specialization=${specialization}`;
      const res = await apiFetch(url);
      setDoctors(res);
    } catch (err: any) {
      triggerToast(err.message || "Failed doctors download operations.");
    }
  };

  useEffect(() => {
    loadDoctors();
  }, [search, specialization]);

  const toggleDoctorStatus = async (doctor: Doctor) => {
    const nextStatus = doctor.status === "active" ? "inactive" : "active";
    try {
      await apiFetch(`/api/doctors/${doctor.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus })
      });
      triggerToast(`${doctor.name} availability toggled successfully!`);
      loadDoctors();
    } catch (err: any) {
      triggerToast(err.message || "Failed schedule modification.");
    }
  };

  const handleCreateDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formName,
      email: formEmail,
      phone: formPhone,
      specialization: formSpec,
      experience: formExp,
      availability: formAvail
    };

    try {
      await apiFetch("/api/doctors", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      triggerToast("Specialist clinician credential and profile logged!");
      setIsFormOpen(false);
      
      // Reset
      setFormName("");
      setFormEmail("");
      setFormPhone("");
      loadDoctors();
    } catch (err: any) {
      triggerToast(err.message || "Credential creation failed.");
    }
  };

  const specializationsList = [
    "All",
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "Dermatology",
    "General Medicine",
    "Oncology"
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-100 p-1 md:p-6 select-none relative">
      
      {/* Toast floating popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 px-5 py-3.5 rounded-xl bg-slate-900 border border-emerald-500/25 text-emerald-400 font-bold text-xs shadow-2xl flex items-center gap-2.5 z-50 animate-slide-in">
          <div className="w-2 h-2 bg-emerald-400 rounded-full" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header operations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Specialists Directory</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Advanced Clinic Scheduling Registries</p>
        </div>

        {/* Create doctor profile (role: admin) */}
        {user?.role === "admin" && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4.5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Onboard Specialist Clinician</span>
          </button>
        )}
      </div>

      {/* Controls & searching bar */}
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
            placeholder="Search specialties or clinicians names..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Spec dropdown */}
        <select
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500 bg-slate-950"
        >
          {specializationsList.map(spec => (
            <option key={spec} value={spec}>{spec} division</option>
          ))}
        </select>

      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.length > 0 ? (
          doctors.map(doctor => (
            <div 
              key={doctor.id} 
              className={`rounded-2xl border bg-slate-900 p-5.5 space-y-4 transition-all duration-300 relative overflow-hidden group hover:scale-[1.015] hover:shadow-xl
                ${doctor.status === "active" ? "border-slate-800 hover:border-slate-700" : "border-slate-800/60 opacity-60"}`}
            >
              {/* Specialization water ripple badge */}
              <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-bold flex items-center justify-center text-sm">
                    {doctor.name.split(" ").slice(-2).map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">{doctor.name}</h3>
                    <p className="text-[10px] font-extrabold text-emerald-400 mt-1 uppercase tracking-wider">{doctor.specialization}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                  <span>{doctor.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Specialist statistics */}
              <div className="grid grid-cols-2 gap-3 py-3.5 px-4 bg-slate-950/40 rounded-xl border border-slate-900 text-xs">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Practice level</span>
                  <span className="font-bold text-slate-200 block mt-0.5">{doctor.experience} Years experience</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Available Slots</span>
                  <span className="font-bold text-slate-200 block mt-0.5 capitalize truncate">{doctor.availability.slice(0,2).join(", ")}</span>
                </div>
              </div>

              {/* Status toggling buttons for administrative users */}
              <div className="flex items-center justify-between gap-4 pt-2 text-xs">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block leading-none">Schedule active</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-2 h-2 rounded-full ${doctor.status === "active" ? "bg-emerald-400" : "bg-red-400"}`} />
                    <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                      {doctor.status === "active" ? "Available for triage" : "Inactive / Away"}
                    </span>
                  </div>
                </div>

                {user?.role === "admin" && (
                  <button
                    onClick={() => toggleDoctorStatus(doctor)}
                    className={`px-3.5 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider border transition-all cursor-pointer
                      ${doctor.status === "active" 
                        ? "border-red-500/25 bg-red-500/5 text-red-400 hover:bg-red-500/10" 
                        : "border-emerald-500/25 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10"}`}
                  >
                    {doctor.status === "active" ? "Set Away" : "Activate"}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
            <FolderLock className="w-12 h-12 text-slate-800 mx-auto" />
            <p className="text-slate-400 text-sm mt-4 font-semibold">No specialists clinicians matched query specifications.</p>
          </div>
        )}
      </div>

      {/* FORM: ONBOARD DOCTOR MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-2xl space-y-4 shadow-2xl relative">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <UserPlus2 className="w-5 h-5 text-emerald-400 hover:rotate-12 transition-transform" />
              <span>Onboard Specialist Clinician</span>
            </h3>

            <form onSubmit={handleCreateDoctorSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Clinician Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Dr. Amanda Ross"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Authorized Login Email</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. ross@hospital.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Specialization</label>
                  <select
                    value={formSpec}
                    onChange={(e) => setFormSpec(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-emerald-500 bg-slate-950"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Oncology">Oncology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Practice Level (Years)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formExp}
                    onChange={(e) => setFormExp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-emerald-500"
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
                  Confirm Specialist Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
