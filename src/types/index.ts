export interface Note {
  id: string;
  title: string;
  content: string;
  folder_id: string | null;
  is_favorite: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface NoteTag {
  note_id: string;
  tag_id: string;
}

export type NavigationView =
  | "all"
  | "favorites"
  | "trash"
  | "settings"
  | { folder: string }
  | { tag: string };
