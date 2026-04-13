import { cn } from "@/lib/utils";

type ResetIndicatorProps = {
  className?: string;
};

export function ResetIndicator({ className }: ResetIndicatorProps) {
  return (
    <span
      className={cn(
        "absolute rounded-full top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-background pointer-events-none",
        className,
      )}
      aria-hidden="true"
    />
  );
}
