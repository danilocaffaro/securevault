"use client";

import { useState, useEffect, useCallback } from "react";

interface Credential {
  name: string;
  savedAt: string;
}

type Status = "idle" | "saving" | "success" | "error";

export default function Home() {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [credentials, setCredentials] = useState<Credential[]>([]);

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch("/api/list");
      if (res.ok) {
        const data: { credentials: Credential[] } = await res.json();
        setCredentials(data.credentials);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleSave = async () => {
    if (!name.trim() || !value.trim()) {
      setStatus("error");
      setMessage("Both fields are required");
      return;
    }

    setStatus("saving");
    setMessage("");

    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), value: value.trim() }),
      });

      const data: { ok: boolean; error?: string } = await res.json();

      if (data.ok) {
        setStatus("success");
        setMessage(`"${name.trim()}" saved securely`);
        setName("");
        setValue("");
        fetchList();
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to save");
      }
    } catch {
      setStatus("error");
      setMessage("Connection failed");
    }

    setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div
        className="w-full max-w-md rounded-2xl p-6 space-y-6"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="text-3xl">🔐</div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            SecureVault
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Credentials are saved to macOS Keychain
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Credential Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. OPENAI_API_KEY"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Value
            </label>
            <input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="off"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={status === "saving"}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: status === "saving" ? "var(--border)" : "var(--accent)",
              color: "#fff",
              cursor: status === "saving" ? "wait" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (status !== "saving") e.currentTarget.style.background = "var(--accent-hover)";
            }}
            onMouseLeave={(e) => {
              if (status !== "saving") e.currentTarget.style.background = "var(--accent)";
            }}
          >
            {status === "saving" ? "Saving..." : "Save Securely"}
          </button>
        </div>

        {/* Status */}
        {status === "success" && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{ background: "#22c55e15", color: "var(--success)" }}>
            <span>✅</span> {message}
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{ background: "#ef444415", color: "var(--error)" }}>
            <span>❌</span> {message}
          </div>
        )}

        {/* Saved credentials */}
        {credentials.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Saved Credentials
            </h2>
            <div className="space-y-1">
              {credentials.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm"
                  style={{ background: "var(--bg-secondary)" }}
                >
                  <span className="font-mono text-xs" style={{ color: "var(--text-primary)" }}>
                    {c.name}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {c.savedAt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs" style={{ color: "var(--text-secondary)" }}>
          🔒 Secured via Tailscale • Stored in macOS Keychain
        </p>
      </div>
    </main>
  );
}
