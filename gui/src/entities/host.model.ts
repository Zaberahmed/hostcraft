export type AccentColor =
  | "primary"
  | "tertiary"
  | "secondary"
  | "outline-variant";

export interface BaseHostEntry {
  ip: string;
  name: string;
  status: "Active" | "Inactive";
}

export interface HostEntry extends Pick<BaseHostEntry, "ip"> {
  id: string;
  hostname: string;
  enabled: boolean;
  accent: AccentColor;
}
