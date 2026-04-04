import { Icon } from "@/components/ui/icon";
import { useThemeContext } from "@/providers/theme.provider";
import { useEntries } from "@/providers/entries.provider";
import { Add01Icon, Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";

export function Footer() {
  const { theme, toggleTheme } = useThemeContext();
  const { openAddModal } = useEntries();

  return (
    <div className="px-4 pb-6 flex flex-col gap-6">
      {/* Add New Entry */}
      <Button variant="primary" size="full" shadow="md" onClick={openAddModal}>
        <Icon icon={Add01Icon} strokeWidth={2.5} />
        Add New Entry
      </Button>

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
          <span className="text-on-surface font-headline text-sm">
            {theme === "dark" ? "Dark" : "Light"} mode
          </span>
        </div>
      </div>
    </div>
  );
}
