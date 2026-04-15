export type Theme = "light" | "dark";

export type HostsPath = { kind: "default" } | { kind: "custom"; value: string };

export interface AppSettings {
  hosts_path: HostsPath;
  dns_validation: boolean;
  backup_on_change: boolean;
  auto_reload: boolean;
  show_update_notifications: boolean;
  should_follow_system_theme: boolean;
  theme: Theme;
}
