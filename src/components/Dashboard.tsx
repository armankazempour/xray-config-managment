"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, UserCheck, UserX, Clock, FolderOpen, RefreshCw } from "lucide-react";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  expiredUsers: number;
  suspendedUsers: number;
  totalFiles: number;
}

export default function Dashboard({ token }: { token: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const statCards = stats
    ? [
        {
          label: "Total Users",
          value: stats.totalUsers,
          icon: Users,
          color: "text-indigo-400",
          bg: "bg-indigo-500/10",
          border: "border-indigo-500/20",
        },
        {
          label: "Active Users",
          value: stats.activeUsers,
          icon: UserCheck,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
        },
        {
          label: "Expired Users",
          value: stats.expiredUsers,
          icon: UserX,
          color: "text-red-400",
          bg: "bg-red-500/10",
          border: "border-red-500/20",
        },
        {
          label: "Suspended Users",
          value: stats.suspendedUsers,
          icon: Clock,
          color: "text-amber-400",
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
        },
        {
          label: "Repository Files",
          value: stats.totalFiles,
          icon: FolderOpen,
          color: "text-cyan-400",
          bg: "bg-cyan-500/10",
          border: "border-cyan-500/20",
        },
      ]
    : [];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-slate-400 mt-1">Overview of your configuration repository</p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchStats();
          }}
          className="p-2 glass rounded-xl hover:bg-white/5 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-10 w-10 rounded-xl bg-white/5 mb-4" />
              <div className="h-8 w-16 bg-white/5 rounded mb-2" />
              <div className="h-4 w-20 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="glass-card p-6">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${card.bg} border ${card.border} mb-4`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-3xl font-bold text-white">{card.value}</p>
              <p className="text-sm text-slate-400 mt-1">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-sm text-slate-400">
              <span className="text-slate-200 font-medium">Repository Path:</span>{" "}
              /repository/
            </p>
            <p className="text-sm text-slate-400">
              <span className="text-slate-200 font-medium">User Access URL:</span>{" "}
              /api/repo/&#123;user_token&#125;
            </p>
            <p className="text-sm text-slate-400">
              <span className="text-slate-200 font-medium">File Download:</span>{" "}
              /api/repo/&#123;token&#125;?file=&#123;filename&#125;
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-slate-400">
              <span className="text-slate-200 font-medium">Allowed File Types:</span>{" "}
              .json, .txt, .conf, .yaml, .yml, .toml, .xml, .ini, .cfg
            </p>
            <p className="text-sm text-slate-400">
              <span className="text-slate-200 font-medium">Auth:</span>{" "}
              JWT Token (24h expiry)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
