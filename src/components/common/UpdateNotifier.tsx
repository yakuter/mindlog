import { useEffect, useState } from "react";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { Download, RefreshCw, X, CheckCircle } from "lucide-react";

type UpdateState = "idle" | "available" | "downloading" | "ready" | "error";

export default function UpdateNotifier() {
  const [state, setState] = useState<UpdateState>("idle");
  const [update, setUpdate] = useState<Update | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const autoUpdate = localStorage.getItem("passwall_auto_update") !== "false";
    if (!autoUpdate) return;

    let cancelled = false;

    async function checkForUpdates() {
      try {
        const result = await check();
        if (cancelled) return;
        if (result) {
          setUpdate(result);
          setState("available");
        }
      } catch {
        // No update artifacts published yet or network issue — silently ignore on startup
      }
    }

    const timer = setTimeout(checkForUpdates, 3000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  const handleUpdate = async () => {
    if (!update) return;

    try {
      setState("downloading");
      setProgress(0);

      let totalBytes = 0;
      let downloadedBytes = 0;

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            totalBytes = event.data.contentLength ?? 0;
            break;
          case "Progress":
            downloadedBytes += event.data.chunkLength;
            if (totalBytes > 0) {
              setProgress(Math.round((downloadedBytes / totalBytes) * 100));
            }
            break;
          case "Finished":
            setProgress(100);
            break;
        }
      });

      setState("ready");
      setTimeout(() => relaunch(), 1500);
    } catch (e) {
      console.error("Update failed:", e);
      setError(String(e));
      setState("error");
    }
  };

  if (state === "idle" || dismissed) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 16,
      left: 68,
      zIndex: 1000,
      minWidth: 280,
      maxWidth: 340,
      backgroundColor: "var(--card-bg)",
      border: "1px solid var(--border-medium)",
      borderRadius: "var(--radius-lg)",
      padding: "14px 16px",
      boxShadow: "var(--shadow-lg)",
      animation: "fadeIn 0.3s ease both",
    }}>
      {/* Close */}
      {state === "available" && (
        <button
          onClick={() => setDismissed(true)}
          style={{ position: "absolute", top: 8, right: 8, padding: 4, borderRadius: "var(--radius-sm)", color: "var(--text-quaternary)" }}
        >
          <X size={14} />
        </button>
      )}

      {state === "available" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "var(--radius-md)", backgroundColor: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Download size={14} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
                New Version Available
              </p>
              <p style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                v{update?.version}
              </p>
            </div>
          </div>
          <button
            onClick={handleUpdate}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              backgroundColor: "var(--accent)",
              color: "white",
              fontSize: 12,
              fontWeight: 600,
              padding: "8px 0",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              border: "none",
              transition: "opacity 0.15s",
            }}
          >
            <Download size={14} />
            Update Now
          </button>
        </>
      )}

      {state === "downloading" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <RefreshCw size={16} style={{ color: "var(--accent)", animation: "spin 1s linear infinite" }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
              Downloading... {progress}%
            </p>
          </div>
          <div style={{ width: "100%", height: 4, backgroundColor: "var(--hover-bg)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", backgroundColor: "var(--accent)", borderRadius: 2, transition: "width 0.3s ease" }} />
          </div>
        </>
      )}

      {state === "ready" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle size={16} style={{ color: "var(--success)" }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--success)" }}>
            Restarting...
          </p>
        </div>
      )}

      {state === "error" && (
        <div>
          <p style={{ fontSize: 12, color: "var(--danger)", marginBottom: 8 }}>
            Update failed: {error}
          </p>
          <button
            onClick={() => { setState("available"); setError(""); }}
            style={{ fontSize: 11, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
