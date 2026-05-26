import { useAuth } from "../context/AuthContext.tsx";
import { 
  LayoutDashboard, 
  Users, 
  UserRound, 
  Calendar, 
  Receipt, 
  Sparkles, 
  LogOut, 
  X,
  Stethoscope,
  HeartPulse,
  ShoppingBag
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ currentTab, setCurrentTab, isOpen, setIsOpen }: SidebarProps) {
  const { user, logout } = useAuth();

  const handleTabClick = (tab: string) => {
    setCurrentTab(tab);
    setIsOpen(false); // Close mobile drawer
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "doctor", "patient"] },
    { id: "patients", label: "Patients", icon: Users, roles: ["admin", "doctor"] },
    { id: "doctors", label: "Doctors Specialists", icon: UserRound, roles: ["admin", "doctor", "patient"] },
    { id: "appointments", label: "Appointments Board", icon: Calendar, roles: ["admin", "doctor", "patient"] },
    { id: "billing", label: "Billing Invoices", icon: Receipt, roles: ["admin", "patient"] },
    { id: "inventory", label: "Medicine Supplies", icon: ShoppingBag, roles: ["admin", "doctor"] },
    { id: "ai_helper", label: "AI Clinical Router", icon: Sparkles, roles: ["admin", "doctor", "patient"] }
  ];

  const allowedItems = menuItems.filter(item => !user || item.roles.includes(user.role));

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar Wrapper */}
      <aside 
        className={`fixed inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col z-50 lg:translate-x-0 transition-transform duration-300 ease-in-out lg:static lg:h-screen
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header Branding */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-lg leading-tight tracking-tight text-white">MedSaaS</p>
              <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Clinical Care</p>
            </div>
          </div>
          <button 
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Quick Info */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/20">
          <p className="text-xs text-slate-500 font-medium">AUTHORIZED ROLE PROFILE</p>
          <p className="font-bold text-white mt-1 text-sm truncate">{user?.name}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs text-slate-400 font-medium capitalize">
              {user?.role === "admin" ? "SaaS Root Administrator" : user?.role || "Staff"}
            </span>
          </div>
        </div>

        {/* Nav list */}
        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-sm transition-all duration-200 group
                  ${isActive 
                    ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-400 font-semibold" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"}`}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 
                  ${isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200"}`} 
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout session footer button */}
        <div className="p-4 border-t border-slate-800 mt-auto bg-slate-950/30">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-slate-800 hover:border-red-500/20 bg-slate-950/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 font-medium text-sm transition-all duration-200"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>
    </>
  );
}
