import { Link, useLocation } from "react-router-dom";
import { ServerStack01Icon, Settings01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const navItems = [
  {
    path: "/host-entries",
    label: "Hosts",
    icon: ServerStack01Icon,
  },
  {
    path: "/settings",
    label: "Settings",
    icon: Settings01Icon,
  },
];

export function Navigation() {
  const location = useLocation();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-auto px-3">
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "group relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98]",
                isActive
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
              )}
            >
              {/* Active indicator pill */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
              )}

              <Icon
                icon={item.icon}
                size={18}
                strokeWidth={isActive ? 2 : 1.5}
                className={cn(
                  "transition-colors",
                  isActive
                    ? "text-on-primary-container"
                    : "text-on-surface-variant group-hover:text-on-surface",
                )}
              />
              <span className="font-headline tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
