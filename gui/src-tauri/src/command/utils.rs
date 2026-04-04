use crate::AppState;
use hostcraft_core::{file, host, HostEntry};
use std::path::PathBuf;
use std::time::{Duration, Instant};

pub fn resolve_path(state: &AppState) -> Result<PathBuf, String> {
    let settings = state.settings.lock().unwrap();
    settings.hosts_path.resolve().map_err(|e| e.to_string())
}

pub fn read_file_get_parsed_contents_and_path(
    state: &AppState,
) -> Result<(Vec<HostEntry>, PathBuf), String> {
    let path = resolve_path(state).map_err(|e| e.to_string())?;
    let file = file::read_file(&path).map_err(|e| e.to_string())?;
    Ok((host::parse_contents(file), path))
}

pub fn mark_internal_write(state: &AppState) {
    let mut until = state.suppress_reload_until.lock().unwrap();
    *until = Some(Instant::now() + Duration::from_millis(800));
}
