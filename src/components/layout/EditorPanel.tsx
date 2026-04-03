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
} from "lucide-react";
import { useUiStore } from "../../stores/uiStore";
import { useNoteStore } from "../../stores/noteStore";
import { useTagStore } from "../../stores/tagStore";
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
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDark = document.documentElement.classList.contains("dark");
  const noteTags = note ? (noteTagMap[note.id] || []) : [];

  useEffect(() => {
    if (note) { setTitle(note.title); setContent(note.content); }
  }, [note?.id]);

  const debouncedSave = useCallback(
    (field: "title" | "content", value: string) => {
      if (!note) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => { updateNote(note.id, { [field]: value }); }, 500);
    },
    [note?.id, updateNote]
  );

  const handleTitleChange = (v: string) => { setTitle(v); debouncedSave("title", v); };
  const handleContentChange = (v: string) => { setContent(v); debouncedSave("content", v); };

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

      {/* Formatting toolbar */}
      {!isTrash && editorMode !== "preview" && (
        <div style={{ paddingLeft: 32, paddingRight: 32, paddingBottom: 12, flexShrink: 0 }}>
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
