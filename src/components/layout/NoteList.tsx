import { useMemo } from "react";
import { Plus, Star, Search, Trash2, FileText, MoreHorizontal } from "lucide-react";
import { useUiStore } from "../../stores/uiStore";
import { useNoteStore } from "../../stores/noteStore";
import { useTagStore } from "../../stores/tagStore";
import { useFolderStore } from "../../stores/folderStore";
import type { Note } from "../../types";

const TAG_COLORS: Record<number, { bg: string; text: string }> = {
  0: { bg: "var(--tag-ux)", text: "var(--tag-ux-text)" },
  1: { bg: "var(--tag-design)", text: "var(--tag-design-text)" },
  2: { bg: "var(--tag-code)", text: "var(--tag-code-text)" },
  3: { bg: "var(--tag-aux)", text: "var(--tag-aux-text)" },
  4: { bg: "var(--tag-tags)", text: "var(--tag-tags-text)" },
};

function NoteCard({ note, isActive, onClick }: { note: Note; isActive: boolean; onClick: () => void }) {
  const { toggleFavorite } = useNoteStore();
  const { noteTagMap, tags } = useTagStore();
  const noteTags = noteTagMap[note.id] || [];

  const preview = note.content.replace(/[#*`>\-\[\]()!~_]/g, "").replace(/\n+/g, " ").trim().slice(0, 100);
  const date = new Date(note.updated_at);
  const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div
      onClick={onClick}
      className={`
        rounded-[var(--radius-lg)] cursor-pointer group transition-all duration-[var(--transition-fast)]
        ${isActive
          ? "bg-[var(--card-bg)] border-l-[3px] border-l-[var(--accent)]"
          : "hover:bg-[var(--card-hover)] border-l-[3px] border-l-transparent"
        }
      `}
      style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 14, paddingBottom: 14, ...(isActive ? { boxShadow: "var(--shadow-card)" } : {}) }}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className={`text-[13px] font-semibold leading-snug ${note.title ? "text-[var(--text-primary)]" : "text-[var(--text-quaternary)] italic font-normal"}`}>
          {note.title || "Untitled"}
        </h3>
        {note.is_favorite && !note.is_deleted && (
          <button onClick={(e) => { e.stopPropagation(); toggleFavorite(note.id); }} className="shrink-0 mt-0.5">
            <Star size={12} className="fill-[var(--warning)] text-[var(--warning)]" />
          </button>
        )}
      </div>

      {preview && (
        <p className="text-[12px] text-[var(--text-tertiary)] leading-relaxed mb-2 line-clamp-2">
          {preview}
        </p>
      )}

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] text-[var(--text-quaternary)] tabular-nums shrink-0">
          {dateStr}
        </span>
        {noteTags.slice(0, 3).map((tagId, idx) => {
          const tag = tags.find((t) => t.id === tagId);
          if (!tag) return null;
          const colors = TAG_COLORS[idx % 5];
          return (
            <span
              key={tagId}
              className="text-[10px] font-medium px-1.5 py-[1px] rounded-[var(--radius-sm)]"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              #{tag.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function NoteList() {
  const { currentView, selectedNoteId, setSelectedNoteId, searchQuery, setSearchQuery } = useUiStore();
  const { notes, createNote, emptyTrash } = useNoteStore();
  const { noteTagMap, tags } = useTagStore();
  const { folders } = useFolderStore();

  const filteredNotes = useMemo(() => {
    let result: Note[];
    if (currentView === "all") result = notes.filter((n) => !n.is_deleted);
    else if (currentView === "favorites") result = notes.filter((n) => n.is_favorite && !n.is_deleted);
    else if (currentView === "trash") result = notes.filter((n) => n.is_deleted);
    else if (typeof currentView === "object" && "folder" in currentView) result = notes.filter((n) => n.folder_id === currentView.folder && !n.is_deleted);
    else if (typeof currentView === "object" && "tag" in currentView) {
      const tagId = currentView.tag;
      result = notes.filter((n) => !n.is_deleted && (noteTagMap[n.id] || []).includes(tagId));
    } else result = notes.filter((n) => !n.is_deleted);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    }
    const favorites = result.filter((n) => n.is_favorite);
    const rest = result.filter((n) => !n.is_favorite);
    return [...favorites, ...rest];
  }, [notes, currentView, searchQuery, noteTagMap]);

  const handleNewNote = async () => {
    const folderId = typeof currentView === "object" && "folder" in currentView ? currentView.folder : null;
    const note = await createNote(folderId);
    setSelectedNoteId(note.id);
  };

  const viewTitle = useMemo(() => {
    if (currentView === "all") return "All Notes";
    if (currentView === "favorites") return "Favorites";
    if (currentView === "trash") return "Trash";
    if (typeof currentView === "object" && "folder" in currentView) {
      const f = folders.find((f) => f.id === currentView.folder);
      return f?.name || "Notebook";
    }
    if (typeof currentView === "object" && "tag" in currentView) {
      const t = tags.find((t) => t.id === currentView.tag);
      return t ? `#${t.name}` : "Tag";
    }
    return "Notes";
  }, [currentView, folders, tags]);

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: "var(--notelist-bg)", borderRight: "1px solid var(--notelist-border)" }}>
      {/* Header */}
      <div className="shrink-0" style={{ paddingTop: 14, paddingLeft: 20, paddingRight: 20, paddingBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
            {viewTitle}
          </h2>
          <div className="flex items-center gap-1">
            {currentView === "trash" && notes.some((n) => n.is_deleted) && (
              <button onClick={emptyTrash} className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-all" title="Empty Trash">
                <Trash2 size={15} />
              </button>
            )}
            <button className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] transition-all">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="relative flex-1">
            <Search size={13} className="absolute top-1/2 -translate-y-1/2" style={{ left: 10, color: "var(--text-quaternary)" }} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", backgroundColor: "var(--hover-bg)", borderRadius: "var(--radius-md)", paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, fontSize: 12, color: "var(--text-primary)", border: "1px solid transparent" }}
              className="placeholder:text-[var(--text-quaternary)] focus:border-[var(--accent)] transition-all"
            />
          </div>
          {currentView !== "trash" && (
            <button
              onClick={handleNewNote}
              className="hover:bg-[var(--accent-hover)] transition-colors shrink-0"
              style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "var(--accent)", color: "white", fontSize: 12, fontWeight: 600, paddingLeft: 14, paddingRight: 14, paddingTop: 7, paddingBottom: 7, borderRadius: "var(--radius-md)" }}
            >
              <Plus size={14} strokeWidth={2.5} />
              New Note
            </button>
          )}
        </div>
      </div>

      {/* Note list */}
      <div className="flex-1 overflow-y-auto" style={{ paddingLeft: 12, paddingRight: 12 }}>
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 pb-16">
            <div className="w-12 h-12 rounded-[var(--radius-xl)] bg-[var(--hover-bg)] flex items-center justify-center mb-3">
              <FileText size={20} className="text-[var(--text-quaternary)]" />
            </div>
            <p className="text-[13px] font-medium text-[var(--text-tertiary)] mb-1">
              {searchQuery ? "No results found" : currentView === "trash" ? "Trash is empty" : "No notes yet"}
            </p>
            {!searchQuery && currentView !== "trash" && (
              <button onClick={handleNewNote} className="text-[12px] text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors mt-1">
                Create your first note
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 pb-4">
            {filteredNotes.map((note) => (
              <NoteCard key={note.id} note={note} isActive={selectedNoteId === note.id} onClick={() => setSelectedNoteId(note.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredNotes.length > 0 && (
        <div className="shrink-0" style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 12, paddingBottom: 12, borderTop: "1px solid var(--border-light)" }}>
          <span className="text-[10px] text-[var(--text-quaternary)] tabular-nums">
            {filteredNotes.length} note{filteredNotes.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
