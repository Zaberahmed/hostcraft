# hostcraft-core

[![Crates.io](https://img.shields.io/crates/v/hostcraft-core)](https://crates.io/crates/hostcraft-core)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/rust-2024_edition-orange.svg)](https://www.rust-lang.org)

The shared foundation powering the hostcraft ecosystem — a suite of tools for managing your system's `/etc/hosts` (unix based) or `\etc\hosts` (windows) file. This crate contains all parsing, data modelling, and file I/O logic, deliberately free of any presentation or platform concerns so it can be consumed equally by a CLI, a desktop GUI, or any other Rust application.

---

## Ecosystem

| Crate | Description | Status |
|---|---|---|
| `hostcraft-core` | Shared library (this crate) | ✅ Published |
| `hostcraft-cli` | Terminal interface | ✅ Active |
| `hostcraft-gui` | Desktop GUI (Tauri) | 🚧 Planned |

Every consumer in the ecosystem depends on this crate for its data types and business logic. Presentation — colours, layout, widgets — is always the consumer's responsibility.

---

## Design Philosophy

- **No I/O surprises** — the library never prints to stdout or stderr. It returns data and `Result` types; what you do with them is up to you.
- **Partial name matching** — `remove` and `toggle` operate on substrings, so `"myapp"` matches `myapp.local`, `myapp.dev`, and so on.
- **Active / Inactive model** — entries are never silently deleted to disable them. Inactive entries are preserved as commented-out lines (`# ip hostname`) so they can be re-enabled at any time.
- **Duplicate safety** — adding an entry that shares both an IP and a hostname with an existing one is rejected before any write occurs.
- **IPv4 and IPv6** — all IP handling goes through Rust's standard `IpAddr`, so both address families work out of the box.

---

## Installation

```toml
[dependencies]
hostcraft-core = "0.1.2"
```

---

## Quick Start

```rust
use hostcraft_core::file::{read_file, write_file};
use hostcraft_core::host::{add_entry, parse_contents, toggle_entry};
use std::net::IpAddr;

// 1. Read and parse
let lines = read_file("/etc/hosts").expect("Failed to read hosts file");
let mut entries = parse_contents(lines);

// 2. Manipulate
let ip: IpAddr = "127.0.0.1".parse().unwrap();
add_entry(&mut entries, ip, "myapp.local".to_string()).expect("Failed to add entry");

// 3. Write back
write_file("/etc/hosts", &entries).expect("Failed to write hosts file");
```

> **Note:** Writing to `/etc/hosts` requires elevated privileges (`sudo` on macOS/Linux). Your application is responsible for requesting or documenting this requirement.

---

## Usage

### Reading and parsing

`read_file` returns a lazy line iterator — nothing is loaded into memory until `parse_contents` consumes it.

```rust
use hostcraft_core::file::read_file;
use hostcraft_core::host::parse_contents;

let lines = read_file("/etc/hosts").expect("Failed to read hosts file");
let entries = parse_contents(lines);

// HostEntry implements Display: "127.0.0.1: example.com is Active"
for entry in &entries {
    println!("{}", entry);
}
```

Lines that do not match a valid host pattern (pure comments, blank lines, malformed entries) are silently skipped during parsing. This mirrors how the OS itself handles the file.

---

### Adding an entry

New entries are always added as `Active`. Adding a duplicate (same IP **and** same hostname) returns `Err(HostError::DuplicateEntry)` without modifying the list.

```rust
use hostcraft_core::host::{add_entry, HostError};
use std::net::IpAddr;

let ip: IpAddr = "192.168.1.10".parse().unwrap();

match add_entry(&mut entries, ip, "myapp.local".to_string()) {
    Ok(())                        => println!("Entry added"),
    Err(HostError::DuplicateEntry) => println!("Already exists"),
    Err(e)                        => println!("Error: {}", e),
}
```

---

### Removing an entry

Matches by substring — all entries whose hostname contains `partial_name` are removed. Returns `Err(HostError::EntryNotFound)` if nothing matched.

```rust
use hostcraft_core::host::{remove_entry, HostError};

match remove_entry(&mut entries, "myapp") {
    Ok(())                       => println!("Removed"),
    Err(HostError::EntryNotFound) => println!("No match found"),
    Err(e)                       => println!("Error: {}", e),
}
```

---

### Toggling an entry

Toggling flips an entry between active and inactive without removing it:

```
127.0.0.1 myapp.local    →    # 127.0.0.1 myapp.local
# 127.0.0.1 myapp.local  →    127.0.0.1 myapp.local
```

All entries matching the partial name are toggled in one call.

```rust
use hostcraft_core::host::{toggle_entry, HostError};

match toggle_entry(&mut entries, "myapp") {
    Ok(())                       => println!("Toggled"),
    Err(HostError::EntryNotFound) => println!("No match found"),
    Err(e)                       => println!("Error: {}", e),
}
```

---

### Writing back

`write_file` truncates and rewrites the file. Active entries are written as plain lines; inactive entries are written as commented-out lines.

```rust
use hostcraft_core::file::write_file;

write_file("/etc/hosts", &entries).expect("Failed to write hosts file");
```

---

## API Reference

### `HostEntry`

The core data type. Represents one parsed line from the hosts file.

```rust
pub struct HostEntry {
    pub status: HostStatus,
    pub ip:     IpAddr,
    pub name:   String,
}
```

| Field    | Type         | Description                              |
|----------|--------------|------------------------------------------|
| `status` | `HostStatus` | Whether the entry is active or inactive  |
| `ip`     | `IpAddr`     | The IP address — IPv4 or IPv6            |
| `name`   | `String`     | The hostname                             |

**Methods**

| Method      | Description                                          |
|-------------|------------------------------------------------------|
| `toggle()`  | Flips `Active` ↔ `Inactive` in place                |

**Trait implementations:** `Debug`, `Clone`, `Display` (`"ip: name is Status"`)

---

### `HostStatus`

```rust
pub enum HostStatus {
    Active,   // Written as:   127.0.0.1 hostname
    Inactive, // Written as: # 127.0.0.1 hostname
}
```

**Trait implementations:** `Debug`, `Clone`, `PartialEq`, `Display` (`"Active"` / `"Inactive"`)

---

### `HostError`

```rust
pub enum HostError {
    DuplicateEntry, // add_entry: same IP + hostname already exists
    EntryNotFound,  // remove_entry / toggle_entry: no name matched
}
```

**Trait implementations:** `Debug`, `Display`, `std::error::Error`

---

### `host` module — functions

| Function                              | Signature                                                                 | Description                                               |
|---------------------------------------|---------------------------------------------------------------------------|-----------------------------------------------------------|
| `parse_contents`                      | `(impl Iterator<Item = io::Result<String>>) -> Vec<HostEntry>`           | Parses a line iterator into a list of entries             |
| `add_entry`                           | `(&mut Vec<HostEntry>, IpAddr, String) -> Result<(), HostError>`         | Adds an active entry; rejects duplicates                  |
| `remove_entry`                        | `(&mut Vec<HostEntry>, &str) -> Result<(), HostError>`                   | Removes all entries matching the partial name             |
| `toggle_entry`                        | `(&mut Vec<HostEntry>, &str) -> Result<(), HostError>`                   | Toggles all entries matching the partial name             |

### `file` module — functions

| Function     | Signature                                              | Description                                          |
|--------------|--------------------------------------------------------|------------------------------------------------------|
| `read_file`  | `(impl AsRef<Path>) -> io::Result<Lines<BufReader<File>>>` | Opens the hosts file and returns a line iterator |
| `write_file` | `(impl AsRef<Path>, &[HostEntry]) -> io::Result<()>`   | Serialises entries and writes them to the file       |

---

## Building for Consumers

If you are building a consumer on top of `hostcraft-core`, the typical pattern is:

1. **Read** with `file::read_file`
2. **Parse** with `host::parse_contents` → `Vec<HostEntry>`
3. **Mutate** using `add_entry` / `remove_entry` / `toggle_entry`
4. **Present** however your layer requires — the types all implement `Display` and `Debug`
5. **Write** back with `file::write_file`

The library holds no global state and makes no assumptions about the platform, runtime, or output format.

---

## License

MIT — see [LICENSE](LICENSE) for details.