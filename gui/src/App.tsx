import "./App.css";
import { Routes, Route, Navigate, HashRouter } from "react-router-dom";
import Layout from "@/components/layout";
import HostEntries from "@/pages/host-entries";
import Settings from "@/pages/settings";
import { ThemeProvider } from "./providers/theme.provider";

function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/host-entries" replace />} />
            <Route path="/host-entries" element={<HostEntries />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
