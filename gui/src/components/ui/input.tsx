import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const input = tv({
  base: [
    "w-full font-label",
    "bg-surface-container-low text-on-surface",
    "ghost-border",
    "focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest",
    "transition-all",
  ],
  variants: {
    customSize: {
      default: "px-3 py-1.5 text-sm",
    },
    customShape: {
      default: "rounded-lg",
      square: "rounded-none",
    },
  },
  defaultVariants: {
    customSize: "default",
    customShape: "default",
  },
});

type InputVariants = VariantProps<typeof input>;

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>, InputVariants {
  variants?: InputVariants;
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variants, className, ...props }, ref) => {
    return (
      <input ref={ref} className={cn(input(variants), className)} {...props} />
    );
  },
);
