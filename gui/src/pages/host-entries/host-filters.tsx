import {
  Search01Icon,
  FilterIcon,
  Sorting01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";

export function HostFilters() {
  return (
    <div className="flex items-center justify-between mb-4">
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
          className="
         pl-9 pr-4 py-1.5 w-sm text-sm rounded-lg
         bg-surface-container-low ghost-border text-on-surface
         placeholder:text-on-surface-variant
         focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest
         transition-all font-body
       "
        />
      </div>

      <div className="flex gap-2">
        <button className="p-2 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <Icon icon={FilterIcon} size={18} />
        </button>
        <button className="p-2 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <Icon icon={Sorting01Icon} size={18} />
        </button>
      </div>
    </div>
  );
}
