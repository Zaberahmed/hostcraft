import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { useSettingsView } from "@/hooks/use-settings-view";
import { cn } from "@/lib/utils";
import {
  MoreIcon,
  SecuredNetworkIcon,
  ServerStack01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { SettingRow } from "./setting-row";
import { SettingSection } from "./setting-section";

export default function Settings() {
  const {
    handleChange,
    settingsLocalState,
    resetState,
    isSaveDisabled,
    handleSave,
    resetSettings,
  } = useSettingsView();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="space-y-4">
        {/* General */}
        <SettingSection
          icon={Settings01Icon}
          title="General"
          isResettable={
            resetState.find((section) => section.title === "General")
              ?.shouldReset
          }
        >
          <SettingRow
            label="Follow system theme"
            description="Toggle to follow the system theme."
          >
            <Toggle
              checked={!!settingsLocalState?.should_follow_system_theme}
              onChange={(v) => handleChange("should_follow_system_theme", v)}
            />
          </SettingRow>
          <SettingRow
            label="Auto-reload on save"
            description="Automatically apply host file changes without a manual flush."
          >
            <Toggle
              checked={!!settingsLocalState?.auto_reload}
              onChange={(v) => handleChange("auto_reload", v)}
            />
          </SettingRow>

          <SettingRow
            label="Update Notification"
            description="Show update notifications when a new version is available."
          >
            <div className="hidden">
              <Toggle
                checked={!!settingsLocalState?.show_update_notifications}
                onChange={(v) => handleChange("show_update_notifications", v)}
              />
            </div>

            <Badge
              variants={{
                color: "tertiary-container",
                size: "md",
                shape: "pill",
              }}
            >
              Coming soon
            </Badge>
          </SettingRow>
        </SettingSection>

        {/* Network */}
        <SettingSection
          icon={ServerStack01Icon}
          title="Network"
          isResettable={
            resetState.find((section) => section.title === "Network")
              ?.shouldReset
          }
        >
          <SettingRow
            label="DNS validation"
            description="Warn when a hostname already resolves to a different IP."
          >
            <Toggle
              checked={!!settingsLocalState?.dns_validation}
              onChange={(v) => handleChange("dns_validation", v)}
            />
          </SettingRow>
          <SettingRow
            label="Hosts file path"
            description="Absolute path to the system hosts file."
          >
            <input
              type="text"
              defaultValue={settingsLocalState?.hosts_path ?? ""}
              onChange={(e) => handleChange("hosts_path", e.target.value)}
              className={cn(
                "w-48 rounded-lg text-sm font-label",
                "px-3 py-1.5",
                "bg-surface-container-low text-on-surface",
                "ghost-border",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest",
                "transition-all",
              )}
            />
          </SettingRow>
        </SettingSection>

        {/* Security */}
        <SettingSection icon={SecuredNetworkIcon} title="Security">
          <SettingRow
            label="Require authentication"
            description="Prompt for system credentials before writing to the hosts file."
          >
            <Badge
              variants={{
                color: "secondary-container",
                size: "md",
                shape: "pill",
              }}
            >
              Always on
            </Badge>
          </SettingRow>
          <SettingRow
            label="Backup on change"
            description="Keep a timestamped backup of the hosts file before each write."
          >
            <Badge
              variants={{
                color: "tertiary-container",
                size: "md",
                shape: "pill",
              }}
            >
              Coming soon
            </Badge>
          </SettingRow>
        </SettingSection>

        {/* External */}
        <SettingSection icon={MoreIcon} title="External">
          <SettingRow
            label="Flush DNS cache"
            description="Flush the DNS cache to ensure changes are applied immediately."
          >
            <Button variant="primary" size="sm" shadow="lg" duration="lg">
              Flush
            </Button>
          </SettingRow>
          <SettingRow
            label="Open in Editor"
            description="Open the hosts file in your default editor."
          >
            <Button variant="primary" size="sm" shadow="lg" duration="lg">
              Open
            </Button>
          </SettingRow>
        </SettingSection>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end gap-3">
        <Button
          variant="subtle"
          size="sm"
          duration="lg"
          onClick={resetSettings}
        >
          Reset to defaults
        </Button>
        <Button
          variant="primary"
          size="sm"
          shadow="lg"
          duration="lg"
          disabled={isSaveDisabled}
          onClick={handleSave}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}
