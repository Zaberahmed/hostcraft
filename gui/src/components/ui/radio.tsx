import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const radio = tv({
  slots: {
    label: [
      "inline-flex items-center ",
      "gap-2",
      "text-sm font-label text-on-surface",
    ],
  },
});

type RadioInputVariants = VariantProps<typeof radio>;

interface RadioInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>, RadioInputVariants {
  labelText: string;
  className?: string;
}

export const RadioInput = forwardRef<HTMLInputElement, RadioInputProps>(
  ({ labelText, className, ...props }, ref) => {
    const { label } = radio({});
    return (
      <label className={cn(label(), className)}>
        <input ref={ref} type="radio" {...props} />
        {labelText}
      </label>
    );
  },
);
