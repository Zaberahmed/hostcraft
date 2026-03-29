import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { Copy01Icon, Delete01Icon, EditIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { AccentColor, HostEntry } from "./host.model";

interface HostRowProps {
  entry: HostEntry;
  onToggle: (id: string, value: boolean) => void;
  onDelete: (id: string) => void;
}

const accentClasses: Record<AccentColor, string> = {
  primary: "bg-primary",
  tertiary: "bg-tertiary",
  secondary: "bg-secondary",
  "outline-variant": "bg-outline-variant",
};
export function HostRow({ entry, onToggle, onDelete }: HostRowProps) {
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

        {/* Edit */}
        <button
          onClick={() => console.log("Edit")}
          className="p-2 rounded-lg text-outline-variant hover:text-primary hover:bg-primary-container/20 transition-all active:scale-90"
          aria-label={`Edit ${entry.hostname}`}
        >
          <Icon icon={EditIcon} size={20} />
        </button>

        {/* Duplicate */}
        <button
          onClick={() => console.log("Duplicate")}
          className="p-2 rounded-lg text-outline-variant hover:text-primary hover:bg-primary-container/20 transition-all active:scale-90"
          aria-label={`Duplicate ${entry.hostname}`}
        >
          <Icon icon={Copy01Icon} size={20} />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(entry.id)}
          className="p-2 rounded-lg text-outline-variant hover:text-error hover:bg-error-container/20 transition-all active:scale-90"
          aria-label={`Delete ${entry.hostname}`}
        >
          <Icon icon={Delete01Icon} size={20} color="red" />
        </button>
      </div>
    </div>
  );
}
