import type {
  AppSettings,
  DnsValidationResult,
  Theme,
} from "@/entities/settings.model";
import { useTauriCommands } from "@/hooks/use-tauri-commands";
import { listen } from "@tauri-apps/api/event";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

interface refetchKeys {
  settings: Date;
}

interface SettingsContextValue {
  settings: AppSettings | null;
  saveSettings: (setting: Partial<AppSettings>) => void;
  resetSettings: () => void;
  flushDNSCache: () => void;
  openHostsFileExternally: () => void;
  validateDns: (
    hostname: string,
    ip: string,
  ) => Promise<DnsValidationResult | undefined>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [cacheBuster, setCacheBuster] = useState<refetchKeys>({
    settings: new Date(),
  });

  const {
    get_settings,
    save_settings,
    reset_settings,
    flush_dns_cache,
    open_hosts_file_externally,
    validate_dns,
  } = useTauriCommands();

  const fetchSettings = async () => {
    try {
      const result = await get_settings();
      console.log("settings", result);
      setSettings(result);
    } catch (error) {
      toast.error("Error while loading settings");
    }
  };

  const refetchSettings = async () => {
    setCacheBuster({ settings: new Date() });
  };

  useEffect(() => {
    fetchSettings();
  }, [cacheBuster]);

  const saveSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      await save_settings({ ...settings, ...newSettings });
      refetchSettings();
    } catch (error) {
      toast.error("Error while saving settings");
    }
  };
  const resetSettings = async () => {
    try {
      await reset_settings();
      refetchSettings();
    } catch (error) {
      toast.error("Error while resetting settings");
    }
  };
  const flushDNSCache = async () => {
    try {
      await flush_dns_cache();
      toast.success("DNS cache flushed successfully");
    } catch (error) {
      toast.error("Error while flushing DNS cache");
    }
  };

  const openHostsFileExternally = async () => {
    try {
      await open_hosts_file_externally();
    } catch (error) {
      toast.error("Error while opening hosts file");
    }
  };

  const validateDns = async (hostname: string, ip: string) => {
    try {
      return await validate_dns(hostname, ip);
    } catch (error) {
      toast.error("Error while validating DNS");
    }
  };

  useEffect(() => {
    const unlisten = listen<Theme>("theme-changed", (event) => {
      // OS theme changed → update local settings state directly
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
        flushDNSCache,
        openHostsFileExternally,
        validateDns,
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
