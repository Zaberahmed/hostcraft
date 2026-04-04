import { ReactNode } from "react";
import { tv, VariantProps } from "tailwind-variants";

const badge = tv({
  base: "inline-flex items-center gap-1.5 font-bold font-label",
  variants: {
    color: {
      default: "bg-primary-fixed-dim text-on-surface-variant",
      secondary: "bg-secondary-fixed-dim text-on-surface-variant",
      tertiary: "bg-tertiary-fixed-dim text-on-surface-variant",
      "tertiary-container": "bg-tertiary-container text-on-tertiary-container",
      "secondary-container":
        "bg-secondary-container text-on-secondary-container",
    },
    size: {
      default: "px-2 py-0.5 text-[10.5px]",
      md: "px-3 py-1 text-xs",
      sm: "px-2 py-0.5 text-[10.5px]",
    },
    shape: {
      rounded: "rounded-md",
      pill: "rounded-full",
    },
    isBeta: {
      true: "uppercase",
    },
  },
  defaultVariants: {
    color: "default",
    size: "default",
    shape: "rounded",
  },
});

export const Badge = ({
  children,
  variants,
}: {
  children: ReactNode;
  variants: VariantProps<typeof badge>;
}) => {
  return <span className={badge(variants)}> {children}</span>;
};
