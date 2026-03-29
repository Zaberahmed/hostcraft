export function Header() {
  return (
    <div className="flex justify-between items-center mb-10">
      {/* File status chip */}
      <div className="bg-surface-container-low px-4 py-2 rounded-lg flex items-center gap-3 ghost-border">
        <span className="text-xs text-on-surface-variant font-medium">
          File Status
        </span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-bold text-on-surface">Operational</span>
        </div>
      </div>
    </div>
  );
}
