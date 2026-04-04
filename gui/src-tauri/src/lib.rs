pub mod command;
mod elevation;
mod setup;

use std::sync::Mutex;
use tauri::Manager;

use command::settings::AppSettings;

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
            let settings = setup::load_persistent_settings_or_fallback_to_default(app);
            let settings = setup::load_theme(app, settings);

            app.manage(AppState {
                settings: Mutex::new(settings),
            });

            setup::listen_os_changes_for_theme(app);

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
