import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { type FilterKey, Filters } from "@/constants/filters.constant";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { getFilterIcon, getSortIcon } from "./utils";
import { ResetButton } from "@/components/reset-button";

type HostFiltersProps = {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: FilterKey;
  onFilterChange: (f: FilterKey) => void;
  sortOrder: "asc" | "desc" | null;
  onSortCycle: () => void;
  isResettable: boolean;
  onReset: () => void;
};

export function HostFilters({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  sortOrder,
  onSortCycle,
  isResettable,
  onReset,
}: HostFiltersProps) {
  const [filterToggled, setFilterToggled] = useState(false);

  const onToggleFilter = () => {
    setFilterToggled(!filterToggled);
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <SearchBar searchQuery={searchQuery} onSearchChange={onSearchChange} />

      <div className="flex gap-2">
        {filterToggled && (
          <FilterKeys
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
          />
        )}

        {/* Filter */}
        <Button
          size="icon"
          variant="surface"
          onClick={onToggleFilter}
          isActive={filterToggled}
        >
          <Icon icon={getFilterIcon(filterToggled)} size={18} />
        </Button>
        {/* Sort */}
        <Button
          size="icon"
          variant="surface"
          onClick={onSortCycle}
          isActive={sortOrder !== null}
        >
          <Icon icon={getSortIcon(sortOrder)} size={18} />
        </Button>
        {/* Reset */}
        <ResetButton isResetting={isResettable} onClick={onReset} />
      </div>
    </div>
  );
}
const SearchBar = ({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}) => {
  return (
    <div className="relative block">
      <Icon
        icon={Search01Icon}
        size={15}
        strokeWidth={2}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none"
      />
      <input
        type="text"
        placeholder="Search hosts..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="
         pl-9 pr-4 py-1.5 w-sm text-sm rounded-lg
         bg-surface-container-low ghost-border text-on-surface
         placeholder:text-on-surface-variant
         focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest
         transition-all font-body
       "
      />
    </div>
  );
};

const FilterKeys = ({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: FilterKey;
  onFilterChange: (key: FilterKey) => void;
}) => {
  return (
    <div className="flex items-center gap-1.5 transition-all duration-200 ease-in-out overflow-hidden">
      {Filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          type="button"
          aria-pressed={activeFilter === filter.key}
        >
          <Badge
            variants={{
              color: "ghost",
              size: "sm",
              isActive: activeFilter === filter.key,
            }}
          >
            {filter.label}
          </Badge>
        </button>
      ))}
    </div>
  );
};
