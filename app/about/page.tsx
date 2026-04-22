import { Cpu, ShieldCheck, Workflow } from "lucide-react"

const points = [
  {
    title: "Prompt-to-Blender Pipeline",
    description: "Your prompt becomes Blender Python code that is validated before execution.",
    icon: Cpu,
  },
  {
    title: "Automatic Script Recovery",
    description: "If Blender fails, the system repairs the script using runtime error feedback.",
    icon: Workflow,
  },
  {
    title: "Quality-Oriented Output",
    description: "The model is guided to generate smoother geometry, better materials, and clean export.",
    icon: ShieldCheck,
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen px-5 pb-16 pt-10 lg:px-8 lg:pt-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">About</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">How Mesh Atelier Works</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            A premium UX is only useful if the generated assets are reliable. This platform combines model guidance,
            runtime checks, and Blender automation to produce cleaner outputs.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {points.map((point) => (
            <article key={point.title} className="rounded-3xl border border-border/60 bg-card/70 p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-border/70 bg-background/80">
                <point.icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{point.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.description}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
