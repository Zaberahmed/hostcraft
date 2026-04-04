import type { ResetSection, SectionTitles } from "@/hooks/use-settings-view";

export function isResettable(
  resetState: ResetSection[],
  title: SectionTitles,
): boolean {
  return !!resetState.find((section) => section.title === title)?.shouldReset;
}
