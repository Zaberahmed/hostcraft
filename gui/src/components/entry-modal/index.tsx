import { Modal } from "@/components/ui/modal";
import { EntryForm } from "./form";
import { useEntryModal } from "./use-entry-modal";

export function EntryModal() {
  const { isEdit, isMounted, isVisible, closeModal } = useEntryModal();

  if (!isMounted) return null;

  return (
    <Modal
      isVisible={isVisible}
      onClose={closeModal}
      title={isEdit ? "Edit Host Entry" : "Add Host Entry"}
    >
      <EntryForm />
    </Modal>
  );
}
