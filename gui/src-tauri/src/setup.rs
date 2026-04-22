use crate::command::settings::AppSettings;
use crate::AppState;
use notify::{Config, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use tauri::{App, AppHandle, Emitter, Manager, Theme};
use tauri_plugin_store::StoreExt;

pub const HOSTS_FILE_CHANGED_EVENT: &str = "hosts-file-changed";

pub fn load_persistent_settings_or_fallback_to_default(app: &mut App) -> AppSettings {
    let mut settings = match app.store("settings.json") {
        Ok(store) => store
            .get("settings")
            .and_then(|v| serde_json::from_value(v).ok())
            .unwrap_or_default(),
        Err(_) => AppSettings::default(),
    };
    settings.normalize_hosts_path();
    settings
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

pub fn start_hosts_watcher(app: &AppHandle) -> Result<(), String> {
    let state = app.state::<AppState>();
    if !state.settings.lock().unwrap().auto_reload {
        return Ok(());
    }

    let path = state
        .settings
        .lock()
        .unwrap()
        .hosts_path
        .resolve()
        .map_err(|e| e.to_string())?;

    let app_handle = app.clone();

    let mut watcher = RecommendedWatcher::new(
        move |res: notify::Result<notify::Event>| {
            let Ok(event) = res else { return };

            let relevant = matches!(
                event.kind,
                EventKind::Modify(_) | EventKind::Create(_) | EventKind::Remove(_)
            );
            if !relevant {
                return;
            }

            let state = app_handle.state::<AppState>();

            let suppressed = state
                .suppress_reload_until
                .lock()
                .unwrap()
                .map(|until| std::time::Instant::now() < until)
                .unwrap_or(false);
            if suppressed {
                return;
            }

            if let Some(window) = app_handle.get_webview_window("main") {
                window.emit(HOSTS_FILE_CHANGED_EVENT, ()).ok();
            }
        },
        Config::default(),
    )
    .map_err(|e| e.to_string())?;

    watcher
        .watch(&path, RecursiveMode::NonRecursive)
        .map_err(|e| e.to_string())?;

    *state.hosts_watcher.lock().unwrap() = Some(watcher);
    Ok(())
}

pub fn restart_hosts_watcher(app: &AppHandle) -> Result<(), String> {
    let state = app.state::<AppState>();
    drop(state.hosts_watcher.lock().unwrap().take());
    start_hosts_watcher(app)
}
