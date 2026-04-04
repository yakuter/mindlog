import { useState, useEffect } from "react";
import {
  Database,
  Save,
  AlertCircle,
  CheckCircle,
  HardDrive,
  Info,
  Sparkles,
  Key,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  Package,
} from "lucide-react";
import { getStoredDbPath, setStoredDbPath } from "../../lib/database";
import { getApiKey, setApiKey } from "../../lib/ai";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { getVersion } from "@tauri-apps/api/app";

const AUTO_UPDATE_KEY = "passwall_auto_update";

export default function SettingsPanel() {
  const [dbPath, setDbPath] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [apiKey, setApiKeyState] = useState("");
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [apiKeyError, setApiKeyError] = useState("");
  const [showKey, setShowKey] = useState(false);

  const [appVersion, setAppVersion] = useState("");
  const [updateStatus, setUpdateStatus] = useState<"idle" | "checking" | "available" | "uptodate" | "downloading" | "ready" | "error">("idle");
  const [updateInfo, setUpdateInfo] = useState<Update | null>(null);
  const [updateError, setUpdateError] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [autoUpdate, setAutoUpdate] = useState(() => localStorage.getItem(AUTO_UPDATE_KEY) !== "false");

  useEffect(() => {
    setDbPath(getStoredDbPath());
    setApiKeyState(getApiKey());
    getVersion().then(setAppVersion).catch(() => setAppVersion("unknown"));
  }, []);

  const handleCheckUpdate = async () => {
    setUpdateStatus("checking");
    setUpdateError("");
    try {
      const result = await check();
      if (result) {
        setUpdateInfo(result);
        setUpdateStatus("available");
      } else {
        setUpdateStatus("uptodate");
      }
    } catch (e) {
      const msg = String(e);
      if (msg.includes("fetch") || msg.includes("release") || msg.includes("json") || msg.includes("network")) {
        setUpdateError("Could not reach the update server. No published release with update artifacts found yet.");
      } else {
        setUpdateError(msg);
      }
      setUpdateStatus("error");
    }
  };

  const handleInstallUpdate = async () => {
    if (!updateInfo) return;
    setUpdateStatus("downloading");
    setDownloadProgress(0);
    try {
      let totalBytes = 0;
      let downloadedBytes = 0;
      await updateInfo.downloadAndInstall((event) => {
        if (event.event === "Started") totalBytes = event.data.contentLength ?? 0;
        if (event.event === "Progress") {
          downloadedBytes += event.data.chunkLength;
          if (totalBytes > 0) setDownloadProgress(Math.round((downloadedBytes / totalBytes) * 100));
        }
        if (event.event === "Finished") setDownloadProgress(100);
      });
      setUpdateStatus("ready");
      setTimeout(() => relaunch(), 1500);
    } catch (e) {
      setUpdateError(String(e));
      setUpdateStatus("error");
    }
  };

  const toggleAutoUpdate = () => {
    const next = !autoUpdate;
    setAutoUpdate(next);
    localStorage.setItem(AUTO_UPDATE_KEY, String(next));
  };

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
    setDbPath("passwall-notes.db");
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
          Configure your Passwall Notes preferences
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
                    placeholder="passwall-notes.db"
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
                    <strong>Relative path</strong> (e.g. <code style={{ fontFamily: "monospace", fontSize: 10, backgroundColor: "var(--active-bg)", padding: "1px 4px", borderRadius: 3 }}>passwall-notes.db</code>) — stored in the app data directory.
                  </p>
                  <p>
                    <strong>Absolute path</strong> (e.g. <code style={{ fontFamily: "monospace", fontSize: 10, backgroundColor: "var(--active-bg)", padding: "1px 4px", borderRadius: 3 }}>/Users/you/Documents/passwall-notes.db</code>) — stored at that exact location.
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
          {/* AI Section */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: "var(--radius-md)", backgroundColor: "rgba(124, 58, 237, 0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={16} style={{ color: "#7c3aed" }} />
              </div>
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                  AI Assistant
                </h2>
                <p style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                  Gemini API configuration
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: "var(--notelist-bg)", border: "1px solid var(--border-medium)", borderRadius: "var(--radius-lg)", padding: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                Gemini API Key
              </label>

              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <Key size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-quaternary)" }} />
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => { setApiKeyState(e.target.value); setApiKeyError(""); setApiKeySaved(false); }}
                    placeholder="AIzaSy..."
                    style={{
                      width: "100%",
                      backgroundColor: "var(--editor-bg)",
                      border: apiKeyError ? "1px solid var(--danger)" : "1px solid var(--border-medium)",
                      borderRadius: "var(--radius-md)",
                      paddingLeft: 36,
                      paddingRight: 40,
                      paddingTop: 10,
                      paddingBottom: 10,
                      fontSize: 13,
                      fontFamily: "'SF Mono', 'Fira Code', monospace",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", padding: 2, background: "none", border: "none", cursor: "pointer", color: "var(--text-quaternary)" }}
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button
                  onClick={() => {
                    const trimmed = apiKey.trim();
                    if (!trimmed) { setApiKeyError("API key cannot be empty."); return; }
                    setApiKeyError("");
                    setApiKey(trimmed);
                    setApiKeySaved(true);
                    setTimeout(() => setApiKeySaved(false), 3000);
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    backgroundColor: "var(--accent)", color: "white",
                    fontSize: 12, fontWeight: 600,
                    paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
                    borderRadius: "var(--radius-md)", cursor: "pointer", border: "none", whiteSpace: "nowrap",
                  }}
                >
                  <Save size={14} />
                  Save
                </button>
              </div>

              {apiKeyError && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", backgroundColor: "var(--danger-soft)", borderRadius: "var(--radius-md)", marginBottom: 12 }}>
                  <AlertCircle size={13} style={{ color: "var(--danger)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--danger)" }}>{apiKeyError}</span>
                </div>
              )}

              {apiKeySaved && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", backgroundColor: "var(--secondary-soft)", borderRadius: "var(--radius-md)", marginBottom: 12 }}>
                  <CheckCircle size={13} style={{ color: "var(--success)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--success)" }}>API key saved. AI features are now enabled.</span>
                </div>
              )}

              <div style={{ display: "flex", gap: 8, padding: "10px 12px", backgroundColor: "var(--hover-bg)", borderRadius: "var(--radius-md)" }}>
                <Info size={14} style={{ color: "var(--text-quaternary)", flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 11, lineHeight: 1.6, color: "var(--text-tertiary)" }}>
                  <p style={{ marginBottom: 4 }}>
                    Get your API key from <strong>Google AI Studio</strong>: <code style={{ fontFamily: "monospace", fontSize: 10, backgroundColor: "var(--active-bg)", padding: "1px 4px", borderRadius: 3 }}>aistudio.google.com</code>
                  </p>
                  <p>Your key is stored locally and never sent to any server except Google's Gemini API.</p>
                </div>
              </div>
            </div>
          </div>
          {/* Updates Section */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: "var(--radius-md)", backgroundColor: "rgba(0, 255, 209, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Package size={16} style={{ color: "var(--secondary)" }} />
              </div>
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                  Updates
                </h2>
                <p style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                  Application version & auto-update
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: "var(--notelist-bg)", border: "1px solid var(--border-medium)", borderRadius: "var(--radius-lg)", padding: 20 }}>
              {/* Current version */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                    Current Version
                  </label>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'SF Mono', 'Fira Code', monospace" }}>
                    v{appVersion}
                  </span>
                </div>
                <button
                  onClick={handleCheckUpdate}
                  disabled={updateStatus === "checking" || updateStatus === "downloading"}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    backgroundColor: "var(--accent)", color: "white",
                    fontSize: 12, fontWeight: 600,
                    paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
                    borderRadius: "var(--radius-md)", cursor: updateStatus === "checking" || updateStatus === "downloading" ? "not-allowed" : "pointer",
                    border: "none", whiteSpace: "nowrap",
                    opacity: updateStatus === "checking" || updateStatus === "downloading" ? 0.6 : 1,
                  }}
                >
                  {updateStatus === "checking" ? (
                    <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Checking...</>
                  ) : (
                    <><RefreshCw size={14} /> Check for Updates</>
                  )}
                </button>
              </div>

              {/* Up to date */}
              {updateStatus === "uptodate" && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", backgroundColor: "var(--secondary-soft)", borderRadius: "var(--radius-md)", marginBottom: 12 }}>
                  <CheckCircle size={13} style={{ color: "var(--success)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--success)" }}>You're on the latest version.</span>
                </div>
              )}

              {/* Update available */}
              {updateStatus === "available" && updateInfo && (
                <div style={{ padding: "12px", backgroundColor: "var(--accent-soft)", borderRadius: "var(--radius-md)", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                        v{updateInfo.version} available
                      </p>
                      <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>
                        A new version is ready to install.
                      </p>
                    </div>
                    <button
                      onClick={handleInstallUpdate}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: "linear-gradient(135deg, #7c3aed, #5707ff)", color: "white",
                        fontSize: 12, fontWeight: 600,
                        paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
                        borderRadius: "var(--radius-md)", cursor: "pointer", border: "none",
                      }}
                    >
                      <Download size={14} />
                      Install Update
                    </button>
                  </div>
                </div>
              )}

              {/* Downloading */}
              {updateStatus === "downloading" && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <RefreshCw size={14} style={{ color: "var(--accent)", animation: "spin 1s linear infinite" }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                      Downloading... {downloadProgress}%
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 6, backgroundColor: "var(--hover-bg)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${downloadProgress}%`, height: "100%", background: "linear-gradient(90deg, var(--accent), #7c3aed)", borderRadius: 3, transition: "width 0.3s ease" }} />
                  </div>
                </div>
              )}

              {/* Ready to relaunch */}
              {updateStatus === "ready" && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", backgroundColor: "var(--secondary-soft)", borderRadius: "var(--radius-md)", marginBottom: 12 }}>
                  <CheckCircle size={13} style={{ color: "var(--success)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--success)" }}>Update installed. Restarting...</span>
                </div>
              )}

              {/* Error */}
              {updateStatus === "error" && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", backgroundColor: "var(--danger-soft)", borderRadius: "var(--radius-md)", marginBottom: 12 }}>
                  <AlertCircle size={13} style={{ color: "var(--danger)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--danger)" }}>{updateError || "Update check failed."}</span>
                </div>
              )}

              {/* Divider */}
              <div style={{ height: 1, backgroundColor: "var(--border-light)", margin: "16px 0" }} />

              {/* Auto-update toggle */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                    Check for updates on startup
                  </label>
                  <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>
                    Automatically check when the app opens
                  </p>
                </div>
                <button
                  onClick={toggleAutoUpdate}
                  style={{
                    width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                    backgroundColor: autoUpdate ? "var(--accent)" : "var(--border-medium)",
                    position: "relative", transition: "background-color 0.2s",
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 9,
                    backgroundColor: "white",
                    position: "absolute", top: 3,
                    left: autoUpdate ? 23 : 3,
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
