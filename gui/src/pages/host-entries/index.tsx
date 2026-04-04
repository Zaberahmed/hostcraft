import { useEntries } from "@/providers/entries.provider";
import { Badge } from "@/components/ui/badge";
import { activeEntriesCount } from "@/utils/entries";
import { EmptyEntries } from "./empty-entries";
import { Header } from "./header";
import { HostFilters } from "./host-filters";
import { HostRow } from "./host-row";
import { useEntriesView } from "@/hooks/use-entries-view";
import { EmptySearchResults } from "./empty-search-results";

export default function HostEntries() {
  const { entries, toggleEntry, deleteEntry, openEditModal } = useEntries();
  const {
    searchQuery,
    setSearchQuery,
    filteredEntries,
    sortOrder,
    cycleSortOrder,
    activeFilter,
    setActiveFilter,
    isFiltered,
  } = useEntriesView(entries);

  const handleQueryClear = () => {
    setActiveFilter("all");
    setSearchQuery("");
  };
  return (
    <div className="px-8 py-6 max-w-6xl mx-auto">
      <Header />

      <div className="flex mb-4 items-center gap-2 font-headline text-lg font-bold text-on-surface">
        <Badge variants={{ color: "tertiary" }}>
          {filteredEntries.length} entries
        </Badge>
        <Badge variants={{ color: "secondary" }}>
          {activeEntriesCount(filteredEntries)} active
        </Badge>
      </div>

      <HostFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortOrder={sortOrder}
        onSortCycle={cycleSortOrder}
        isResettable={isFiltered}
        onReset={handleQueryClear}
      />

      <div className="space-y-2">
        {entries.length === 0 ? (
          <EmptyEntries />
        ) : filteredEntries.length === 0 ? (
          <EmptySearchResults
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            onClear={handleQueryClear}
          />
        ) : (
          filteredEntries.map((entry) => (
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
