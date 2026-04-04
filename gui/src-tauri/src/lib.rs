mod command;

use command::{add_entry, edit_entry, get_entries, remove_entry, toggle_entry};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_entries,
            add_entry,
            edit_entry,
            toggle_entry,
            remove_entry
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
