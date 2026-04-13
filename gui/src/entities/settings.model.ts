export type Theme = "light" | "dark";

export interface AppSettings {
  hosts_path: string | null; // None = platform default
  dns_validation: boolean;
  backup_on_change: boolean;
  auto_reload: boolean;
  show_update_notifications: boolean;
  should_follow_system_theme: boolean;
  theme: Theme;
}
