import { Link, useLocation } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ServerStack01Icon,
  Settings01Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

const navItems = [
  {
    path: "/host-entries",
    label: "Host Entries",
    icon: ServerStack01Icon,
  },
  {
    path: "/settings",
    label: "Settings",
    icon: Settings01Icon,
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-surface-container-low overflow-y-auto">
      {/* ── Logo ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 px-6 pt-6 pb-8">
        <div className="flex items-center gap-3">
          {/* Gradient icon badge */}
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-primary-dim flex items-center justify-center shadow-sm shrink-0">
            <HugeiconsIcon
              icon={ServerStack01Icon}
              size={20}
              strokeWidth={1.5}
              className="text-on-primary"
            />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tighter text-on-surface font-headline leading-none">
              HostCraft
            </h1>
            <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant font-label mt-0.5">
              Precision Curator
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────────── */}
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

                <HugeiconsIcon
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
                <span className="font-headline tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 px-4 pb-6 mt-auto">
        {/* Add New Entry — gradient CTA */}
        <button className="w-full flex items-center justify-center gap-2 py-3 bg-linear-to-r from-primary to-primary-dim text-on-primary rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-105 transition-all duration-300 font-semibold text-sm">
          <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2.5} />
          Add New Entry
        </button>

        {/* Divider — whisper-level */}
        <div className="mt-3 pt-5 border-t border-outline-variant/10">
          {/* User profile */}
          <div className="flex items-center gap-3 px-1">
            {/* Avatar initials */}
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-xs font-bold font-label shrink-0">
              AC
            </div>

            <div className="overflow-hidden">
              <p className="text-xs font-bold text-on-surface truncate">
                Alex Chen
              </p>
              <p className="text-[10px] text-on-surface-variant truncate">
                System Admin
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
