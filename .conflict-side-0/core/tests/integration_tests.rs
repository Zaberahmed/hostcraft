use hostcraft_core::file;
use hostcraft_core::host;
use hostcraft_core::{HostEntry, HostStatus};
use std::net::{IpAddr, Ipv4Addr};

// --- Helpers ---

struct TempFile(std::path::PathBuf);

impl TempFile {
    fn new(name: &str) -> Self {
        Self(std::env::temp_dir().join(format!("hostcraft_test_{}.txt", name)))
    }

    fn path(&self) -> &std::path::Path {
        &self.0
    }
}

impl Drop for TempFile {
    fn drop(&mut self) {
        let _ = std::fs::remove_file(&self.0);
    }
}

fn ip(a: u8, b: u8, c: u8, d: u8) -> IpAddr {
    IpAddr::V4(Ipv4Addr::new(a, b, c, d))
}

fn make_entry(ip_addr: IpAddr, name: &str, status: HostStatus) -> HostEntry {
    HostEntry {
        ip: ip_addr,
        name: name.to_string(),
        status,
    }
}

// --- Round-trip ---

#[test]
fn round_trip_preserves_all_entries() {
    let tmp = TempFile::new("round_trip");
    let entries = vec![
        make_entry(ip(127, 0, 0, 1), "alpha.com", HostStatus::Active),
        make_entry(ip(192, 168, 0, 1), "beta.com", HostStatus::Inactive),
    ];

    file::write_file(tmp.path(), &entries).expect("Failed to write");
    let lines = file::read_file(tmp.path()).expect("Failed to read");
    let result = host::parse_contents(lines);

    assert_eq!(result.len(), 2);
    assert_eq!(result[0].ip, ip(127, 0, 0, 1));
    assert_eq!(result[0].name, "alpha.com");
    assert_eq!(result[0].status, HostStatus::Active);
    assert_eq!(result[1].ip, ip(192, 168, 0, 1));
    assert_eq!(result[1].name, "beta.com");
    assert_eq!(result[1].status, HostStatus::Inactive);
}

#[test]
fn add_then_round_trip_includes_new_entry() {
    let tmp = TempFile::new("add_round_trip");
    let mut entries = vec![make_entry(
        ip(127, 0, 0, 1),
        "alpha.com",
        HostStatus::Active,
    )];

    host::add_entry(&mut entries, ip(192, 168, 0, 1), "beta.com".to_string())
        .expect("Failed to add");

    file::write_file(tmp.path(), &entries).expect("Failed to write");
    let lines = file::read_file(tmp.path()).expect("Failed to read");
    let result = host::parse_contents(lines);

    assert_eq!(result.len(), 2);
    assert_eq!(result[1].ip, ip(192, 168, 0, 1));
    assert_eq!(result[1].name, "beta.com");
    assert_eq!(result[1].status, HostStatus::Active);
}

#[test]
fn toggle_then_round_trip_reflects_status_change() {
    let tmp = TempFile::new("toggle_round_trip");
    let mut entries = vec![
        make_entry(ip(127, 0, 0, 1), "alpha.com", HostStatus::Active),
        make_entry(ip(192, 168, 0, 1), "beta.com", HostStatus::Inactive),
    ];

    host::toggle_entry(&mut entries, "alpha.com").expect("Failed to toggle");

    file::write_file(tmp.path(), &entries).expect("Failed to write");
    let lines = file::read_file(tmp.path()).expect("Failed to read");
    let result = host::parse_contents(lines);

    assert_eq!(result[0].status, HostStatus::Inactive);
    assert_eq!(result[1].status, HostStatus::Inactive);
}

#[test]
fn remove_then_round_trip_excludes_removed_entry() {
    let tmp = TempFile::new("remove_round_trip");
    let mut entries = vec![
        make_entry(ip(127, 0, 0, 1), "alpha.com", HostStatus::Active),
        make_entry(ip(192, 168, 0, 1), "beta.com", HostStatus::Active),
    ];

    host::remove_entry(&mut entries, "alpha.com").expect("Failed to remove");

    file::write_file(tmp.path(), &entries).expect("Failed to write");
    let lines = file::read_file(tmp.path()).expect("Failed to read");
    let result = host::parse_contents(lines);

    assert_eq!(result.len(), 1);
    assert_eq!(result[0].name, "beta.com");
}

// --- Edge cases ---

#[test]
fn write_empty_entries_read_back_returns_empty_vec() {
    let tmp = TempFile::new("empty_entries");
    let entries: Vec<HostEntry> = vec![];

    file::write_file(tmp.path(), &entries).expect("Failed to write");
    let lines = file::read_file(tmp.path()).expect("Failed to read");
    let result = host::parse_contents(lines);

    assert!(result.is_empty());
}

#[test]
fn read_nonexistent_file_returns_error() {
    let tmp = TempFile::new("nonexistent_xyz_99999");
    let _ = std::fs::remove_file(tmp.path());
    let result = file::read_file(tmp.path());
    assert!(result.is_err());
}
