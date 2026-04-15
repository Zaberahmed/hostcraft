use hostcraft_core::{platform, HostCraftError};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::Theme;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind", content = "value", rename_all = "snake_case")]
pub enum HostsPath {
    Default,
    Custom(String),
}

impl HostsPath {
    pub fn resolve(&self) -> Result<PathBuf, HostCraftError> {
        match self {
            HostsPath::Default => platform::get_hosts_path(),
            HostsPath::Custom(p) => Ok(PathBuf::from(p)),
        }
    }

    pub fn is_default(&self) -> bool {
        matches!(self, HostsPath::Default)
    }
}

impl Default for HostsPath {
    fn default() -> Self {
        HostsPath::Default
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

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            hosts_path: HostsPath::default(),
            dns_validation: false,
            backup_on_change: false,
            auto_reload: false,
            show_update_notifications: false,
            should_follow_system_theme: true,
            theme: Theme::Dark,
        }
    }
}
