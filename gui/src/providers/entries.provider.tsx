import type { HostEntry } from "@/entities/host.model";
import { useTauriCommands } from "@/hooks/use-tauri-commands";
import { transformResponse } from "@/utils/entries";
import { showErrorToast } from "@/utils/error";
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
  refetchEntries: () => void;
}

const EntriesContext = createContext<EntriesContextValue | null>(null);

export function EntriesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<HostEntry[]>([]);
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [cacheBuster, setCacheBuster] = useState<refetchKeys>({
    entries: new Date(),
  });

  const { get_entries, add_entry, edit_entry, toggle_entry, delete_entry } =
    useTauriCommands();

  const openAddModal = useCallback(() => setModal({ mode: "add" }), []);
  const openEditModal = useCallback(
    (entry: HostEntry) => setModal({ mode: "edit", entry }),
    [],
  );
  const closeModal = useCallback(() => setModal({ mode: "closed" }), []);

  // ── Entry CRUD ──────────────────────────────────────────────────────────────

  const fetchEntries = async () => {
    try {
      const result = await get_entries();
      setEntries(() => transformResponse(result));
    } catch (error) {
      toast.error("Error while loading host entries");
      setEntries([]);
    }
  };

  const refetchEntries = useCallback(() => {
    setCacheBuster({ entries: new Date() });
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [cacheBuster]);

  const addEntry = useCallback(
    async (ip: string, name: string) => {
      try {
        await add_entry(ip, name);
        toast.success("Entry added successfully");
        refetchEntries();
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
        await edit_entry(id, ip, name);
        toast.success("Entry edited successfully");
        refetchEntries();
        closeModal();
      } catch (error) {
        showErrorToast(error, "Editing");
      }
    },
    [closeModal],
  );

  const toggleEntry = useCallback(async (name: string) => {
    try {
      await toggle_entry(name);
      toast.success("Entry toggled successfully");
      refetchEntries();
    } catch (error) {
      showErrorToast(error, "Toggling");
    }
  }, []);

  const deleteEntry = useCallback(async (name: string) => {
    try {
      await delete_entry(name);
      toast.success("Entry deleted successfully");
      refetchEntries();
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
        refetchEntries,
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
