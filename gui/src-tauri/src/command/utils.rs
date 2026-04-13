use crate::AppState;
use hostcraft_core::{file, host, platform::get_hosts_path, HostEntry};
use std::path::PathBuf;

pub fn resolve_path(state: &AppState) -> Result<PathBuf, String> {
    let settings = state.settings.lock().unwrap();
    match &settings.hosts_path {
        Some(p) => Ok(PathBuf::from(p)),
        None => get_hosts_path().map_err(|e| e.to_string()),
    }
}

pub fn read_file_get_parsed_contents_and_path(
    state: &AppState,
) -> Result<(Vec<HostEntry>, PathBuf), String> {
    let path = resolve_path(state).map_err(|e| e.to_string())?;
    let file = file::read_file(&path).map_err(|e| e.to_string())?;
    Ok((host::parse_contents(file), path))
}
