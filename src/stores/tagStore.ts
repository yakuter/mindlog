import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../lib/database";
import type { Tag } from "../types";

interface TagState {
  tags: Tag[];
  noteTagMap: Record<string, string[]>;
  loading: boolean;

  loadTags: () => Promise<void>;
  loadNoteTagMap: () => Promise<void>;
  createTag: (name: string, color?: string) => Promise<Tag>;
  deleteTag: (id: string) => Promise<void>;
  addTagToNote: (noteId: string, tagId: string) => Promise<void>;
  removeTagFromNote: (noteId: string, tagId: string) => Promise<void>;
  getTagsForNote: (noteId: string) => string[];
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],
  noteTagMap: {},
  loading: false,

  loadTags: async () => {
    set({ loading: true });
    const db = await getDb();
    const tags = await db.select<Tag[]>("SELECT * FROM tags ORDER BY name ASC");
    set({ tags, loading: false });
  },

  loadNoteTagMap: async () => {
    const db = await getDb();
    const rows = await db.select<{ note_id: string; tag_id: string }[]>(
      "SELECT note_id, tag_id FROM note_tags"
    );
    const map: Record<string, string[]> = {};
    for (const row of rows) {
      if (!map[row.note_id]) map[row.note_id] = [];
      map[row.note_id].push(row.tag_id);
    }
    set({ noteTagMap: map });
  },

  createTag: async (name, color = "#007aff") => {
    const db = await getDb();
    const tag: Tag = {
      id: uuidv4(),
      name,
      color,
      created_at: new Date().toISOString(),
    };
    await db.execute(
      "INSERT INTO tags (id, name, color, created_at) VALUES ($1, $2, $3, $4)",
      [tag.id, tag.name, tag.color, tag.created_at]
    );
    set({ tags: [...get().tags, tag] });
    return tag;
  },

  deleteTag: async (id) => {
    const db = await getDb();
    await db.execute("DELETE FROM note_tags WHERE tag_id = $1", [id]);
    await db.execute("DELETE FROM tags WHERE id = $1", [id]);
    set({ tags: get().tags.filter((t) => t.id !== id) });
    const newMap = { ...get().noteTagMap };
    for (const noteId of Object.keys(newMap)) {
      newMap[noteId] = newMap[noteId].filter((tid) => tid !== id);
    }
    set({ noteTagMap: newMap });
  },

  addTagToNote: async (noteId, tagId) => {
    const db = await getDb();
    await db.execute(
      "INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES ($1, $2)",
      [noteId, tagId]
    );
    const map = { ...get().noteTagMap };
    if (!map[noteId]) map[noteId] = [];
    if (!map[noteId].includes(tagId)) map[noteId] = [...map[noteId], tagId];
    set({ noteTagMap: map });
  },

  removeTagFromNote: async (noteId, tagId) => {
    const db = await getDb();
    await db.execute(
      "DELETE FROM note_tags WHERE note_id = $1 AND tag_id = $2",
      [noteId, tagId]
    );
    const map = { ...get().noteTagMap };
    if (map[noteId]) {
      map[noteId] = map[noteId].filter((tid) => tid !== tagId);
    }
    set({ noteTagMap: map });
  },

  getTagsForNote: (noteId) => {
    return get().noteTagMap[noteId] || [];
  },
}));
