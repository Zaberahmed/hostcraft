import "./App.css";
import Layout from "@/components/layout";
import {
  EntriesProvider,
  SettingsProvider,
  ThemeProvider,
  ToastProvider,
} from "@/providers";
import { AppRoutes } from "./routes";

function App() {
  return (
    <EntriesProvider>
      <SettingsProvider>
        <ThemeProvider>
          <ToastProvider />
          <AppRoutes layout={Layout} />
        </ThemeProvider>
      </SettingsProvider>
    </EntriesProvider>
  );
}

export default App;
