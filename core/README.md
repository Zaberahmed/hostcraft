# hostcraft-core

[![Crates.io](https://img.shields.io/crates/v/hostcraft-core)](https://crates.io/crates/hostcraft-core)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

The core library powering [hostcraft](https://github.com/Zaberahmed/hostcraft) — a CLI tool for managing your system's `/etc/hosts` file. This crate provides all the parsing, manipulation, and file I/O logic as a reusable library so you can build your own tooling on top of it.

---

## Features

- Parse `/etc/hosts` file lines into structured `HostEntry` values
- Add, remove, and toggle host entries
- Supports both active (`127.0.0.1 example.com`) and inactive (`# 127.0.0.1 example.com`) entries
- Read from and write back to the hosts file safely
- Duplicate entry detection
- Partial name matching for remove and toggle operations
- IPv4 and IPv6 address support via Rust's standard `IpAddr`

---

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
hostcraft-core = "0.1.0"
```

---

## Usage

### Parsing the hosts file

```rust
use hostcraft_core::file::read_file;
use hostcraft_core::host::parse_contents;

let lines = read_file("/etc/hosts").expect("Failed to read hosts file");
let entries = parse_contents(lines);

for entry in &entries {
    println!("{}", entry); // e.g. "127.0.0.1: example.com is Active"
}
```

### Adding an entry

```rust
use hostcraft_core::host::{add_entry, HostError};
use std::net::IpAddr;

let ip: IpAddr = "192.168.1.10".parse().unwrap();

match add_entry(&mut entries, ip, "myapp.local".to_string()) {
    Ok(()) => println!("Entry added"),
    Err(HostError::DuplicateEntry) => println!("Entry already exists"),
    Err(e) => println!("Error: {}", e),
}
```

### Removing an entry

Partial name matching is supported — `"myapp"` will match `myapp.local`, `myapp.dev`, etc.

```rust
use hostcraft_core::host::{remove_entry, HostError};

match remove_entry(&mut entries, "myapp.local") {
    Ok(()) => println!("Entry removed"),
    Err(HostError::EntryNotFound) => println!("No matching entry found"),
    Err(e) => println!("Error: {}", e),
}
```

### Toggling an entry (enable / disable)

Toggling comments out an active entry:

```
127.0.0.1 example.com  →  # 127.0.0.1 example.com
```

And re-enables an inactive one. All entries matching the partial name are toggled together.

```rust
use hostcraft_core::host::{toggle_entry, HostError};

match toggle_entry(&mut entries, "myapp") {
    Ok(()) => println!("Toggled all matching entries"),
    Err(HostError::EntryNotFound) => println!("No matching entry found"),
    Err(e) => println!("Error: {}", e),
}
```

### Writing back to the hosts file

```rust
use hostcraft_core::file::write_file;

write_file("/etc/hosts", &entries).expect("Failed to write hosts file");
```

> **Note:** Writing to `/etc/hosts` requires elevated privileges. Make sure your application handles `sudo` or runs with the appropriate permissions.

---

## API Reference

### `HostEntry`

Represents a single parsed line from the hosts file.

```rust
pub struct HostEntry {
    pub status: HostStatus,
    pub ip: IpAddr,
    pub name: String,
}
```

| Field    | Type         | Description                        |
|----------|--------------|------------------------------------|
| `status` | `HostStatus` | Whether the entry is active or not |
| `ip`     | `IpAddr`     | The IP address (IPv4 or IPv6)      |
| `name`   | `String`     | The hostname                       |

`HostEntry` also exposes a `toggle()` method to flip its status in place, and implements `Display` to print it in a human-readable format.

---

### `HostStatus`

```rust
pub enum HostStatus {
    Active,   // e.g.  127.0.0.1 example.com
    Inactive, // e.g. # 127.0.0.1 example.com
}
```

---

### `HostError`

```rust
pub enum HostError {
    DuplicateEntry, // Returned by add_entry when the same IP + name already exists
    EntryNotFound,  // Returned by remove_entry / toggle_entry when no match is found
}
```

Both variants implement `std::error::Error` and `Display`.

---

### Functions

| Function                          | Description                                                       |
|-----------------------------------|-------------------------------------------------------------------|
| `parse_contents(lines)`           | Parses an iterator of lines into a `Vec<HostEntry>`              |
| `add_entry(entries, ip, name)`    | Adds a new active entry; returns `Err(DuplicateEntry)` if exists |
| `remove_entry(entries, name)`     | Removes all entries whose name contains the given partial name   |
| `toggle_entry(entries, name)`     | Toggles all entries whose name contains the given partial name   |
| `print_entries(entries)`          | Prints all entries to stdout                                      |
| `file::read_file(path)`           | Opens the hosts file and returns a buffered line iterator        |
| `file::write_file(path, entries)` | Serialises and writes entries back to the hosts file             |

---

## License

MIT — see [LICENSE](LICENSE) for details.