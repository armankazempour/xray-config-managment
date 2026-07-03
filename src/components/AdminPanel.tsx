"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import Dashboard from "@/components/Dashboard";
import UserManagement from "@/components/UserManagement";
import FileManager from "@/components/FileManager";
import SettingsPanel from "@/components/SettingsPanel";

interface AdminPanelProps {
  token: string;
  onLogout: () => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "files", label: "Repository", icon: FolderOpen },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function AdminPanel({ token, onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard token={token} />;
      case "users":
        return <UserManagement token={token} />;
      case "files":
        return <FileManager token={token} />;
      case "settings":
        return <SettingsPanel token={token} />;
      default:
        return <Dashboard token={token} />;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Mobile menu toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass rounded-xl"
      >
        <div className="w-6 h-5 flex flex-col justify-between">
          <span className={`block h-0.5 bg-slate-300 transition-all ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block h-0.5 bg-slate-300 transition-all ${mobileMenuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 bg-slate-300 transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </div>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 glass border-r border-white/5 flex flex-col transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg">XRay Manager</h1>
              <p className="text-xs text-slate-500">Config Repository</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`sidebar-link w-full flex items-center gap-3 px-4 py-3 text-left text-sm ${
                activeTab === item.id ? "active text-indigo-300" : "text-slate-400"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 sidebar-link text-sm"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto min-h-screen">
        <div className="max-w-7xl mx-auto pt-12 lg:pt-0">{renderContent()}</div>
      </main>
    </div>
  );
}
