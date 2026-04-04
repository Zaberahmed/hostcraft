import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useEntries, useSettings } from "@/providers";
import { useEffect, useState } from "react";
import { isUnChanged, validate } from "./utils";
import { confirm } from "@tauri-apps/plugin-dialog";
import type { FormData } from "./types";

export function EntryForm() {
  const { modal, closeModal, addEntry, editEntry } = useEntries();
  const { settings, validateDns } = useSettings();
  const isEdit = modal.mode === "edit";

  const [formData, setFormData] = useState<FormData>({ ip: "", hostname: "" });
  const [errors, setErrors] = useState<FormData>({ ip: "", hostname: "" });
  const [isDisabled, setIsDisabled] = useState(() => isEdit);

  const formValidation = () => {
    return validate({
      formData,
      setErrroCallback: (e) => setErrors(e),
    });
  };

  const dnsValidation = async (hostname: string, ip: string) => {
    if (settings?.dns_validation) {
      const res = await validateDns(hostname, ip);

      if (res?.lookup_failed) {
        const ok = await confirm(
          "DNS lookup failed — hostname could not be resolved.\nSave anyway?",
          { kind: "warning", title: "DNS Lookup Failed" },
        );
        if (!ok) return false;
      }

      if (res?.conflict) {
        const ok = await confirm(
          `DNS mismatch detected.\n\nCurrent DNS resolves to: ${res?.resolved_ips.join(", ")}\nYou entered: ${ip}\n\nSave anyway?`,
          { kind: "warning", title: "DNS Mismatch", okLabel: "Save anyway" },
        );
        if (!ok) return false;
      }
    }
    return true;
  };

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    const ip = formData.ip.trim();
    const hostname = formData.hostname.trim();

    if (!formValidation()) return;
    if (!(await dnsValidation(hostname, ip))) return;

    if (isEdit) {
      editEntry(modal.entry.id, ip, hostname);
    } else {
      addEntry(ip, hostname);
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
