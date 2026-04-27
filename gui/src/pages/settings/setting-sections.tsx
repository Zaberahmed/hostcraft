import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioInput } from "@/components/ui/radio";
import { Toggle } from "@/components/ui/toggle";
import type { AppSettings, HostsPath } from "@/entities/settings.model";
import type { ResetSection } from "@/hooks/use-settings-view";
import {
  MoreIcon,
  SecuredNetworkIcon,
  ServerStack01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { SettingRow } from "./setting-row";
import { SettingSection } from "./setting-section";
import { isResettable } from "./utils";

type SettingSectionsProps = {
  handleChange: (
    key: keyof AppSettings,
    value: boolean | string | HostsPath,
  ) => void;
  settingsLocalState: AppSettings | null;
  resetState: ResetSection[];
  setHostsPathDefault: () => void;
  setHostsPathCustom: (value: string) => void;
  flushDNSCache: () => void;
  openHostsFileExternally: () => void;
};

export function SettingSections({
  handleChange,
  settingsLocalState,
  resetState,
  setHostsPathDefault,
  setHostsPathCustom,
  flushDNSCache,
  openHostsFileExternally,
}: SettingSectionsProps) {
  const {
    should_follow_system_theme,
    auto_reload,
    show_update_notifications,
    dns_validation,
    hosts_path,
  } = settingsLocalState ?? {};
  return (
    <div className="space-y-4">
      <GeneralSection
        isResettable={isResettable(resetState, "General")}
        followSystemTheme={!!should_follow_system_theme}
        autoReload={!!auto_reload}
        showUpdateNotifications={!!show_update_notifications}
        handleChange={handleChange}
      />

      <NetworkSection
        isResettable={isResettable(resetState, "Network")}
        dnsValidation={!!dns_validation}
        hosts_path={hosts_path ?? { kind: "default", value: "" }}
        handleChange={handleChange}
        setHostsPathDefault={setHostsPathDefault}
        setHostsPathCustom={setHostsPathCustom}
      />

      <SecuritySection />

      <ExternalSection
        flushDNSCache={flushDNSCache}
        openHostsFileExternally={openHostsFileExternally}
      />
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
  setHostsPathDefault: () => void;
  setHostsPathCustom: (value: string) => void;
};

export function NetworkSection({
  isResettable,
  handleChange,
  dnsValidation,
  hosts_path,
  setHostsPathDefault,
  setHostsPathCustom,
}: NetworkSectionProps) {
  const isDefaultHostPath = hosts_path.kind === "default";
  const hostsPathValue = hosts_path.value;
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
            <RadioInput
              labelText="Use system default"
              name="hosts-path-mode"
              checked={isDefaultHostPath}
              onChange={setHostsPathDefault}
            />

            <RadioInput
              labelText="Use custom path"
              name="hosts-path-mode"
              checked={!isDefaultHostPath}
              onChange={() => setHostsPathCustom(hostsPathValue)}
            />
          </div>

          <Input
            type="text"
            value={hostsPathValue}
            onChange={(e) => setHostsPathCustom(e.target.value)}
            disabled={isDefaultHostPath}
            autoFocus={!isDefaultHostPath}
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

type ExternalSectionProps = {
  flushDNSCache: () => void;
  openHostsFileExternally: () => void;
};

export function ExternalSection({
  flushDNSCache,
  openHostsFileExternally,
}: ExternalSectionProps) {
  return (
    <SettingSection icon={MoreIcon} title="External">
      <SettingRow
        label="Flush DNS cache"
        description="Flush the DNS cache to ensure changes are applied immediately."
      >
        <Button
          variant="primary"
          size="sm"
          shadow="lg"
          duration="lg"
          onClick={flushDNSCache}
        >
          Flush
        </Button>
      </SettingRow>
      <SettingRow
        label="Open in Editor"
        description="Open the hosts file in your default editor."
      >
        <Button
          variant="primary"
          size="sm"
          shadow="lg"
          duration="lg"
          onClick={openHostsFileExternally}
        >
          Open
        </Button>
      </SettingRow>
    </SettingSection>
  );
}
