use crate::host::{HostEntry, HostStatus};
use std::io::Write;

pub fn write_entries(entries: &[HostEntry], file: &mut impl Write) -> Result<(), std::io::Error> {
    for entry in entries {
        let line = match entry.status {
            HostStatus::Active => format!("{} {}\n", entry.ip, entry.name),
            HostStatus::Inactive => format!("# {} {}\n", entry.ip, entry.name),
        };
        file.write_all(line.as_bytes())?;
    }
    Ok(())
}
