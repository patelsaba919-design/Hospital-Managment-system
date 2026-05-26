import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types.js";

interface AuthContextType {
  user: User | null;
  token: string | null;
  theme: "light" | "dark";
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  toggleTheme: () => void;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark"); // Default to modern ultra-premium dark slate mode
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session
    const savedToken = localStorage.getItem("hms_token");
    const savedUser = localStorage.getItem("hms_user");
    const savedTheme = localStorage.getItem("hms_theme") as "light" | "dark";

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    if (savedTheme) {
      setTheme(savedTheme);
    }
    setLoading(false);
  }, []);

  // Update theme class on root element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("hms_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Login credentials rejected." };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("hms_token", data.token);
      localStorage.setItem("hms_user", JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: "Unable to reach security gateway." };
    }
  };

  const signup = async (name: string, email: string, password: string, role: string) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Registration validation error." };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("hms_token", data.token);
      localStorage.setItem("hms_user", JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: "Registration service unreachable." };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("hms_token");
    localStorage.removeItem("hms_user");
  };

  // Automated fetch handler injecting credentials and active headers
  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const configHeaders = (options.headers || {}) as Record<string, string>;
    
    if (token) {
      configHeaders["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...configHeaders
      }
    });

    if (response.status === 401) {
      // Auto session clearance on security expiry
      logout();
      throw new Error("Authorization credentials expired. Please re-authenticate.");
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "API service request failed.");
    }

    return data;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Booting secure medical systems...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, theme, login, signup, logout, toggleTheme, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be nested within AuthProvider");
  }
  return context;
}
