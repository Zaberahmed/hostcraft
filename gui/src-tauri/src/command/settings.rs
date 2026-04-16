use hostcraft_core::{platform, HostCraftError};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::Theme;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum HostsPath {
    Default {
        #[serde(default)]
        value: String,
    },
    Custom { value: String },
}

impl HostsPath {
    pub fn resolve(&self) -> Result<PathBuf, HostCraftError> {
        match self {
            HostsPath::Default { .. } => platform::get_hosts_path(),
            HostsPath::Custom { value } => Ok(PathBuf::from(value)),
        }
    }

    pub fn is_default(&self) -> bool {
        matches!(self, HostsPath::Default { .. })
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
            dns_validation: false,
            backup_on_change: false,
            auto_reload: false,
            show_update_notifications: false,
            should_follow_system_theme: true,
            theme: Theme::Dark,
        }
    }
}
