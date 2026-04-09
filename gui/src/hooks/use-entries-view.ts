import { useEffect, useMemo, useState } from "react";
import { FilterKey, Filters } from "@/constants/filters.constant";
import type { HostEntry } from "@/entities/host.model";

export function useEntriesView(entries: HostEntry[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredEntries = useMemo(() => {
    const filter = Filters.find((f) => f.key === activeFilter)!;
    let filtered = entries.filter(filter.predicate);

    if (debouncedQuery.trim() !== "") {
      const query = debouncedQuery.toLowerCase();
      filtered = filtered.filter((entry) =>
        entry.hostname.toLowerCase().includes(query),
      );
    }

    if (sortOrder !== null) {
      filtered = [...filtered].sort((a, b) =>
        sortOrder === "asc"
          ? a.hostname.localeCompare(b.hostname)
          : b.hostname.localeCompare(a.hostname),
      );
    }

    return filtered;
  }, [entries, activeFilter, debouncedQuery, sortOrder]);

  const cycleSortOrder = () => {
    setSortOrder((prev) => {
      if (prev === null) return "asc";
      if (prev === "asc") return "desc";
      return null;
    });
  };

  const isFiltered =
    activeFilter !== "all" ||
    debouncedQuery.trim() !== "" ||
    sortOrder !== null;

  return {
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    sortOrder,
    cycleSortOrder,
    filteredEntries,
    isFiltered,
  };
}
