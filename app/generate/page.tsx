import { BlenderGenerator } from "@/components/blender-generator"

export default function GeneratePage() {
  return (
    <div className="min-h-screen px-5 pb-16 pt-10 lg:px-8 lg:pt-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Studio</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">Generate</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Build polished assets from plain text prompts. The pipeline validates scripts, runs Blender,
            and retries fixes on errors automatically.
          </p>
        </div>
        <BlenderGenerator />
      </div>
    </div>
  )
}
