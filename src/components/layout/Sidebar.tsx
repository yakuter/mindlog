import { useState } from "react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Folder,
  MoreHorizontal,
  Plus,
  Inbox,
  X,
} from "lucide-react";
import { useUiStore } from "../../stores/uiStore";
import { useFolderStore } from "../../stores/folderStore";
import { useNoteStore } from "../../stores/noteStore";
import { useTagStore } from "../../stores/tagStore";
import ThemeToggle from "../common/ThemeToggle";
import type { Folder as FolderType } from "../../types";

function FolderItem({ folder, depth = 0 }: { folder: FolderType; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  const [showMenu, setShowMenu] = useState(false);
  const { currentView, setCurrentView } = useUiStore();
  const { folders, renameFolder, deleteFolder } = useFolderStore();
  const children = folders.filter((f) => f.parent_id === folder.id);
  const isActive =
    typeof currentView === "object" && "folder" in currentView && currentView.folder === folder.id;

  const handleRename = async () => {
    if (editName.trim() && editName !== folder.name) await renameFolder(folder.id, editName.trim());
    setEditing(false);
  };

  return (
    <div>
      <div
        className={`
          flex items-center gap-2 h-[34px] rounded-[var(--radius-md)] cursor-pointer text-[13px] group
          transition-all duration-[var(--transition-fast)]
          ${isActive
            ? "bg-[var(--accent-soft)] text-[var(--accent)] font-medium"
            : "text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]"
          }
        `}
        style={{ paddingLeft: `${depth * 16 + 14}px`, paddingRight: "12px" }}
        onClick={() => setCurrentView({ folder: folder.id })}
      >
        <button
          onClick={(e) => { e.stopPropagation(); if (children.length > 0) setExpanded(!expanded); }}
          className="shrink-0 p-0 opacity-40 hover:opacity-100 transition-opacity"
        >
          {children.length > 0
            ? expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />
            : <span className="w-[13px]" />}
        </button>
        <Folder size={14} className={`shrink-0 ${isActive ? "text-[var(--accent)]" : "opacity-40"}`} />
        {editing ? (
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setEditing(false); }}
            className="flex-1 bg-[var(--editor-bg)] border border-[var(--accent)] rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[12px] text-[var(--text-primary)]"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate">{folder.name}</span>
        )}
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-0.5 rounded opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity"
          >
            <MoreHorizontal size={13} />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-6 z-20 bg-[var(--notelist-bg)] border border-[var(--border-medium)] rounded-[var(--radius-md)] py-1 min-w-[130px] animate-slide-in" style={{ boxShadow: "var(--shadow-popup)" }}>
                <button onClick={(e) => { e.stopPropagation(); setEditing(true); setEditName(folder.name); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-[var(--hover-bg)] text-[var(--text-primary)]">Rename</button>
                <button onClick={async (e) => { e.stopPropagation(); await deleteFolder(folder.id); setShowMenu(false); setCurrentView("all"); }} className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-[var(--danger-soft)] text-[var(--danger)]">Delete</button>
              </div>
            </>
          )}
        </div>
      </div>
      {expanded && children.map((child) => <FolderItem key={child.id} folder={child} depth={depth + 1} />)}
    </div>
  );
}

export default function Sidebar() {
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const { currentView, setCurrentView, searchQuery, setSearchQuery } = useUiStore();
  const { folders, createFolder } = useFolderStore();
  const { tags, createTag, deleteTag } = useTagStore();
  const rootFolders = folders.filter((f) => !f.parent_id);

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) { await createFolder(newFolderName.trim()); setNewFolderName(""); }
    setCreatingFolder(false);
  };

  return (
    <div
      className="h-full flex flex-col"
      style={{ backgroundColor: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
    >
      {/* Search */}
      <div className="shrink-0" style={{ paddingTop: 14, paddingLeft: 16, paddingRight: 16, paddingBottom: 12 }}>
        <div className="relative">
          <Search size={14} className="absolute top-1/2 -translate-y-1/2" style={{ left: 10, color: "var(--text-quaternary)" }} />
          <input
            type="text"
            placeholder="Search Notebooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, fontSize: 12, backgroundColor: "var(--notelist-bg)", border: "1px solid var(--border-medium)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", width: "100%" }}
            className="placeholder:text-[var(--text-quaternary)] focus:border-[var(--accent)] transition-colors"
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* ALL NOTES */}
        <div style={{ paddingLeft: 16, paddingRight: 16, marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "1.5px", display: "block", marginBottom: 6 }}>
            All Notes
          </span>
          <button
            onClick={() => setCurrentView("all")}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", height: 34, paddingLeft: 12, paddingRight: 12, borderRadius: "var(--radius-md)", fontSize: 13, backgroundColor: currentView === "all" ? "var(--accent-soft)" : "transparent", color: currentView === "all" ? "var(--accent)" : "var(--text-secondary)", fontWeight: currentView === "all" ? 500 : 400, transition: "all 0.15s ease" }}
          >
            <Inbox size={15} style={{ color: currentView === "all" ? "var(--accent)" : undefined, opacity: currentView === "all" ? 1 : 0.4 }} />
            <span>Inbox</span>
          </button>
        </div>

        {/* NOTEBOOKS */}
        <div style={{ marginTop: 20, marginBottom: 8, paddingLeft: 16, paddingRight: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "1.5px" }}>
              Notebooks
            </span>
            <button
              onClick={() => setCreatingFolder(true)}
              style={{ padding: 2, borderRadius: 4, color: "var(--text-quaternary)" }}
              className="hover:text-[var(--accent)] transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          {creatingFolder && (
            <div style={{ marginBottom: 8 }}>
              <input
                autoFocus
                placeholder="Notebook name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onBlur={handleCreateFolder}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreateFolder(); if (e.key === "Escape") setCreatingFolder(false); }}
                style={{ width: "100%", backgroundColor: "var(--notelist-bg)", border: "1px solid var(--border-medium)", borderRadius: "var(--radius-sm)", paddingLeft: 10, paddingRight: 10, paddingTop: 6, paddingBottom: 6, fontSize: 12, color: "var(--text-primary)" }}
                className="focus:border-[var(--accent)] transition-colors"
              />
            </div>
          )}
        </div>

        <div style={{ paddingLeft: 12, paddingRight: 12 }}>
          {rootFolders.map((folder) => (
            <FolderItem key={folder.id} folder={folder} />
          ))}
        </div>

        {rootFolders.length === 0 && !creatingFolder && (
          <div style={{ paddingLeft: 16, paddingRight: 16 }}>
            <button
              onClick={() => setCreatingFolder(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 6, paddingBottom: 6, fontSize: 12, color: "var(--text-quaternary)" }}
              className="hover:text-[var(--text-tertiary)] transition-colors"
            >
              <Plus size={12} style={{ opacity: 0.5 }} />
              <span>New notebook</span>
            </button>
          </div>
        )}

        {/* TAGS */}
        <div style={{ marginTop: 24, marginBottom: 8, paddingLeft: 16, paddingRight: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "1.5px" }}>
              Tags
            </span>
            <button
              onClick={() => setCreatingTag(true)}
              style={{ padding: 2, borderRadius: 4, color: "var(--text-quaternary)" }}
              className="hover:text-[var(--accent)] transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          {creatingTag && (
            <div style={{ marginBottom: 8 }}>
              <input
                autoFocus
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onBlur={() => { if (newTagName.trim()) createTag(newTagName.trim()); setNewTagName(""); setCreatingTag(false); }}
                onKeyDown={(e) => { if (e.key === "Enter") { if (newTagName.trim()) createTag(newTagName.trim()); setNewTagName(""); setCreatingTag(false); } if (e.key === "Escape") setCreatingTag(false); }}
                style={{ width: "100%", backgroundColor: "var(--notelist-bg)", border: "1px solid var(--border-medium)", borderRadius: "var(--radius-sm)", paddingLeft: 10, paddingRight: 10, paddingTop: 6, paddingBottom: 6, fontSize: 12, color: "var(--text-primary)" }}
                className="focus:border-[var(--accent)] transition-colors"
              />
            </div>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {tags.map((tag) => {
              const isActive = typeof currentView === "object" && "tag" in currentView && currentView.tag === tag.id;
              return (
                <button
                  key={tag.id}
                  onClick={() => setCurrentView({ tag: tag.id })}
                  className="group"
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4, borderRadius: 9999, transition: "all 0.15s ease", backgroundColor: isActive ? "var(--accent)" : "var(--hover-bg)", color: isActive ? "white" : "var(--text-secondary)" }}
                >
                  #{tag.name}
                  <button
                    onClick={async (e) => { e.stopPropagation(); await deleteTag(tag.id); if (isActive) setCurrentView("all"); }}
                    className={`opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity`}
                    style={{ marginLeft: 2, borderRadius: 9999, padding: 1 }}
                  >
                    <X size={10} />
                  </button>
                </button>
              );
            })}
            {tags.length === 0 && !creatingTag && (
              <button
                onClick={() => setCreatingTag(true)}
                style={{ fontSize: 11, color: "var(--text-quaternary)" }}
                className="hover:text-[var(--text-tertiary)] transition-colors"
              >
                + Add tag
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0" style={{ padding: 16, borderTop: "1px solid var(--border-light)" }}>
        <ThemeToggle />
      </div>
    </div>
  );
}
