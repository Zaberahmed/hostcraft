use crate::error::{HostCraftError, Result};
use crate::file;
use crate::host::HostEntry;
use std::path::{Path, PathBuf};

pub fn get_hosts_path() -> Result<PathBuf> {
    match std::env::consts::OS {
        "windows" => {
            let root = std::env::var("SystemRoot").unwrap_or_else(|_| "C:\\Windows".to_string());
            Ok(PathBuf::from(root)
                .join("System32")
                .join("drivers")
                .join("etc")
                .join("hosts"))
        }
        "macos" | "linux" => Ok(PathBuf::from("/etc/hosts")),
        other => Err(HostCraftError::UnsupportedPlatform(other.to_string())),
    }
}

pub fn write_hosts_to(path: &Path, entries: &[HostEntry]) -> Result<()> {
    file::write_file(path, entries).map_err(|e| {
        if e.kind() == std::io::ErrorKind::PermissionDenied {
            if cfg!(target_os = "windows") {
                HostCraftError::PermissionDenied(format!(
                    "Permission denied: run as Administrator to modify '{}'",
                    path.display()
                ))
            } else {
                HostCraftError::PermissionDenied(format!(
                    "Permission denied: run with sudo to modify '{}'",
                    path.display()
                ))
            }
        } else {
            HostCraftError::Io(e)
        }
        .into()
    })
}

pub fn write_hosts(entries: &[HostEntry]) -> Result<()> {
    write_hosts_to(&get_hosts_path()?, entries)
}
