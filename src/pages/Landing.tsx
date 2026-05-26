import { useAuth } from "../context/AuthContext.tsx";
import { 
  HeartPulse, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  TrendingUp, 
  Activity, 
  Clock, 
  ArrowRight,
  Database,
  Users2,
  Stethoscope,
  Receipt
} from "lucide-react";

interface LandingProps {
  onGetStarted: () => void;
}

export default function Landing({ onGetStarted }: LandingProps) {
  const { theme } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Interactive glowing background orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header / Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white block">MedSaaS</span>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">Enterprise Hub</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#about" className="hover:text-white transition-colors">Integrations</a>
            <a href="#security" className="hover:text-white transition-colors">Security Standards</a>
          </nav>

          <button 
            onClick={onGetStarted}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm tracking-tight hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-all duration-200"
          >
            Access Dashboard
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-36 max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Clinical Intelligence Engine Enabled</span>
        </div>
        
        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] max-w-4xl mx-auto">
          The Intelligent Operating System for <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Health Care Enterprises</span>
        </h1>
        
        <p className="mt-8 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Unify patient analytics, specialist appointments, secure invoices, smart inventory supplies, and AI-driven symptom clinical routing inside a high-contrast glassmorphism interface.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 hover:shadow-[0_0_35px_rgba(16,185,129,0.4)] hover:scale-[1.02] transition-all duration-200 cursor-pointer"
          >
            <span>Launch System Demo</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 px-6 py-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-sm font-semibold">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Compliance Ready API and JWT Hashing</span>
          </div>
        </div>

        {/* Floating SaaS Dashboard Preview Card */}
        <div className="mt-20 border border-slate-800 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/60 p-2 backdrop-blur-xl max-w-5xl mx-auto shadow-[0_30px_70px_rgba(0,0,0,0.6)]">
          <div className="border border-slate-800 rounded-xl bg-slate-950 overflow-hidden relative aspect-video flex flex-col items-center justify-center p-8 text-center group">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                <HeartPulse className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Active Clinician Center</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-md">Click "Launch System Demo" above or "Access Dashboard" to sign in with passwordless demo accounts bypass.</p>
              <button 
                onClick={onGetStarted}
                className="mt-6 px-6 py-3 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 text-xs tracking-wider uppercase transition-colors"
              >
                Access Dashboard
              </button>
            </div>
            
            {/* Visual simulation lines */}
            <div className="w-full grid grid-cols-3 gap-4 opacity-10">
              <div className="h-28 bg-emerald-500 rounded-lg"></div>
              <div className="h-28 bg-teal-500 rounded-lg"></div>
              <div className="h-28 bg-blue-500 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of core features */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 border-t border-slate-900 relative">
        <p className="text-emerald-400 font-bold uppercase text-center tracking-widest text-xs">Aesthetic Precision & Logic</p>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white text-center tracking-tight mt-3">Full-Stack Enterprise Ecosystem</h2>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Symptom Router</h3>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Leverage server-side Google Gemini neural processing to analyze raw symptoms, map medical priority tags, suggest active specialist departments, and issue immediate precautions.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
              <Users2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Clinical Patient CRM</h3>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Track full medical timeline records, manage detailed allergy charts, review report summaries, and manage complete diagnostic histories inside a single responsive panel.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Interactive Schedulers</h3>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Prevent calendar collisions with our double-booking prevention engine, track appointment check-dates, and cancel or reschedule slots seamlessly under role authorization checkups.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Automated Invoicing</h3>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Generate detailed fee ledger invoices directly from completed appointments, implement sales-tax computation, support discounts, and export beautiful PDF print layouts.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-6">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Dynamic Finance Charts</h3>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Monitor clinic revenues, inventory ledgers, and appointment allocations inside graphical charts driven by advanced backend telemetry and REST schemas.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-6">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Exquisite Inventory</h3>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Organize pharmaceutical categories, map stock count thresholds, trigger immediate low-supply warning indicators, and prevent expiry risks with visual alarms.
            </p>
          </div>

        </div>
      </section>

      {/* Demo Account Credentials Quick Panel */}
      <section id="demo" className="py-20 bg-slate-950 border-t border-slate-900 relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="p-8 md:p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 pointer-events-none" />
            <h3 className="text-2xl font-bold text-white">Passwordless Bypasses Protected for Speed-Testing</h3>
            <p className="text-slate-400 mt-3 text-sm leading-relaxed max-w-xl mx-auto">
              Our deployment schema is seeded with active mock profiles to allow immediate deep feature testing without any cloud signup obstacles. Use these credentials to login:
            </p>
            
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest block">SAAS ROOT ADMIN</span>
                <span className="font-semibold text-slate-200 text-sm block mt-1">admin@hospital.com</span>
                <span className="text-xs text-slate-500 block">Password: <b className="text-emerald-400">admin123</b></span>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest block">SPECIALIST CLINICIAN</span>
                <span className="font-semibold text-slate-200 text-sm block mt-1">doctor@hospital.com</span>
                <span className="text-xs text-slate-500 block">Password: <b className="text-emerald-400">password123</b></span>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest block">DEMO ACTIVE PATIENT</span>
                <span className="font-semibold text-slate-200 text-sm block mt-1">patient@hospital.com</span>
                <span className="text-xs text-slate-500 block">Password: <b className="text-emerald-400">password123</b></span>
              </div>
            </div>

            <button 
              onClick={onGetStarted}
              className="mt-10 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-sm tracking-tight hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-[1.01] transition-all"
            >
              Access System Login
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 text-center text-xs text-slate-500 font-medium">
        <p>© 2026 MedSaaS Enterprise Systems Ltd. All rights security protected.</p>
        <p className="mt-2 text-[10px] text-slate-600">Compliance Code: HIPAA / JWT256S / GMT-Clinical</p>
      </footer>
    </div>
  );
}
