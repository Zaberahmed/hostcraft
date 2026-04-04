import type { HostEntry } from "@/pages/host-entries/host.model";

export const activeEntriesCount = (entries: HostEntry[]): number => {
  return entries.filter((entry) => entry.enabled).length;
};
