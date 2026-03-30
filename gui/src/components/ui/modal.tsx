import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { ReactNode } from "react";
import { tv } from "tailwind-variants";

const modal = tv({
  slots: {
    base: cn(
      "fixed inset-0 z-50 flex items-center justify-center",
      "transition-opacity duration-200",
    ),
    backdrop: "fixed inset-0 bg-on-surface/25 backdrop-blur-sm",
    panel: cn(
      "relative w-full max-w-md mx-4",
      "glass-panel rounded-2xl",
      "border border-outline-variant/10",
      "shadow-[0px_12px_32px_rgba(40,52,57,0.08)]",
      "transition-all duration-200",
    ),
    header: "flex items-start justify-between px-6 pt-6 pb-5",
    titleClassName:
      "text-xl font-bold font-headline tracking-tight text-on-surface",
    subTitleClassName:
      "text-primary font-label text-[10px] font-bold tracking-[0.2em] uppercase mb-1.5",
    closeButton: cn(
      "p-1.5 mt-0.5 rounded-lg",
      "text-outline-variant hover:text-on-surface hover:bg-surface-container",
      "transition-colors duration-150",
    ),
    divider: "h-px bg-outline-variant/10 mx-6",
  },
  variants: {
    isVisible: {
      true: {
        base: "opacity-100",
        panel: "scale-100 translate-y-0",
      },
      false: {
        base: "opacity-0 pointer-events-none",
        panel: "scale-95 -translate-y-2",
      },
    },
  },
});

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
  const {
    base,
    backdrop,
    panel,
    header,
    titleClassName,
    subTitleClassName,
    closeButton,
    divider,
  } = modal({
    isVisible,
  });
  return (
    <div
      className={base()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="entry-modal-title"
    >
      <div className={backdrop()} onClick={onClose} aria-hidden="true" />
      <div className={panel()}>
        <div className={header()}>
          <>
            {subTitle && <p className={subTitleClassName()}>{subTitle}</p>}
            <h2 id="entry-modal-title" className={titleClassName()}>
              {title}
            </h2>
          </>

          <button
            type="button"
            onClick={onClose}
            className={closeButton()}
            aria-label="Close dialog"
          >
            <Icon icon={Cancel01Icon} size={18} />
          </button>
        </div>

        <div className={divider()} />

        {children}
      </div>
    </div>
  );
}
