import { useAppVersion } from "@/hooks/use-app-version";
import { isBetaVersion } from "@/utils/app-version";

export function Footer() {
  const version = useAppVersion();
  const isBeta = isBetaVersion(version);
  return (
    <footer className="px-6 py-2 flex flex-col md:flex-row justify-between items-center gap-4 text-outline-variant text-xs">
      <p>© 2026 Hostcraft GUI. All technical rights reserved.</p>
      <div className="flex gap-6">
        <a
          href="https://github.com/Zaberahmed/hostcraft/tree/main/gui"
          className="hover:text-primary transition-colors"
        >
          Source Code
        </a>
        <a
          href="https://github.com/Zaberahmed/hostcraft/tree/main/gui"
          className="hover:text-primary transition-colors lowercase"
        >
          {`v${version}${isBeta ? "-beta" : "stable"}`}
        </a>
      </div>
    </footer>
  );
}
