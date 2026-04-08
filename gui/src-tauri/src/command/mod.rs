mod utils;

use crate::elevation::try_write_or_elevate;
use hostcraft_core::{host, HostCraftError, HostEntry};
use std::net::IpAddr;
use utils::read_file_get_parsed_contents_and_path;

#[tauri::command]
pub fn get_entries() -> Result<Vec<HostEntry>, String> {
    let (entries, _) = read_file_get_parsed_contents_and_path()?;
    Ok(entries)
}

#[tauri::command]
pub fn add_entry(ip: IpAddr, name: String) -> Result<(), String> {
    let (mut entries, path) = read_file_get_parsed_contents_and_path()?;

    host::add_entry(&mut entries, ip, name.as_str()).map_err(|e| match e {
        HostCraftError::DuplicateEntry => format!("Entry already exists. {}", e),
        _ => format!("Failed to add entry: {}", e),
    })?;

    try_write_or_elevate(&path, &entries)?;
    Ok(())
}

#[tauri::command]
pub fn remove_entry(name: String) -> Result<(), String> {
    let (mut entries, path) = read_file_get_parsed_contents_and_path()?;

    host::remove_entry(&mut entries, &name).map_err(|e| match e {
        HostCraftError::EntryNotFound => format!("No entry found matching '{}'. {}", name, e),
        _ => format!("Failed to remove entry: {}", e),
    })?;

    try_write_or_elevate(&path, &entries)?;
    Ok(())
}

#[tauri::command]
pub fn toggle_entry(name: String) -> Result<(), String> {
    let (mut entries, path) = read_file_get_parsed_contents_and_path()?;

    host::toggle_entry(&mut entries, &name).map_err(|e| match e {
        HostCraftError::EntryNotFound => format!("No entry found matching '{}'. {}", name, e),
        _ => format!("Failed to toggle entry: {}", e),
    })?;

    try_write_or_elevate(&path, &entries)?;
    Ok(())
}

#[tauri::command]
pub fn edit_entry(old_name: String, new_ip: IpAddr, new_name: String) -> Result<(), String> {
    let (mut entries, path) = read_file_get_parsed_contents_and_path()?;

    host::edit_entry(&mut entries, &old_name, new_ip, &new_name).map_err(|e| match e {
        HostCraftError::EntryNotFound => format!("No entry found matching '{}'. {}", old_name, e),
        HostCraftError::DuplicateEntry => format!("Entry already exists. {}", e),
        HostCraftError::NoChange => format!("No change needed for '{}'. {}", old_name, e),
        _ => format!("Failed to edit entry: {}", e),
    })?;

    try_write_or_elevate(&path, &entries)?;
    Ok(())
}
