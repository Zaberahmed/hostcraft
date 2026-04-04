import { Footer } from "./footer";
import { SidebarHeader } from "./header";
import { Navigation } from "./navigation";

export function Sidebar() {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-surface-container-low overflow-y-auto">
      <SidebarHeader />
      <Navigation />
      <Footer />
    </aside>
  );
}
