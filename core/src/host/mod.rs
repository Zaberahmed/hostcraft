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
            HostError::DuplicateEntry => write!(f, "Entry already exists"),
            HostError::EntryNotFound => write!(f, "No matching entries found"),
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

pub fn print_entries(entries: &[HostEntry]) {
    for entry in entries {
        println!("{}", entry);
    }
}
