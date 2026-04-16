import type { AppSettings, HostsPath } from "@/entities/settings.model";
import { useEntries, useSettings } from "@/providers";
import { areHostsPathEqual, isSectionChanged } from "@/utils/settings";
import { useState, useEffect, useMemo } from "react";
import { confirm } from "@tauri-apps/plugin-dialog";
import { toast } from "sonner";

type SectionTitles = "General" | "Network";

export type ResetSection = {
  id: string;
  title: SectionTitles;
  shouldReset: boolean;
};

export function useSettingsView() {
  const {
    settings,
    saveSettings,
    resetSettings,
    flushDNSCache,
    openHostsFileExternally,
  } = useSettings();
  const { refetchEntries } = useEntries();
  const [settingsLocalState, setSettingsLocalState] =
    useState<AppSettings | null>(null);

  useEffect(() => {
    if (settings) {
      setSettingsLocalState((prev) => ({ ...prev, ...settings }));
    }
  }, [settings]);

  const handleChange = (
    key: keyof AppSettings,
    value: boolean | string | HostsPath,
  ) => {
    setSettingsLocalState((prev) => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });
  };

  const setHostsPathDefault = () =>
    handleChange("hosts_path", {
      kind: "default",
      value: settings?.hosts_path.value ?? "",
    });

  const setHostsPathCustom = (value: string) =>
    handleChange("hosts_path", { kind: "custom", value });

  const handleSave = async () => {
    if (!settingsLocalState) return;

    const hostsPath = settingsLocalState.hosts_path;
    if (hostsPath.kind === "custom" && !hostsPath.value.trim()) {
      toast.error("Custom hosts path cannot be empty.");
      return;
    }

    const hasHostPathChanged = !areHostsPathEqual(
      settingsLocalState.hosts_path,
      settings?.hosts_path,
    );

    if (hasHostPathChanged) {
      const confirmation = await confirm(
        "Are you sure you want to change the hosts path?",
        { kind: "warning", okLabel: "Confirm" },
      );
      if (!confirmation) return;
    }

    saveSettings({
      should_follow_system_theme: settingsLocalState.should_follow_system_theme,
      auto_reload: settingsLocalState.auto_reload,
      dns_validation: settingsLocalState.dns_validation,
      show_update_notifications: settingsLocalState.show_update_notifications,
      hosts_path: settingsLocalState.hosts_path,
    });
    refetchEntries();
  };

  const isGeneralSectionResettable = useMemo(
    () =>
      isSectionChanged(settings, settingsLocalState, [
        "auto_reload",
        "show_update_notifications",
        "should_follow_system_theme",
      ]),
    [settings, settingsLocalState],
  );

  const isNetworkSectionResettable = useMemo(
    () =>
      isSectionChanged(settings, settingsLocalState, [
        "dns_validation",
        "hosts_path",
      ]),
    [settings, settingsLocalState],
  );

  const resetState = useMemo<ResetSection[]>(
    () => [
      {
        id: "general",
        title: "General",
        shouldReset: isGeneralSectionResettable,
      },
      {
        id: "network",
        title: "Network",
        shouldReset: isNetworkSectionResettable,
      },
    ],
    [isGeneralSectionResettable, isNetworkSectionResettable],
  );

  const isSaveDisabled = !resetState.some((section) => section.shouldReset);

  return {
    settingsLocalState,
    setSettingsLocalState,
    resetSettings,
    isSaveDisabled,
    handleChange,
    handleSave,
    resetState,
    setHostsPathDefault,
    setHostsPathCustom,
    flushDNSCache,
    openHostsFileExternally,
  };
}
