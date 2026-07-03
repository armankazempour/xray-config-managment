"use client";

import { useState } from "react";
import { Lock, Check, AlertCircle } from "lucide-react";

export default function SettingsPanel({ token }: { token: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const changePassword = async () => {
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to change password" });
        return;
      }

      setMessage({ type: "success", text: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setMessage({ type: "error", text: "Connection error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-slate-400 mt-1">Manage your admin account</p>
      </div>

      <div className="glass-card p-6 max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Lock className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Change Password</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="glass-input w-full px-4 py-2.5 text-sm"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="glass-input w-full px-4 py-2.5 text-sm"
              placeholder="Enter new password (min 6 chars)"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="glass-input w-full px-4 py-2.5 text-sm"
              placeholder="Confirm new password"
            />
          </div>

          {message && (
            <div
              className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${
                message.type === "success"
                  ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"
                  : "text-red-400 bg-red-400/10 border border-red-400/20"
              }`}
            >
              {message.type === "success" ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              {message.text}
            </div>
          )}

          <button
            onClick={changePassword}
            disabled={loading}
            className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
