use crate::host::{HostEntry, HostStatus};
use regex::Regex;
use std::{net::IpAddr, sync::OnceLock};

static HOST_LINE_REGEX: OnceLock<Regex> = OnceLock::new();

pub fn parse_line(line: &str) -> Option<HostEntry> {
    if !line_has_numbers(line) {
        return None;
    }
    let parts: Vec<&str> = line.split_whitespace().collect();
    let offset = count_hash_offset(&parts);
    let status = status_from_offset(offset);
    let ip = parts.get(offset)?.parse::<IpAddr>().ok()?;
    let name = parts.get(offset + 1)?.to_string();
    Some(HostEntry { status, ip, name })
}

pub fn is_duplicate_entry(ip: IpAddr, name: &str, entries: &[HostEntry]) -> bool {
    entries.iter().any(|e| e.ip == ip && e.name == name)
}

fn line_has_numbers(line: &str) -> bool {
    HOST_LINE_REGEX
        .get_or_init(|| Regex::new(r"[0-9]+").expect("Invalid regex pattern"))
        .is_match(line)
}

fn count_hash_offset(parts: &[&str]) -> usize {
    parts
        .iter()
        .take_while(|p| p.chars().all(|c| c == '#'))
        .count()
}

fn status_from_offset(offset: usize) -> HostStatus {
    if offset > 0 {
        HostStatus::Inactive
    } else {
        HostStatus::Active
    }
}
