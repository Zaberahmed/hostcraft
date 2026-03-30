import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const button = tv({
  base: "inline-flex items-center justify-center transition-all duration-150 font-semibold disabled:opacity-50 disabled:pointer-events-none",
  variants: {
    variant: {
      primary: [
        "text-on-primary rounded-xl",
        "bg-linear-to-r from-primary to-primary-dim",
        "shadow-md shadow-primary/20",
        "hover:brightness-105 hover:shadow-xl",
        "active:scale-[0.98]",
      ],
      ghost: [
        "rounded-lg text-outline-variant",
        "hover:text-primary hover:bg-primary-container/20",
        "active:scale-90",
      ],
      danger: [
        "rounded-lg text-outline-variant",
        "hover:text-error hover:bg-error-container/20",
        "active:scale-90",
      ],
      subtle: ["rounded-lg text-primary", "hover:bg-primary-container/30"],
      surface: [
        "rounded-lg bg-surface-container-low text-on-surface-variant",
        "hover:bg-surface-container",
      ],
    },
    size: {
      icon: "p-2",
      sm: "px-4 py-2 text-sm gap-2",
      md: "px-5 py-2 text-sm gap-2",
      full: "w-full py-3 text-sm gap-2",
    },
  },
  defaultVariants: {
    variant: "ghost",
    size: "sm",
  },
});
type ButtonVariants = VariantProps<typeof button>;

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariants {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(button({ variant, size }), className)}
      {...props}
    />
  ),
);
