interface TopAppBarProps {
  name?: string
  subtitle?: string
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

/** Fixed top bar (PRD §9.5): avatar + name/subtitle + notifications bell. */
export default function TopAppBar({ name, subtitle }: TopAppBarProps) {
  return (
    <header className="flex justify-between items-center px-lg py-sm w-full bg-canvas fixed top-0 z-50 border-b border-hairline">
      <div className="flex items-center gap-md">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary-container flex items-center justify-center border border-hairline">
          {name ? (
            <span className="font-label-mono text-[13px] font-bold text-on-secondary-container">
              {initials(name)}
            </span>
          ) : (
            <span className="material-symbols-outlined text-muted">person</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-headline-md text-[16px] font-bold text-primary leading-tight">
            {name ?? "—"}
          </span>
          <span className="font-caption text-caption text-muted">
            {subtitle ?? ""}
          </span>
        </div>
      </div>
      <button
        aria-label="Notifications"
        className="material-symbols-outlined text-primary hover:opacity-80 transition-opacity p-xs"
      >
        notifications
      </button>
    </header>
  )
}
