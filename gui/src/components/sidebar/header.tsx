import { badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { APP_SUBTITLE, APP_TITLE } from "@/constants/app.constant";
import { useAppVersion } from "@/hooks/use-app-version";
import { cn } from "@/lib/utils";
import { isBetaVersion } from "@/utils/app-version";
import { ServerStack01Icon } from "@hugeicons/core-free-icons";

export function SidebarHeader() {
  const version = useAppVersion();
  const isBeta = isBetaVersion(version);
  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-8">
      <div className="flex items-center gap-3">
        {/* Gradient icon badge */}
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-primary-dim flex items-center justify-center shadow-sm shrink-0">
          <Icon
            icon={ServerStack01Icon}
            size={20}
            className="text-on-primary"
          />
        </div>

        <div>
          <div className="flex gap-2 align-items-end">
            <h1 className="text-xl font-bold tracking-tighter text-on-surface font-headline leading-none">
              {APP_TITLE}
            </h1>
            {version && (
              <span className={cn(badge({ isBeta }))}>
                {isBeta ? "Beta" : `v${version}`}
              </span>
            )}
          </div>

          <p className="text-[12px] tracking-[0.05em] text-on-surface-variant font-label mt-0.5">
            {APP_SUBTITLE}
          </p>
        </div>
      </div>
    </div>
  );
}
