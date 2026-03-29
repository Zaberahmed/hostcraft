import "./App.css";
import Layout from "@/components/layout";
import { EntriesProvider } from "@/providers/entries.provider";
import { ThemeProvider } from "@/providers/theme.provider";
import { AppRoutes } from "@/routes";

function App() {
  return (
    <ThemeProvider>
      <EntriesProvider>
        <AppRoutes layout={Layout} />
      </EntriesProvider>
    </ThemeProvider>
  );
}

export default App;
