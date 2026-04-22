import { BadgeCheck, Cuboid, LampDesk, Rocket, Sofa } from "lucide-react"

const items = [
  { name: "Modern Sofa", category: "Furniture", icon: Sofa },
  { name: "Studio Lamp", category: "Product", icon: LampDesk },
  { name: "Sci-Fi Drone", category: "Hard Surface", icon: Rocket },
  { name: "Ceramic Vase", category: "Decor", icon: Cuboid },
]

export default function GalleryPage() {
  return (
    <div className="min-h-screen px-5 pb-16 pt-10 lg:px-8 lg:pt-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Portfolio</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">Gallery</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Sample directions your prompts can produce. Each concept is optimized for clean topology and polished export.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <article key={item.name} className="rounded-3xl border border-border/60 bg-card/70 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/70 bg-background/80">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="rounded-full border border-border/70 bg-background/75 px-3 py-1 text-xs text-muted-foreground">
                  {item.category}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-foreground">{item.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">Polished materials, clean normals, and production-style shape language.</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                <BadgeCheck className="h-3.5 w-3.5" />
                Quality Ready
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
