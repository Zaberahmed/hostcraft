import { isValidIPv4, isValidHostname } from "@/utils/entries";
import type { FormData } from "./types";

export function isUnChanged(prevData: FormData, newData: FormData) {
  return prevData.ip === newData.ip && prevData.hostname === newData.hostname;
}
export function validate({
  formData,
  setErrroCallback,
}: {
  formData: FormData;
  setErrroCallback: (errorData: FormData) => void;
}): boolean {
  const tempEntry = { ip: "", hostname: "" };
  let valid = true;

  if (!isValidIPv4(formData.ip)) {
    tempEntry.ip = "Enter a valid IPv4 address (e.g. 192.168.1.1)";
    valid = false;
  }
  if (!isValidHostname(formData.hostname)) {
    tempEntry.hostname = "Enter a valid hostname (e.g. dev.local)";
    valid = false;
  }

  setErrroCallback(tempEntry);
  return valid;
}
