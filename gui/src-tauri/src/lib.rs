pub mod command;
mod elevation;
mod setup;

use command::settings::AppSettings;
use notify::RecommendedWatcher;
use std::sync::Mutex;
use std::time::Instant;
use tauri::Manager;

pub struct AppState {
    pub settings: Mutex<AppSettings>,
    pub hosts_watcher: Mutex<Option<RecommendedWatcher>>,
    pub suppress_reload_until: Mutex<Option<Instant>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            let settings = setup::load_persistent_settings_or_fallback_to_default(app);
            let settings = setup::load_theme(app, settings);

            app.manage(AppState {
                settings: Mutex::new(settings),
                hosts_watcher: Mutex::new(None),
                suppress_reload_until: Mutex::new(None),
            });

            setup::listen_os_changes_for_theme(app);
            setup::start_hosts_watcher(app.handle()).ok();

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
            command::settings::get_settings,
            command::settings::save_settings,
            command::settings::reset_settings,
            command::settings::flush_dns_cache,
            command::settings::open_hosts_file,
            command::dns::validate_dns,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
