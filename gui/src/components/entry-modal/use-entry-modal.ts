import { useEntries } from "@/providers/entries.provider";
import { useEffect, useState } from "react";

export function useEntryModal() {
  const { modal, closeModal } = useEntries();

  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const isOpen = modal.mode !== "closed";
  const isEdit = modal.mode === "edit";

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      const raf = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setIsVisible(false);
      const t = setTimeout(() => setIsMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Escape key closes the modal
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeModal]);

  return {
    isEdit,
    isMounted,
    isVisible,
    closeModal,
  };
}
