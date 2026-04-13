use crate::command::settings::AppSettings;
use crate::AppState;
use tauri::{App, Emitter, Manager, Theme};
use tauri_plugin_store::StoreExt;

pub fn load_persistent_settings_or_fallback_to_default(app: &mut App) -> AppSettings {
    match app.store("settings.json") {
        Ok(store) => store
            .get("settings")
            .and_then(|v| serde_json::from_value(v).ok())
            .unwrap_or_default(),
        Err(_) => AppSettings::default(),
    }
}

pub fn load_theme(app: &mut App, settings: AppSettings) -> AppSettings {
    // If following system theme, resolve it now and save into settings
    if settings.should_follow_system_theme {
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
    }
}

pub fn listen_os_changes_for_theme(app: &mut App) {
    let app_handle = app.handle().clone();
    app.get_webview_window("main")
        .unwrap()
        .on_window_event(move |event| {
            if let tauri::WindowEvent::ThemeChanged(tauri_theme) = event {
                let state = app_handle.state::<AppState>();
                let should_follow = state.settings.lock().unwrap().should_follow_system_theme;

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
}
