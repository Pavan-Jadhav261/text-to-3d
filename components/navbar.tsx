"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, Cuboid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/generate", label: "Generate" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/75 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card shadow-[0_10px_30px_-15px_rgba(16,24,40,.8)]">
            <Cuboid className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Mesh Atelier
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button asChild className="rounded-full px-5">
            <Link href="/generate">Launch Studio</Link>
          </Button>
        </div>

        <button
          className="rounded-md p-1 text-foreground md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border/50 bg-background/95 p-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm ${
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between rounded-lg border border-border/60 bg-card/70 px-3 py-2">
              <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <Button asChild className="mt-2 w-full rounded-lg">
              <Link href="/generate" onClick={() => setMobileOpen(false)}>
                Launch Studio
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
