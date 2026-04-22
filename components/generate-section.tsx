import Link from "next/link"
import { ArrowUpRight, Camera, Layers3, WandSparkles } from "lucide-react"

const sections = [
  {
    href: "/generate",
    title: "Generate",
    icon: WandSparkles,
    description: "Prompt-to-GLB workflow with live preview and retry-safe generation.",
  },
  {
    href: "/gallery",
    title: "Gallery",
    icon: Camera,
    description: "Explore curated examples of furniture, props, and product concepts.",
  },
  {
    href: "/about",
    title: "About",
    icon: Layers3,
    description: "Learn how quality checks and Blender automation power the platform.",
  },
]

export function GenerateSection() {
  return (
    <section className="px-5 py-6 pb-20 lg:px-8 lg:pb-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Explore</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Studio Sections</h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-3xl border border-border/60 bg-card/70 p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-primary/40"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-border/70 bg-background/80">
                <section.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="flex items-center justify-between text-xl font-semibold text-foreground">
                {section.title}
                <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{section.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
