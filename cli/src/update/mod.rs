mod utils;

use crate::display::{print_success, print_up_to_date, print_updating};
use std::error::Error;
use std::sync::mpsc;
use std::thread;
use utils::{
    CRATE_NAME, api_url, fetch_from_crates_io, is_newer_version, record_last_checked,
    should_check_for_update,
};

// ── Public API ────────────────────────────────────────────────────────────────

/// Spawns a background thread to check crates.io for a newer version.
/// Returns a handle that blocks until the result is ready when called.
/// Skips the check entirely if it was performed within the last 24 hours.
/// Network failures are silently ignored.
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

/// Checks crates.io for a newer version.
/// Returns Ok(Some(version)) if a newer version is available,
/// Ok(None) if already up to date, or Err if the check failed.
pub fn fetch_latest_version() -> Result<Option<String>, Box<dyn Error>> {
    let response = fetch_from_crates_io(&api_url())
        .ok_or_else(|| "Failed to reach crates.io or parse response".to_string())?;

    let latest = response.info.newest_version;

    let is_newer =
        is_newer_version(&latest).ok_or_else(|| format!("Failed to parse version '{}'", latest))?;

    if is_newer { Ok(Some(latest)) } else { Ok(None) }
}

/// Installs the latest version of hostcraft using cargo.
pub fn install_latest() -> Result<(), Box<dyn Error>> {
    let status = std::process::Command::new("cargo")
        .args(["install", CRATE_NAME])
        .status()
        .map_err(|e| format!("Failed to run cargo: {}", e))?;

    if status.success() {
        Ok(())
    } else {
        Err(format!("cargo install exited with status: {}", status).into())
    }
}

/// Runs the update flow for the `hostcraft update` command.
pub fn handle_update() -> Result<(), Box<dyn Error>> {
    match fetch_latest_version().map_err(|e| format!("Failed to check for updates: {}", e))? {
        None => print_up_to_date(),
        Some(latest) => {
            print_updating(&latest);
            install_latest().map_err(|e| format!("Update failed: {}", e))?;
            print_success(&format!("Updated to v{}", latest));
        }
    }
    Ok(())
}
