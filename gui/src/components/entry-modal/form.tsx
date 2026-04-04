import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useEntries } from "@/providers/entries.provider";
import { useEffect, useState } from "react";
import type { FormData } from "./types";
import { isUnChanged, validate } from "./utils";

export function EntryForm() {
  const { modal, closeModal, addEntry, editEntry } = useEntries();
  const isEdit = modal.mode === "edit";

  const [formData, setFormData] = useState<FormData>({ ip: "", hostname: "" });
  const [errors, setErrors] = useState<FormData>({ ip: "", hostname: "" });
  const [isDisabled, setIsDisabled] = useState(() => isEdit);

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    const isValid = validate({
      formData,
      setErrroCallback: (e) => setErrors(e),
    });

    if (!isValid) return;

    if (isEdit) {
      editEntry(modal.entry.id, formData.ip.trim(), formData.hostname.trim());
    } else {
      addEntry(formData.ip.trim(), formData.hostname.trim());
    }
  }

  // Clear individual field errors as the user types corrections
  function handleIpChange(v: string) {
    setFormData((prev) => ({ ...prev, ip: v }));
    if (errors.ip) setErrors((prev) => ({ ...prev, ip: "" }));
  }

  function handleHostnameChange(v: string) {
    setFormData((prev) => ({ ...prev, hostname: v }));
    if (errors.hostname) setErrors((prev) => ({ ...prev, hostname: "" }));
  }

  // Populate or reset fields whenever the modal mode / target entry changes
  useEffect(() => {
    if (isEdit) {
      setFormData({
        ip: modal.entry.ip,
        hostname: modal.entry.hostname,
      });
    } else if (modal.mode === "add") {
      setFormData({ ip: "", hostname: "" });
    }
    setErrors({ ip: "", hostname: "" });
  }, [modal]);

  // Disable the submit button if the form data matches the entry being edited
  useEffect(() => {
    if (isEdit) {
      if (isUnChanged(modal.entry, formData)) {
        setIsDisabled(true);
      } else {
        setIsDisabled(false);
      }
    }
  }, [formData]);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="px-6 pt-5 pb-4 flex flex-col gap-5">
        <Field
          id="entry-ip"
          label="IP Address"
          value={formData.ip}
          onChange={handleIpChange}
          placeholder="192.168.1.1"
          error={errors.ip}
          fontClass="fontLabel"
        />

        <Field
          id="entry-hostname"
          label="Hostname"
          value={formData.hostname}
          onChange={handleHostnameChange}
          placeholder="dev.local"
          error={errors.hostname}
          fontClass="fontBody"
        />
      </div>

      <div className="flex items-center justify-end gap-2 px-6 pb-6 pt-1">
        {/* Cancel */}
        <Button type="button" variant="subtle" onClick={closeModal}>
          Cancel
        </Button>

        {/* Save / Add */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          shadow="md"
          disabled={isDisabled}
        >
          {isEdit ? "Save Changes" : "Add Entry"}
        </Button>
      </div>
    </form>
  );
}
