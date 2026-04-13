use serde::{Deserialize, Serialize};
use tauri::Theme;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub hosts_path: Option<String>, // None = platform default
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
            hosts_path: None,
            dns_validation: false,
            backup_on_change: false,
            auto_reload: false,
            show_update_notifications: false,
            should_follow_system_theme: true,
            theme: Theme::Dark,
        }
    }
}
