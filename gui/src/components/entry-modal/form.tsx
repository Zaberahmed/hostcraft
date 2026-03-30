import { cn } from "@/lib/utils";
import { Field } from "@/components/ui/field";
import { useEffect, useState } from "react";
import { isValidIPv4, isValidHostname } from "@/utils/entries";
import { useEntries } from "@/providers/entries.provider";

export function EntryForm() {
  const { modal, closeModal, addEntry, editEntry } = useEntries();
  const [ip, setIp] = useState("");
  const [hostname, setHostname] = useState("");
  const [errors, setErrors] = useState({ ip: "", hostname: "" });

  const isEdit = modal.mode === "edit";

  function validate(): boolean {
    const tempEntry = { ip: "", hostname: "" };
    let valid = true;

    if (!isValidIPv4(ip)) {
      tempEntry.ip = "Enter a valid IPv4 address (e.g. 192.168.1.1)";
      valid = false;
    }
    if (!isValidHostname(hostname)) {
      tempEntry.hostname = "Enter a valid hostname (e.g. dev.local)";
      valid = false;
    }

    setErrors(tempEntry);
    return valid;
  }

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit) {
      editEntry(modal.entry.id, ip.trim(), hostname.trim());
    } else {
      addEntry(ip.trim(), hostname.trim());
    }
  }

  // Clear individual field errors as the user types corrections
  function handleIpChange(v: string) {
    setIp(v);
    if (errors.ip) setErrors((prev) => ({ ...prev, ip: "" }));
  }

  function handleHostnameChange(v: string) {
    setHostname(v);
    if (errors.hostname) setErrors((prev) => ({ ...prev, hostname: "" }));
  }

  // Populate or reset fields whenever the modal mode / target entry changes
  useEffect(() => {
    if (isEdit) {
      setIp(modal.entry.ip);
      setHostname(modal.entry.hostname);
    } else if (modal.mode === "add") {
      setIp("");
      setHostname("");
    }
    setErrors({ ip: "", hostname: "" });
  }, [modal]);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="px-6 pt-5 pb-4 flex flex-col gap-5">
        <Field
          id="entry-ip"
          label="IP Address"
          value={ip}
          onChange={handleIpChange}
          placeholder="192.168.1.1"
          error={errors.ip}
          fontClass="fontLabel"
        />

        <Field
          id="entry-hostname"
          label="Hostname"
          value={hostname}
          onChange={handleHostnameChange}
          placeholder="dev.local"
          error={errors.hostname}
          fontClass="fontBody"
        />
      </div>

      <div className="flex items-center justify-end gap-2 px-6 pb-6 pt-1">
        <button
          type="button"
          onClick={closeModal}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-semibold",
            "text-primary hover:bg-primary-container/30",
            "transition-colors duration-150",
          )}
        >
          Cancel
        </button>

        <button
          type="submit"
          className={cn(
            "flex items-center gap-2 px-5 py-2 rounded-lg",
            "text-sm font-semibold text-on-primary",
            "bg-linear-to-r from-primary to-primary-dim",
            "shadow-md shadow-primary/20",
            "hover:brightness-105 active:scale-[0.98]",
            "transition-all duration-150",
          )}
        >
          {isEdit ? "Save Changes" : "Add Entry"}
        </button>
      </div>
    </form>
  );
}
