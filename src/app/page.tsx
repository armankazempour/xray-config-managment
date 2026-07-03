"use client";

import { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import AdminPanel from "@/components/AdminPanel";
import LoginForm from "@/components/LoginForm";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("admin_token");
    if (stored) {
      setToken(stored);
    }
    setLoading(false);
    // Initialize admin account
    fetch("/api/init").catch(() => {});
  }, []);

  const handleLogin = (t: string) => {
    localStorage.setItem("admin_token", t);
    setToken(t);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-indigo-400 animate-pulse" />
          <span className="text-xl text-slate-300">Loading...</span>
        </div>
      </div>
    );
  }

  if (!token) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <AdminPanel token={token} onLogout={handleLogout} />;
}
