"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Ban,
  Play,
  Clock,
  Copy,
  Check,
  X,
  Search,
  RefreshCw,
  Link,
  CalendarPlus,
} from "lucide-react";

interface User {
  id: string;
  username: string;
  token: string;
  subscriptionDays: number;
  startDate: string;
  expirationDate: string;
  status: string;
  remainingDays: number;
  createdAt: string;
}

export default function UserManagement({ token }: { token: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<User | null>(null);
  const [showExtend, setShowExtend] = useState<User | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Create form
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newDays, setNewDays] = useState("30");

  // Edit form
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editDays, setEditDays] = useState("");

  // Extend form
  const [extendDays, setExtendDays] = useState("30");

  const [formError, setFormError] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async () => {
    setFormError("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          subscriptionDays: newDays,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error);
        return;
      }
      setShowCreate(false);
      setNewUsername("");
      setNewPassword("");
      setNewDays("30");
      fetchUsers();
    } catch {
      setFormError("Failed to create user");
    }
  };

  const updateUser = async () => {
    if (!showEdit) return;
    setFormError("");
    try {
      const body: Record<string, string> = {};
      if (editUsername) body.username = editUsername;
      if (editPassword) body.password = editPassword;
      if (editDays) body.subscriptionDays = editDays;

      const res = await fetch(`/api/users/${showEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error);
        return;
      }
      setShowEdit(null);
      fetchUsers();
    } catch {
      setFormError("Failed to update user");
    }
  };

  const performAction = async (userId: string, action: string, days?: string) => {
    try {
      const body: Record<string, string> = { action };
      if (days) body.days = days;

      await fetch(`/api/users/${userId}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      fetchUsers();
    } catch {
      // ignore
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch {
      // ignore
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-slate-400 mt-1">Manage users and subscriptions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setLoading(true);
              fetchUsers();
            }}
            className="p-2 glass rounded-xl hover:bg-white/5 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary px-4 py-2 flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Create User
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="glass-input w-full pl-11 pr-4 py-3 text-sm"
        />
      </div>

      {/* User Cards */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="flex justify-between">
                <div className="h-6 w-32 bg-white/5 rounded" />
                <div className="h-6 w-16 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-slate-400">No users found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="glass-card p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-white">{user.username}</h3>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        user.status === "active"
                          ? "status-active"
                          : user.status === "expired"
                          ? "status-expired"
                          : "status-suspended"
                      }`}
                    >
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500">Subscription:</span>{" "}
                      <span className="text-slate-300">{user.subscriptionDays} days</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Start:</span>{" "}
                      <span className="text-slate-300">{formatDate(user.startDate)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Expires:</span>{" "}
                      <span className="text-slate-300">{formatDate(user.expirationDate)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Remaining:</span>{" "}
                      <span
                        className={`font-medium ${
                          user.remainingDays > 7
                            ? "text-emerald-400"
                            : user.remainingDays > 0
                            ? "text-amber-400"
                            : "text-red-400"
                        }`}
                      >
                        {user.remainingDays} days
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Link className="w-3.5 h-3.5 text-slate-500" />
                    <code className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-lg truncate max-w-[300px]">
                      /api/repo/{user.token.slice(0, 16)}...
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${window.location.origin}/api/repo/${user.token}`,
                          user.id
                        )
                      }
                      className="text-slate-500 hover:text-indigo-400 transition-colors"
                    >
                      {copied === user.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setShowExtend(user);
                      setExtendDays("30");
                    }}
                    className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                    title="Extend"
                  >
                    <CalendarPlus className="w-4 h-4" />
                  </button>
                  {user.status === "active" ? (
                    <button
                      onClick={() => performAction(user.id, "suspend")}
                      className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors"
                      title="Suspend"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => performAction(user.id, "reactivate")}
                      className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                      title="Reactivate"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => performAction(user.id, "expire")}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Expire Now"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setShowEdit(user);
                      setEditUsername(user.username);
                      setEditPassword("");
                      setEditDays(String(user.subscriptionDays));
                      setFormError("");
                    }}
                    className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create User Modal */}
      {showCreate && (
        <Modal
          title="Create User"
          onClose={() => {
            setShowCreate(false);
            setFormError("");
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="glass-input w-full px-4 py-2.5 text-sm"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Password</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="glass-input w-full px-4 py-2.5 text-sm"
                placeholder="Enter password"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Subscription Days</label>
              <input
                type="number"
                value={newDays}
                onChange={(e) => setNewDays(e.target.value)}
                className="glass-input w-full px-4 py-2.5 text-sm"
                min={1}
              />
            </div>
            {formError && (
              <p className="text-red-400 text-sm bg-red-400/10 rounded-xl px-3 py-2">{formError}</p>
            )}
            <button onClick={createUser} className="btn-primary w-full py-2.5 text-sm">
              Create User
            </button>
          </div>
        </Modal>
      )}

      {/* Edit User Modal */}
      {showEdit && (
        <Modal
          title={`Edit: ${showEdit.username}`}
          onClose={() => {
            setShowEdit(null);
            setFormError("");
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Username</label>
              <input
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="glass-input w-full px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">New Password (leave blank to keep)</label>
              <input
                type="text"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                className="glass-input w-full px-4 py-2.5 text-sm"
                placeholder="Leave blank to keep current"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Subscription Days</label>
              <input
                type="number"
                value={editDays}
                onChange={(e) => setEditDays(e.target.value)}
                className="glass-input w-full px-4 py-2.5 text-sm"
                min={1}
              />
            </div>
            {formError && (
              <p className="text-red-400 text-sm bg-red-400/10 rounded-xl px-3 py-2">{formError}</p>
            )}
            <button onClick={updateUser} className="btn-primary w-full py-2.5 text-sm">
              Save Changes
            </button>
          </div>
        </Modal>
      )}

      {/* Extend Subscription Modal */}
      {showExtend && (
        <Modal
          title={`Extend: ${showExtend.username}`}
          onClose={() => setShowExtend(null)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Days to Add</label>
              <input
                type="number"
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value)}
                className="glass-input w-full px-4 py-2.5 text-sm"
                min={1}
              />
            </div>
            <button
              onClick={() => {
                performAction(showExtend.id, "extend", extendDays);
                setShowExtend(null);
              }}
              className="btn-primary w-full py-2.5 text-sm"
            >
              Extend Subscription
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card p-6 w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
