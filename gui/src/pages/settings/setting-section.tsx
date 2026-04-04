import { Icon } from "@/components/ui/icon";
import { ResetIndicator } from "@/components/ui/reset";

interface SettingSectionProps {
  icon: React.ComponentProps<typeof Icon>["icon"];
  title: string;
  children: React.ReactNode;
  isResettable?: boolean;
}

export function SettingSection({
  icon,
  title,
  children,
  isResettable = false,
}: SettingSectionProps) {
  return (
    <div className="bg-surface-container-low rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4">
        <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
          <div className="relative inline-flex">
            <Icon
              icon={icon}
              className="text-on-primary-container"
              strokeWidth={2}
            />
            {isResettable && <ResetIndicator className="-top-1.5 -right-1.5" />}
          </div>
        </div>
        <h3 className="font-headline text-base font-bold text-on-surface">
          {title}
        </h3>
      </div>

      <div className="px-6 pb-2">
        <div className="bg-surface-container-highest/40 rounded-xl px-4 divide-y-0">
          {children}
        </div>
      </div>

      <div className="pb-4" />
    </div>
  );
}
