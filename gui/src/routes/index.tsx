import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import HostEntries from "@/pages/host-entries";
import Settings from "@/pages/settings";

interface AppRoutesProps {
  layout: React.ComponentType<{ children: React.ReactNode }>;
}

export function AppRoutes({ layout: Layout }: AppRoutesProps) {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/host-entries" replace />} />
          <Route path="/host-entries" element={<HostEntries />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
