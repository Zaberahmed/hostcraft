# HostCraft

```
hosts-tool/
│
├── core/                          # Shared logic (pure TS/Rust)
│   ├── parser.ts                  # Parse hosts file into structured data
│   ├── writer.ts                  # Write back safely (with backup)
│   └── types.ts                   # HostEntry, Group, etc.
│
├── cli/                           # CLI interface (consumes core)
│   └── index.ts                   # Commands: add, remove, toggle, list
│
└── gui/                           # Tauri app (consumes core)
    ├── src/                       # Frontend UI
    └── src-tauri/                 # Rust shell (minimal)
        └── main.rs                # Calls into core via sidecar or commands
```
```
CLI  →  Node.js + TypeScript  (published to npm)
         • You know TS already
         • npx hosts-tool toggle my-project works out of the box
         • No learning curve

GUI  →  Tauri + Rust backend
         • File I/O is exactly the "3-week Rust" scenario we discussed
         • No sidecar needed — hosts file manipulation is simple fs ops
         • Ships as a proper .dmg / .exe / .deb
         • System tray icon = one click toggle without opening full UI
```

```
Core operations
├── add     hostname ip           # Add new entry
├── remove  hostname              # Remove entry
├── toggle  hostname              # Comment/uncomment  ← your main pain point
├── list                          # Show all entries with status
└── group   [name]                # Group related entries together

Power features (what makes it open source worthy)
├── Profiles   # "work", "personal", "project-x" — switch entire sets
├── Backup     # Auto-backup before every write operation
├── Dry run    # Preview changes before applying
└── sudo handling  # Graceful elevation prompts, not silent failures
```
