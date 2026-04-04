import {
  FilterIcon,
  FilterResetIcon,
  HugeiconsIcon,
  SortByDown02Icon,
  SortByUp02Icon,
  Sorting05FreeIcons,
} from "@hugeicons/core-free-icons";

export function getSortIcon(
  sortOrder: "asc" | "desc" | null,
): typeof HugeiconsIcon {
  return sortOrder === "asc"
    ? SortByUp02Icon
    : sortOrder === "desc"
      ? SortByDown02Icon
      : Sorting05FreeIcons;
}

export function getFilterIcon(filterToggled: boolean): typeof HugeiconsIcon {
  return filterToggled ? FilterResetIcon : FilterIcon;
}
