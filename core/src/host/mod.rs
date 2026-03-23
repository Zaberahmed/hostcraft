mod utils;
use crate::host::utils::{is_duplicate_entry, parse_line};
use std::{fmt, io, net::IpAddr};

#[derive(Debug, Clone, PartialEq)]
pub enum HostStatus {
    Active,
    Inactive,
}

impl fmt::Display for HostStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            HostStatus::Active => write!(f, "Active"),
            HostStatus::Inactive => write!(f, "Inactive"),
        }
    }
}

#[derive(Debug, Clone)]
pub struct HostEntry {
    pub status: HostStatus,
    pub ip: IpAddr,
    pub name: String,
}

impl HostEntry {
    pub fn toggle(&mut self) {
        self.status = match self.status {
            HostStatus::Active => HostStatus::Inactive,
            HostStatus::Inactive => HostStatus::Active,
        };
    }
}

impl fmt::Display for HostEntry {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}: {} is {}", self.ip, self.name, self.status)
    }
}

#[derive(Debug)]
pub enum HostError {
    DuplicateEntry,
    EntryNotFound,
}

impl fmt::Display for HostError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            HostError::DuplicateEntry => write!(f, "You have inserted a duplicate entry"),
            HostError::EntryNotFound => write!(f, "Please check the name and try again"),
        }
    }
}

impl std::error::Error for HostError {}

pub fn parse_contents(contents: impl Iterator<Item = io::Result<String>>) -> Vec<HostEntry> {
    contents
        .map_while(Result::ok)
        .filter_map(|line| parse_line(&line))
        .collect()
}

pub fn add_entry(entries: &mut Vec<HostEntry>, ip: IpAddr, name: String) -> Result<(), HostError> {
    if is_duplicate_entry(ip, &name, entries) {
        return Err(HostError::DuplicateEntry);
    }
    entries.push(HostEntry {
        status: HostStatus::Active,
        ip,
        name,
    });
    Ok(())
}

pub fn remove_entry(entries: &mut Vec<HostEntry>, partial_name: &str) -> Result<(), HostError> {
    let original_len = entries.len();
    entries.retain(|e| !e.name.contains(partial_name));
    if entries.len() == original_len {
        return Err(HostError::EntryNotFound);
    }
    Ok(())
}

pub fn toggle_entry(entries: &mut Vec<HostEntry>, partial_name: &str) -> Result<(), HostError> {
    let mut found = false;
    for entry in entries.iter_mut() {
        if entry.name.contains(partial_name) {
            entry.toggle();
            found = true;
        }
    }
    if !found {
        return Err(HostError::EntryNotFound);
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io;
    use std::net::{IpAddr, Ipv4Addr};

    // --- Helpers ---

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

    fn sample_entries() -> Vec<HostEntry> {
        vec![
            make_entry(ip(127, 0, 0, 1), "alpha.com", HostStatus::Active),
            make_entry(ip(192, 168, 0, 1), "beta.com", HostStatus::Inactive),
        ]
    }

    fn to_lines(lines: &[&str]) -> std::vec::IntoIter<io::Result<String>> {
        lines
            .iter()
            .map(|l| Ok(l.to_string()))
            .collect::<Vec<_>>()
            .into_iter()
    }

    // --- parse_contents ---

    #[test]
    fn parse_contents_mixed_lines_returns_correct_entries() {
        let lines = to_lines(&["127.0.0.1 active.com", "# 192.168.0.1 inactive.com"]);
        let entries = parse_contents(lines);
        assert_eq!(entries.len(), 2);
        assert_eq!(entries[0].ip, ip(127, 0, 0, 1));
        assert_eq!(entries[0].name, "active.com");
        assert_eq!(entries[0].status, HostStatus::Active);
        assert_eq!(entries[1].ip, ip(192, 168, 0, 1));
        assert_eq!(entries[1].name, "inactive.com");
        assert_eq!(entries[1].status, HostStatus::Inactive);
    }

    #[test]
    fn parse_contents_skips_non_matching_lines() {
        let lines = to_lines(&[
            "127.0.0.1 active.com",
            "# This is a comment",
            "",
            "192.168.0.1 another.com",
        ]);
        let entries = parse_contents(lines);
        assert_eq!(entries.len(), 2);
    }

    #[test]
    fn parse_contents_empty_input_returns_empty_vec() {
        let entries = parse_contents(std::iter::empty::<io::Result<String>>());
        assert!(entries.is_empty());
    }

    // --- add_entry ---

    #[test]
    fn add_entry_new_entry_returns_ok_and_appends() {
        let mut entries = sample_entries();
        let result = add_entry(&mut entries, ip(10, 0, 0, 1), "new.com".to_string());
        assert!(result.is_ok());
        assert_eq!(entries.len(), 3);
        assert_eq!(entries[2].ip, ip(10, 0, 0, 1));
        assert_eq!(entries[2].name, "new.com");
        assert_eq!(entries[2].status, HostStatus::Active);
    }

    #[test]
    fn add_entry_duplicate_returns_err_and_leaves_entries_unchanged() {
        let mut entries = sample_entries();
        let result = add_entry(&mut entries, ip(127, 0, 0, 1), "alpha.com".to_string());
        assert!(matches!(result, Err(HostError::DuplicateEntry)));
        assert_eq!(entries.len(), 2);
    }

    // --- remove_entry ---

    #[test]
    fn remove_entry_exact_name_match_removes_entry() {
        let mut entries = sample_entries();
        let result = remove_entry(&mut entries, "alpha.com");
        assert!(result.is_ok());
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].name, "beta.com");
    }

    #[test]
    fn remove_entry_partial_name_match_removes_all_matching() {
        let mut entries = vec![
            make_entry(ip(127, 0, 0, 1), "dev.hostcraft.com", HostStatus::Active),
            make_entry(
                ip(192, 168, 0, 1),
                "staging.hostcraft.com",
                HostStatus::Active,
            ),
            make_entry(ip(10, 0, 0, 1), "unrelated.com", HostStatus::Active),
        ];
        let result = remove_entry(&mut entries, "hostcraft");
        assert!(result.is_ok());
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].name, "unrelated.com");
    }

    #[test]
    fn remove_entry_no_match_returns_err_and_leaves_entries_unchanged() {
        let mut entries = sample_entries();
        let result = remove_entry(&mut entries, "nonexistent.com");
        assert!(matches!(result, Err(HostError::EntryNotFound)));
        assert_eq!(entries.len(), 2);
    }

    // --- toggle_entry ---

    #[test]
    fn toggle_entry_active_becomes_inactive() {
        let mut entries = sample_entries();
        let result = toggle_entry(&mut entries, "alpha.com");
        assert!(result.is_ok());
        assert_eq!(entries[0].status, HostStatus::Inactive);
    }

    #[test]
    fn toggle_entry_inactive_becomes_active() {
        let mut entries = sample_entries();
        let result = toggle_entry(&mut entries, "beta.com");
        assert!(result.is_ok());
        assert_eq!(entries[1].status, HostStatus::Active);
    }

    #[test]
    fn toggle_entry_partial_match_toggles_all_matching_only() {
        let mut entries = vec![
            make_entry(ip(127, 0, 0, 1), "dev.hostcraft.com", HostStatus::Active),
            make_entry(
                ip(192, 168, 0, 1),
                "staging.hostcraft.com",
                HostStatus::Active,
            ),
            make_entry(ip(10, 0, 0, 1), "unrelated.com", HostStatus::Active),
        ];
        let result = toggle_entry(&mut entries, "hostcraft");
        assert!(result.is_ok());
        assert_eq!(entries[0].status, HostStatus::Inactive);
        assert_eq!(entries[1].status, HostStatus::Inactive);
        assert_eq!(entries[2].status, HostStatus::Active);
    }

    #[test]
    fn toggle_entry_no_match_returns_err() {
        let mut entries = sample_entries();
        let result = toggle_entry(&mut entries, "nonexistent.com");
        assert!(matches!(result, Err(HostError::EntryNotFound)));
    }
}
