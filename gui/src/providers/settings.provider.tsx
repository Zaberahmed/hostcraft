import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import type { AppSettings, Theme } from "@/entities/settings.model";
import { listen } from "@tauri-apps/api/event";

interface refetchKeys {
  settings: Date;
}

interface SettingsContextValue {
  settings: AppSettings | null;
  saveSettings: (setting: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [cacheBuster, setCacheBuster] = useState<refetchKeys>({
    settings: new Date(),
  });

  const fetchSettings = async () => {
    try {
      const result = await invoke<AppSettings>("get_settings");
      console.log("settings", result);
      setSettings(result);
    } catch (error) {
      toast.error("Error while loading settings");
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [cacheBuster]);

  const saveSettings = async (setting: Partial<AppSettings>) => {
    try {
      await invoke("save_settings", { settings: { ...settings, ...setting } });
      setCacheBuster({ settings: new Date() });
    } catch (error) {
      toast.error("Error while saving settings");
    }
  };
  const resetSettings = async () => {
    try {
      await invoke("reset_settings");
      setCacheBuster({ settings: new Date() });
    } catch (error) {
      toast.error("Error while resetting settings");
    }
  };

  useEffect(() => {
    const unlisten = listen<Theme>("theme-changed", (event) => {
      // OS changed → update local settings state directly
      setSettings((prev) => (prev ? { ...prev, theme: event.payload } : prev));
    });
    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        saveSettings,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useSettings must be used within <SettingsProvider>");
  return ctx;
}
