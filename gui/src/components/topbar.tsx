import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification01Icon,
  UserCircle02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

export function TopBar() {
  return (
    <header className="glass-panel sticky top-0 z-10 flex h-16 items-center justify-between border-b border-outline-variant/10 px-8 w-full">
      <div className="flex items-center gap-8">
        {/* Search */}
        <div className="relative hidden lg:block">
          <HugeiconsIcon
            icon={Search01Icon}
            size={15}
            strokeWidth={2}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search hosts..."
            className="
              pl-9 pr-4 py-1.5 w-64 text-sm rounded-lg
              bg-surface-container-low ghost-border text-on-surface
              placeholder:text-on-surface-variant
              focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest
              transition-all font-body
            "
          />
        </div>

        {/* Nav links */}
        <nav className="flex gap-6">
          <a
            href="#"
            className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors font-headline"
          >
            Docs
          </a>
          <a
            href="#"
            className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors font-headline"
          >
            Support
          </a>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors">
          <HugeiconsIcon
            icon={Notification01Icon}
            size={20}
            strokeWidth={1.5}
          />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
        </button>

        {/* Profile */}
        <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors">
          <HugeiconsIcon icon={UserCircle02Icon} size={20} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
