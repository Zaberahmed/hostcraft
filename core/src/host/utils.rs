use crate::host::HostEntry;
use regex::Regex;
use std::{io::Error, net::IpAddr};

pub fn extract_lines_with_numbers(line: &str) -> Result<&str, regex::Error> {
    let regex = Regex::new(r"[0-9]+").expect("Invalid regex pattern");
    if regex.is_match(line) {
        return Ok(line);
    }
    Err(regex::Error::Syntax(String::from("Pattern parsing error")))
}

// pub fn extract_ip_and_name(line: &str) -> Result<Option<(IpAddr, String)>, Error> {
//     let parts: Vec<&str> = line.split_whitespace().collect();
//     if parts.len() == 2 {
//         Ok(Some((
//             parts[0].parse().expect("Invalid IP address"),
//             parts[1].to_string(),
//         )))
//     } else if parts.len() == 3 {
//         Ok(Some((
//             parts[1].parse().expect("Invalid IP address"),
//             parts[2].to_string(),
//         )))
//     } else {
//         Err(Error::new(std::io::ErrorKind::Other, "Invalid line format"))
//     }
// }

pub fn is_duplicate_entry(ip: IpAddr, name: String, entries: &[HostEntry]) -> bool {
    entries.iter().any(|e| e.ip == ip && e.name == name)
}
