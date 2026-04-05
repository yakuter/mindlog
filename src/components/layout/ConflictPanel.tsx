import { useState } from "react";
import {
  AlertTriangle,
  Monitor,
  Cloud,
  Check,
  GitMerge,
  ArrowRight,
  Clock,
} from "lucide-react";

const LOCAL_NOTE = {
  title: "Q2 Product Roadmap",
  content: `## Q2 2026 Roadmap

### Goals
- Launch mobile app (iOS + Android)
- Implement real-time collaboration
- Add end-to-end encryption
- Performance improvements (50% faster sync)

### Timeline
- **April**: Mobile app beta release
- **May**: Collaboration MVP
- **June**: E2E encryption + public launch

### Notes
Priority is mobile — users have been requesting this since Q4.
Talk to design team about the collab UX on Monday.`,
  updatedAt: "Today, 14:32",
  updatedBy: "You (this device)",
};

const REMOTE_NOTE = {
  title: "Q2 Product Roadmap — Updated",
  content: `## Q2 2026 Roadmap

### Goals
- Launch mobile app (iOS only first, Android in Q3)
- Implement real-time collaboration
- Add end-to-end encryption
- Redesign settings page
- Performance improvements (50% faster sync)

### Timeline
- **April**: Mobile app beta release (iOS)
- **May**: Collaboration MVP + settings redesign
- **June**: E2E encryption + public launch
- **July**: Android release

### Notes
Priority is mobile — users have been requesting this since Q4.
Android pushed to Q3 per Sarah's resource constraints.
Design team meeting moved to Wednesday.`,
  updatedAt: "Today, 14:45",
  updatedBy: "You (MacBook Pro)",
};

type Resolution = "pending" | "local" | "remote" | "merged";

export default function ConflictPanel() {
  const [resolution, setResolution] = useState<Resolution>("pending");
  const [showDiff, setShowDiff] = useState(true);

  const handleResolve = (choice: Resolution) => {
    setResolution(choice);
    setTimeout(() => setResolution("pending"), 3000);
  };

  const diffLines = getDiffLines(LOCAL_NOTE.content, REMOTE_NOTE.content);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "var(--editor-bg)" }}>
      {/* Header */}
      <div style={{ paddingTop: 14, paddingLeft: 32, paddingRight: 32, paddingBottom: 16, flexShrink: 0, borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: "var(--radius-md)", backgroundColor: "rgba(245, 158, 11, 0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertTriangle size={16} style={{ color: "#f59e0b" }} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
              Sync Conflict
            </h1>
            <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>
              This note was modified on another device while you had unsaved changes
            </p>
          </div>
        </div>
      </div>

      {/* Resolution success banner */}
      {resolution !== "pending" && (
        <div style={{ margin: "16px 32px 0", padding: "12px 16px", backgroundColor: "var(--secondary-soft)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: 8 }}>
          <Check size={15} style={{ color: "var(--success)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--success)" }}>
            {resolution === "local" && "Kept local version. Remote changes discarded."}
            {resolution === "remote" && "Accepted remote version. Local changes discarded."}
            {resolution === "merged" && "Manual merge applied. Both versions preserved."}
          </span>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
        {/* Note info bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, padding: "10px 14px", backgroundColor: "var(--hover-bg)", borderRadius: "var(--radius-md)" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
            "{LOCAL_NOTE.title}"
          </span>
          <ArrowRight size={12} style={{ color: "var(--text-quaternary)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--warning)" }}>
            "{REMOTE_NOTE.title}"
          </span>
        </div>

        {/* Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button
            onClick={() => setShowDiff(false)}
            style={{
              padding: "6px 14px", borderRadius: "var(--radius-md)", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
              backgroundColor: !showDiff ? "var(--accent)" : "var(--hover-bg)",
              color: !showDiff ? "white" : "var(--text-secondary)",
            }}
          >
            Side by Side
          </button>
          <button
            onClick={() => setShowDiff(true)}
            style={{
              padding: "6px 14px", borderRadius: "var(--radius-md)", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
              backgroundColor: showDiff ? "var(--accent)" : "var(--hover-bg)",
              color: showDiff ? "white" : "var(--text-secondary)",
            }}
          >
            Unified Diff
          </button>
        </div>

        {showDiff ? (
          /* Unified diff view */
          <div style={{ backgroundColor: "var(--notelist-bg)", border: "1px solid var(--border-medium)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: 8 }}>
              <GitMerge size={14} style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>Changes</span>
              <span style={{ fontSize: 11, color: "var(--text-quaternary)" }}>
                — <span style={{ color: "#ef4444" }}>removed</span> / <span style={{ color: "#22c55e" }}>added</span>
              </span>
            </div>
            <div style={{ padding: "12px 0", fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 12, lineHeight: 1.8 }}>
              {diffLines.map((line, i) => (
                <div
                  key={i}
                  style={{
                    padding: "1px 16px",
                    backgroundColor:
                      line.type === "added" ? "rgba(34, 197, 94, 0.08)" :
                      line.type === "removed" ? "rgba(239, 68, 68, 0.08)" : "transparent",
                    color:
                      line.type === "added" ? "#22c55e" :
                      line.type === "removed" ? "#ef4444" : "var(--text-secondary)",
                  }}
                >
                  <span style={{ display: "inline-block", width: 18, color: "var(--text-quaternary)", userSelect: "none" }}>
                    {line.type === "added" ? "+" : line.type === "removed" ? "−" : " "}
                  </span>
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Side by side view */
          <div style={{ display: "flex", gap: 16 }}>
            {/* Local */}
            <div style={{ flex: 1, backgroundColor: "var(--notelist-bg)", border: "1px solid var(--border-medium)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Monitor size={14} style={{ color: "var(--accent)" }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>Local Version</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={10} style={{ color: "var(--text-quaternary)" }} />
                  <span style={{ fontSize: 10, color: "var(--text-quaternary)" }}>{LOCAL_NOTE.updatedAt}</span>
                </div>
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{
                  fontSize: 15, fontWeight: 700, marginBottom: 12,
                  color: LOCAL_NOTE.title !== REMOTE_NOTE.title ? "var(--text-primary)" : "var(--text-primary)",
                  backgroundColor: LOCAL_NOTE.title !== REMOTE_NOTE.title ? "rgba(239, 68, 68, 0.08)" : "transparent",
                  padding: LOCAL_NOTE.title !== REMOTE_NOTE.title ? "2px 6px" : 0,
                  borderRadius: 4,
                }}>{LOCAL_NOTE.title}</h3>
                <div style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 12, lineHeight: 1.8 }}>
                  {renderSideLines(LOCAL_NOTE.content, REMOTE_NOTE.content, "local")}
                </div>
              </div>
              <div style={{ padding: "8px 16px", borderTop: "1px solid var(--border-light)", fontSize: 10, color: "var(--text-quaternary)" }}>
                {LOCAL_NOTE.updatedBy}
              </div>
            </div>

            {/* Remote */}
            <div style={{ flex: 1, backgroundColor: "var(--notelist-bg)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(245, 158, 11, 0.15)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Cloud size={14} style={{ color: "#f59e0b" }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>Remote Version</span>
                  <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 9999, backgroundColor: "rgba(245, 158, 11, 0.12)", color: "#f59e0b" }}>NEWER</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={10} style={{ color: "var(--text-quaternary)" }} />
                  <span style={{ fontSize: 10, color: "var(--text-quaternary)" }}>{REMOTE_NOTE.updatedAt}</span>
                </div>
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{
                  fontSize: 15, fontWeight: 700, marginBottom: 12,
                  color: LOCAL_NOTE.title !== REMOTE_NOTE.title ? "var(--text-primary)" : "var(--text-primary)",
                  backgroundColor: LOCAL_NOTE.title !== REMOTE_NOTE.title ? "rgba(34, 197, 94, 0.08)" : "transparent",
                  padding: LOCAL_NOTE.title !== REMOTE_NOTE.title ? "2px 6px" : 0,
                  borderRadius: 4,
                }}>{REMOTE_NOTE.title}</h3>
                <div style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 12, lineHeight: 1.8 }}>
                  {renderSideLines(LOCAL_NOTE.content, REMOTE_NOTE.content, "remote")}
                </div>
              </div>
              <div style={{ padding: "8px 16px", borderTop: "1px solid rgba(245, 158, 11, 0.15)", fontSize: 10, color: "var(--text-quaternary)" }}>
                {REMOTE_NOTE.updatedBy}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div style={{ padding: "16px 32px", borderTop: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button
          onClick={() => handleResolve("local")}
          disabled={resolution !== "pending"}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "10px 20px", borderRadius: "var(--radius-md)", fontSize: 12, fontWeight: 600,
            backgroundColor: "var(--hover-bg)", color: "var(--text-primary)",
            border: "1px solid var(--border-medium)", cursor: "pointer",
            opacity: resolution !== "pending" ? 0.5 : 1,
          }}
        >
          <Monitor size={14} />
          Keep Local
        </button>
        <button
          onClick={() => handleResolve("remote")}
          disabled={resolution !== "pending"}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "10px 20px", borderRadius: "var(--radius-md)", fontSize: 12, fontWeight: 600,
            backgroundColor: "var(--hover-bg)", color: "var(--text-primary)",
            border: "1px solid var(--border-medium)", cursor: "pointer",
            opacity: resolution !== "pending" ? 0.5 : 1,
          }}
        >
          <Cloud size={14} />
          Keep Remote
        </button>
        <button
          onClick={() => handleResolve("merged")}
          disabled={resolution !== "pending"}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "10px 20px", borderRadius: "var(--radius-md)", fontSize: 12, fontWeight: 600,
            background: "linear-gradient(135deg, #7c3aed, #5707ff)", color: "white",
            border: "none", cursor: "pointer",
            opacity: resolution !== "pending" ? 0.5 : 1,
          }}
        >
          <GitMerge size={14} />
          Manual Merge
        </button>

        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: "var(--text-quaternary)" }}>
          1 conflict remaining
        </span>
      </div>
    </div>
  );
}

function renderSideLines(localContent: string, remoteContent: string, side: "local" | "remote") {
  const localLines = localContent.split("\n");
  const remoteLines = remoteContent.split("\n");
  const remoteSet = new Set(remoteLines);
  const localSet = new Set(localLines);

  const lines = side === "local" ? localLines : remoteLines;
  const otherSet = side === "local" ? remoteSet : localSet;

  return lines.map((line, i) => {
    const isChanged = !otherSet.has(line);
    const bg = isChanged
      ? side === "local"
        ? "rgba(239, 68, 68, 0.08)"
        : "rgba(34, 197, 94, 0.08)"
      : "transparent";
    const borderLeft = isChanged
      ? side === "local"
        ? "3px solid rgba(239, 68, 68, 0.5)"
        : "3px solid rgba(34, 197, 94, 0.5)"
      : "3px solid transparent";
    const color = isChanged
      ? side === "local" ? "#ef4444" : "#22c55e"
      : "var(--text-secondary)";

    return (
      <div key={i} style={{ padding: "1px 8px", backgroundColor: bg, borderLeft, color }}>
        {line || "\u00A0"}
      </div>
    );
  });
}

function getDiffLines(local: string, remote: string) {
  const localLines = local.split("\n");
  const remoteLines = remote.split("\n");
  const result: { type: "same" | "added" | "removed"; text: string }[] = [];

  const localSet = new Set(localLines);
  const remoteSet = new Set(remoteLines);

  let li = 0, ri = 0;
  while (li < localLines.length || ri < remoteLines.length) {
    if (li < localLines.length && ri < remoteLines.length && localLines[li] === remoteLines[ri]) {
      result.push({ type: "same", text: localLines[li] });
      li++; ri++;
    } else if (li < localLines.length && !remoteSet.has(localLines[li])) {
      result.push({ type: "removed", text: localLines[li] });
      li++;
    } else if (ri < remoteLines.length && !localSet.has(remoteLines[ri])) {
      result.push({ type: "added", text: remoteLines[ri] });
      ri++;
    } else if (li < localLines.length) {
      result.push({ type: "removed", text: localLines[li] });
      li++;
    } else {
      result.push({ type: "added", text: remoteLines[ri] });
      ri++;
    }
  }

  return result;
}
