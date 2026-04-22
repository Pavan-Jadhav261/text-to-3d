"use client"

export function BlenderModel({ glbPath }: { glbPath: string | null }) {
  if (!glbPath) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-border/50 bg-card/40">
        <p className="text-sm italic text-muted-foreground">Generated 3D model preview appears here</p>
      </div>
    )
  }

  const modelUrl = `${glbPath}?t=${Date.now()}`
  const viewerUrl = `/viewer.html?model=${encodeURIComponent(modelUrl)}`

  return (
    <div className="group relative h-full w-full overflow-hidden rounded-2xl border border-border/50 bg-card/60">
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-border/50 bg-background/85 px-3 py-1.5 backdrop-blur-md">
        <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
        <span className="text-xs font-medium uppercase tracking-wider text-cyan-400">Live Preview</span>
      </div>

      <iframe
        src={viewerUrl}
        className="h-full w-full border-0"
        allow="camera; microphone; fullscreen; accelerometer; gyroscope; magnetometer"
      />

      <div className="pointer-events-none absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
        <p className="rounded bg-background/70 px-2 py-1 text-[10px] text-muted-foreground">
          Drag to rotate | Scroll to zoom
        </p>
      </div>
    </div>
  )
}
