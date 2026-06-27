"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavTab {
  href: string
  label: string
  icon: string // Material Symbols Outlined name (PRD §9.7)
}

const TABS: NavTab[] = [
  { href: "/teen", label: "Home", icon: "home" },
  { href: "/insights", label: "Insights", icon: "insights" },
  { href: "/activity", label: "Activity", icon: "receipt_long" },
  { href: "/ingest", label: "Parse", icon: "data_object" },
  { href: "/debugger", label: "Engine", icon: "memory" },
  { href: "/parent", label: "Parent", icon: "person" },
]

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * App shell: renders page content with the persistent bottom navigation
 * (PRD §9.5). Bottom nav stays fixed, all four tabs always visible.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? ""

  return (
    <div className="min-h-screen bg-canvas">
      {/* Pad content so the fixed nav never overlaps it */}
      <main className="pb-[72px]">{children}</main>

      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center bg-canvas py-md px-xs border-t border-hairline">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex-1 flex flex-col items-center justify-center py-xs transition-all duration-200 active:scale-90 ${
                active ? "text-primary" : "text-muted"
              }`}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {tab.icon}
              </span>
              <span className="font-caption text-[10px] mt-xxs whitespace-nowrap">
                {tab.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
