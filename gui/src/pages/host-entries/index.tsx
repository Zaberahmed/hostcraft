import { badge } from "@/components/ui/badge";
import type { HostEntry } from "@/pages/host-entries/host.model";
import { activeEntriesCount } from "@/utils/entries";
import { useState } from "react";
import { EmptyEntries } from "./empty-entries";
import { Header } from "./header";
import { HostFilters } from "./host-filters";
import { HostRow } from "./host-row";

const INITIAL_ENTRIES: HostEntry[] = [
  {
    id: "1",
    ip: "192.168.1.104",
    hostname: "dev-server-alpha.local",
    enabled: true,
    accent: "primary",
  },
  {
    id: "2",
    ip: "10.0.0.45",
    hostname: "staging-db.internal",
    enabled: true,
    accent: "tertiary",
  },
  {
    id: "3",
    ip: "172.16.254.1",
    hostname: "legacy-gateway-node",
    enabled: false,
    accent: "outline-variant",
  },
  {
    id: "4",
    ip: "127.0.0.1",
    hostname: "localhost.dev.env",
    enabled: true,
    accent: "secondary",
  },

  {
    id: "5",
    ip: "127.0.0.1",
    hostname: "localhost.dev.env",
    enabled: true,
    accent: "secondary",
  },
  {
    id: "6",
    ip: "127.0.0.1",
    hostname: "localhost.dev.env",
    enabled: true,
    accent: "secondary",
  },
  {
    id: "7",
    ip: "127.0.0.1",
    hostname: "localhost.dev.env",
    enabled: true,
    accent: "secondary",
  },
];

export default function HostEntries() {
  const [entries, setEntries] = useState<HostEntry[]>(INITIAL_ENTRIES);

  function handleToggle(id: string, value: boolean) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, enabled: value } : e)),
    );
  }

  function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="px-8 py-6 max-w-6xl mx-auto">
      <Header />

      <div className="flex mb-4 items-center gap-2 font-headline text-lg font-bold text-on-surface">
        <span className={badge({ color: "tertiary" })}>
          {entries.length} entries
        </span>
        <span className={badge({ color: "secondary" })}>
          {activeEntriesCount(entries)} active
        </span>
      </div>

      <HostFilters />

      <div className="space-y-2">
        {entries.length === 0 ? (
          <EmptyEntries />
        ) : (
          entries.map((entry) => (
            <HostRow
              key={entry.id}
              entry={entry}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
