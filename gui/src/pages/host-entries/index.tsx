import { useEntries } from "@/providers/entries.provider";
import { badge } from "@/components/ui/badge";
import { activeEntriesCount } from "@/utils/entries";
import { EmptyEntries } from "./empty-entries";
import { Header } from "./header";
import { HostFilters } from "./host-filters";
import { HostRow } from "./host-row";

export default function HostEntries() {
  const { entries, toggleEntry, deleteEntry, openEditModal, duplicateEntry } =
    useEntries();

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
              onToggle={toggleEntry}
              onDelete={deleteEntry}
              onEdit={openEditModal}
              onDuplicate={duplicateEntry}
            />
          ))
        )}
      </div>
    </div>
  );
}
