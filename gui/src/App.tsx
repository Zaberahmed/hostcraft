import "./App.css";
import Layout from "@/components/layout";
import { EntriesProvider } from "@/providers/entries.provider";
import { ThemeProvider } from "@/providers/theme.provider";
import { AppRoutes } from "@/routes";
import { ToastProvider } from "./providers/toast.provider";

function App() {
  return (
    <ThemeProvider>
      <EntriesProvider>
        <ToastProvider />
        <AppRoutes layout={Layout} />
      </EntriesProvider>
    </ThemeProvider>
  );
}

export default App;
