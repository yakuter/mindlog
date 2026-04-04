# Passwall Notes

A fast, privacy-first desktop notes application built with Tauri, React, and SQLite. All data stays local on your machine.

## Features

- **Markdown Editor** — Write in Markdown with live preview, split view, and syntax highlighting (CodeMirror 6)
- **Folders & Tags** — Organize notes with hierarchical notebooks and color-coded tags
- **Full-Text Search** — Instantly find notes with SQLite FTS5 powered search
- **Favorites & Trash** — Pin important notes, soft-delete with restore support
- **Dark / Light Theme** — System-aware theme with manual override
- **Keyboard Shortcuts** — `⌘N` new note, `⌘F` search, `⌘D` delete, and more
- **Export** — Export any note as `.md` file
- **Configurable Storage** — Choose where your SQLite database is stored

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Runtime   | [Tauri 2](https://tauri.app)        |
| Frontend  | React 19 + TypeScript               |
| Styling   | Tailwind CSS 4                       |
| Editor    | CodeMirror 6                         |
| State     | Zustand                              |
| Database  | SQLite (via `tauri-plugin-sql`)       |
| Icons     | Lucide React                         |
| Build     | Vite 7                               |

## Prerequisites

- **Node.js** >= 18
- **pnpm** (package manager)
- **Rust** (stable toolchain via [rustup](https://rustup.rs))
- **Xcode Command Line Tools** (macOS): `xcode-select --install`

### Install Rust (macOS with Homebrew)

```bash
brew install rustup
rustup default stable
```

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd mindlog

# Install frontend dependencies
pnpm install

# Run in development mode (starts Vite + Tauri)
pnpm tauri dev
```

The app window will open automatically once the Rust backend compiles.

## Build for Production

```bash
pnpm tauri build
```

The installer/binary will be generated in `src-tauri/target/release/bundle/`.

## Project Structure

```
mindlog/
├── src/                     # React frontend
│   ├── components/
│   │   ├── layout/          # IconRail, Sidebar, NoteList, EditorPanel, SettingsPanel
│   │   ├── editor/          # MarkdownEditor, MarkdownPreview
│   │   └── common/          # ThemeToggle
│   ├── stores/              # Zustand stores (noteStore, folderStore, tagStore, uiStore)
│   ├── hooks/               # useTheme, useKeyboardShortcuts
│   ├── lib/                 # database.ts (SQLite init & queries)
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx
│   └── index.css            # Tailwind + custom design tokens
├── src-tauri/               # Rust backend
│   ├── src/lib.rs           # Tauri plugin registration
│   ├── Cargo.toml
│   └── tauri.conf.json      # Window config, permissions
├── package.json
└── vite.config.ts
```

## Database

Passwall Notes uses SQLite with the following schema:

- **notes** — id, title, content, folder_id, is_favorite, is_deleted, timestamps
- **folders** — id, name, parent_id (hierarchical), sort_order
- **tags** — id, name, color
- **note_tags** — many-to-many relationship
- **notes_fts** — FTS5 virtual table for full-text search

By default the database file is stored in the Tauri app data directory. You can change the path in **Settings** (gear icon).

## Keyboard Shortcuts

| Shortcut      | Action              |
|---------------|----------------------|
| `⌘ N`         | New note             |
| `⌘ F`         | Focus search         |
| `⌘ D`         | Move to trash        |
| `⌘ Shift F`   | Toggle favorite      |
| `⌘ E`         | Toggle edit/preview  |
| `⌘ Shift E`   | Toggle split view    |

## License

Private project.
