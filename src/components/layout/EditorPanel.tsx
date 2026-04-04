import { useCallback, useEffect, useRef, useState } from "react";
import {
  Star,
  Trash2,
  RotateCcw,
  MoreHorizontal,
  Eye,
  Code2,
  Tag,
  X,
  Download,
  PenLine,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link2,
  Image,
  Columns2,
  Pencil,
  Sparkles,
  FileText,
  Expand,
  RefreshCw,
  Lightbulb,
  Copy,
  Check,
  Replace,
  ChevronDown,
  Languages,
} from "lucide-react";
import { useUiStore } from "../../stores/uiStore";
import { useNoteStore } from "../../stores/noteStore";
import { useTagStore } from "../../stores/tagStore";
import { runAiAction, getApiKey, ACTION_LABELS, type AiAction, type AiResult } from "../../lib/ai";
import MarkdownEditor from "../editor/MarkdownEditor";
import MarkdownPreview from "../editor/MarkdownPreview";

const toolbarItems = [
  { icon: Bold, label: "Bold", md: "**" },
  { icon: Italic, label: "Italic", md: "*" },
  { icon: Underline, label: "Underline", md: "__" },
  { icon: Strikethrough, label: "Strikethrough", md: "~~" },
  { type: "divider" as const },
  { icon: List, label: "Bullet List", md: "- " },
  { icon: ListOrdered, label: "Ordered List", md: "1. " },
  { type: "divider" as const },
  { icon: Code2, label: "Code", md: "`" },
  { icon: Link2, label: "Link", md: "[](url)" },
  { icon: Image, label: "Image", md: "![](url)" },
];

export default function EditorPanel() {
  const { selectedNoteId, editorMode, setEditorMode, setSelectedNoteId } = useUiStore();
  const { notes, updateNote, toggleFavorite, softDeleteNote, restoreNote, permanentDeleteNote } = useNoteStore();
  const { tags, noteTagMap, addTagToNote, removeTagFromNote } = useTagStore();
  const note = notes.find((n) => n.id === selectedNoteId);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [aiAction, setAiAction] = useState<AiAction | null>(null);
  const [aiError, setAiError] = useState("");
  const [copied, setCopied] = useState(false);
  const titleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDark = document.documentElement.classList.contains("dark");
  const noteTags = note ? (noteTagMap[note.id] || []) : [];
  const hasApiKey = !!getApiKey();

  useEffect(() => {
    if (note) { setTitle(note.title); setContent(note.content); }
  }, [note?.id]);

  const handleTitleChange = useCallback((v: string) => {
    setTitle(v);
    if (!note) return;
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(() => { updateNote(note.id, { title: v }); }, 500);
  }, [note?.id, updateNote]);

  const handleContentChange = useCallback((v: string) => {
    setContent(v);
    if (!note) return;
    if (contentTimerRef.current) clearTimeout(contentTimerRef.current);
    contentTimerRef.current = setTimeout(() => { updateNote(note.id, { content: v }); }, 500);
  }, [note?.id, updateNote]);

  const handleAiAction = async (action: AiAction) => {
    setShowAiMenu(false);
    setAiAction(action);
    setAiResult(null);
    setAiError("");
    setAiLoading(true);
    try {
      const result = await runAiAction(action, content, title);
      setAiResult(result);
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : "AI request failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleReplaceContent = () => {
    if (!aiResult) return;
    handleContentChange(aiResult.content);
    if (aiResult.title) handleTitleChange(aiResult.title);
    setAiResult(null);
    setAiAction(null);
  };

  const handleCopyResult = async () => {
    if (!aiResult) return;
    const text = aiResult.title
      ? `${aiResult.title}\n\n${aiResult.content}`
      : aiResult.content;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAppendResult = () => {
    if (!aiResult) return;
    handleContentChange(content + "\n\n---\n\n" + aiResult.content);
    setAiResult(null);
    setAiAction(null);
  };

  const dismissAi = () => {
    setAiResult(null);
    setAiAction(null);
    setAiError("");
    setAiLoading(false);
  };

  if (!note) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--editor-bg)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "var(--radius-xl)", backgroundColor: "var(--hover-bg)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, marginLeft: "auto", marginRight: "auto" }}>
            <PenLine size={28} style={{ color: "var(--text-quaternary)" }} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-tertiary)", marginBottom: 4 }}>
            Select a note to start editing
          </p>
          <p style={{ fontSize: 12, color: "var(--text-quaternary)" }}>
            or press <kbd style={{ padding: "2px 6px", backgroundColor: "var(--hover-bg)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", fontSize: 11, fontFamily: "monospace", fontWeight: 500, color: "var(--text-tertiary)" }}>⌘N</kbd> to create one
          </p>
        </div>
      </div>
    );
  }

  const isTrash = note.is_deleted;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "var(--editor-bg)" }}>
      {/* Top bar */}
      <div data-tauri-drag-region style={{ paddingTop: 14, paddingLeft: 32, paddingRight: 32, paddingBottom: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-quaternary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Note Editor
          </span>
          {isTrash && (
            <span style={{ fontSize: 10, fontWeight: 600, backgroundColor: "var(--danger-soft)", color: "var(--danger)", padding: "2px 8px", borderRadius: 9999 }}>
              In Trash
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {isTrash ? (
            <>
              <button onClick={() => restoreNote(note.id)} style={{ padding: 6, borderRadius: "var(--radius-sm)", color: "var(--text-tertiary)" }} title="Restore"><RotateCcw size={15} /></button>
              <button onClick={async () => { await permanentDeleteNote(note.id); setSelectedNoteId(null); }} style={{ padding: 6, borderRadius: "var(--radius-sm)", color: "var(--text-tertiary)" }} title="Delete permanently"><Trash2 size={15} /></button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditorMode(editorMode === "preview" ? "edit" : "preview")}
                style={{ padding: 6, borderRadius: "var(--radius-sm)", color: editorMode === "preview" ? "var(--accent)" : "var(--text-tertiary)", backgroundColor: editorMode === "preview" ? "var(--accent-soft)" : "transparent" }}
                title={editorMode === "preview" ? "Edit mode" : "Preview mode"}
              >
                {editorMode === "preview" ? <Pencil size={15} /> : <Eye size={15} />}
              </button>
              <button
                onClick={() => setEditorMode(editorMode === "split" ? "edit" : "split")}
                style={{ padding: 6, borderRadius: "var(--radius-sm)", color: editorMode === "split" ? "var(--accent)" : "var(--text-tertiary)", backgroundColor: editorMode === "split" ? "var(--accent-soft)" : "transparent" }}
                title="Split view"
              >
                <Columns2 size={15} />
              </button>
              <button onClick={() => toggleFavorite(note.id)} style={{ padding: 6, borderRadius: "var(--radius-sm)", color: note.is_favorite ? "var(--warning)" : "var(--text-quaternary)" }} title="Favorite">
                <Star size={15} className={note.is_favorite ? "fill-current" : ""} />
              </button>
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} style={{ padding: 6, borderRadius: "var(--radius-sm)", color: "var(--text-quaternary)" }}><MoreHorizontal size={15} /></button>
                {showMenu && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setShowMenu(false)} />
                    <div style={{ position: "absolute", right: 0, top: 32, zIndex: 20, backgroundColor: "var(--notelist-bg)", border: "1px solid var(--border-medium)", borderRadius: "var(--radius-lg)", padding: "6px 0", minWidth: 180, boxShadow: "var(--shadow-popup)" }}>
                      <button onClick={() => { setShowTagPicker(!showTagPicker); setShowMenu(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, textAlign: "left", padding: "8px 12px", fontSize: 12, color: "var(--text-primary)" }} className="hover:bg-[var(--hover-bg)]"><Tag size={13} style={{ color: "var(--text-tertiary)" }} />Manage Tags</button>
                      <button onClick={() => { const f = `${note.title || "untitled"}.md`; const b = new Blob([note.content], { type: "text/markdown" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = f; a.click(); URL.revokeObjectURL(u); setShowMenu(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, textAlign: "left", padding: "8px 12px", fontSize: 12, color: "var(--text-primary)" }} className="hover:bg-[var(--hover-bg)]"><Download size={13} style={{ color: "var(--text-tertiary)" }} />Export as Markdown</button>
                      <div style={{ height: 1, backgroundColor: "var(--border-light)", margin: "4px 8px" }} />
                      <button onClick={async () => { await softDeleteNote(note.id); setSelectedNoteId(null); setShowMenu(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, textAlign: "left", padding: "8px 12px", fontSize: 12, color: "var(--danger)" }} className="hover:bg-[var(--danger-soft)]"><Trash2 size={13} />Move to Trash</button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <div style={{ paddingLeft: 32, paddingRight: 32, paddingTop: 12, paddingBottom: 12, flexShrink: 0, borderBottom: "1px solid var(--border-light)" }}>
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled"
          disabled={isTrash}
          style={{ width: "100%", fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px", backgroundColor: "transparent", border: "none", outline: "none", color: "var(--text-primary)", lineHeight: 1.3, opacity: isTrash ? 0.5 : 1 }}
        />
      </div>

      {/* Tags */}
      {(noteTags.length > 0 || showTagPicker) && !isTrash && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 32, paddingRight: 32, paddingBottom: 8, flexWrap: "wrap" }}>
          {noteTags.map((tagId) => {
            const tag = tags.find((t) => t.id === tagId);
            if (!tag) return null;
            return (
              <span key={tagId} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, backgroundColor: "var(--accent-soft)", color: "var(--accent)", paddingLeft: 8, paddingRight: 4, paddingTop: 2, paddingBottom: 2, borderRadius: 9999, fontWeight: 500 }}>
                #{tag.name}
                <button onClick={() => removeTagFromNote(note.id, tagId)} style={{ borderRadius: 9999, padding: 1 }} className="hover:bg-[var(--accent)] hover:text-white transition-colors"><X size={10} /></button>
              </span>
            );
          })}
          {showTagPicker && (
            <div className="relative">
              <button onClick={() => setShowTagPicker(false)} style={{ fontSize: 11, color: "var(--accent)", fontWeight: 500 }}>+ Add</button>
              <div style={{ position: "absolute", left: 0, top: 24, zIndex: 20, backgroundColor: "var(--notelist-bg)", border: "1px solid var(--border-medium)", borderRadius: "var(--radius-md)", padding: "4px 0", minWidth: 140, boxShadow: "var(--shadow-popup)" }}>
                {tags.filter((t) => !noteTags.includes(t.id)).map((tag) => (
                  <button key={tag.id} onClick={() => addTagToNote(note.id, tag.id)} style={{ width: "100%", textAlign: "left", padding: "6px 12px", fontSize: 12, color: "var(--text-primary)" }} className="hover:bg-[var(--hover-bg)]">#{tag.name}</button>
                ))}
                {tags.filter((t) => !noteTags.includes(t.id)).length === 0 && <p style={{ padding: "6px 12px", fontSize: 11, color: "var(--text-quaternary)" }}>No more tags</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Formatting toolbar + AI button */}
      {!isTrash && editorMode !== "preview" && (
        <div style={{ paddingLeft: 32, paddingRight: 32, paddingBottom: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "6px 4px", backgroundColor: "var(--hover-bg)", borderRadius: "var(--radius-md)", width: "fit-content" }}>
            {toolbarItems.map((item, i) => {
              if ("type" in item && item.type === "divider") {
                return <div key={`d-${i}`} style={{ width: 1, height: 16, backgroundColor: "var(--border-medium)", marginLeft: 4, marginRight: 4 }} />;
              }
              const Icon = item.icon!;
              return (
                <button
                  key={item.label}
                  style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-sm)", color: "var(--text-tertiary)" }}
                  className="hover:text-[var(--text-primary)] hover:bg-[var(--notelist-bg)] transition-all"
                  title={item.label}
                >
                  <Icon size={15} strokeWidth={1.8} />
                </button>
              );
            })}
          </div>

          {hasApiKey && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowAiMenu(!showAiMenu)}
                disabled={aiLoading || !content.trim()}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: "var(--radius-md)",
                  fontSize: 12, fontWeight: 600,
                  background: "linear-gradient(135deg, #7c3aed, #5707ff)",
                  color: "white", border: "none", cursor: aiLoading || !content.trim() ? "not-allowed" : "pointer",
                  opacity: aiLoading || !content.trim() ? 0.5 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                <Sparkles size={13} />
                AI
                <ChevronDown size={11} />
              </button>

              {showAiMenu && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setShowAiMenu(false)} />
                  <div style={{ position: "absolute", right: 0, top: 36, zIndex: 20, backgroundColor: "var(--sidebar-bg)", border: "1px solid rgba(124, 58, 237, 0.2)", borderRadius: "var(--radius-lg)", padding: "6px 0", minWidth: 220, boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(124, 58, 237, 0.08)", backdropFilter: "blur(12px)" }}>
                    {/* Gemini branding header */}
                    <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid rgba(124, 58, 237, 0.12)", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 8, background: "linear-gradient(135deg, #4285F4, #9B72CB, #D96570)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Sparkles size={13} style={{ color: "white" }} />
                        </div>
                        <div>
                          <span style={{ fontSize: 14, fontWeight: 700, background: "linear-gradient(135deg, #4285F4, #9B72CB, #D96570)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Gemini</span>
                          <span style={{ fontSize: 10, color: "var(--text-quaternary)", marginLeft: 6, fontWeight: 500 }}>AI</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 10, color: "var(--text-quaternary)", marginTop: 4, lineHeight: 1.4 }}>Powered by Google Gemini</p>
                    </div>
                    {([
                      { action: "summarize" as AiAction, icon: FileText, desc: "Condense into key points" },
                      { action: "expand" as AiAction, icon: Expand, desc: "Add more detail & depth" },
                      { action: "rewrite" as AiAction, icon: RefreshCw, desc: "Improve clarity & flow" },
                      { action: "ideas" as AiAction, icon: Lightbulb, desc: "Generate related ideas" },
                      { action: "translate" as AiAction, icon: Languages, desc: "English ↔ Turkish" },
                    ]).map((item) => (
                      <button
                        key={item.action}
                        onClick={() => handleAiAction(item.action)}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, textAlign: "left", padding: "10px 14px", fontSize: 12, color: "var(--text-primary)", border: "none", background: "none", cursor: "pointer" }}
                        className="hover:bg-[var(--hover-bg)]"
                      >
                        <item.icon size={14} style={{ color: "#7c3aed", flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{ACTION_LABELS[item.action]}</div>
                          <div style={{ fontSize: 10, color: "var(--text-quaternary)", marginTop: 1 }}>{item.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* AI Result Panel */}
      {(aiLoading || aiResult || aiError) && (
        <div style={{ paddingLeft: 32, paddingRight: 32, paddingBottom: 12, flexShrink: 0 }}>
          <div style={{
            border: "1px solid rgba(124, 58, 237, 0.25)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            background: isDark ? "rgba(124, 58, 237, 0.06)" : "rgba(124, 58, 237, 0.04)",
          }}>
            {/* Panel header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: (aiResult || aiError) ? "1px solid rgba(124, 58, 237, 0.15)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: "linear-gradient(135deg, #4285F4, #9B72CB, #D96570)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Sparkles size={10} style={{ color: "white" }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg, #4285F4, #9B72CB, #D96570)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Gemini</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>
                  {aiAction ? ACTION_LABELS[aiAction] : ""}
                </span>
                {aiLoading && (
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                    Processing...
                  </span>
                )}
              </div>
              {!aiLoading && (
                <button onClick={dismissAi} style={{ padding: 4, borderRadius: "var(--radius-sm)", color: "var(--text-quaternary)", background: "none", border: "none", cursor: "pointer" }}>
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Loading spinner */}
            {aiLoading && (
              <div style={{ padding: "20px 14px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <div style={{ width: 16, height: 16, border: "2px solid rgba(124, 58, 237, 0.2)", borderTop: "2px solid #7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Gemini is thinking...</span>
              </div>
            )}

            {/* Error */}
            {aiError && (
              <div style={{ padding: "12px 14px", fontSize: 12, color: "var(--danger)" }}>
                {aiError}
              </div>
            )}

            {/* Result */}
            {aiResult && (
              <>
                <div style={{ padding: "12px 14px", maxHeight: 240, overflowY: "auto" }}>
                  {aiResult.title && (
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid rgba(124, 58, 237, 0.12)" }}>
                      {aiResult.title}
                    </div>
                  )}
                  <div style={{ fontSize: 13, lineHeight: 1.7, color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>
                    {aiResult.content}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderTop: "1px solid rgba(124, 58, 237, 0.15)" }}>
                  <button
                    onClick={handleReplaceContent}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", fontSize: 11, fontWeight: 600, borderRadius: "var(--radius-md)", background: "linear-gradient(135deg, #7c3aed, #5707ff)", color: "white", border: "none", cursor: "pointer" }}
                  >
                    <Replace size={12} />
                    Replace
                  </button>
                  <button
                    onClick={handleAppendResult}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", fontSize: 11, fontWeight: 600, borderRadius: "var(--radius-md)", backgroundColor: "var(--hover-bg)", color: "var(--text-primary)", border: "1px solid var(--border-medium)", cursor: "pointer" }}
                  >
                    Append
                  </button>
                  <button
                    onClick={handleCopyResult}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", fontSize: 11, fontWeight: 600, borderRadius: "var(--radius-md)", backgroundColor: "var(--hover-bg)", color: "var(--text-primary)", border: "1px solid var(--border-medium)", cursor: "pointer" }}
                  >
                    {copied ? <Check size={12} style={{ color: "var(--success)" }} /> : <Copy size={12} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <div style={{ flex: 1 }} />
                  <button onClick={dismissAi} style={{ fontSize: 11, color: "var(--text-quaternary)", background: "none", border: "none", cursor: "pointer" }}>
                    Dismiss
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {isTrash || editorMode === "preview" ? (
          <div style={{ height: "100%", overflowY: "auto", paddingLeft: 32, paddingRight: 32, paddingBottom: 48, paddingTop: 8 }}>
            <MarkdownPreview content={content} />
          </div>
        ) : editorMode === "split" ? (
          <div style={{ height: "100%", display: "flex" }}>
            <div style={{ flex: 1, overflow: "hidden", paddingLeft: 32, paddingRight: 32, paddingBottom: 48, paddingTop: 8 }}>
              <MarkdownEditor content={content} onChange={handleContentChange} disabled={isTrash} isDark={isDark} />
            </div>
            <div style={{ width: 1, backgroundColor: "var(--border-light)" }} />
            <div style={{ flex: 1, overflowY: "auto", paddingLeft: 32, paddingRight: 32, paddingBottom: 48, paddingTop: 8 }}>
              <MarkdownPreview content={content} />
            </div>
          </div>
        ) : (
          <div style={{ height: "100%", paddingLeft: 32, paddingRight: 32, paddingBottom: 48, paddingTop: 8 }}>
            <MarkdownEditor content={content} onChange={handleContentChange} disabled={isTrash} isDark={isDark} />
          </div>
        )}
      </div>
    </div>
  );
}
