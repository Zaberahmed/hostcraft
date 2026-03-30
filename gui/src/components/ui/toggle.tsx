import { cn } from "@/lib/utils";
import { tv } from "tailwind-variants";

const toggle = tv({
  slots: {
    label: "relative inline-flex items-center cursor-pointer",
    input: "sr-only peer",
    thumb: cn(
      "w-11 h-6 bg-surface-container-highest rounded-full",
      "peer peer-checked:after:translate-x-full",
      "after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white",
      "after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary",
    ),
  },
});

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const { label, input, thumb } = toggle();
  return (
    <label className={label()}>
      <input
        type="checkbox"
        className={input()}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className={thumb()} />
    </label>
  );
}
