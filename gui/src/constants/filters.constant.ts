import type { HostEntry } from "@/entities/host.model";

export type FilterKey = "all" | "active" | "inactive" | "localhost" | "ipv6";

export const Filters = [
  { key: "all", label: "All", predicate: () => true },
  {
    key: "active",
    label: "Active",
    predicate: (entry: HostEntry) => entry.enabled === true,
  },
  {
    key: "inactive",
    label: "Inactive",
    predicate: (entry: HostEntry) => entry.enabled === false,
  },
  {
    key: "localhost",
    label: "Localhost",
    predicate: (entry: HostEntry) =>
      entry.ip === "127.0.0.1" || entry.ip === "::1",
  },
  {
    key: "ipv6",
    label: "IPv6",
    predicate: (entry: HostEntry) => entry.ip.includes(":"),
  },
] as const satisfies readonly {
  key: FilterKey;
  label: string;
  predicate: (entry: HostEntry) => boolean;
}[];
