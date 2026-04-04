import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;
let currentDbPath: string | null = null;

const DB_PATH_KEY = "mindlog_db_path";
const DEFAULT_DB_NAME = "passwall-notes.db";

export function getStoredDbPath(): string {
  return localStorage.getItem(DB_PATH_KEY) || DEFAULT_DB_NAME;
}

export function setStoredDbPath(path: string): void {
  localStorage.setItem(DB_PATH_KEY, path);
}

function buildConnectionString(path: string): string {
  if (path.startsWith("/")) {
    return `sqlite:${path}`;
  }
  return `sqlite:${path}`;
}

export async function getDb(): Promise<Database> {
  const desiredPath = getStoredDbPath();
  if (!db || currentDbPath !== desiredPath) {
    if (db) {
      await db.close();
      db = null;
    }
    db = await Database.load(buildConnectionString(desiredPath));
    currentDbPath = desiredPath;
  }
  return db;
}

export async function closeDb(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
    currentDbPath = null;
  }
}

export async function initDatabase(): Promise<void> {
  const database = await getDb();

  await database.execute(`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE SET NULL
    )
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      folder_id TEXT,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      deleted_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
    )
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#007aff',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS note_tags (
      note_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (note_id, tag_id),
      FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `);

  await database.execute(`
    CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id)
  `);
  await database.execute(`
    CREATE INDEX IF NOT EXISTS idx_notes_is_deleted ON notes(is_deleted)
  `);
  await database.execute(`
    CREATE INDEX IF NOT EXISTS idx_notes_is_favorite ON notes(is_favorite)
  `);
  await database.execute(`
    CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at)
  `);

  await database.execute(`
    CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
      title, content, content='notes', content_rowid='rowid'
    )
  `);

  await database.execute(`
    CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
      INSERT INTO notes_fts(rowid, title, content) VALUES (NEW.rowid, NEW.title, NEW.content);
    END
  `);

  await database.execute(`
    CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
      INSERT INTO notes_fts(notes_fts, rowid, title, content) VALUES('delete', OLD.rowid, OLD.title, OLD.content);
    END
  `);

  await database.execute(`
    CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
      INSERT INTO notes_fts(notes_fts, rowid, title, content) VALUES('delete', OLD.rowid, OLD.title, OLD.content);
      INSERT INTO notes_fts(rowid, title, content) VALUES (NEW.rowid, NEW.title, NEW.content);
    END
  `);
}

export async function searchNotes(query: string): Promise<string[]> {
  const database = await getDb();
  if (!query.trim()) return [];
  const safeQuery = query.replace(/['"]/g, "").trim() + "*";
  const results = await database.select<{ id: string }[]>(
    `SELECT n.id FROM notes n
     INNER JOIN notes_fts f ON n.rowid = f.rowid
     WHERE notes_fts MATCH $1 AND n.is_deleted = 0
     ORDER BY rank`,
    [safeQuery]
  );
  return results.map((r) => r.id);
}
