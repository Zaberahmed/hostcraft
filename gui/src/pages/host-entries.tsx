import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  NeuralNetworkIcon,
  DashboardSpeed01Icon,
  SecuredNetworkIcon,
  FilterIcon,
  Sorting01Icon,
  Delete01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

type AccentColor = "primary" | "tertiary" | "secondary" | "outline-variant";

interface HostEntry {
  id: string;
  ip: string;
  hostname: string;
  enabled: boolean;
  accent: AccentColor;
}

// ── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_ENTRIES: HostEntry[] = [
  {
    id: "1",
    ip: "192.168.1.104",
    hostname: "dev-server-alpha.local",
    enabled: true,
    accent: "primary",
  },
  {
    id: "2",
    ip: "10.0.0.45",
    hostname: "staging-db.internal",
    enabled: true,
    accent: "tertiary",
  },
  {
    id: "3",
    ip: "172.16.254.1",
    hostname: "legacy-gateway-node",
    enabled: false,
    accent: "outline-variant",
  },
  {
    id: "4",
    ip: "127.0.0.1",
    hostname: "localhost.dev.env",
    enabled: true,
    accent: "secondary",
  },
];

const accentClasses: Record<AccentColor, string> = {
  primary: "bg-primary",
  tertiary: "bg-tertiary",
  secondary: "bg-secondary",
  "outline-variant": "bg-outline-variant",
};

// ── Sub-components ────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
  iconClass: string;
  value: string;
  label: string;
  hoverClass: string;
}

function StatCard({
  icon,
  iconClass,
  value,
  label,
  hoverClass,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group bg-surface-container-low p-6 rounded-2xl flex flex-col justify-between h-40 transition-colors duration-500",
        hoverClass,
      )}
    >
      <HugeiconsIcon
        icon={icon}
        size={24}
        strokeWidth={1.5}
        className={cn("transition-colors", iconClass)}
      />
      <div>
        <p className="text-3xl font-extrabold font-headline text-on-surface transition-colors">
          {value}
        </p>
        <p className="text-sm text-on-surface-variant transition-colors">
          {label}
        </p>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
    </label>
  );
}

interface HostRowProps {
  entry: HostEntry;
  onToggle: (id: string, value: boolean) => void;
  onDelete: (id: string) => void;
}

function HostRow({ entry, onToggle, onDelete }: HostRowProps) {
  const isDisabled = !entry.enabled;

  return (
    <div
      className={cn(
        "group flex items-center justify-between p-4 bg-surface-container-low rounded-xl transition-all duration-300 hover:bg-surface-container-highest hover:translate-x-1",
        isDisabled && "opacity-60 grayscale",
      )}
    >
      {/* Left section */}
      <div className="flex items-center gap-8 flex-1 min-w-0">
        {/* Accent pill */}
        <div
          className={cn(
            "w-2.5 h-10 rounded-full shrink-0",
            accentClasses[entry.accent],
          )}
        />

        {/* IP Address */}
        <div className="w-40 shrink-0">
          <p className="text-[10px] uppercase font-bold text-outline-variant tracking-wider mb-0.5">
            IP Address
          </p>
          <p className="font-label text-sm text-primary font-bold">
            {entry.ip}
          </p>
        </div>

        {/* Hostname */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase font-bold text-outline-variant tracking-wider mb-0.5">
            Hostname
          </p>
          <p className="font-label text-base text-on-surface font-medium truncate">
            {entry.hostname}
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-6 shrink-0">
        {/* Toggle */}
        <div className="flex items-center gap-3 pr-6 border-r border-outline-variant/20">
          <span className="text-xs font-bold text-on-surface-variant">
            Status
          </span>
          <Toggle
            checked={entry.enabled}
            onChange={(v) => onToggle(entry.id, v)}
          />
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(entry.id)}
          className="p-2 rounded-lg text-outline-variant hover:text-error hover:bg-error-container/20 transition-all active:scale-90"
          aria-label={`Delete ${entry.hostname}`}
        >
          <HugeiconsIcon icon={Delete01Icon} size={20} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HostEntries() {
  const [entries, setEntries] = useState<HostEntry[]>(INITIAL_ENTRIES);

  const activeCount = entries.filter((e) => e.enabled).length;

  function handleToggle(id: string, value: boolean) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, enabled: value } : e)),
    );
  }

  function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <span className="text-primary font-label text-xs font-bold tracking-[0.2em] uppercase mb-2 block">
            Management Console
          </span>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
            Dashboard
          </h2>
        </div>

        {/* System status chip */}
        <div className="bg-surface-container-low px-4 py-2 rounded-lg flex items-center gap-3 ghost-border">
          <span className="text-xs text-on-surface-variant font-medium">
            System Status
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-bold text-on-surface">
              Operational
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats Bento Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard
          icon={NeuralNetworkIcon}
          iconClass="text-primary group-hover:text-on-primary-container"
          value={String(activeCount)}
          label="Total Active Hosts"
          hoverClass="hover:bg-primary-container"
        />
        <StatCard
          icon={DashboardSpeed01Icon}
          iconClass="text-tertiary"
          value="12ms"
          label="Avg. DNS Response"
          hoverClass="hover:bg-tertiary-container"
        />
        <StatCard
          icon={SecuredNetworkIcon}
          iconClass="text-secondary"
          value="0"
          label="Security Alerts"
          hoverClass="hover:bg-surface-container-high"
        />
      </div>

      {/* ── Host List Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4 px-4">
        <h3 className="font-headline text-lg font-bold text-on-surface">
          Active Host Entries
        </h3>

        <div className="flex gap-2">
          <button className="p-2 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
            <HugeiconsIcon icon={FilterIcon} size={18} strokeWidth={1.5} />
          </button>
          <button className="p-2 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
            <HugeiconsIcon icon={Sorting01Icon} size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* ── Host Entry List ──────────────────────────────────────── */}
      <div className="space-y-2">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center mb-4">
              <HugeiconsIcon
                icon={NeuralNetworkIcon}
                size={24}
                strokeWidth={1.5}
                className="text-outline-variant"
              />
            </div>
            <p className="text-sm font-semibold text-on-surface-variant">
              No host entries yet
            </p>
            <p className="text-xs text-outline-variant mt-1">
              Use "Add New Entry" in the sidebar to get started.
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <HostRow
              key={entry.id}
              entry={entry}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="mt-12 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4 text-outline-variant text-xs">
        <p>© 2024 HostCraft Precision Curator. All technical rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-primary transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            API Reference
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            v2.4.1-stable
          </a>
        </div>
      </footer>
    </div>
  );
}
