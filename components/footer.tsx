import Link from "next/link"
import { Cuboid } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/60 px-5 py-12 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-background/80">
              <Cuboid className="h-4 w-4 text-primary" />
            </div>
            <p className="text-base font-semibold text-foreground">Mesh Atelier</p>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            AI-assisted 3D generation with polished output quality and creator-first workflow.
          </p>
        </div>

        <div className="flex flex-wrap gap-5 text-sm">
          <Link href="/generate" className="text-muted-foreground transition-colors hover:text-foreground">
            Generate
          </Link>
          <Link href="/gallery" className="text-muted-foreground transition-colors hover:text-foreground">
            Gallery
          </Link>
          <Link href="/about" className="text-muted-foreground transition-colors hover:text-foreground">
            About
          </Link>
        </div>
      </div>
    </footer>
  )
}
