import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { 
  Sparkles, 
  Send, 
  RotateCcw, 
  HelpCircle, 
  ShieldAlert, 
  HeartPulse, 
  Clock, 
  ThumbsUp, 
  Activity,
  AlertOctagon,
  ChevronsRight
} from "lucide-react";

interface DiagnoseResponse {
  department: string;
  urgency: string;
  reasoning: string;
  instructions: string[];
}

export default function AiTriage() {
  const { apiFetch } = useAuth();

  const [symptoms, setSymptoms] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnoseResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Common quick prompt cards
  const demoSymptoms = [
    { label: "Cardiac Distress", text: "Heavy feeling in center chest, left arm numbness, mild breathing difficulty" },
    { label: "Severe Migraine", text: "Intense throbbing temple headache, blind spots, nausea when looking at light" },
    { label: "Pediatric Fever", text: "Child running 102.5F high temperature, rash, persistent dry cough" },
    { label: "Sore throat & fatigue", text: "Persistent scratchy sore throat, difficulty swallowing, swollen lymph nodes" }
  ];

  const handleDiagnose = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const queryText = customText || symptoms;
    
    if (!queryText.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setDiagnosis(null);

    try {
      const res = await apiFetch("/api/ai/diagnose", {
        method: "POST",
        body: JSON.stringify({ symptoms: queryText })
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setDiagnosis(res);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed connecting to AI diagnostic server.");
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyBadgeColor = (urgency: string) => {
    const u = urgency.toLowerCase();
    if (u.includes("critical") || u.includes("emergency") || u.includes("high")) {
      return "bg-red-500/10 border-red-500/25 text-red-400";
    }
    if (u.includes("moderate") || u.includes("urgent") || u.includes("medium")) {
      return "bg-amber-500/10 border-amber-500/25 text-amber-400";
    }
    return "bg-emerald-500/10 border-emerald-500/25 text-emerald-400";
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100 p-1 md:p-6 select-none relative">
      
      {/* Background radial soft light */}
      <div className="absolute top-10 right-10 w-[240px] h-[240px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header operations */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
          <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest leading-none">Diagnostic Intelligence Node</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white mt-1.5 tracking-tight">Clinical AI Symptoms Checker Triage</h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Secure HIPAA Compliant Natural Language Processing Platform</p>
      </div>

      {/* Grid: Inputs Form & Detailed suggestion results panels */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        {/* COLUMN 1 & 2: Diagnosis text inputs */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5.5 space-y-5.5">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Symptoms Triage Consultation</h3>
            <p className="text-xs text-slate-400 mt-1">Describe symptoms in details. The Clinical AI model analyzes departments allocation and care instructions.</p>
          </div>

          <form onSubmit={handleDiagnose} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Detailed symptoms narrative</label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe: e.g. persistent fever, chest tightness, high blood pressure, asthma with coughing, allergic rash..."
                rows={5}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Evaluating Clinical Triage...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Analyze Clinical Symptoms</span>
                </>
              )}
            </button>
          </form>

          {/* Quick preset cards */}
          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">Reference Clinical Cases</span>
            <div className="grid grid-cols-1 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {demoSymptoms.map((ds, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { setSymptoms(ds.text); handleDiagnose(e, ds.text); }}
                  className="w-full text-left p-3.5 bg-slate-950/50 border border-slate-950 hover:border-emerald-500/20 text-xs rounded-xl hover:bg-slate-800/30 transition-all flex justify-between items-center group cursor-pointer"
                >
                  <div className="truncate pr-2">
                    <span className="font-bold text-slate-200 block text-[11px] group-hover:text-emerald-400 transition-colors leading-none">{ds.label}</span>
                    <span className="text-[10px] text-slate-500 block mt-1.5 truncate">{ds.text}</span>
                  </div>
                  <ChevronsRight className="w-4 h-4 text-slate-650 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800/65 rounded-xl text-[10px] text-slate-500 leading-normal flex gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>AI diagnostic outcomes are purely clinical references and priority allocation guides. In case of life-threatening events, seek immediate professional physical emergency departments care.</span>
          </div>
        </div>

        {/* COLUMN 3 to 5: Response output detailed layout card */}
        <div className="lg:col-span-3">
          {diagnosis ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6.5 space-y-6 relative overflow-hidden animate-slide-in">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-emerald-500/5 rounded-full blur-[70px] pointer-events-none" />

              {/* Urgency and department banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
                <div>
                  <h3 className="text-xs text-slate-500 font-extrabold uppercase tracking-widest">Recommended Allocation Clinic</h3>
                  <h4 className="text-lg font-black text-white mt-1 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400 animate-pulse animate-bounce" />
                    <span>{diagnosis.department}</span>
                  </h4>
                </div>

                <div className={`px-4.5 py-2 font-bold rounded-xl border uppercase tracking-wider text-xs 
                  ${getUrgencyBadgeColor(diagnosis.urgency)}`}
                >
                  Priority: {diagnosis.urgency}
                </div>
              </div>

              {/* Scientific clinical analysis logic */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide block">Case Reasoning Dynamics</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 font-medium">
                  {diagnosis.reasoning}
                </p>
              </div>

              {/* Suggested immediate action lists */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide block">Instructions & Care Procedures</span>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {diagnosis.instructions.map((inst, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs leading-relaxed p-3 bg-slate-950/40 rounded-xl border border-slate-900">
                      <div className="w-5 h-5 rounded-full bg-emerald-400/10 border border-emerald-400/25 flex items-center justify-center text-emerald-400 shrink-0 text-[10px] font-bold mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-slate-300 mt-0.5">{inst}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Triage action item */}
              <div className="pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">Safe-Zone Verified HIPAA compliant</span>
                <button
                  onClick={() => { setDiagnosis(null); setSymptoms(""); }}
                  className="px-4 py-2 border border-slate-800 rounded-xl text-slate-400 hover:text-white font-bold cursor-pointer transition-colors"
                >
                  Reset Diagnostics
                </button>
              </div>

            </div>
          ) : isLoading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto animate-spin">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Formulating clinical diagnosis report</p>
                <p className="text-xs text-slate-500 mt-1">Calling Gemini neural network with secure context models...</p>
              </div>
            </div>
          ) : errorMsg ? (
            <div className="bg-slate-900 border border-red-500/25 rounded-2xl p-8 text-center space-y-4">
              <AlertOctagon className="w-12 h-12 text-red-400 mx-auto animate-bounce" />
              <div>
                <p className="text-sm font-bold text-white">Diagnostic Process Halted</p>
                <p className="text-xs text-red-400/80 mt-1 max-w-sm mx-auto">{errorMsg}</p>
              </div>
              <button
                onClick={(e) => handleDiagnose(e)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 font-bold text-xs rounded-xl transition-all"
              >
                Retry Symptoms evaluation
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center text-slate-500">
              <HelpCircle className="w-12 h-12 text-slate-850 mx-auto" />
              <p className="mt-4 font-semibold text-sm text-slate-400">Diagnosis outcome results will materialize here upon text submission.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
