import { cn } from "@/lib/utils";
import { tv } from "tailwind-variants";

const field = tv({
  slots: {
    base: "flex flex-col gap-1.5",
    labelClassName:
      "text-[10px] uppercase font-bold tracking-wider text-outline-variant font-label select-none",
    input: cn(
      "w-full px-3.5 py-2.5 rounded-lg text-sm text-on-surface",
      "border transition-all duration-150 outline-none",
      "placeholder:text-outline-variant/50",
    ),
    errorContainer: "overflow-hidden transition-all duration-200",
    errorClassName: "text-xs text-error-dim font-label pt-0.5",
  },
  variants: {
    hasError: {
      true: {
        input: cn(
          "bg-error-container/10 border-error/40",
          "focus:border-error focus:ring-2 focus:ring-error/15",
        ),
        errorContainer: "max-h-8 opacity-100",
      },
      false: {
        input: cn(
          "bg-surface-container-low border-outline-variant/15",
          "focus:bg-surface-container-lowest focus:border-primary",
          "focus:ring-2 focus:ring-primary/15",
        ),
        errorContainer: "max-h-0 opacity-0",
      },
    },
    fontClass: {
      fontBody: "font-body",
      fontLabel: "font-label",
    },
  },
});

interface FieldProps {
  id: "entry-ip" | "entry-hostname";
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  fontClass: "fontBody" | "fontLabel";
  error?: string;
}

export function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  fontClass,
}: FieldProps) {
  const hasError = Boolean(error);

  const { base, labelClassName, input, errorContainer, errorClassName } = field(
    {
      hasError,
      fontClass,
    },
  );

  return (
    <div className={base()}>
      <label htmlFor={id} className={labelClassName()}>
        {label}
      </label>

      <input
        autoFocus={id === "entry-ip"}
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        aria-describedby={hasError ? `${id}-error` : undefined}
        aria-invalid={hasError}
        className={input()}
      />

      <div className={errorContainer()}>
        {error && (
          <p id={`${id}-error`} role="alert" className={errorClassName()}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
