interface MetricPillProps {
  children: React.ReactNode
}

/** Small stat pill used across insight cards (PRD §9.6). */
export default function MetricPill({ children }: MetricPillProps) {
  return (
    <span className="inline-flex items-center font-label-mono text-caption text-on-surface-variant bg-surface-container rounded-full px-md py-xs">
      {children}
    </span>
  )
}
