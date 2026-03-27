import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-svh w-full overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-surface custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
