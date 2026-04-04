use hostcraft_core::platform::write_hosts_to;
use hostcraft_core::HostEntry;
use std::path::Path;

pub fn try_write_or_elevate(path: &Path, entries: &[HostEntry]) -> Result<(), String> {
    match write_hosts_to(path, entries) {
        Ok(_) => Ok(()),
        Err(e) if e.to_string().contains("Permission denied") => write_elevated(path, entries),
        Err(e) => Err(e.to_string()),
    }
}

fn write_elevated(dest_path: &Path, entries: &[HostEntry]) -> Result<(), String> {
    // Write to temp file first
    let temp_path = std::env::temp_dir().join("hostcraft_hosts.tmp");
    write_hosts_to(&temp_path, entries).map_err(|e| e.to_string())?;

    #[cfg(target_os = "macos")]
    elevated_write_macos(&temp_path, dest_path)?;

    #[cfg(target_os = "linux")]
    elevated_write_linux(&temp_path, dest_path)?;

    let _ = std::fs::remove_file(&temp_path);
    Ok(())
}

#[cfg(target_os = "macos")]
fn elevated_write_macos(temp_path: &Path, dest_path: &Path) -> Result<(), String> {
    let script = format!(
        "do shell script \"cp '{}' '{}'\" with administrator privileges",
        temp_path.display(),
        dest_path.display(),
    );

    let output = std::process::Command::new("osascript")
        .arg("-e")
        .arg(&script)
        .output()
        .map_err(|e| format!("Failed to launch osascript: {}", e))?;

    if output.status.success() {
        return Ok(());
    }

    let stderr = String::from_utf8_lossy(&output.stderr);
    if stderr.contains("User canceled.") {
        return Err("Authorisation cancelled".to_string());
    }

    Err(format!("Elevated write failed: {}", stderr.trim()))
}

#[cfg(target_os = "linux")]
fn elevated_write_linux(temp_path: &Path, dest_path: &Path) -> Result<(), String> {
    let status = std::process::Command::new("pkexec")
        .arg("cp")
        .arg(temp_path)
        .arg(dest_path)
        .status()
        .map_err(|e| format!("Failed to launch pkexec: {}", e))?;

    if status.success() {
        return Ok(());
    }

    // pkexec exits with 126 on user cancel
    if status.code() == Some(126) {
        return Err("Authorisation cancelled".to_string());
    }

    Err(format!(
        "Elevated write failed with exit code: {:?}",
        status.code()
    ))
}
