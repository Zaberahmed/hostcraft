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

#[cfg(test)]
mod tests {
    use super::*;
    use std::net::{IpAddr, Ipv4Addr};

    // --- line_has_numbers ---

    #[test]
    fn line_has_numbers_with_ip_line_returns_true() {
        assert!(line_has_numbers("127.0.0.1 hostname.com"));
    }

    #[test]
    fn line_has_numbers_with_commented_ip_returns_true() {
        assert!(line_has_numbers("# 127.0.0.1 hostname.com"));
    }

    #[test]
    fn line_has_numbers_with_text_only_returns_false() {
        assert!(!line_has_numbers("# some host"));
    }

    #[test]
    fn line_has_numbers_empty_string_returns_false() {
        assert!(!line_has_numbers(""));
    }

    #[test]
    fn line_has_numbers_hashes_only_returns_false() {
        assert!(!line_has_numbers("###"));
    }

    // --- count_hash_offset ---

    #[test]
    fn count_hash_offset_no_hashes_returns_zero() {
        let parts = vec!["127.0.0.1", "hostname.com"];
        assert_eq!(count_hash_offset(&parts), 0);
    }

    #[test]
    fn count_hash_offset_single_hash_token_returns_one() {
        let parts = vec!["#", "127.0.0.1", "hostname.com"];
        assert_eq!(count_hash_offset(&parts), 1);
    }

    #[test]
    fn count_hash_offset_double_hash_single_token_returns_one() {
        let parts = vec!["##", "127.0.0.1", "hostname.com"];
        assert_eq!(count_hash_offset(&parts), 1);
    }

    #[test]
    fn count_hash_offset_two_separate_hash_tokens_returns_two() {
        let parts = vec!["#", "#", "127.0.0.1", "hostname.com"];
        assert_eq!(count_hash_offset(&parts), 2);
    }

    #[test]
    fn count_hash_offset_empty_slice_returns_zero() {
        assert_eq!(count_hash_offset(&[]), 0);
    }

    // --- status_from_offset ---

    #[test]
    fn status_from_offset_zero_returns_active() {
        assert_eq!(status_from_offset(0), HostStatus::Active);
    }

    #[test]
    fn status_from_offset_one_returns_inactive() {
        assert_eq!(status_from_offset(1), HostStatus::Inactive);
    }

    #[test]
    fn status_from_offset_large_number_returns_inactive() {
        assert_eq!(status_from_offset(5), HostStatus::Inactive);
    }

    // --- parse_line ---

    #[test]
    fn parse_line_active_entry_returns_correct_fields() {
        let entry = parse_line("127.0.0.1 hostname.com").unwrap();
        assert_eq!(entry.ip, IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)));
        assert_eq!(entry.name, "hostname.com");
        assert_eq!(entry.status, HostStatus::Active);
    }

    #[test]
    fn parse_line_inactive_single_hash_returns_correct_fields() {
        let entry = parse_line("# 127.0.0.1 hostname.com").unwrap();
        assert_eq!(entry.ip, IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)));
        assert_eq!(entry.name, "hostname.com");
        assert_eq!(entry.status, HostStatus::Inactive);
    }

    #[test]
    fn parse_line_inactive_double_hash_token_returns_correct_fields() {
        let entry = parse_line("## 127.0.0.1 hostname.com").unwrap();
        assert_eq!(entry.ip, IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)));
        assert_eq!(entry.name, "hostname.com");
        assert_eq!(entry.status, HostStatus::Inactive);
    }

    #[test]
    fn parse_line_inactive_multiple_hash_tokens_returns_correct_fields() {
        let entry = parse_line("# # 127.0.0.1 hostname.com").unwrap();
        assert_eq!(entry.ip, IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)));
        assert_eq!(entry.name, "hostname.com");
        assert_eq!(entry.status, HostStatus::Inactive);
    }

    #[test]
    fn parse_line_no_numbers_returns_none() {
        assert!(parse_line("# some host without ip").is_none());
    }

    #[test]
    fn parse_line_missing_name_returns_none() {
        assert!(parse_line("127.0.0.1").is_none());
    }

    #[test]
    fn parse_line_invalid_ip_returns_none() {
        assert!(parse_line("999.999.999.999 hostname.com").is_none());
    }

    #[test]
    fn parse_line_empty_string_returns_none() {
        assert!(parse_line("").is_none());
    }

    // --- is_duplicate_entry ---

    #[test]
    fn is_duplicate_entry_matching_ip_and_name_returns_true() {
        let ip = IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1));
        let entries = vec![parse_line("127.0.0.1 hostname.com").unwrap()];
        assert!(is_duplicate_entry(ip, "hostname.com", &entries));
    }

    #[test]
    fn is_duplicate_entry_same_ip_different_name_returns_false() {
        let ip = IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1));
        let entries = vec![parse_line("127.0.0.1 hostname.com").unwrap()];
        assert!(!is_duplicate_entry(ip, "other.com", &entries));
    }

    #[test]
    fn is_duplicate_entry_different_ip_same_name_returns_false() {
        let ip = IpAddr::V4(Ipv4Addr::new(192, 168, 0, 1));
        let entries = vec![parse_line("127.0.0.1 hostname.com").unwrap()];
        assert!(!is_duplicate_entry(ip, "hostname.com", &entries));
    }

    #[test]
    fn is_duplicate_entry_empty_entries_returns_false() {
        let ip = IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1));
        assert!(!is_duplicate_entry(ip, "hostname.com", &[]));
    }
}
