"use client"

import Link from "next/link"
import { ArrowRight, Sparkles, GalleryHorizontalEnd, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Premium AI 3D Studio
          </div>

          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Craft Clean, Polished 3D Models From a Simple Prompt
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Mesh Atelier turns text into production-ready Blender scenes with a premium workflow,
            faster generation retries, and better geometry quality controls.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-6">
              <Link href="/generate">
                Open Generator
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-6">
              <Link href="/gallery">
                View Gallery
                <GalleryHorizontalEnd className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative rounded-[2rem] border border-border/60 bg-card/80 p-6 shadow-[0_35px_100px_-45px_rgba(12,35,70,0.45)]">
          <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
          <div className="absolute -bottom-8 -left-6 h-24 w-24 rounded-full bg-accent/20 blur-2xl" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Generation Speed</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">&lt; 30s</p>
              <p className="mt-1 text-sm text-muted-foreground">Average first draft script</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Quality Safeguards</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">2x</p>
              <p className="mt-1 text-sm text-muted-foreground">Auto repair and retry passes</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/70 p-5 sm:col-span-2">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Runtime-Validated Scripts</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Generated code is checked before Blender execution to minimize failures and improve output consistency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
