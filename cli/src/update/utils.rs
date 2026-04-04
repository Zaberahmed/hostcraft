// ── Constants ──────────────────────────────────────────────────────────────────

pub(super) const CURRENT_VERSION: &str = env!("CARGO_PKG_VERSION");
const REPO: &str = "Zaberahmed/hostcraft";
const GITHUB_RELEASES_URL: &str =
    "https://api.github.com/repos/Zaberahmed/hostcraft/releases?per_page=50";

// ── Types ──────────────────────────────────────────────────────────────────────

/// One entry in the GitHub releases API response array.
#[derive(serde::Deserialize)]
pub(super) struct GitHubRelease {
    pub(super) tag_name: String,
    pub(super) draft: bool,
    pub(super) prerelease: bool,
}

// ── GitHub helpers ─────────────────────────────────────────────────────────────

fn user_agent() -> String {
    format!("hostcraft-cli/{}", CURRENT_VERSION)
}

/// Fetches the GitHub releases list and returns the newest stable CLI release.
/// CLI releases are identified by tags that start with "cli-v".
pub(super) fn fetch_latest_cli_release() -> Option<GitHubRelease> {
    let releases: Vec<GitHubRelease> = ureq::get(GITHUB_RELEASES_URL)
        .header("User-Agent", &user_agent())
        .call()
        .ok()?
        .body_mut()
        .read_json()
        .ok()?;

    // Find the first (most recent) non-draft, non-prerelease CLI release
    releases
        .into_iter()
        .find(|r| r.tag_name.starts_with("cli-v") && !r.draft && !r.prerelease)
}

/// Strips the "cli-v" prefix from a tag to get a plain semver string.
/// "cli-v2.0.1" → "2.0.1"
pub(super) fn version_from_tag(tag: &str) -> Option<&str> {
    tag.strip_prefix("cli-v")
}

/// Returns true if `version` is strictly newer than the compiled-in version.
pub(super) fn is_newer_version(version: &str) -> Option<bool> {
    let current = semver::Version::parse(CURRENT_VERSION).ok()?;
    let latest = semver::Version::parse(version).ok()?;
    Some(latest > current)
}

// ── Platform detection ─────────────────────────────────────────────────────────

/// Maps the current OS + architecture to the release asset name suffix we use
/// in the workflow (e.g. "universal-apple-darwin", "x86_64-unknown-linux-gnu").
/// Returns None for platforms we don't ship pre-built binaries for.
pub(super) fn current_target() -> Option<&'static str> {
    match (std::env::consts::OS, std::env::consts::ARCH) {
        ("macos", _) => Some("universal-apple-darwin"),
        ("linux", "x86_64") => Some("x86_64-unknown-linux-gnu"),
        ("linux", "aarch64") => Some("aarch64-unknown-linux-gnu"),
        ("windows", "x86_64") => Some("x86_64-pc-windows-msvc"),
        _ => None,
    }
}

/// Builds the download URL for the raw binary asset.
///
/// The raw binaries are named:
///   hostcraft-universal-apple-darwin          (Unix, no extension)
///   hostcraft-x86_64-pc-windows-msvc.exe      (Windows)
pub(super) fn binary_download_url(version: &str, target: &str) -> String {
    let filename = if cfg!(target_os = "windows") {
        format!("hostcraft-{}.exe", target)
    } else {
        format!("hostcraft-{}", target)
    };
    format!(
        "https://github.com/{}/releases/download/cli-v{}/{}",
        REPO, version, filename
    )
}

// ── Download ───────────────────────────────────────────────────────────────────

/// Downloads a URL into a Vec<u8>.
/// ureq follows GitHub's redirect to the CDN automatically.
pub(super) fn download_bytes(url: &str) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let response = ureq::get(url)
        .header("User-Agent", &user_agent())
        .call()
        .map_err(|e| format!("Download failed: {}", e))?;

    let bytes = response
        .into_body()
        .read_to_vec()
        .map_err(|e| format!("Failed to read response body: {}", e))?;

    Ok(bytes)
}

// ── Self-replacement ───────────────────────────────────────────────────────────

/// Replaces the currently-running binary with `new_bytes`.
///
/// Unix  — writes to a sibling `.new` file, sets +x, then atomically renames.
///         `rename()` on the same filesystem is atomic on POSIX: readers of
///         the old binary (including the current process) are unaffected.
///
/// Windows — renames the running exe to `.bak` first (Windows allows renaming
///           open files), then moves the new binary into place. Cleans up the
///           backup on the next run.
pub(super) fn replace_binary(new_bytes: &[u8]) -> Result<(), Box<dyn std::error::Error>> {
    let current_exe = std::env::current_exe()
        .map_err(|e| format!("Could not locate current executable: {}", e))?;

    let tmp_path = current_exe.with_extension("new");

    std::fs::write(&tmp_path, new_bytes)
        .map_err(|e| format!("Failed to write new binary: {}", e))?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(&tmp_path, std::fs::Permissions::from_mode(0o755))
            .map_err(|e| format!("Failed to set permissions: {}", e))?;

        std::fs::rename(&tmp_path, &current_exe).map_err(|e| {
            let _ = std::fs::remove_file(&tmp_path); // tidy up on failure
            if e.kind() == std::io::ErrorKind::PermissionDenied {
                "Permission denied — try: sudo hostcraft update".into()
            } else {
                format!("Failed to replace binary: {}", e)
            }
        })?;
    }

    #[cfg(windows)]
    {
        let backup = current_exe.with_extension("bak");
        // Remove any leftover backup from a previous update attempt
        let _ = std::fs::remove_file(&backup);

        // Windows lets you rename (but not delete) a running exe
        std::fs::rename(&current_exe, &backup)
            .map_err(|e| format!("Could not move current binary: {}", e))?;

        if let Err(e) = std::fs::rename(&tmp_path, &current_exe) {
            // Rollback so the tool still works
            let _ = std::fs::rename(&backup, &current_exe);
            return Err(format!("Failed to place new binary: {}", e).into());
        }

        // Non-critical — the .bak will be cleaned up on the next update
        let _ = std::fs::remove_file(&backup);
    }

    Ok(())
}

// ── Update frequency ───────────────────────────────────────────────────────────

pub(super) const CHECK_INTERVAL_SECS: u64 = 60 * 60 * 24; // 24 hours

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

fn last_checked_path() -> Option<std::path::PathBuf> {
    directories::ProjectDirs::from("", "", "hostcraft")
        .map(|dirs| dirs.cache_dir().join("last_update_check"))
}
