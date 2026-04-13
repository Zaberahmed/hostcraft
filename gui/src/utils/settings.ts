import type { AppSettings } from "@/entities/settings.model";

export function isSectionChanged(
  saved: AppSettings | null,
  local: AppSettings | null,
  keys: (keyof AppSettings)[],
): boolean {
  return keys.some((key) => saved?.[key] !== local?.[key]);
}
