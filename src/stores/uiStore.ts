import { create } from "zustand";
import type { NavigationView } from "../types";

interface UiState {
  currentView: NavigationView;
  selectedNoteId: string | null;
  searchQuery: string;
  theme: "light" | "dark" | "system";
  sidebarWidth: number;
  noteListWidth: number;
  editorMode: "edit" | "preview" | "split";

  setCurrentView: (view: NavigationView) => void;
  setSelectedNoteId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setSidebarWidth: (width: number) => void;
  setNoteListWidth: (width: number) => void;
  setEditorMode: (mode: "edit" | "preview" | "split") => void;
}

export const useUiStore = create<UiState>((set) => ({
  currentView: "all",
  selectedNoteId: null,
  searchQuery: "",
  theme: "dark",
  sidebarWidth: 220,
  noteListWidth: 280,
  editorMode: "edit",

  setCurrentView: (view) => set({ currentView: view, selectedNoteId: null }),
  setSelectedNoteId: (id) => set({ selectedNoteId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setTheme: (theme) => set({ theme }),
  setSidebarWidth: (width) => set({ sidebarWidth: width }),
  setNoteListWidth: (width) => set({ noteListWidth: width }),
  setEditorMode: (mode) => set({ editorMode: mode }),
}));
