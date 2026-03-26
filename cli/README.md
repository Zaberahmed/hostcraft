# hostcraft

[![Crates.io](https://img.shields.io/crates/v/hostcraft-cli)](https://crates.io/crates/hostcraft-cli)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/rust-2024_edition-orange.svg)](https://www.rust-lang.org)

A fast, cross-platform CLI for managing your system hosts file — add, remove, toggle, and list host entries directly from your terminal without ever manually editing the file.

---

## Ecosystem

| Crate | Description | Status |
|---|---|---|
| `hostcraft-core` | Shared library | ✅ Published |
| `hostcraft-cli` | Terminal interface (this crate) | ✅ Published |
| `hostcraft-gui` | Desktop GUI (Tauri) | 🚧 Planned |

---

## Features

- **List** all host entries with colour-coded active/inactive status
- **Add** a new entry with an IP address and hostname
- **Remove** entries by full or partial name match
- **Toggle** entries on/off without deleting them
- Entries are never silently lost — disabled entries are preserved as commented-out lines
- Duplicate entry detection — adding the same IP + hostname twice is rejected
- IPv4 and IPv6 support
- Cross-platform — works on macOS, Linux, and Windows
- Coloured, aligned terminal output powered by `anstyle`
- Friendly error messages with platform-specific permission hints

---

## Installation

### From crates.io (recommended)

```sh
cargo install hostcraft-cli
```

This compiles the binary and places it in `~/.cargo/bin/`, which is on your `PATH` by default after a standard Rust install. Once done, `hostcraft` is available globally from any directory.

### From source

```sh
git clone https://github.com/Zaberahmed/hostcraft.git
cd hostcraft
cargo install --path cli
```

### Verify the install

```sh
hostcraft --version
```

---

## Quick Start

```sh
# See all current entries in your hosts file
hostcraft list

# Add a new entry
sudo hostcraft add myapp.local 127.0.0.1

# Disable it temporarily without removing it
sudo hostcraft toggle myapp.local

# Remove it entirely
sudo hostcraft remove myapp.local
```

> **Why sudo?** Your system hosts file is a protected system file. Reading it works without elevated privileges, but any command that writes — `add`, `remove`, `toggle` — requires `sudo` on macOS/Linux or running as Administrator on Windows.

---

## Commands

### `list`

Prints all entries in your hosts file with colour-coded status.

```sh
hostcraft list
```

**Output:**

```
  127.0.0.1            localhost                      ● Active
  255.255.255.255      broadcasthost                  ● Active
  ::1                  localhost                      ● Active
  127.0.0.1            myapp.local                    ○ Inactive
```

- `●` green — entry is active and in effect
- `○` red/dimmed — entry is inactive (commented out in the hosts file)

---

### `add <name> <ip>`

Adds a new active entry. The entry is immediately written to the hosts file.

```sh
sudo hostcraft add myapp.local 127.0.0.1
sudo hostcraft add staging.myapp.com 192.168.1.50
sudo hostcraft add mysite.local ::1          # IPv6
```

Adding a duplicate (same IP **and** same hostname) is rejected with an error — the file is left unchanged.

---

### `remove <name>`

Removes all entries whose hostname contains the given string. Supports partial matches.

```sh
# Remove an exact hostname
sudo hostcraft remove myapp.local

# Remove all entries matching a substring
sudo hostcraft remove myapp      # removes myapp.local, myapp.dev, etc.
```

Returns an error if no matching entry is found.

---

### `toggle <name>`

Flips matching entries between active and inactive without removing them. Useful for temporarily disabling a host without losing it.

```sh
sudo hostcraft toggle myapp.local

# Before:   127.0.0.1 myapp.local
# After:  # 127.0.0.1 myapp.local

sudo hostcraft toggle myapp.local

# Before: # 127.0.0.1 myapp.local
# After:    127.0.0.1 myapp.local
```

Supports partial name matching — `hostcraft toggle myapp` toggles all entries whose hostname contains `"myapp"`.

---

## Options

| Flag | Default | Description |
|---|---|---|
| `--file <path>` | Platform default (see below) | Override the hosts file path |
| `--help` | — | Print help for the command or subcommand |
| `--version` | — | Print the installed version |

### Default hosts file path

| Platform | Path |
|---|---|
| macOS / Linux | `/etc/hosts` |
| Windows | `C:\Windows\System32\drivers\etc\hosts` |

### Overriding the path

The `--file` flag is useful for testing against a copy without touching your real hosts file:

```sh
hostcraft --file ./hosts-copy list
hostcraft --file ./hosts-copy add myapp.local 127.0.0.1
```

> **Note:** `--file` must come **before** the subcommand.
>
> ```sh
> ✅  hostcraft --file ./hosts-copy list
> ❌  hostcraft list --file ./hosts-copy
> ```

---

## Permissions

Writing to the system hosts file requires elevated privileges on all platforms.

### macOS / Linux

Prefix write commands with `sudo`:

```sh
sudo hostcraft add myapp.local 127.0.0.1
sudo hostcraft remove myapp.local
sudo hostcraft toggle myapp.local
```

`list` does **not** require `sudo`:

```sh
hostcraft list
```

### Windows

Run your terminal (Command Prompt or PowerShell) **as Administrator**, then use `hostcraft` normally without any prefix:

```sh
hostcraft add myapp.local 127.0.0.1
hostcraft remove myapp.local
hostcraft toggle myapp.local
```

If you forget, hostcraft will tell you:

```
✗ Error: Permission denied: run as Administrator to modify 'C:\Windows\System32\drivers\etc\hosts'
```

---

## Development

### Prerequisites

- [Rust](https://rustup.rs/) (2024 edition or later)

### Build from source

```sh
git clone https://github.com/Zaberahmed/hostcraft.git
cd hostcraft

# Build the entire workspace
cargo build

# Run directly without installing
cargo run --bin hostcraft -- list
cargo run --bin hostcraft -- add myapp.local 127.0.0.1
cargo run --bin hostcraft -- --file ./cli/hosts-copy list
```

### Re-installing after changes

If you've installed via `cargo install` and made local changes, reinstall to pick them up:

```sh
cargo install --path cli --force
```

### Project structure

```
hostcraft/
├── core/                  # hostcraft-core — shared library
│   └── src/
│       ├── host/          # HostEntry, HostStatus, HostError + operations
│       │   ├── mod.rs     # Public API: parse_contents, add_entry, remove_entry, toggle_entry
│       │   └── utils.rs   # Internal: parse_line, is_duplicate_entry
│       └── file/          # File I/O
│           ├── mod.rs     # Public API: read_file, write_file
│           └── utils.rs   # Internal: write_entries
│
└── cli/                   # hostcraft-cli — this crate
    └── src/
        ├── main.rs        # Entry point — parses args, delegates to run()
        ├── command.rs     # CLI definition (Cli, Command) + run() dispatch
        └── display.rs     # Coloured output — styles and print functions
```

### Running tests

```sh
# Run all tests across the workspace
cargo test

# Run only core library tests
cargo test -p hostcraft-core
```

---

## License

MIT — see [LICENSE](LICENSE) for details.