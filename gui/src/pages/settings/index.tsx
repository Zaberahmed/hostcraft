import { Icon } from "@/components/ui/icon";
import { Toggle } from "@/components/ui/toggle";
import {
  Add01Icon,
  MoreIcon,
  SecuredNetworkIcon,
  ServerStack01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { useState } from "react";
import { SettingRow } from "./setting-row";
import { SettingSection } from "./setting-section";

export default function Settings() {
  const [dnsValidation, setDnsValidation] = useState(true);
  const [isSystemTheme, setIsSystemTheme] = useState(false);
  const [autoReload, setAutoReload] = useState(false);
  // const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="space-y-4">
        {/* General */}
        <SettingSection icon={Settings01Icon} title="General">
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
            {/*<Toggle
              checked={showUpdateNotification}
              onChange={setShowUpdateNotification}
            />*/}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container text-xs font-bold font-label">
              Coming soon
            </span>
          </SettingRow>
        </SettingSection>

        {/* Network */}
        <SettingSection icon={ServerStack01Icon} title="Network">
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
              className="w-48 px-3 py-1.5 text-sm rounded-lg bg-surface-container-low ghost-border text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all font-label"
            />
          </SettingRow>
        </SettingSection>

        {/* Security */}
        <SettingSection icon={SecuredNetworkIcon} title="Security">
          <SettingRow
            label="Require authentication"
            description="Prompt for system credentials before writing to the hosts file."
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold font-label">
              Always on
            </span>
          </SettingRow>
          <SettingRow
            label="Backup on change"
            description="Keep a timestamped backup of the hosts file before each write."
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container text-xs font-bold font-label">
              Coming soon
            </span>
          </SettingRow>
        </SettingSection>

        {/* External */}
        <SettingSection icon={MoreIcon} title="External">
          <SettingRow
            label="Flush DNS cache"
            description="Flush the DNS cache to ensure changes are applied immediately."
          >
            <button className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-primary to-primary-dim text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-300">
              <span>Flush</span>
            </button>
          </SettingRow>
          <SettingRow
            label="Open in Editor"
            description="Open the hosts file in your default editor."
          >
            <button className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-primary to-primary-dim text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-300">
              <span>Open</span>
            </button>
          </SettingRow>
        </SettingSection>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end gap-3">
        <button className="px-5 py-2.5 text-sm font-semibold text-primary rounded-lg hover:bg-primary-container/40 transition-colors">
          Reset to defaults
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-primary to-primary-dim text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-300">
          <Icon icon={Add01Icon} size={15} strokeWidth={2.5} />
          Save changes
        </button>
      </div>
    </div>
  );
}
