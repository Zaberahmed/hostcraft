import { toast } from "sonner";

type OperationVerbs = "Adding" | "Editing" | "Deleting" | "Toggling";

export function showErrorToast(error: unknown, verb: OperationVerbs) {
  if (error === "Authorisation cancelled") {
    toast.info("Changes cancelled");
  } else {
    toast.error(`Error while ${verb.toLowerCase()} entry: ${error}`);
  }
}
