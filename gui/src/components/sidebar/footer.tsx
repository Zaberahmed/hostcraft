import { Icon } from "@/components/ui/icon";
import { useThemeContext } from "@/providers/theme.provider";
import { Add01Icon, Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons";
import { Toggle } from "@/components/ui/toggle";

export function Footer() {
  const { theme, toggleTheme } = useThemeContext();

  return (
    <div className="px-4 pb-6 flex flex-col gap-6">
      <button className="w-full flex items-center justify-center gap-2 py-3 bg-linear-to-r from-primary to-primary-dim text-on-primary rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-105 transition-all duration-300 font-semibold text-sm">
        <Icon icon={Add01Icon} strokeWidth={2.5} />
        Add New Entry
      </button>

      <div className="border-t border-outline-variant/10">
        {/* Theme toggle */}
        <div className="mt-3 flex items-center gap-2 pr-6">
          <Toggle checked={theme === "dark"} onChange={toggleTheme} />
          <Icon
            icon={Sun01Icon}
            altIcon={Moon02Icon}
            size={18}
            showAlt={theme === "dark"}
          />
          <span>{theme === "dark" ? "Dark" : "Light"} mode</span>
        </div>
      </div>
    </div>
  );
}
