import type { Theme } from "@/entities/settings.model";
import { createContext, useContext, useEffect } from "react";
import { useSettings } from "./settings.provider";

interface ThemeContextType {
  currentTheme: Theme | undefined;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { settings, saveSettings } = useSettings();
  const currentTheme = settings?.theme;
  const toggleTheme = () => {
    const newTheme = currentTheme?.toLowerCase() === "light" ? "dark" : "light";
    saveSettings({ theme: newTheme });
  };

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      currentTheme?.toLowerCase() === "dark",
    );
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, toggleTheme }}>
      <div className={currentTheme}>{children}</div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
