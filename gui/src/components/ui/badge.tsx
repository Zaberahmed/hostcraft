import { tv } from "tailwind-variants";

export const badge = tv({
  base: "px-2 py-0.5 rounded-md",
  variants: {
    color: {
      default: "bg-primary-fixed-dim",
      secondary: "bg-secondary-fixed-dim",
      tertiary: "bg-tertiary-fixed-dim",
    },
    textSize: {
      default: "text-[10.5px]",
      large: "text-lg",
    },
    textColor: {
      default: "text-on-surface-variant",
    },
    fontFamily: {
      default: "font-label",
    },
    isBeta: {
      true: "uppercase",
    },
  },
  defaultVariants: {
    color: "default",
    textSize: "default",
    textColor: "default",
    fontFamily: "default",
  },
});
