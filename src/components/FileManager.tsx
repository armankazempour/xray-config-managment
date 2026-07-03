"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload,
  Trash2,
  FileText,
  Download,
  RefreshCw,
  FolderOpen,
  HardDrive,
} from "lucide-react";

interface RepoFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export default function FileManager({ token }: { token: string }) {
  const [files, setFiles] = useState<RepoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch("/api/files", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFiles(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/files", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Upload failed");
      }

      fetchFiles();
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (id: string) => {
    if (!confirm("Delete this file from the repository?")) return;
    try {
      await fetch(`/api/files/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFiles();
    } catch {
      // ignore
    }
  };

  const downloadFile = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/files/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Repository</h2>
          <p className="text-slate-400 mt-1">Manage Xray configuration files</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <HardDrive className="w-4 h-4" />
            {files.length} files · {formatSize(totalSize)}
          </div>
          <button
            onClick={() => {
              setLoading(true);
              fetchFiles();
            }}
            className="p-2 glass rounded-xl hover:bg-white/5 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`glass-card p-8 mb-6 text-center cursor-pointer transition-all ${
          dragOver ? "border-indigo-500/50 bg-indigo-500/5" : ""
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".json,.txt,.conf,.yaml,.yml,.toml,.xml,.ini,.cfg,.log"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              uploadFile(e.target.files[0]);
              e.target.value = "";
            }
          }}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
            <p className="text-slate-400">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Upload className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-slate-300 font-medium">Drop files here or click to upload</p>
              <p className="text-slate-500 text-sm mt-1">
                Supported: .json, .txt, .conf, .yaml, .yml, .toml, .xml, .ini, .cfg
              </p>
            </div>
          </div>
        )}
      </div>

      {/* File List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="flex justify-between">
                <div className="h-5 w-48 bg-white/5 rounded" />
                <div className="h-5 w-20 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Repository is empty</p>
          <p className="text-slate-500 text-sm mt-1">Upload configuration files to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div key={file.id} className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {file.originalName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatSize(file.size)} ·{" "}
                    {new Date(file.uploadedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => downloadFile(file.id, file.originalName)}
                  className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteFile(file.id)}
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
