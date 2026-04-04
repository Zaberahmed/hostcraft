# Hostcraft GUI

[![GUI](https://img.shields.io/badge/GUI-Beta-orange)](https://github.com/Zaberahmed/hostcraft/releases)
[![Tauri](https://img.shields.io/badge/Tauri-v2-blue)](https://tauri.app)
[![React](https://img.shields.io/badge/React-v19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5-blue)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-blue)](https://tailwindcss.com/)

--- 

A cross-platform desktop application for effortlessly managing your system hosts file. Built with Tauri, React, and TypeScript, the Hostcraft GUI provides a modern, intuitive interface for all your host management needs.

<p align="center">
  <img src="../assets/gui-demo-dark.png" width="49%" alt="Hostcraft GUI — dark mode" />
  &nbsp;
  <img src="../assets/gui-demo-light.png" width="49%" alt="Hostcraft GUI — light mode" />
</p>


---

## Ecosystem

| Component | Description | Status | Link |
|---|---|---|---|
| `hostcraft-core` | Shared library | ✅ Published | [crates.io](https://crates.io/crates/hostcraft-core) |
| `hostcraft-cli` | Terminal interface (this crate) | ✅ Published | [crates.io](https://crates.io/crates/hostcraft-cli) and [Releases](https://github.com/Zaberahmed/hostcraft/releases/tag/cli-v2.1.1) |
| `hostcraft-gui` | Desktop GUI (Tauri) | 🟡 Beta | [Releases](https://github.com/Zaberahmed/hostcraft/releases) |

---

## Features

- **Intuitive List View:** See all your host entries at a glance with clear, colour-coded active/inactive status.
- **Toggle with a Click:** Enable or disable host entries instantly without permanent deletion.
- **Search & Filter:** Quickly find specific entries by hostname, IP address, status, or address family (IPv6).
- **Guided Entry Forms:** Add new host entries through user-friendly forms with real-time validation.
- **Edit Existing Entries:** Modify IP addresses or hostnames of existing entries easily.
- **System Integration:** Flush DNS cache and open the hosts file in your default editor directly from the app.
- **Permission Handling:** Automatically prompts for administrative privileges when writing to the protected hosts file.
- **Light & Dark Mode:** Full theme support, with an option to follow your system's theme.
- **Cross-Platform:** Available for macOS, Windows, and Linux.

---

## Download

Download the installer for your platform from the [latest release on GitHub](https://github.com/Zaberahmed/hostcraft/releases):

| Platform | Installer |
|---|---|
| macOS | `.dmg` |
| Windows | `.msi` or `.exe` |
| Linux | `.AppImage` or `.deb` |

---

## Development

Hostcraft GUI is a Tauri application built with a React frontend.

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (2024 edition or later)
- [Node.js](https://nodejs.org/en/download/) (v22 or later)
- [pnpm](https://pnpm.io/installation) (v9 or later)
- [Tauri CLI](https://tauri.app/v2/guides/getting-started/prerequisites)

### Run in development mode

```sh
# Navigate to the GUI project root
cd hostcraft/gui

# Install frontend dependencies
pnpm install

# Start the Tauri dev server
pnpm tauri dev
```

### Build for production

```sh
# Navigate to the GUI project root
cd hostcraft/gui

# Install frontend dependencies
pnpm install

# Build the application for your target platform
pnpm tauri build
```

The compiled installer will be located in `src-tauri/target/release/bundle/`.

---

## Project Structure

```
hostcraft/gui/
├── src/                    # React frontend source code
│   ├── assets/             # Images, icons, static files
│   ├── components/         # Reusable React components (UI, layout, modals)
│   ├── constants/          # Application-wide constants (filters, app info)
│   ├── entities/           # TypeScript types and interfaces
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions, TailwindCSS config
│   ├── pages/              # Top-level application pages (Host Entries, Settings)
│   ├── providers/          # React context providers (Theme, Entries, Toast)
│   ├── routes/             # React Router setup
│   ├── utils/              # General utility functions
│   ├── App.css             # Main stylesheet (TailwindCSS imports, CSS vars)
│   ├── App.tsx             # Main React application component
│   └── main.tsx            # React entry point
└── src-tauri/              # Rust backend (Tauri) source code
    ├── capabilities/       # Tauri capabilities definition
    ├── icons/              # Application icons for different platforms
    ├── src/                # Rust backend logic
    │   ├── command/        # Tauri commands (IPC calls from frontend to Rust)
    │   ├── elevation.rs    # Platform-specific privilege elevation (sudo/admin)
    │   └── lib.rs          # Tauri application entry point and plugin setup
    ├── Cargo.toml          # Rust project manifest
    └── tauri.conf.json     # Tauri configuration (window, bundle, security)
```

---

## Tech Stack

- **Frontend:** [React](https://react.dev/) (v19), [TypeScript](https://www.typescriptlang.org/) (v5), [Tailwind CSS](https://tailwindcss.com/) (v4), [pnpm](https://pnpm.io/)
- **Backend:** [Rust](https://www.rust-lang.org/) (2024 edition), [Tauri](https://tauri.app/) (v2), [hostcraft-core](https://crates.io/crates/hostcraft-core)
- **Tooling:** [Vite](https://vitejs.dev/)

---

## License

MIT — see [LICENSE](../../LICENSE) for details.
