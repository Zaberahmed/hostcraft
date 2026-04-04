export function isBetaVersion(version: string | undefined): boolean {
  if (!version) return false;
  return version?.split(".")[0] === "0";
}
