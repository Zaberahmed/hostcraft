import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";

type ModalProps = {
  children: ReactNode;
  isVisible: boolean;
  onClose: () => void;
  title: string;
  subTitle?: string;
};

export function Modal({
  children,
  isVisible,
  onClose,
  title,
  subTitle,
}: ModalProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "transition-opacity duration-200",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="entry-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-on-surface/25 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full max-w-md mx-4",
          "glass-panel rounded-2xl",
          "border border-outline-variant/10",
          "shadow-[0px_12px_32px_rgba(40,52,57,0.08)]",
          "transition-all duration-200",
          isVisible ? "scale-100 translate-y-0" : "scale-95 -translate-y-2",
        )}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-6 pt-6 pb-5">
          <div>
            {subTitle && (
              <p className="text-primary font-label text-[10px] font-bold tracking-[0.2em] uppercase mb-1.5">
                {subTitle}
              </p>
            )}
            <h2
              id="entry-modal-title"
              className="text-xl font-bold font-headline tracking-tight text-on-surface"
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={cn(
              "p-1.5 mt-0.5 rounded-lg",
              "text-outline-variant hover:text-on-surface hover:bg-surface-container",
              "transition-colors duration-150",
            )}
            aria-label="Close dialog"
          >
            <Icon icon={Cancel01Icon} size={18} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-outline-variant/10 mx-6" />

        {children}
      </div>
    </div>
  );
}
