export type AccentColor =
  | "primary"
  | "tertiary"
  | "secondary"
  | "outline-variant";

export interface HostEntry {
  id: string;
  ip: string;
  hostname: string;
  enabled: boolean;
  accent: AccentColor;
}
