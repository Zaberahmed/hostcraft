mod utils;

use crate::display::{print_success, print_up_to_date, print_updating};
use std::error::Error;
use std::sync::mpsc;
use std::thread;
use utils::{
    binary_download_url, current_target, download_bytes, fetch_latest_cli_release,
    is_newer_version, record_last_checked, replace_binary, should_check_for_update,
    version_from_tag,
};

// ── Public API ─────────────────────────────────────────────────────────────────

/// Spawns a background thread to check GitHub for a newer CLI version.
/// Returns a lazy handle — calling the handle blocks until the result is ready.
/// The check is skipped entirely if one ran within the last 24 hours.
/// Network failures are silently swallowed so they never interrupt normal usage.
pub fn check_for_update() -> Box<dyn FnOnce() -> Option<String>> {
    if !should_check_for_update() {
        return Box::new(|| None);
    }

    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let result = fetch_latest_version().ok().flatten();
        record_last_checked();
        let _ = tx.send(result);
    });

    Box::new(move || rx.recv().ok().flatten())
}

/// Asks GitHub releases whether there is a newer version.
/// Returns Ok(Some(version_string)) if there is, Ok(None) if already current,
/// or Err if the network request failed or the response was unparseable.
pub fn fetch_latest_version() -> Result<Option<String>, Box<dyn Error>> {
    let release = fetch_latest_cli_release()
        .ok_or("Could not fetch release info from GitHub. Check your connection.")?;

    let version = version_from_tag(&release.tag_name)
        .ok_or_else(|| format!("Unexpected tag format: '{}'", release.tag_name))?;

    let is_newer = is_newer_version(version)
        .ok_or_else(|| format!("Could not parse version string: '{}'", version))?;

    Ok(if is_newer {
        Some(version.to_owned())
    } else {
        None
    })
}

/// Full update flow for the `hostcraft update` command.
pub fn handle_update() -> Result<(), Box<dyn Error>> {
    let latest =
        fetch_latest_version().map_err(|e| format!("Failed to check for updates: {}", e))?;

    match latest {
        None => print_up_to_date(),
        Some(version) => {
            print_updating(&version);
            install_latest(&version).map_err(|e| format!("Update failed: {}", e))?;
            print_success(&format!("Updated to v{}", version));
        }
    }
    Ok(())
}

// ── Private ────────────────────────────────────────────────────────────────────

/// Downloads the binary for the current platform from GitHub and self-replaces.
/// Falls back to `cargo install` if no pre-built binary matches this platform
/// (e.g. someone compiled from source on a niche target).
fn install_latest(version: &str) -> Result<(), Box<dyn Error>> {
    match current_target() {
        Some(target) => {
            let url = binary_download_url(version, target);
            let bytes = download_bytes(&url)?;
            replace_binary(&bytes)
        }
        None => install_via_cargo(),
    }
}

fn install_via_cargo() -> Result<(), Box<dyn Error>> {
    let status = std::process::Command::new("cargo")
        .args(["install", "hostcraft-cli"])
        .status()
        .map_err(|e| format!("Failed to run cargo: {}", e))?;

    if status.success() {
        Ok(())
    } else {
        Err(format!("cargo install exited with status: {}", status).into())
    }
}
