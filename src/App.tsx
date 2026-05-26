import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.tsx";
import Sidebar from "./components/Sidebar.tsx";
import Landing from "./pages/Landing.tsx";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Patients from "./pages/Patients.tsx";
import Doctors from "./pages/Doctors.tsx";
import Appointments from "./pages/Appointments.tsx";
import Billing from "./pages/Billing.tsx";
import Inventory from "./pages/Inventory.tsx";
import AiTriage from "./pages/AiTriage.tsx";

import { Menu, LogOut, Sun, Moon, Sparkles, UserCheck } from "lucide-react";

function MainAppContent() {
  const { user, theme, toggleTheme, logout } = useAuth();
  
  // Tab states
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Navigation for non-authenticated states
  const [viewState, setViewState] = useState<"landing" | "login">("landing");

  // Renders correct active page
  const renderActiveTab = () => {
    switch (currentTab) {
      case "dashboard":
        return <Dashboard />;
      case "patients":
        return <Patients />;
      case "doctors":
        return <Doctors />;
      case "appointments":
        return <Appointments />;
      case "billing":
        return <Billing />;
      case "inventory":
        return <Inventory />;
      case "ai_helper":
        return <AiTriage />;
      default:
        return <Dashboard />;
    }
  };

  // If user is not yet logged in, show requested Landing/Access panels
  if (!user) {
    if (viewState === "landing") {
      return (
        <Landing onGetStarted={() => setViewState("login")} />
      );
    }
    return (
      <Login 
        onSuccess={() => setViewState("landing")} 
        onBackToLanding={() => setViewState("landing")} 
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Dynamic Persistent / Mobile Drawer Sidebar */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        isOpen={mobileSidebarOpen} 
        setIsOpen={setMobileSidebarOpen} 
      />

      {/* Main Container Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Decorative ambient glowing backdrops in layout */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.02] rounded-full blur-[140px] pointer-events-none" />

        {/* Global Control Top Bar */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/40 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0 select-none print:hidden">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Node Security Layer Compliant</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Quick AI Clinical helper direct toggle shortcut badge */}
            <button
              onClick={() => setCurrentTab("ai_helper")}
              className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer
                ${currentTab === "ai_helper" 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-black shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"}`}
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>Diagnostic Assistant</span>
            </button>

            {/* Session Indicator profile */}
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-400">Clinic User ID</p>
              <p className="text-[10px] text-emerald-400 font-extrabold uppercase mt-0.5 tracking-widest">{user.role}: {user.email}</p>
            </div>

            {/* Exit/Logout */}
            <button
              onClick={logout}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-red-400 hover:border-red-500/25 transition-all text-xs font-bold cursor-pointer"
              title="Terminate Secure Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Core routing dashboard screens viewport fluid overflow container */}
        <main className="flex-1 overflow-y-auto bg-slate-950 scrollbar-none pb-6">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
            {renderActiveTab()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
