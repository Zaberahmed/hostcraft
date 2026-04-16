import type { AppSettings, HostsPath } from "@/entities/settings.model";

export function isSectionChanged(
  saved: AppSettings | null,
  local: AppSettings | null,
  keys: (keyof AppSettings)[],
): boolean {
  return keys.some((key) => {
    const savedValue = saved?.[key];
    const localValue = local?.[key];
    if (
      typeof savedValue === "object" &&
      savedValue !== null &&
      typeof localValue === "object" &&
      localValue !== null
    ) {
      return JSON.stringify(savedValue) !== JSON.stringify(localValue);
    }
    return savedValue !== localValue;
  });
}

export function areHostsPathEqual(
  a: HostsPath | undefined,
  b: HostsPath | undefined,
): boolean {
  if (!a || !b) return a === b;
  if (a.kind === "default" && b.kind === "default") {
    return true;
  }
  return a.kind === b.kind && a.value === b.value;
}
