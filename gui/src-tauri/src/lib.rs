mod command;
mod elevation;

use std::sync::Mutex;
use tauri::{Emitter, Manager, Theme};

use command::settings::AppSettings;
use tauri_plugin_store::StoreExt;

pub struct AppState {
    pub settings: Mutex<AppSettings>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            // Load persisted settings or fall back to defaults
            let settings = match app.store("settings.json") {
                Ok(store) => store
                    .get("settings")
                    .and_then(|v| serde_json::from_value(v).ok())
                    .unwrap_or_default(),
                Err(_) => AppSettings::default(),
            };
            // If following system theme, resolve it now and save into settings
            let settings = if settings.should_follow_system_theme {
                let window = app.get_webview_window("main").unwrap();
                let system_theme = match window.theme().unwrap_or(tauri::Theme::Light) {
                    tauri::Theme::Dark => Theme::Dark,
                    _ => Theme::Light,
                };
                AppSettings {
                    theme: system_theme,
                    ..settings
                }
            } else {
                settings
            };
            app.manage(AppState {
                settings: Mutex::new(settings),
            });

            // Listen for OS theme changes and sync if should_follow_system_theme
            let app_handle = app.handle().clone();
            app.get_webview_window("main")
                .unwrap()
                .on_window_event(move |event| {
                    if let tauri::WindowEvent::ThemeChanged(tauri_theme) = event {
                        let state = app_handle.state::<AppState>();
                        let should_follow =
                            state.settings.lock().unwrap().should_follow_system_theme;

                        if should_follow {
                            let new_theme = match tauri_theme {
                                tauri::Theme::Dark => Theme::Dark,
                                _ => Theme::Light,
                            };

                            // Update in-memory state
                            state.settings.lock().unwrap().theme = new_theme.clone();

                            // Use app_handle to get the window for emitting
                            if let Some(window) = app_handle.get_webview_window("main") {
                                window.emit("theme-changed", &new_theme).ok();
                            }
                        }
                    }
                });

            #[cfg(debug_assertions)]
            app.get_webview_window("main").unwrap().open_devtools();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            command::get_entries,
            command::add_entry,
            command::edit_entry,
            command::toggle_entry,
            command::remove_entry,
            command::get_settings,
            command::save_settings,
            command::reset_settings,
            command::flush_dns_cache,
            command::open_hosts_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
