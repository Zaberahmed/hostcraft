// ── Constants ─────────────────────────────────────────────────────────────────

pub(super) const CURRENT_VERSION: &str = env!("CARGO_PKG_VERSION");
pub(super) const CRATE_NAME: &str = env!("CARGO_PKG_NAME");
pub(super) const CRATES_IO_API: &str = "https://crates.io/api/v1/crates";

// ── Types ─────────────────────────────────────────────────────────────────────

#[derive(serde::Deserialize)]
pub(super) struct CratesIoResponse {
    #[serde(rename = "crate")]
    pub(super) info: CrateInfo,
}

#[derive(serde::Deserialize)]
pub(super) struct CrateInfo {
    pub(super) newest_version: String,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

pub(super) fn api_url() -> String {
    format!("{}/{}", CRATES_IO_API, CRATE_NAME)
}

pub(super) fn fetch_from_crates_io(url: &str) -> Option<CratesIoResponse> {
    ureq::get(url)
        .set("User-Agent", &format!("{}/{}", CRATE_NAME, CURRENT_VERSION))
        .call()
        .ok()?
        .into_json()
        .ok()
}

pub(super) fn is_newer_version(version: &str) -> Option<bool> {
    let current = semver::Version::parse(CURRENT_VERSION).ok()?;
    let latest = semver::Version::parse(version).ok()?;
    Some(latest > current)
}

// ── Update frequency ──────────────────────────────────────────────────────────

// How often the background update check is allowed to run (once per 24 hours)
pub(super) const CHECK_INTERVAL_SECS: u64 = 60 * 60 * 24;

/// Returns true if enough time has passed since the last check, or if no
/// check has ever been recorded. Defaults to true on any read/parse failure
/// so a broken state file never permanently silences the update notice.
pub(super) fn should_check_for_update() -> bool {
    let Some(path) = last_checked_path() else {
        return true;
    };
    let Ok(contents) = std::fs::read_to_string(&path) else {
        return true;
    };
    let Ok(timestamp) = contents.trim().parse::<u64>() else {
        return true;
    };
    let Ok(now) = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH) else {
        return true;
    };
    now.as_secs().saturating_sub(timestamp) >= CHECK_INTERVAL_SECS
}

/// Writes the current Unix timestamp to the state file so the next run knows
/// when the last check was performed. Failures are silently ignored — a missed
/// write just means the check runs again sooner than expected.
pub(super) fn record_last_checked() {
    let Some(path) = last_checked_path() else {
        return;
    };
    let Ok(now) = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH) else {
        return;
    };
    if let Some(parent) = path.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    let _ = std::fs::write(&path, now.as_secs().to_string());
}

// Returns the OS-appropriate path for the update check state file:
//   Linux   — ~/.cache/hostcraft/last_update_check
//   macOS   — ~/Library/Caches/hostcraft/last_update_check
//   Windows — %LOCALAPPDATA%\hostcraft\last_update_check
fn last_checked_path() -> Option<std::path::PathBuf> {
    directories::ProjectDirs::from("", "", "hostcraft")
        .map(|dirs| dirs.cache_dir().join("last_update_check"))
}
