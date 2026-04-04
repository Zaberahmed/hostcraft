pub mod settings;
mod utils;

use crate::elevation::try_write_or_elevate;
use crate::{AppSettings, AppState};
use hostcraft_core::{host, HostCraftError, HostEntry};
use std::net::IpAddr;
use tauri::{AppHandle, State};
use tauri_plugin_opener::OpenerExt;
use tauri_plugin_store::StoreExt;
use utils::read_file_get_parsed_contents_and_path;

// Host entry management commands

#[tauri::command]
pub fn get_entries(state: State<'_, AppState>) -> Result<Vec<HostEntry>, String> {
    let (entries, _) = read_file_get_parsed_contents_and_path(&state)?;
    Ok(entries)
}

#[tauri::command]
pub fn add_entry(ip: IpAddr, name: String, state: State<'_, AppState>) -> Result<(), String> {
    let (mut entries, path) = read_file_get_parsed_contents_and_path(&state)?;

    host::add_entry(&mut entries, ip, name.as_str()).map_err(|e| match e {
        HostCraftError::DuplicateEntry => format!("Entry already exists. {}", e),
        _ => format!("Failed to add entry: {}", e),
    })?;

    try_write_or_elevate(&path, &entries)?;
    Ok(())
}

#[tauri::command]
pub fn remove_entry(name: String, state: State<'_, AppState>) -> Result<(), String> {
    let (mut entries, path) = read_file_get_parsed_contents_and_path(&state)?;

    host::remove_entry(&mut entries, &name).map_err(|e| match e {
        HostCraftError::EntryNotFound => format!("No entry found matching '{}'. {}", name, e),
        _ => format!("Failed to remove entry: {}", e),
    })?;

    try_write_or_elevate(&path, &entries)?;
    Ok(())
}

#[tauri::command]
pub fn toggle_entry(name: String, state: State<'_, AppState>) -> Result<(), String> {
    let (mut entries, path) = read_file_get_parsed_contents_and_path(&state)?;

    host::toggle_entry(&mut entries, &name).map_err(|e| match e {
        HostCraftError::EntryNotFound => format!("No entry found matching '{}'. {}", name, e),
        _ => format!("Failed to toggle entry: {}", e),
    })?;

    try_write_or_elevate(&path, &entries)?;
    Ok(())
}

#[tauri::command]
pub fn edit_entry(
    old_name: String,
    new_ip: IpAddr,
    new_name: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let (mut entries, path) = read_file_get_parsed_contents_and_path(&state)?;

    host::edit_entry(&mut entries, &old_name, new_ip, &new_name).map_err(|e| match e {
        HostCraftError::EntryNotFound => format!("No entry found matching '{}'. {}", old_name, e),
        HostCraftError::DuplicateEntry => format!("Entry already exists. {}", e),
        HostCraftError::NoChange => format!("No change needed for '{}'. {}", old_name, e),
        _ => format!("Failed to edit entry: {}", e),
    })?;

    try_write_or_elevate(&path, &entries)?;
    Ok(())
}

// Settings commands

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
    Ok(())
}

#[tauri::command]
pub fn reset_settings(state: State<'_, AppState>, app: AppHandle) -> Result<(), String> {
    // Reset in-memory state
    {
        let mut current = state.settings.lock().unwrap();
        *current = AppSettings::default();
    }
    // Persist to store
    let store = StoreExt::store(&app, "settings.json").map_err(|e| e.to_string())?;
    store.set(
        "settings",
        serde_json::to_value(&AppSettings::default()).map_err(|e| e.to_string())?,
    );
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

// Action commands

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
