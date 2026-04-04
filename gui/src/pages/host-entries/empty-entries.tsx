import { NeuralNetworkIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";

export function EmptyEntries() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center mb-4">
        <Icon
          icon={NeuralNetworkIcon}
          size={24}
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
  );
}
