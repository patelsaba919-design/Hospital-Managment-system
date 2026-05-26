import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { HeartPulse, Key, Mail, UserPlus, HelpCircle, Lock, ArrowLeft } from "lucide-react";

interface LoginProps {
  onSuccess: () => void;
  onBackToLanding: () => void;
}

export default function Login({ onSuccess, onBackToLanding }: LoginProps) {
  const { login, signup } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "forgot">("login");
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("patient");
  
  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const triggerAlert = (type: "success" | "error", text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => {
      setAlertMsg(null);
    }, 4000);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      return triggerAlert("error", "Please provide email and password details.");
    }

    setIsLoading(true);
    const res = await login(loginEmail, loginPassword);
    setIsLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      triggerAlert("error", res.error || "Login validation failed.");
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      return triggerAlert("error", "All fields are required for register checks.");
    }

    setIsLoading(true);
    const res = await signup(regName, regEmail, regPassword, regRole);
    setIsLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      triggerAlert("error", res.error || "Registration validation error.");
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotNewPassword) {
      return triggerAlert("error", "Email and New Password parameters are required.");
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, newPassword: forgotNewPassword })
      });
      const data = await response.json();
      setIsLoading(false);

      if (!response.ok) {
        return triggerAlert("error", data.error || "Password reset verification failed.");
      }

      triggerAlert("success", "Password updated successfully! Please log in.");
      setActiveTab("login");
    } catch (err) {
      setIsLoading(false);
      triggerAlert("error", "Gateway connection timeout.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[380px] h-[380px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-10 left-10 text-slate-500 hover:text-slate-300 transition-colors z-20">
        <button 
          onClick={onBackToLanding}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl font-medium text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Website</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center text-emerald-400 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <HeartPulse className="w-8 h-8 animate-pulse" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">MedSaaS Clinical Portal</h2>
        <p className="mt-2 text-sm text-slate-400">Secure HIPAA Encrypted Access Gateway</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/60 border border-slate-800/80 p-8 rounded-2xl backdrop-blur-xl shadow-2xl relative">
          
          {/* Quick status toast */}
          {alertMsg && (
            <div className={`absolute top-4 left-4 right-4 p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 z-30 transition-all duration-300
              ${alertMsg.type === "success" 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-red-500/10 border-red-500/20 text-red-400"}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${alertMsg.type === "success" ? "bg-emerald-400" : "bg-red-400"}`} />
              <span>{alertMsg.text}</span>
            </div>
          )}

          {/* Core Sign-In / Sign-Up tab selectors */}
          {activeTab !== "forgot" && (
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 mb-6">
              <button
                onClick={() => { setActiveTab("login"); setAlertMsg(null); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all
                  ${activeTab === "login" 
                    ? "bg-slate-800 text-emerald-400 shadow-sm" 
                    : "text-slate-500 hover:text-slate-300"}`}
              >
                Sign In Credentials
              </button>
              <button
                onClick={() => { setActiveTab("signup"); setAlertMsg(null); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all
                  ${activeTab === "signup" 
                    ? "bg-slate-800 text-emerald-400 shadow-sm" 
                    : "text-slate-500 hover:text-slate-300"}`}
              >
                Request Access Profile
              </button>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Registered Email Address</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="e.g. admin@hospital.com"
                    className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Security Password</label>
                  <button
                    type="button"
                    onClick={() => setActiveTab("forgot")}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Verify and Login</span>
                )}
              </button>

              <div className="p-3.5 bg-slate-950 border border-slate-800/60 rounded-xl mt-6 text-[11px] text-slate-400 leading-normal flex flex-col gap-1.5">
                <span className="font-bold text-emerald-400 uppercase tracking-widest text-[9px]">Bypass Speed Demo Accounts</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="block text-[8px] text-slate-500 font-bold uppercase block leading-none">ROOT ADMIN</span>
                    <button type="button" onClick={() => { setLoginEmail("admin@hospital.com"); setLoginPassword("admin123"); }} className="text-emerald-400 hover:underline hover:text-emerald-300 text-left font-semibold">admin@hospital.com</button>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-500 font-bold uppercase block leading-none">DOCTOR</span>
                    <button type="button" onClick={() => { setLoginEmail("doctor@hospital.com"); setLoginPassword("password123"); }} className="text-emerald-400 hover:underline hover:text-emerald-300 text-left font-semibold font-semibold">doctor@hospital.com</button>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-500 font-bold uppercase block leading-none">PATIENT</span>
                    <button type="button" onClick={() => { setLoginEmail("patient@hospital.com"); setLoginPassword("password123"); }} className="text-emerald-400 hover:underline hover:text-emerald-300 text-left font-semibold">patient@hospital.com</button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: SIGNUP */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <UserPlus className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    placeholder="e.g. Jonathan Doe"
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Primary Email</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    placeholder="e.g. jonathan@gmail.com"
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Select Role</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-emerald-500 text-sm focus:bg-slate-950"
                >
                  <option value="patient">Patient (Auto-creates clinical chart)</option>
                  <option value="doctor">Doctor Clinic Specialty (General Medicine)</option>
                  <option value="admin">SaaS Staff Admin Member</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Secure Password</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    placeholder="Min 6 characters recommended"
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Register Secure Access</span>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {activeTab === "forgot" && (
            <form onSubmit={handleForgotSubmit} className="space-y-6">
              <div className="flex items-center gap-2 text-slate-300 mb-2">
                <HelpCircle className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm text-white">Reset Credentials Validation</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal mb-4">
                To reset password, provide your registered account email and set a new password. The backend securely updates your credentials on validation.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-medium text-slate-400">Account Primary Email</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    placeholder="e.g. member@email.com"
                    className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Enter New Password</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => { setActiveTab("login"); setAlertMsg(null); }}
                  className="px-5 py-3 pr-6 rounded-xl border border-slate-800/80 hover:bg-slate-800/45 text-slate-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Back to Signin
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Submit Reset</span>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
