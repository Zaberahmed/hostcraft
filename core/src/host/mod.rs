mod utils;
use crate::host::utils::{extract_lines_with_numbers, is_duplicate_entry};
use std::{
    fmt,
    fs::File,
    io::{BufReader, Error},
    net::IpAddr,
};

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

pub fn parse_contents(contents: std::io::Lines<BufReader<File>>) -> Vec<HostEntry> {
    let mut host_entries = Vec::<HostEntry>::new();
    for line in contents.map_while(Result::ok) {
        if let Ok(matched) = extract_lines_with_numbers(&line) {
            if matched.contains('#') {
                let parts: Vec<&str> = matched.split_whitespace().collect();
                let ip: IpAddr = parts[1].parse().expect("Invalid IP address");
                let name = parts[2].to_string();
                host_entries.push(HostEntry {
                    status: HostStatus::Inactive,
                    ip,
                    name,
                });
            } else {
                let parts: Vec<&str> = matched.split_whitespace().collect();
                let ip: IpAddr = parts[0].parse().expect("Invalid IP address");
                let name = parts[1].to_string();
                host_entries.push(HostEntry {
                    status: HostStatus::Active,
                    ip,
                    name,
                });
            }
        }
    }
    host_entries
}

pub fn add_entry(entries: &mut Vec<HostEntry>, ip: IpAddr, name: String) -> Result<(), Error> {
    if is_duplicate_entry(ip, name.clone(), entries) {
        return Err(Error::new(std::io::ErrorKind::Other, "Duplicate entry"));
    }
    entries.push(HostEntry {
        status: HostStatus::Active,
        ip,
        name,
    });
    Ok(())
}

pub fn remove_entry(entries: &mut Vec<HostEntry>, partial_name: &str) {
    entries.retain(|e| !e.name.contains(partial_name));
}

pub fn toggle_entry(entries: &mut Vec<HostEntry>, partial_name: &str) {
    for entry in entries.iter_mut() {
        if entry.name.contains(partial_name) {
            entry.toggle();
        }
    }
}

pub fn print_entries(entries: &[HostEntry]) {
    println!(
        "{}",
        entries
            .iter()
            .map(|e| format!("{}: {} is {}", e.ip, e.name, e.status))
            .collect::<Vec<String>>()
            .join("\n")
    );
}
