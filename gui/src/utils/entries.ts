import { ACCENT_COLORS } from "@/constants/entries.constant";
import type { BaseHostEntry, HostEntry } from "@/entities/host.model";

export function activeEntriesCount(entries: HostEntry[]): number {
  return entries.filter((entry) => entry.enabled).length;
}

export function isValidIPv4(value: string): boolean {
  const trimmed = value.trim();
  const parts = trimmed.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (part === "" || !/^\d+$/.test(part)) return false;
    const n = parseInt(part, 10);
    return n >= 0 && n <= 255;
  });
}

export function isValidHostname(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 253) return false;
  return trimmed
    .split(".")
    .every(
      (label) =>
        label.length > 0 &&
        label.length <= 63 &&
        /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(label),
    );
}

export function transformResponse(entries: BaseHostEntry[]): HostEntry[] {
  return entries.map((entry, index) => {
    const randomId = crypto.randomUUID();
    return {
      ...entry,
      id: randomId,
      hostname: entry.name,
      enabled: entry.status === "Active",
      accent: ACCENT_COLORS[index % ACCENT_COLORS.length],
    };
  });
}
