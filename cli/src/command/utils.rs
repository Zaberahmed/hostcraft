use hostcraft_core::file;
use std::error::Error;

pub fn write_hosts(
    path: &str,
    entries: &[hostcraft_core::HostEntry],
) -> Result<(), Box<dyn Error>> {
    file::write_file(path, entries).map_err(|e| {
        if e.kind() == std::io::ErrorKind::PermissionDenied {
            if cfg!(target_os = "windows") {
                format!(
                    "Permission denied: run as Administrator to modify '{}'",
                    path
                )
            } else {
                format!("Permission denied: run with sudo to modify '{}'", path)
            }
        } else {
            format!("Failed to write hosts file '{}': {}", path, e)
        }
        .into()
    })
}
