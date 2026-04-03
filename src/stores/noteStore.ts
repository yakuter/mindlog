import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../lib/database";
import type { Note } from "../types";

interface NoteState {
  notes: Note[];
  loading: boolean;

  loadNotes: () => Promise<void>;
  createNote: (folderId?: string | null) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Pick<Note, "title" | "content" | "folder_id">>) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  softDeleteNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  permanentDeleteNote: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  loading: false,

  loadNotes: async () => {
    set({ loading: true });
    const db = await getDb();
    const rows = await db.select<Note[]>("SELECT * FROM notes ORDER BY updated_at DESC");
    const notes = rows.map((r) => ({
      ...r,
      is_favorite: Boolean(r.is_favorite),
      is_deleted: Boolean(r.is_deleted),
    }));
    set({ notes, loading: false });
  },

  createNote: async (folderId = null) => {
    const db = await getDb();
    const note: Note = {
      id: uuidv4(),
      title: "",
      content: "",
      folder_id: folderId,
      is_favorite: false,
      is_deleted: false,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await db.execute(
      "INSERT INTO notes (id, title, content, folder_id, is_favorite, is_deleted, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [note.id, note.title, note.content, note.folder_id, 0, 0, note.created_at, note.updated_at]
    );
    set({ notes: [note, ...get().notes] });
    return note;
  },

  updateNote: async (id, updates) => {
    const db = await getDb();
    const now = new Date().toISOString();
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIdx = 1;

    if (updates.title !== undefined) {
      setClauses.push(`title = $${paramIdx++}`);
      values.push(updates.title);
    }
    if (updates.content !== undefined) {
      setClauses.push(`content = $${paramIdx++}`);
      values.push(updates.content);
    }
    if (updates.folder_id !== undefined) {
      setClauses.push(`folder_id = $${paramIdx++}`);
      values.push(updates.folder_id);
    }
    setClauses.push(`updated_at = $${paramIdx++}`);
    values.push(now);
    values.push(id);

    await db.execute(
      `UPDATE notes SET ${setClauses.join(", ")} WHERE id = $${paramIdx}`,
      values
    );

    set({
      notes: get().notes.map((n) =>
        n.id === id ? { ...n, ...updates, updated_at: now } : n
      ),
    });
  },

  toggleFavorite: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;
    const db = await getDb();
    const newVal = note.is_favorite ? 0 : 1;
    await db.execute("UPDATE notes SET is_favorite = $1 WHERE id = $2", [newVal, id]);
    set({
      notes: get().notes.map((n) =>
        n.id === id ? { ...n, is_favorite: !n.is_favorite } : n
      ),
    });
  },

  softDeleteNote: async (id) => {
    const db = await getDb();
    const now = new Date().toISOString();
    await db.execute("UPDATE notes SET is_deleted = 1, deleted_at = $1 WHERE id = $2", [now, id]);
    set({
      notes: get().notes.map((n) =>
        n.id === id ? { ...n, is_deleted: true, deleted_at: now } : n
      ),
    });
  },

  restoreNote: async (id) => {
    const db = await getDb();
    await db.execute("UPDATE notes SET is_deleted = 0, deleted_at = NULL WHERE id = $1", [id]);
    set({
      notes: get().notes.map((n) =>
        n.id === id ? { ...n, is_deleted: false, deleted_at: null } : n
      ),
    });
  },

  permanentDeleteNote: async (id) => {
    const db = await getDb();
    await db.execute("DELETE FROM notes WHERE id = $1", [id]);
    set({ notes: get().notes.filter((n) => n.id !== id) });
  },

  emptyTrash: async () => {
    const db = await getDb();
    await db.execute("DELETE FROM notes WHERE is_deleted = 1");
    set({ notes: get().notes.filter((n) => !n.is_deleted) });
  },
}));
