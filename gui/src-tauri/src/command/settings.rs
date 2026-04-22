use crate::command::utils;
use crate::setup;
use crate::AppState;

use hostcraft_core::{platform, HostCraftError};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{AppHandle, State, Theme};
use tauri_plugin_opener::OpenerExt;
use tauri_plugin_store::StoreExt;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum HostsPath {
    Default {
        #[serde(default)]
        value: String,
    },
    Custom {
        value: String,
    },
}

impl HostsPath {
    pub fn resolve(&self) -> Result<PathBuf, HostCraftError> {
        match self {
            HostsPath::Default { .. } => platform::get_hosts_path(),
            HostsPath::Custom { value } => Ok(PathBuf::from(value)),
        }
    }

    pub fn normalize_default_value(&mut self) {
        if let HostsPath::Default { value } = self {
            if let Ok(path) = platform::get_hosts_path() {
                *value = path.to_string_lossy().to_string();
            }
        }
    }
}

impl Default for HostsPath {
    fn default() -> Self {
        let value = platform::get_hosts_path()
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_default();
        HostsPath::Default { value }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub hosts_path: HostsPath,
    pub dns_validation: bool,
    pub backup_on_change: bool,
    pub auto_reload: bool,
    pub show_update_notifications: bool,
    pub theme: Theme,
    pub should_follow_system_theme: bool,
}

impl AppSettings {
    pub fn normalize_hosts_path(&mut self) {
        self.hosts_path.normalize_default_value();
    }
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            hosts_path: HostsPath::default(),
            dns_validation: true,
            backup_on_change: false,
            auto_reload: true,
            show_update_notifications: false,
            should_follow_system_theme: true,
            theme: Theme::Dark,
        }
    }
}

#[tauri::command]
pub fn get_settings(state: State<AppState>) -> Result<AppSettings, String> {
    let settings = state.settings.lock().unwrap().clone();
    Ok(settings)
}

// Acquires the Mutex, writes new settings, persists to store via AppHandle.
#[tauri::command]
pub fn save_settings(
    mut settings: AppSettings,
    state: State<'_, AppState>,
    app: AppHandle,
) -> Result<(), String> {
    settings.normalize_hosts_path();
    let old_settings = state.settings.lock().unwrap().clone();
    let old_path = old_settings.hosts_path.resolve().ok();
    let new_path = settings.hosts_path.resolve().ok();
    let should_restart_watcher =
        old_settings.auto_reload != settings.auto_reload || old_path != new_path;

    // Update in-memory state
    {
        let mut current = state.settings.lock().unwrap();
        *current = settings.clone();
    }
    // Persist to store
    let store = StoreExt::store(&app, "settings.json").map_err(|e| e.to_string())?;
    store.set(
        "settings",
        serde_json::to_value(&settings).map_err(|e| e.to_string())?,
    );
    store.save().map_err(|e| e.to_string())?;

    if should_restart_watcher {
        setup::restart_hosts_watcher(&app)?;
    }

    Ok(())
}

#[tauri::command]
pub fn reset_settings(state: State<'_, AppState>, app: AppHandle) -> Result<(), String> {
    let next_settings = AppSettings::default();

    // Reset in-memory state
    {
        let mut current = state.settings.lock().unwrap();
        *current = next_settings.clone();
    }
    // Persist to store
    let store = StoreExt::store(&app, "settings.json").map_err(|e| e.to_string())?;
    store.set(
        "settings",
        serde_json::to_value(&next_settings).map_err(|e| e.to_string())?,
    );
    store.save().map_err(|e| e.to_string())?;

    setup::restart_hosts_watcher(&app)?;

    Ok(())
}

// macOS: dscacheutil -flushcache + killall -HUP mDNSResponder
// Windows: ipconfig /flushdns
// Linux: systemd-resolve --flush-caches (or nscd -i hosts)
#[tauri::command]
pub fn flush_dns_cache() -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("dscacheutil")
            .arg("-flushcache")
            .status()
            .map_err(|e| e.to_string())?;
        std::process::Command::new("killall")
            .args(["-HUP", "mDNSResponder"])
            .status()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("ipconfig")
            .arg("/flushdns")
            .status()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "linux")]
    {
        // Try systemd-resolve first, fall back to nscd
        let result = std::process::Command::new("systemd-resolve")
            .arg("--flush-caches")
            .status();
        if result.is_err() {
            std::process::Command::new("nscd")
                .args(["-i", "hosts"])
                .status()
                .map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

// Resolves path via AppState, calls opener::open(path)
#[tauri::command]
pub fn open_hosts_file(state: State<'_, AppState>, app: AppHandle) -> Result<(), String> {
    let path = utils::resolve_path(&state)?;
    app.opener()
        .open_path(path.to_string_lossy(), None::<&str>)
        .map_err(|e| e.to_string())
}
