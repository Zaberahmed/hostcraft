import { cn } from "@/lib/utils";

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
  fontClass?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  fontClass = "font-body",
  inputRef,
}: FieldProps) {
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[10px] uppercase font-bold tracking-wider text-outline-variant font-label select-none"
      >
        {label}
      </label>

      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        aria-describedby={hasError ? `${id}-error` : undefined}
        aria-invalid={hasError}
        className={cn(
          "w-full px-3.5 py-2.5 rounded-lg text-sm text-on-surface",
          "border transition-all duration-150 outline-none",
          "placeholder:text-outline-variant/50",
          fontClass,
          hasError
            ? [
                "bg-error-container/10 border-error/40",
                "focus:border-error focus:ring-2 focus:ring-error/15",
              ]
            : [
                "bg-surface-container-low border-outline-variant/15",
                "focus:bg-surface-container-lowest focus:border-primary",
                "focus:ring-2 focus:ring-primary/15",
              ],
        )}
      />

      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          hasError ? "max-h-8 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        {error && (
          <p
            id={`${id}-error`}
            role="alert"
            className="text-xs text-error font-label pt-0.5"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
