import type {
  AccentColor,
  BaseHostEntry,
  HostEntry,
} from "@/entities/host.model";
import { showErrorToast } from "@/utils/error";
import { invoke } from "@tauri-apps/api/core";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

export type ModalState =
  | { mode: "closed" }
  | { mode: "add" }
  | { mode: "edit"; entry: HostEntry };

export type refetchKeys = {
  entries: Date;
};

interface EntriesContextValue {
  entries: HostEntry[];
  modal: ModalState;
  openAddModal: () => void;
  openEditModal: (entry: HostEntry) => void;
  closeModal: () => void;
  addEntry: (ip: string, name: string) => void;
  editEntry: (id: string, ip: string, name: string) => void;
  toggleEntry: (name: string) => void;
  deleteEntry: (name: string) => void;
}

const ACCENT_COLORS: AccentColor[] = [
  "primary",
  "tertiary",
  "secondary",
  "outline-variant",
];

const EntriesContext = createContext<EntriesContextValue | null>(null);

export function EntriesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<HostEntry[]>([]);
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [cacheBuster, setCacheBuster] = useState<refetchKeys>({
    entries: new Date(),
  });

  const openAddModal = useCallback(() => setModal({ mode: "add" }), []);
  const openEditModal = useCallback(
    (entry: HostEntry) => setModal({ mode: "edit", entry }),
    [],
  );
  const closeModal = useCallback(() => setModal({ mode: "closed" }), []);

  // ── Entry CRUD ──────────────────────────────────────────────────────────────

  const fetchEntries = async () => {
    try {
      const result = await invoke<BaseHostEntry[]>("get_entries");
      const modifiedResult = result.map((entry, index) => {
        const randomId = crypto.randomUUID();
        return {
          ...entry,
          id: randomId,
          hostname: entry.name,
          enabled: entry.status === "Active",
          accent: ACCENT_COLORS[index % ACCENT_COLORS.length],
        };
      });
      setEntries(modifiedResult);
    } catch (error) {
      toast.error("Error while loading host entries");
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [cacheBuster]);

  const addEntry = useCallback(
    async (ip: string, name: string) => {
      try {
        await invoke("add_entry", { ip, name });
        toast.success("Entry added successfully");
        setCacheBuster({ entries: new Date() });
        closeModal();
      } catch (error) {
        showErrorToast(error, "Adding");
      }
    },
    [closeModal],
  );
  const editEntry = useCallback(
    async (id: string, ip: string, name: string) => {
      const old_entry = entries.find((e) => e.id === id);
      if (!old_entry) {
        toast.error("Entry not found");
        return;
      }
      try {
        await invoke("edit_entry", {
          oldName: old_entry.hostname,
          newIp: ip,
          newName: name,
        });
        toast.success("Entry edited successfully");
        setCacheBuster({ entries: new Date() });
        closeModal();
      } catch (error) {
        showErrorToast(error, "Editing");
      }
    },
    [closeModal],
  );

  const toggleEntry = useCallback(async (name: string) => {
    try {
      await invoke("toggle_entry", { name });
      toast.success("Entry toggled successfully");
      setCacheBuster({ entries: new Date() });
    } catch (error) {
      showErrorToast(error, "Toggling");
    }
  }, []);

  const deleteEntry = useCallback(async (name: string) => {
    try {
      await invoke("remove_entry", { name });
      toast.success("Entry deleted successfully");
      setCacheBuster({ entries: new Date() });
    } catch (error) {
      showErrorToast(error, "Deleting");
    }
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
