import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { RedoIcon } from "@hugeicons/core-free-icons";

interface ResetButtonProps {
  isResetting: boolean;
  onClick: () => void;
}

export function ResetButton({ isResetting, onClick }: ResetButtonProps) {
  return (
    <div className="relative inline-flex">
      <Button
        size="icon"
        variant="surface"
        onClick={onClick}
        aria-label={isResetting ? "Reset active" : "Reset inactive"}
      >
        <Icon icon={RedoIcon} size={18} />
      </Button>

      {isResetting && (
        <span
          className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-background pointer-events-none"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
