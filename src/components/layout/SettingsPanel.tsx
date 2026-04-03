import { useState, useEffect } from "react";
import {
  Database,
  Save,
  AlertCircle,
  CheckCircle,
  HardDrive,
  Info,
} from "lucide-react";
import { getStoredDbPath, setStoredDbPath } from "../../lib/database";

export default function SettingsPanel() {
  const [dbPath, setDbPath] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setDbPath(getStoredDbPath());
  }, []);

  const handleSave = () => {
    const trimmed = dbPath.trim();
    if (!trimmed) {
      setError("Database path cannot be empty.");
      return;
    }
    if (!trimmed.endsWith(".db") && !trimmed.endsWith(".sqlite")) {
      setError("File should end with .db or .sqlite");
      return;
    }
    setError("");
    setStoredDbPath(trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setDbPath("mindlog.db");
    setError("");
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "var(--editor-bg)" }}>
      {/* Header */}
      <div style={{ paddingTop: 14, paddingLeft: 32, paddingRight: 32, paddingBottom: 16, flexShrink: 0, borderBottom: "1px solid var(--border-light)" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
          Settings
        </h1>
        <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>
          Configure your MindLog preferences
        </p>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
        <div style={{ maxWidth: 560 }}>
          {/* Database Section */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: "var(--radius-md)", backgroundColor: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Database size={16} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                  Database
                </h2>
                <p style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                  SQLite storage configuration
                </p>
              </div>
            </div>

            {/* DB Path Input */}
            <div style={{ backgroundColor: "var(--notelist-bg)", border: "1px solid var(--border-medium)", borderRadius: "var(--radius-lg)", padding: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                Database File Path
              </label>

              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <HardDrive size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-quaternary)" }} />
                  <input
                    type="text"
                    value={dbPath}
                    onChange={(e) => { setDbPath(e.target.value); setError(""); setSaved(false); }}
                    placeholder="mindlog.db"
                    style={{
                      width: "100%",
                      backgroundColor: "var(--editor-bg)",
                      border: error ? "1px solid var(--danger)" : "1px solid var(--border-medium)",
                      borderRadius: "var(--radius-md)",
                      paddingLeft: 36,
                      paddingRight: 12,
                      paddingTop: 10,
                      paddingBottom: 10,
                      fontSize: 13,
                      fontFamily: "'SF Mono', 'Fira Code', monospace",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  />
                </div>
                <button
                  onClick={handleSave}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: "var(--accent)",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 600,
                    paddingLeft: 16,
                    paddingRight: 16,
                    paddingTop: 10,
                    paddingBottom: 10,
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    border: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Save size={14} />
                  Save
                </button>
              </div>

              {/* Error message */}
              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", backgroundColor: "var(--danger-soft)", borderRadius: "var(--radius-md)", marginBottom: 12 }}>
                  <AlertCircle size={13} style={{ color: "var(--danger)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--danger)" }}>{error}</span>
                </div>
              )}

              {/* Success message */}
              {saved && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", backgroundColor: "var(--secondary-soft)", borderRadius: "var(--radius-md)", marginBottom: 12 }}>
                  <CheckCircle size={13} style={{ color: "var(--success)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--success)" }}>Path saved. Restart the app to apply changes.</span>
                </div>
              )}

              {/* Info */}
              <div style={{ display: "flex", gap: 8, padding: "10px 12px", backgroundColor: "var(--hover-bg)", borderRadius: "var(--radius-md)" }}>
                <Info size={14} style={{ color: "var(--text-quaternary)", flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 11, lineHeight: 1.6, color: "var(--text-tertiary)" }}>
                  <p style={{ marginBottom: 4 }}>
                    <strong>Relative path</strong> (e.g. <code style={{ fontFamily: "monospace", fontSize: 10, backgroundColor: "var(--active-bg)", padding: "1px 4px", borderRadius: 3 }}>mindlog.db</code>) — stored in the app data directory.
                  </p>
                  <p>
                    <strong>Absolute path</strong> (e.g. <code style={{ fontFamily: "monospace", fontSize: 10, backgroundColor: "var(--active-bg)", padding: "1px 4px", borderRadius: 3 }}>/Users/you/Documents/mindlog.db</code>) — stored at that exact location.
                  </p>
                </div>
              </div>

              {/* Reset link */}
              <div style={{ marginTop: 12, textAlign: "right" }}>
                <button
                  onClick={handleReset}
                  style={{ fontSize: 11, color: "var(--text-quaternary)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                >
                  Reset to default
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
