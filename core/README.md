# hostcraft-core

[![Crates.io](https://img.shields.io/crates/v/hostcraft-core)](https://crates.io/crates/hostcraft-core)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/rust-2024_edition-orange.svg)](https://www.rust-lang.org)

The shared foundation powering the hostcraft ecosystem — a suite of tools for managing your system hosts file (`/etc/hosts` on macOS/Linux, `C:\Windows\System32\drivers\etc\hosts` on Windows). This crate contains all parsing, data modelling, and file I/O logic, deliberately free of any presentation or platform concerns so it can be consumed equally by a CLI, a desktop GUI, or any other Rust application.

---

## Ecosystem

| Component | Description | Status | Link |
|---|---|---|---|
| `hostcraft-core` | Shared library (this crate) | ✅ Published | [crates.io](https://crates.io/crates/hostcraft-core) |
| `hostcraft-cli` | Terminal interface | ✅ Published | [crates.io](https://crates.io/crates/hostcraft-cli) and [Releases](https://github.com/Zaberahmed/hostcraft/releases/tag/cli-v2.1.1) |
| `hostcraft-gui` | Desktop GUI (Tauri) | 🟡 Beta | [Releases](https://github.com/Zaberahmed/hostcraft/releases) |

Every consumer in the ecosystem depends on this crate for its data types and business logic. Presentation — colours, layout, widgets — is always the consumer's responsibility.

---

## Design Philosophy

- **No I/O surprises** — the library never prints to stdout or stderr. It returns data and `Result` types; what you do with them is up to you.
- **Partial name matching** — `remove` and `toggle` operate on substrings, so `"myapp"` matches `myapp.local`, `myapp.dev`, and so on.
- **Exact matching for edits** — `edit` requires the full hostname to prevent accidental bulk modifications.
- **Active / Inactive model** — entries are never silently deleted to disable them. Inactive entries are preserved as commented-out lines (`# ip hostname`) so they can be re-enabled at any time.
- **Duplicate safety** — adding or editing an entry to a combination that already exists is rejected before any write occurs.
- **IPv4 and IPv6** — all IP handling goes through Rust's standard `IpAddr`, so both address families work out of the box.

---

## Installation

```toml
[dependencies]
hostcraft-core = "1.1.2"
```

---

## Quick Start

```rust
use hostcraft_core::HostCraftError;
use hostcraft_core::file::{read_file, write_file};
use hostcraft_core::host::{add_entry, parse_contents, toggle_entry};
use std::net::IpAddr;

// 1. Read and parse
let lines = read_file("/etc/hosts").expect("Failed to read hosts file");
let mut entries = parse_contents(lines);

// 2. Manipulate
let ip: IpAddr = "127.0.0.1".parse().unwrap();
add_entry(&mut entries, ip, "myapp.local").expect("Failed to add entry");

// 3. Write back
write_file("/etc/hosts", &entries).expect("Failed to write hosts file");
```

> **Note:** Writing to `/etc/hosts` requires elevated privileges (`sudo` on macOS/Linux). Your application is responsible for requesting or documenting this requirement. See the [`platform` module](#platform-module) for permission-aware write helpers.

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

New entries are always added as `Active`. Adding a duplicate (same hostname **and** same IP) returns `Err(HostCraftError::DuplicateEntry)` without modifying the list.

```rust
use hostcraft_core::HostCraftError;
use hostcraft_core::host::add_entry;
use std::net::IpAddr;

let ip: IpAddr = "192.168.1.10".parse().unwrap();

match add_entry(&mut entries, ip, "myapp.local") {
    Ok(())                                  => println!("Entry added"),
    Err(HostCraftError::DuplicateEntry)     => println!("Already exists"),
    Err(e)                                  => println!("Error: {}", e),
}
```

---

### Editing an entry

Updates an existing entry's IP address, hostname, or both in a single call. Requires an **exact** hostname match — partial names are not accepted.

The entry's `HostStatus` is preserved unchanged.

```rust
use hostcraft_core::HostCraftError;
use hostcraft_core::host::edit_entry;
use std::net::IpAddr;

let new_ip: IpAddr = "192.168.1.50".parse().unwrap();

match edit_entry(&mut entries, "myapp.local", new_ip, "myapp.dev") {
    Ok(())                                  => println!("Entry updated"),
    Err(HostCraftError::EntryNotFound)      => println!("No entry with that exact name"),
    Err(HostCraftError::DuplicateEntry)     => println!("Another entry already has that IP + name"),
    Err(HostCraftError::NoChange)           => println!("New values are identical to current ones"),
    Err(e)                                  => println!("Error: {}", e),
}
```

---

### Removing an entry

Matches by substring — all entries whose hostname contains `partial_name` are removed. Returns `Err(HostCraftError::EntryNotFound)` if nothing matched.

```rust
use hostcraft_core::HostCraftError;
use hostcraft_core::host::remove_entry;

match remove_entry(&mut entries, "myapp") {
    Ok(())                                  => println!("Removed"),
    Err(HostCraftError::EntryNotFound)      => println!("No match found"),
    Err(e)                                  => println!("Error: {}", e),
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
use hostcraft_core::HostCraftError;
use hostcraft_core::host::toggle_entry;

match toggle_entry(&mut entries, "myapp") {
    Ok(())                                  => println!("Toggled"),
    Err(HostCraftError::EntryNotFound)      => println!("No match found"),
    Err(e)                                  => println!("Error: {}", e),
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

### Platform module

The `platform` module provides OS-aware path resolution and permission-aware write helpers. Rather than handling raw `io::Error` from `write_file`, these functions return `HostCraftError::PermissionDenied` with a clear, platform-specific message when the process lacks the necessary privileges.

```rust
use hostcraft_core::platform;

// Resolve the hosts file path for the current OS at runtime
let path = platform::get_hosts_path().expect("Unsupported platform");
println!("Hosts file: {}", path.display());

// Write to an explicit path with permission-aware error messages
platform::write_hosts_to(&path, &entries)?;

// Or use the convenience wrapper — resolves the path and writes in one call
platform::write_hosts(&entries)?;
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

**Trait implementations:** `Debug`, `Clone`, `PartialEq`, `Serialize`, `Display` (`"ip: name is Status"`)

---

### `HostStatus`

```rust
pub enum HostStatus {
    Active,   // Written as:   127.0.0.1 hostname
    Inactive, // Written as: # 127.0.0.1 hostname
}
```

**Trait implementations:** `Debug`, `Clone`, `PartialEq`, `Serialize`, `Display` (`"Active"` / `"Inactive"`)

---

### `HostCraftError`

```rust
pub enum HostCraftError {
    Io(std::io::Error),          // Underlying I/O failure from read_file / write_file
    PermissionDenied(String),    // Write rejected — process lacks privileges
    UnsupportedPlatform(String), // get_hosts_path called on an unrecognised OS
    DuplicateEntry,              // add_entry / edit_entry: same IP + hostname already exists
    EntryNotFound,               // remove_entry / toggle_entry / edit_entry: no name matched
    NoChange,                    // edit_entry: supplied values are identical to current ones
}
```

| Variant               | Raised by                              | `Display` message                                      |
|-----------------------|----------------------------------------|--------------------------------------------------------|
| `Io(e)`               | `read_file`, `write_file`              | `"IO error: {e}"`                                      |
| `PermissionDenied(m)` | `platform::write_hosts_to`            | `"{m}"` (platform-specific hint included)              |
| `UnsupportedPlatform` | `platform::get_hosts_path`            | `"Unsupported platform: {os}"`                         |
| `DuplicateEntry`      | `add_entry`, `edit_entry`             | `"You have inserted a duplicate entry."`               |
| `EntryNotFound`       | `remove_entry`, `toggle_entry`, `edit_entry` | `"Please check the name and try again."`        |
| `NoChange`            | `edit_entry`                          | `"Entry already exists. No changes made."`             |

**Trait implementations:** `Debug`, `Display`, `std::error::Error`

---

### `Result<T>` type alias

```rust
pub type Result<T> = std::result::Result<T, HostCraftError>;
```

Re-exported at the crate root as `hostcraft_core::Result<T>`. All fallible functions in this crate return this type.

---

### `host` module — functions

| Function         | Signature                                                                                               | Description                                                     |
|------------------|---------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|
| `parse_contents` | `(impl Iterator<Item = io::Result<String>>) -> Vec<HostEntry>`                                         | Parses a line iterator into a list of entries                   |
| `add_entry`      | `(&mut Vec<HostEntry>, IpAddr, impl Into<String>) -> Result<()>`                                        | Adds an active entry; rejects duplicates                        |
| `edit_entry`     | `(&mut Vec<HostEntry>, impl Into<String>, IpAddr, impl Into<String>) -> Result<()>`                     | Edits an entry by exact name; preserves status                  |
| `remove_entry`   | `(&mut Vec<HostEntry>, &str) -> Result<()>`                                                             | Removes all entries matching the partial name                   |
| `toggle_entry`   | `(&mut Vec<HostEntry>, &str) -> Result<()>`                                                             | Toggles all entries matching the partial name                   |

---

### `file` module — functions

| Function     | Signature                                                          | Description                                          |
|--------------|--------------------------------------------------------------------|------------------------------------------------------|
| `read_file`  | `(impl AsRef<Path>) -> io::Result<Lines<BufReader<File>>>`         | Opens the hosts file and returns a lazy line iterator |
| `write_file` | `(impl AsRef<Path>, &[HostEntry]) -> io::Result<()>`               | Serialises entries and writes them to the file        |

---

### `platform` module — functions

| Function         | Signature                                  | Description                                                        |
|------------------|--------------------------------------------|--------------------------------------------------------------------|
| `get_hosts_path` | `() -> Result<PathBuf>`                    | Returns the OS-appropriate hosts file path                         |
| `write_hosts_to` | `(&Path, &[HostEntry]) -> Result<()>`      | Writes entries to a path; wraps permission errors with a clear hint |
| `write_hosts`    | `(&[HostEntry]) -> Result<()>`             | Convenience wrapper: resolves the platform path and writes         |

---

## Building for Consumers

If you are building a consumer on top of `hostcraft-core`, the typical pattern is:

1. **Read** with `file::read_file`
2. **Parse** with `host::parse_contents` → `Vec<HostEntry>`
3. **Mutate** using `add_entry` / `edit_entry` / `remove_entry` / `toggle_entry`
4. **Present** however your layer requires — the types all implement `Display`, `Debug`, and `Serialize`
5. **Write** back with `platform::write_hosts_to` (permission-aware) or `file::write_file` (raw)

The library holds no global state and makes no assumptions about the platform, runtime, or output format.

---

## License

MIT — see [LICENSE](LICENSE) for details.
