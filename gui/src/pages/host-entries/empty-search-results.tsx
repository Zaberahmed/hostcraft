import { Icon } from "@/components/ui/icon";
import type { FilterKey } from "@/constants/filters.constant";
import { TaskRemove02Icon } from "@hugeicons/core-free-icons";

function getEmptyMessage(activeFilter: FilterKey, searchQuery: string): string {
  const hasFilter = activeFilter !== "all";
  const hasQuery = searchQuery.trim() !== "";

  if (hasFilter && hasQuery) {
    return `No ${activeFilter} entries matching "${searchQuery}"`;
  }
  if (hasFilter) {
    return `No ${activeFilter} entries`;
  }
  if (hasQuery) {
    return `No entries match "${searchQuery}"`;
  }
  return "No entries found";
}

type EmptySearchResultsProps = {
  searchQuery: string;
  activeFilter: FilterKey;
  onClear: () => void;
};

export function EmptySearchResults({
  searchQuery,
  activeFilter,
  onClear,
}: EmptySearchResultsProps) {
  const message = getEmptyMessage(activeFilter, searchQuery);
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center mb-4">
        <Icon
          icon={TaskRemove02Icon}
          size={24}
          className="text-outline-variant"
        />
      </div>
      <p className="text-sm font-semibold text-on-surface-variant">{message}</p>
      <p
        className="text-xs text-on-primary-fixed mt-1.5 cursor-pointer"
        onClick={onClear}
      >
        Clear filters
      </p>
    </div>
  );
}
