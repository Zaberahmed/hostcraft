import type { BaseHostEntry } from "@/entities/host.model";
import type { AppSettings } from "@/entities/settings.model";
import { invoke } from "@tauri-apps/api/core";

export function useTauriCommands() {
  const get_entries = async () => {
    return await invoke<BaseHostEntry[]>("get_entries");
  };
  const add_entry = async (ip: string, name: string) => {
    return await invoke("add_entry", { ip, name });
  };
  const edit_entry = async (id: string, ip: string, name: string) => {
    return await invoke("edit_entry", { id, ip, name });
  };
  const toggle_entry = async (name: string) => {
    return await invoke("toggle_entry", { name });
  };
  const delete_entry = async (name: string) => {
    return await invoke("delete_entry", { name });
  };
  const get_settings = async () => {
    return await invoke<AppSettings>("get_settings");
  };
  const save_settings = async (settings: Partial<AppSettings>) => {
    return await invoke("save_settings", { settings });
  };
  const reset_settings = async () => {
    return await invoke("reset_settings");
  };

  return {
    get_entries,
    add_entry,
    edit_entry,
    toggle_entry,
    delete_entry,
    get_settings,
    save_settings,
    reset_settings,
  };
}
