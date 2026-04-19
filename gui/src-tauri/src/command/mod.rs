pub mod dns;
pub mod settings;
pub mod utils;

use crate::elevation::try_write_or_elevate;
use crate::AppState;
use hostcraft_core::{host, HostCraftError, HostEntry};
use std::net::IpAddr;
use tauri::State;
use utils::{mark_internal_write, read_file_get_parsed_contents_and_path};

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
    mark_internal_write(&state);
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
    mark_internal_write(&state);
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
    mark_internal_write(&state);
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

    mark_internal_write(&state);
    try_write_or_elevate(&path, &entries)?;
    Ok(())
}
