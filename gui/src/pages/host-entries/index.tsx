import { useEntries } from "@/providers/entries.provider";
import { Badge } from "@/components/ui/badge";
import { activeEntriesCount } from "@/utils/entries";
import { EmptyEntries } from "./empty-entries";
import { Header } from "./header";
import { HostFilters } from "./host-filters";
import { HostRow } from "./host-row";

export default function HostEntries() {
  const { entries, toggleEntry, deleteEntry, openEditModal } = useEntries();

  return (
    <div className="px-8 py-6 max-w-6xl mx-auto">
      <Header />

      <div className="flex mb-4 items-center gap-2 font-headline text-lg font-bold text-on-surface">
        <Badge variants={{ color: "tertiary" }}>{entries.length} entries</Badge>
        <Badge variants={{ color: "secondary" }}>
          {activeEntriesCount(entries)} active
        </Badge>
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
              onToggle={toggleEntry}
              onDelete={deleteEntry}
              onEdit={openEditModal}
            />
          ))
        )}
      </div>
    </div>
  );
}
