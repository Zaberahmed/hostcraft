mod utils;

use hostcraft_core::{file, host, HostEntry, HostError};
use std::net::IpAddr;
use utils::write_hosts;

#[tauri::command]
pub fn get_entries() -> Result<Vec<HostEntry>, String> {
    let file = file::read_file("/etc/hosts").map_err(|e| e.to_string())?;
    let entries = host::parse_contents(file);
    Ok(entries)
}

#[tauri::command]
pub fn add_entry(ip: IpAddr, name: String) -> Result<(), String> {
    let file = file::read_file("/etc/hosts").map_err(|e| e.to_string())?;
    let mut entries = host::parse_contents(file);

    host::add_entry(&mut entries, ip, name.as_str()).map_err(|e| match e {
        HostError::DuplicateEntry => format!("Entry already exists. {}", e),
        _ => format!("Failed to add entry: {}", e),
    })?;

    write_hosts("/etc/hosts", &entries).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn remove_entry(name: String) -> Result<(), String> {
    let file = file::read_file("/etc/hosts").map_err(|e| e.to_string())?;
    let mut entries = host::parse_contents(file);

    host::remove_entry(&mut entries, &name).map_err(|e| match e {
        HostError::EntryNotFound => format!("No entry found matching '{}'. {}", name, e),
        _ => format!("Failed to remove entry: {}", e),
    })?;

    write_hosts("/etc/hosts", &entries).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn toggle_entry(name: String) -> Result<(), String> {
    let file = file::read_file("/etc/hosts").map_err(|e| e.to_string())?;
    let mut entries = host::parse_contents(file);

    host::toggle_entry(&mut entries, &name).map_err(|e| match e {
        HostError::EntryNotFound => format!("No entry found matching '{}'. {}", name, e),
        _ => format!("Failed to toggle entry: {}", e),
    })?;

    write_hosts("/etc/hosts", &entries).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn edit_entry(old_name: String, new_ip: IpAddr, new_name: String) -> Result<(), String> {
    let file = file::read_file("/etc/hosts").map_err(|e| e.to_string())?;
    let mut entries = host::parse_contents(file);

    host::remove_entry(&mut entries, &old_name).map_err(|e| match e {
        HostError::EntryNotFound => format!("No entry found matching '{}'. {}", old_name, e),
        _ => format!("Failed to remove entry: {}", e),
    })?;

    host::add_entry(&mut entries, new_ip, new_name.as_str()).map_err(|e| match e {
        HostError::DuplicateEntry => format!("Entry already exists. {}", e),
        _ => format!("Failed to add entry: {}", e),
    })?;

    write_hosts("/etc/hosts", &entries).map_err(|e| e.to_string())?;
    Ok(())
}
