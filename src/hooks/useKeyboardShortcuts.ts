import { useEffect } from "react";
import { useUiStore } from "../stores/uiStore";
import { useNoteStore } from "../stores/noteStore";

export function useKeyboardShortcuts() {
  const { currentView, selectedNoteId, setSelectedNoteId, setEditorMode, editorMode } = useUiStore();
  const { notes, createNote, toggleFavorite, softDeleteNote } = useNoteStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;

      if (meta && e.key === "n") {
        e.preventDefault();
        const folderId =
          typeof currentView === "object" && "folder" in currentView
            ? currentView.folder
            : null;
        createNote(folderId).then((note) => setSelectedNoteId(note.id));
        return;
      }

      if (meta && e.key === "f") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[placeholder="Search..."]'
        );
        searchInput?.focus();
        return;
      }

      if (meta && e.key === "p") {
        e.preventDefault();
        setEditorMode(editorMode === "preview" ? "edit" : "preview");
        return;
      }

      if (meta && e.key === "e") {
        e.preventDefault();
        const modes: ("edit" | "split" | "preview")[] = ["edit", "split", "preview"];
        const idx = modes.indexOf(editorMode);
        setEditorMode(modes[(idx + 1) % modes.length]);
        return;
      }

      if (meta && e.shiftKey && e.key === "d") {
        e.preventDefault();
        if (selectedNoteId) {
          toggleFavorite(selectedNoteId);
        }
        return;
      }

      if (meta && e.key === "Backspace") {
        e.preventDefault();
        if (selectedNoteId) {
          const note = notes.find((n) => n.id === selectedNoteId);
          if (note && !note.is_deleted) {
            softDeleteNote(selectedNoteId);
            setSelectedNoteId(null);
          }
        }
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentView, selectedNoteId, editorMode, notes]);
}
