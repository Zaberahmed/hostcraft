import { HugeiconsIcon } from "@hugeicons/react";
import {
  Settings01Icon,
  UserCircle02Icon,
  ServerStack01Icon,
  Notification01Icon,
  SecuredNetworkIcon,
  Add01Icon,
} from "@hugeicons/core-free-icons";
import { useState } from "react";
import { Toggle } from "@/components/ui/toggle";

interface SettingRowProps {
  label: string;
  description: string;
  children: React.ReactNode;
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-4 gap-8">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-on-surface">{label}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

interface SettingSectionProps {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
  title: string;
  children: React.ReactNode;
}

function SettingSection({ icon, title, children }: SettingSectionProps) {
  return (
    <div className="bg-surface-container-low rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4">
        <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
          <HugeiconsIcon
            icon={icon}
            size={16}
            className="text-on-primary-container"
            strokeWidth={2}
          />
        </div>
        <h3 className="font-headline text-base font-bold text-on-surface">
          {title}
        </h3>
      </div>

      <div className="px-6 pb-2">
        <div className="bg-surface-container-highest/40 rounded-xl px-4 divide-y-0">
          {children}
        </div>
      </div>

      <div className="pb-4" />
    </div>
  );
}

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [autoReload, setAutoReload] = useState(false);
  const [dnsValidation, setDnsValidation] = useState(true);
  const [telemetry, setTelemetry] = useState(false);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-10">
        <span className="text-primary font-label text-xs font-bold tracking-[0.2em] uppercase mb-2 block">
          Application
        </span>
        <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
          Settings
        </h2>
        <p className="text-on-surface-variant text-sm mt-2">
          Configure your HostCraft environment and preferences.
        </p>
      </div>

      <div className="space-y-4">
        {/* General */}
        <SettingSection icon={Settings01Icon} title="General">
          <SettingRow
            label="Auto-reload on save"
            description="Automatically apply host file changes without a manual flush."
          >
            <Toggle checked={autoReload} onChange={setAutoReload} />
          </SettingRow>
          <SettingRow
            label="Usage telemetry"
            description="Send anonymous usage data to help improve HostCraft."
          >
            <Toggle checked={telemetry} onChange={setTelemetry} />
          </SettingRow>
        </SettingSection>

        {/* Profile */}
        <SettingSection icon={UserCircle02Icon} title="Profile">
          <SettingRow
            label="Display name"
            description="Name shown in the sidebar and activity logs."
          >
            <input
              type="text"
              defaultValue="Alex Chen"
              className="w-48 px-3 py-1.5 text-sm rounded-lg bg-surface-container-low ghost-border text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all font-body"
            />
          </SettingRow>
          <SettingRow
            label="Role"
            description="Your organizational role, displayed as metadata."
          >
            <input
              type="text"
              defaultValue="System Admin"
              className="w-48 px-3 py-1.5 text-sm rounded-lg bg-surface-container-low ghost-border text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all font-body"
            />
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

        {/* Notifications */}
        <SettingSection icon={Notification01Icon} title="Notifications">
          <SettingRow
            label="System notifications"
            description="Show desktop alerts when host entries are added or removed."
          >
            <Toggle checked={notifications} onChange={setNotifications} />
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
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end gap-3">
        <button className="px-5 py-2.5 text-sm font-semibold text-primary rounded-lg hover:bg-primary-container/40 transition-colors">
          Reset to defaults
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-primary to-primary-dim text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-300">
          <HugeiconsIcon icon={Add01Icon} size={15} strokeWidth={2.5} />
          Save changes
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4 text-outline-variant text-xs">
        <p>
          © 2024 HostCraft Precision Curator. All technical rights reserved.
        </p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-primary transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            API Reference
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            v2.4.1-stable
          </a>
        </div>
      </footer>
    </div>
  );
}
