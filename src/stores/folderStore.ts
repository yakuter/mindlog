import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../lib/database";
import type { Folder } from "../types";

interface FolderState {
  folders: Folder[];
  loading: boolean;

  loadFolders: () => Promise<void>;
  createFolder: (name: string, parentId?: string | null) => Promise<Folder>;
  renameFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
}

export const useFolderStore = create<FolderState>((set, get) => ({
  folders: [],
  loading: false,

  loadFolders: async () => {
    set({ loading: true });
    const db = await getDb();
    const folders = await db.select<Folder[]>(
      "SELECT * FROM folders ORDER BY sort_order ASC, name ASC"
    );
    set({ folders, loading: false });
  },

  createFolder: async (name, parentId = null) => {
    const db = await getDb();
    const folder: Folder = {
      id: uuidv4(),
      name,
      parent_id: parentId ?? null,
      sort_order: get().folders.length,
      created_at: new Date().toISOString(),
    };
    await db.execute(
      "INSERT INTO folders (id, name, parent_id, sort_order, created_at) VALUES ($1, $2, $3, $4, $5)",
      [folder.id, folder.name, folder.parent_id, folder.sort_order, folder.created_at]
    );
    set({ folders: [...get().folders, folder] });
    return folder;
  },

  renameFolder: async (id, name) => {
    const db = await getDb();
    await db.execute("UPDATE folders SET name = $1 WHERE id = $2", [name, id]);
    set({
      folders: get().folders.map((f) => (f.id === id ? { ...f, name } : f)),
    });
  },

  deleteFolder: async (id) => {
    const db = await getDb();
    await db.execute("UPDATE notes SET folder_id = NULL WHERE folder_id = $1", [id]);
    await db.execute("UPDATE folders SET parent_id = NULL WHERE parent_id = $1", [id]);
    await db.execute("DELETE FROM folders WHERE id = $1", [id]);
    set({ folders: get().folders.filter((f) => f.id !== id) });
  },
}));
