import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { AccentColor, HostEntry } from "@/entities/host.model";

export type ModalState =
  | { mode: "closed" }
  | { mode: "add" }
  | { mode: "edit"; entry: HostEntry };

interface EntriesContextValue {
  entries: HostEntry[];
  modal: ModalState;
  openAddModal: () => void;
  openEditModal: (entry: HostEntry) => void;
  closeModal: () => void;
  addEntry: (ip: string, hostname: string) => void;
  editEntry: (id: string, ip: string, hostname: string) => void;
  duplicateEntry: (entry: HostEntry) => void;
  toggleEntry: (id: string, enabled: boolean) => void;
  deleteEntry: (id: string) => void;
}

const ACCENT_COLORS: AccentColor[] = [
  "primary",
  "tertiary",
  "secondary",
  "outline-variant",
];

// ── Mock data — swap the body of each function for invoke() when ready ────────

const INITIAL_ENTRIES: HostEntry[] = [
  {
    id: "1",
    ip: "192.168.1.104",
    hostname: "dev-server-alpha.local",
    enabled: true,
    accent: "primary",
  },
  {
    id: "2",
    ip: "10.0.0.45",
    hostname: "staging-db.internal",
    enabled: true,
    accent: "tertiary",
  },
  {
    id: "3",
    ip: "172.16.254.1",
    hostname: "legacy-gateway-node",
    enabled: false,
    accent: "outline-variant",
  },
  {
    id: "4",
    ip: "127.0.0.1",
    hostname: "localhost.dev.env",
    enabled: true,
    accent: "secondary",
  },
];

const EntriesContext = createContext<EntriesContextValue | null>(null);

export function EntriesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<HostEntry[]>(INITIAL_ENTRIES);
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });

  const openAddModal = useCallback(() => setModal({ mode: "add" }), []);

  const openEditModal = useCallback(
    (entry: HostEntry) => setModal({ mode: "edit", entry }),
    [],
  );

  const closeModal = useCallback(() => setModal({ mode: "closed" }), []);

  // ── Entry CRUD ──────────────────────────────────────────────────────────────

  // Each function is the migration seam: replace its body with an invoke() call
  // and a subsequent setEntries() when Tauri commands are ready.

  const addEntry = useCallback(
    (ip: string, hostname: string) => {
      // Future: const updated = await invoke<HostEntry[]>("add_entry", { ip, hostname });
      //         setEntries(updated);
      const accent = ACCENT_COLORS[entries.length % ACCENT_COLORS.length];
      const newEntry: HostEntry = {
        id: crypto.randomUUID(),
        ip,
        hostname,
        enabled: true,
        accent,
      };
      setEntries((prev) => [newEntry, ...prev]);
      closeModal();
    },
    [entries.length, closeModal],
  );

  const editEntry = useCallback(
    (id: string, ip: string, hostname: string) => {
      // Future: const updated = await invoke<HostEntry[]>("edit_entry", { id, ip, hostname });
      //         setEntries(updated);
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ip, hostname } : e)),
      );
      closeModal();
    },
    [closeModal],
  );

  const duplicateEntry = useCallback(
    (entry: HostEntry) => {
      // Future: const updated = await invoke<HostEntry[]>("duplicate_entry", { id: entry.id });
      //         setEntries(updated);
      const accent = ACCENT_COLORS[entries.length % ACCENT_COLORS.length];
      const duplicate: HostEntry = {
        ...entry,
        id: crypto.randomUUID(),
        accent,
      };
      setEntries((prev) => [duplicate, ...prev]);
    },
    [entries.length],
  );

  const toggleEntry = useCallback((id: string, enabled: boolean) => {
    // Future: const updated = await invoke<HostEntry[]>("toggle_entry", { id, enabled });
    //         setEntries(updated);
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, enabled } : e)),
    );
  }, []);

  const deleteEntry = useCallback((id: string) => {
    // Future: await invoke("delete_entry", { id });
    //         setEntries((prev) => prev.filter((e) => e.id !== id));
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <EntriesContext.Provider
      value={{
        entries,
        modal,
        openAddModal,
        openEditModal,
        closeModal,
        addEntry,
        editEntry,
        duplicateEntry,
        toggleEntry,
        deleteEntry,
      }}
    >
      {children}
    </EntriesContext.Provider>
  );
}

export function useEntries(): EntriesContextValue {
  const ctx = useContext(EntriesContext);
  if (!ctx) throw new Error("useEntries must be used within <EntriesProvider>");
  return ctx;
}
