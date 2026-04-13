import { useEffect, useMemo, useState } from "react";
import {
  MoreIcon,
  SecuredNetworkIcon,
  ServerStack01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { SettingRow } from "./setting-row";
import { SettingSection } from "./setting-section";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSettings } from "@/providers";

export default function Settings() {
  const { settings, saveSettings, resetSettings } = useSettings();
  const [dnsValidation, setDnsValidation] = useState(
    settings?.dns_validation ?? false,
  );
  const [isSystemTheme, setIsSystemTheme] = useState(
    settings?.should_follow_system_theme ?? false,
  );
  const [autoReload, setAutoReload] = useState(settings?.auto_reload ?? false);
  const [showUpdateNotification, setShowUpdateNotification] = useState(
    settings?.show_update_notifications ?? false,
  );

  useEffect(() => {
    setDnsValidation(settings?.dns_validation ?? false);
    setIsSystemTheme(settings?.should_follow_system_theme ?? false);
    setAutoReload(settings?.auto_reload ?? false);
    setShowUpdateNotification(settings?.show_update_notifications ?? false);
  }, [settings]);

  const handleSave = () => {
    saveSettings({
      should_follow_system_theme: isSystemTheme,
      auto_reload: autoReload,
      dns_validation: dnsValidation,
      show_update_notifications: showUpdateNotification,
    });
  };

  const isGeneralSectionResettable = useMemo(() => {
    return (
      settings?.auto_reload !== autoReload ||
      settings?.show_update_notifications !== showUpdateNotification ||
      settings?.should_follow_system_theme !== isSystemTheme
    );
  }, [
    settings?.auto_reload,
    settings?.show_update_notifications,
    settings?.should_follow_system_theme,
    autoReload,
    showUpdateNotification,
    isSystemTheme,
  ]);

  const isNetworkSectionResettable = useMemo(() => {
    return settings?.dns_validation !== dnsValidation;
  }, [settings?.dns_validation, dnsValidation]);

  const isDisabled = !(
    isGeneralSectionResettable || isNetworkSectionResettable
  );

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="space-y-4">
        {/* General */}
        <SettingSection
          icon={Settings01Icon}
          title="General"
          isResettable={isGeneralSectionResettable}
        >
          <SettingRow
            label="Follow system theme"
            description="Toggle to follow the system theme."
          >
            <Toggle checked={isSystemTheme} onChange={setIsSystemTheme} />
          </SettingRow>
          <SettingRow
            label="Auto-reload on save"
            description="Automatically apply host file changes without a manual flush."
          >
            <Toggle checked={autoReload} onChange={setAutoReload} />
          </SettingRow>

          <SettingRow
            label="Update Notification"
            description="Show update notifications when a new version is available."
          >
            <div className="hidden">
              <Toggle
                checked={showUpdateNotification}
                onChange={setShowUpdateNotification}
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
          isResettable={isNetworkSectionResettable}
        >
          <SettingRow
            label="DNS validation"
            description="Warn when a hostname already resolves to a different IP."
          >
            <Toggle checked={dnsValidation} onChange={setDnsValidation} />
          </SettingRow>
          <SettingRow
            label="Hosts file path"
            description="Absolute path to the system hosts file."
          >
            <input
              type="text"
              defaultValue="/etc/hosts"
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
          disabled={isDisabled}
          onClick={handleSave}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}
