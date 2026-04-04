# Hostcraft

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/rust-2024_edition-orange.svg)](https://www.rust-lang.org)

A suite of tools for managing your system hosts file without ever manually editing it.

---

## Ecosystem

| Crate | Description | Status | Link |
|---|---|---|---|
| `hostcraft-core` | Shared parsing, data modelling and file I/O library | ✅ Published | [crates.io](https://crates.io/crates/hostcraft-core) |
| `hostcraft-cli` | Terminal interface | ✅ Published | [crates.io](https://crates.io/crates/hostcraft-cli) |
| `hostcraft-gui` | Desktop GUI (Tauri) | 🚧 Planned | — |

---

## Quick Start

Install the CLI with a single command:

```sh
cargo install hostcraft-cli
```

Then use it from anywhere in your terminal:

```sh
hostcraft list                              # view all entries
sudo hostcraft add myapp.local 127.0.0.1   # add an entry
sudo hostcraft toggle myapp.local          # enable / disable
sudo hostcraft remove myapp.local          # remove permanently
hostcraft update                           # update to the latest version
```

> **Windows users:** run your terminal as Administrator instead of using `sudo`.

---

## Repository Structure

```
hostcraft/
├── core/        # hostcraft-core — shared library consumed by all tools
└── cli/         # hostcraft-cli — the terminal interface
```

Each crate has its own README with full documentation:

- [`core/README.md`](core/README.md) — API reference, usage examples, and integration guide
- [`cli/README.md`](cli/README.md) — commands, options, permissions, update checker, and development guide

---

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/Zaberahmed/hostcraft).
If you find the project useful, leaving a ⭐ helps others discover it.

---

## License

MIT — see [LICENSE](LICENSE) for details.
