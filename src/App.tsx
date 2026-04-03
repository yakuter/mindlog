import { useEffect, useState } from "react";
import { initDatabase } from "./lib/database";
import { useNoteStore } from "./stores/noteStore";
import { useFolderStore } from "./stores/folderStore";
import { useTagStore } from "./stores/tagStore";
import { useUiStore } from "./stores/uiStore";
import { useTheme } from "./hooks/useTheme";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import IconRail from "./components/layout/IconRail";
import Sidebar from "./components/layout/Sidebar";
import NoteList from "./components/layout/NoteList";
import EditorPanel from "./components/layout/EditorPanel";
import SettingsPanel from "./components/layout/SettingsPanel";

function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentView = useUiStore((s) => s.currentView);
  const loadNotes = useNoteStore((s) => s.loadNotes);
  const loadFolders = useFolderStore((s) => s.loadFolders);
  const loadTags = useTagStore((s) => s.loadTags);
  const loadNoteTagMap = useTagStore((s) => s.loadNoteTagMap);

  useTheme();
  useKeyboardShortcuts();

  useEffect(() => {
    async function init() {
      try {
        await initDatabase();
        await Promise.all([loadNotes(), loadFolders(), loadTags(), loadNoteTagMap()]);
        setReady(true);
      } catch (e) {
        console.error("Failed to initialize:", e);
        setError(String(e));
      }
    }
    init();
  }, []);

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: "var(--editor-bg)" }}>
        <div className="text-center max-w-md px-4">
          <p className="text-sm font-medium mb-2 text-[var(--danger)]">Failed to start MindLog</p>
          <p className="text-xs text-[var(--text-secondary)]">{error}</p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: "var(--editor-bg)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--accent)] flex items-center justify-center">
            <span className="text-white font-bold text-[16px]">M</span>
          </div>
          <p className="text-[13px] text-[var(--text-tertiary)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <IconRail />
      {currentView === "settings" ? (
        <div className="flex-1 min-w-0">
          <SettingsPanel />
        </div>
      ) : (
        <>
          <div className="w-[200px] shrink-0">
            <Sidebar />
          </div>
          <div className="w-[300px] shrink-0">
            <NoteList />
          </div>
          <div className="flex-1 min-w-0">
            <EditorPanel />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
