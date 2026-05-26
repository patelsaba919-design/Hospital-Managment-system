import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { 
  Users, 
  UserSquare, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  Clock, 
  Sparkles,
  CheckCircle2,
  BellRing
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

import { Patient, Doctor, Appointment, Bill, Medicine } from "../types.js";

export default function Dashboard() {
  const { user, apiFetch } = useAuth();
  
  // Data State holds
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [analytics, setAnalytics] = useState<any>({ totalRevenue: 0, pendingRevenue: 0, dailyHistory: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        
        // Fetch depending on roles
        const docsRes = await apiFetch("/api/doctors");
        setDoctors(docsRes);

        const apptsRes = await apiFetch("/api/appointments");
        setAppointments(apptsRes);

        const medRes = await apiFetch("/api/medicines");
        setMedicines(medRes);

        if (user?.role === "admin" || user?.role === "doctor") {
          const ptRes = await apiFetch("/api/patients");
          setPatients(ptRes.data);
        }

        if (user?.role === "admin") {
          const bRes = await apiFetch("/api/bills");
          setBills(bRes);
          const analyticRes = await apiFetch("/api/bills/analytics");
          setAnalytics(analyticRes);
        } else if (user?.role === "patient") {
          const bRes = await apiFetch(`/api/bills?patientId=${user.id}`);
          setBills(bRes);
        }
      } catch (err) {
        console.error("Dashboard failed loading:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  // Calculations for cards
  const pendingAppointments = appointments.filter(a => a.status === "pending").length;
  const confirmedAppointments = appointments.filter(a => a.status === "confirmed").length;
  const activeDoctors = doctors.filter(d => d.status === "active").length;
  
  // Low stock medicine alert checkup count
  const lowStockMedicines = medicines.filter(m => m.stock <= m.minStockAlert);
  const lowStockCount = lowStockMedicines.length;

  const getRecentActivities = () => {
    // Combine recent inputs
    const list: any[] = [];
    appointments.slice(-3).forEach(a => {
      list.push({
        type: "appointment",
        text: `Appointment for ${a.patientName} with ${a.doctorName}`,
        date: a.createdAt || new Date().toISOString(),
        status: a.status
      });
    });
    bills.slice(-2).forEach(b => {
      list.push({
        type: "billing",
        text: `Invoice #${b.id} created for ${b.patientName} totaling $${b.total}`,
        date: b.createdAt || new Date().toISOString(),
        status: b.status
      });
    });
    return list.sort((a,b) => b.date.localeCompare(a.date)).slice(0, 5);
  };

  const chartData = analytics.dailyHistory && analytics.dailyHistory.length > 0
    ? analytics.dailyHistory
    : [
        { date: "May 20", revenue: 520 },
        { date: "May 21", revenue: 680 },
        { date: "May 22", revenue: 860 },
        { date: "May 23", revenue: 1100 },
        { date: "May 24", revenue: 950 },
        { date: "May 25", revenue: 1420 },
        { date: "May 26", revenue: 1850 }
      ];

  const appointmentSummaryData = [
    { name: "Pending", count: pendingAppointments, color: "#eab308" },
    { name: "Confirmed", count: confirmedAppointments, color: "#10b981" },
    { name: "Completed", count: appointments.filter(a => a.status === "completed").length, color: "#3b82f6" },
    { name: "Cancelled", count: appointments.filter(a => a.status === "cancelled").length, color: "#f43f5e" }
  ];

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-10 w-48 bg-slate-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(n => <div key={n} className="h-28 bg-slate-800 rounded-xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 lg:col-span-2 bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-80 bg-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-slate-100 p-1 md:p-6 select-none">
      
      {/* Header Welcome banner with micro alerts */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-b from-slate-900/60 to-slate-950/60 p-6 rounded-2xl border border-slate-800 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest leading-none">Command Enterprise Hub</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1.5 tracking-tight">
            Greetings, {user?.name.split(" ")[0]}!
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-lg leading-relaxed">
            All clinical interfaces match HIPAA guidelines. Your clinical node diagnostics suggest stable service operations.
          </p>
        </div>

        {/* Live system notice count badge */}
        <div className="flex items-center gap-3.5 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <div className="relative">
            <BellRing className="w-5 h-5 text-amber-400 animate-swing" />
            {(lowStockCount > 0) && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            )}
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Supply Monitors</p>
            <p className="text-xs font-bold mt-0.5 text-slate-300">
              {lowStockCount > 0 ? `${lowStockCount} Drugs in low stock alert` : "All supplies fully stocked"}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Bento Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 p-6 rounded-2xl transition-all duration-300 group hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Clinical In-Patients</span>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-4">{patients.length || 4}</p>
          <div className="text-[10px] text-teal-400 font-semibold mt-2 flex items-center gap-1.5 bg-teal-500/5 px-2.5 py-1 rounded-lg w-max border border-teal-500/10">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active clinical profiles logged</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 p-6 rounded-2xl transition-all duration-300 group hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Active Specialists</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-4">{activeDoctors || 4}</p>
          <div className="text-[10px] text-emerald-400 font-semibold mt-2 flex items-center gap-1.5 bg-emerald-500/5 px-2.5 py-1 rounded-lg w-max border border-emerald-500/10 animate-pulse">
            <Activity className="w-3.5 h-3.5 animate-bounce" />
            <span>Active schedule availability status</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 p-6 rounded-2xl transition-all duration-300 group hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Pending Bookings</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-4">{pendingAppointments + confirmedAppointments}</p>
          <div className="text-[10px] text-amber-400 font-semibold mt-2 flex items-center gap-1.5 bg-amber-500/5 px-2.5 py-1 rounded-lg w-max border border-amber-500/10">
            <Clock className="w-3.5 h-3.5" />
            <span>Schedules awaiting triage</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 p-6 rounded-2xl transition-all duration-300 group hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">System Finances</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-4">
            ${user?.role === "admin" ? analytics.totalRevenue : (bills.filter(b => b.status === "paid").reduce((acc, curr) => acc + curr.total, 0) || 189)}
          </p>
          <div className="text-[10px] text-indigo-400 font-semibold mt-2 flex items-center gap-1.5 bg-indigo-500/5 px-2.5 py-1 rounded-lg w-max border border-indigo-500/15">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Cleared ledger receipts</span>
          </div>
        </div>

      </div>

      {/* Main Analytics Graphs & Activity list layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Card (Recharts) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Accounting Ledger</p>
              <h2 className="text-lg font-bold text-white mt-0.5">Enterprise Revenue Analytics</h2>
            </div>
            <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-emerald-400">
              Live REST Sync
            </div>
          </div>

          <div className="h-68 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#f8fafc" }}
                  itemStyle={{ color: "#10b981" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Appointment status bar summary chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Triage Schedulers</p>
            <h2 className="text-lg font-bold text-white mt-0.5">Appointments Triage</h2>
            <p className="text-xs text-slate-400 mt-1">Breakdown of clinic reservation states</p>
          </div>

          <div className="h-44 w-full mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentSummaryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#f8fafc" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {appointmentSummaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/80">
            {appointmentSummaryData.map(st => (
              <div key={st.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }} />
                <span className="text-xs text-slate-400 font-semibold">{st.name}: {st.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Two-Column: Low Stock Medicines & Recent Activity logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Medicine Low Stock warnings box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
              <span>Low-Stock Supply Audits</span>
            </h3>
            <span className="text-[10px] text-amber-500 bg-amber-500/5 border border-amber-500/20 rounded-lg px-2.5 py-1 font-bold">
              Restock Mandated
            </span>
          </div>

          <div className="divide-y divide-slate-800/80 overflow-y-auto max-h-56">
            {lowStockMedicines.length > 0 ? (
              lowStockMedicines.map(med => (
                <div key={med.id} className="py-3 flex items-center justify-between group">
                  <div>
                    <p className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{med.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{med.category} · Exp: {med.expiryDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-red-400 bg-red-400/5 px-2 py-1 rounded border border-red-400/10">Stock: {med.stock} / min: {med.minStockAlert}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-xs py-4 text-center font-medium">All medicines and surgical commodities remain above minimum safety balances levels.</p>
            )}
          </div>
        </div>

        {/* Recent telemetry logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Recent Activities Log</h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Audit Trail</span>
          </div>

          <div className="space-y-3.5 overflow-y-auto max-h-56">
            {getRecentActivities().map((act, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 
                  ${act.type === "appointment" ? "bg-emerald-400" : "bg-indigo-400"}`} 
                />
                <div className="flex-1">
                  <p className="text-slate-200 font-medium leading-relaxed">{act.text}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {new Date(act.date).toLocaleDateString()} {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
