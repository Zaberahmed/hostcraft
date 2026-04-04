use hostcraft_core::{file, host, platform::get_hosts_path, HostEntry};
use std::path::PathBuf;

pub fn read_file_get_parsed_contents_and_path() -> Result<(Vec<HostEntry>, PathBuf), String> {
    let path = get_hosts_path().map_err(|e| e.to_string())?;
    let file = file::read_file(&path).map_err(|e| e.to_string())?;
    Ok((host::parse_contents(file), path))
}
