import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ServerStack01Icon,
  SecuredNetworkIcon,
  MoreIcon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { SettingRow } from "./setting-row";
import { SettingSection } from "./setting-section";
import { Toggle } from "@/components/ui/toggle";
import { useSettingsView } from "@/hooks/use-settings-view";
import { useState } from "react";
import type { AppSettings, HostsPath } from "@/entities/settings.model";

export function SettingSections() {
  const { handleChange, settingsLocalState, resetState } = useSettingsView();

  return (
    <div className="space-y-4">
      <GeneralSection
        isResettable={
          !!resetState.find((section) => section.title === "General")
            ?.shouldReset
        }
        followSystemTheme={!!settingsLocalState?.should_follow_system_theme}
        autoReload={!!settingsLocalState?.auto_reload}
        showUpdateNotifications={
          !!settingsLocalState?.show_update_notifications
        }
        handleChange={handleChange}
      />

      <NetworkSection
        isResettable={
          !!resetState.find((section) => section.title === "Network")
            ?.shouldReset
        }
        dnsValidation={!!settingsLocalState?.dns_validation}
        hosts_path={
          settingsLocalState?.hosts_path ?? { kind: "default", value: "" }
        }
        handleChange={handleChange}
      />

      <SecuritySection />

      <ExternalSection />
    </div>
  );
}
type CommonProps = {
  isResettable: boolean;
  handleChange: (
    key: keyof AppSettings,
    value: boolean | string | HostsPath,
  ) => void;
};

type GeneralSectionProps = CommonProps & {
  followSystemTheme: boolean;
  autoReload: boolean;
  showUpdateNotifications: boolean;
};

export function GeneralSection({
  isResettable,
  followSystemTheme,
  autoReload,
  showUpdateNotifications,
  handleChange,
}: GeneralSectionProps) {
  return (
    <SettingSection
      icon={Settings01Icon}
      title="General"
      isResettable={isResettable}
    >
      <SettingRow
        label="Follow system theme"
        description="Toggle to follow the system theme."
      >
        <Toggle
          checked={followSystemTheme}
          onChange={(v) => handleChange("should_follow_system_theme", v)}
        />
      </SettingRow>
      <SettingRow
        label="Auto-reload on save"
        description="Automatically apply host file changes without a manual flush."
      >
        <Toggle
          checked={autoReload}
          onChange={(v) => handleChange("auto_reload", v)}
        />
      </SettingRow>

      <SettingRow
        label="Update Notification"
        description="Show update notifications when a new version is available."
      >
        <div className="hidden">
          <Toggle
            checked={showUpdateNotifications}
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
  );
}
type NetworkSectionProps = CommonProps & {
  dnsValidation: boolean;
  hosts_path: HostsPath;
};

export function NetworkSection({
  isResettable,
  handleChange,
  dnsValidation,
  hosts_path,
}: NetworkSectionProps) {
  const [isDefaultHostPath, setIsDefaultHostPath] = useState(
    () => hosts_path.kind === "default",
  );
  const hostsPathValue = hosts_path.value ?? "";
  return (
    <SettingSection
      icon={ServerStack01Icon}
      title="Network"
      isResettable={isResettable}
    >
      <SettingRow
        label="DNS validation"
        description="Warn when a hostname already resolves to a different IP."
      >
        <Toggle
          checked={dnsValidation}
          onChange={(v) => handleChange("dns_validation", v)}
        />
      </SettingRow>
      <SettingRow
        label="Hosts file path"
        description="Choose system default hosts file path or override with a custom absolute path."
      >
        <div className="space-y-2">
          <div className="flex w-80 flex-wrap items-center gap-2">
            <label
              className="inline-flex items-center gap-2 text-sm font-label text-on-surface"
              onClick={() => setIsDefaultHostPath(true)}
            >
              <input
                type="radio"
                name="hosts-path-default-mode"
                checked={isDefaultHostPath}
              />
              Use system default
            </label>

            <label
              className="inline-flex items-center gap-2 text-sm font-label text-on-surface"
              onClick={() => setIsDefaultHostPath(false)}
            >
              <input
                type="radio"
                name="hosts-path-custom-mode"
                checked={!isDefaultHostPath}
              />
              Use custom path
            </label>
          </div>

          <input
            type="text"
            value={hostsPathValue}
            onChange={(e) =>
              handleChange("hosts_path", {
                kind: "custom",
                value: e.target.value,
              })
            }
            disabled={isDefaultHostPath}
            autoFocus={!isDefaultHostPath}
            className={cn(
              "w-full rounded-lg text-sm font-label",
              "px-3 py-1.5",
              "bg-surface-container-low text-on-surface",
              "ghost-border",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest",
              "transition-all",
            )}
          />
        </div>
      </SettingRow>
    </SettingSection>
  );
}

export function SecuritySection() {
  return (
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
  );
}

export function ExternalSection() {
  return (
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
  );
}
