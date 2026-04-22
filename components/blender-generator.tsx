"use client"

import { useState } from "react"
import { BlenderModel } from "./blender-model"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Sparkles, Box, Send, Loader2, WandSparkles } from "lucide-react"

const suggestions = [
  "A premium ergonomic office chair with chrome legs",
  "A low-poly cyberpunk motorcycle with neon accents",
  "A modern coffee machine with brushed aluminum finish",
]

export function BlenderGenerator() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [glbPath, setGlbPath] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-3d", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (data.success) {
        setGlbPath(data.glbPath)
      } else {
        setError(data.message || data.error || "Generation failed")
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid w-full max-w-7xl gap-8 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-2">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Quality-First Generator
          </div>
          <div className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Low-Poly Mesh (Quad-First)
          </div>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-foreground lg:text-4xl">
            Generate Clean 3D Assets with Blender + Groq
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground lg:text-base">
            Enter a detailed prompt to create polished models with smarter retry and repair flow for cleaner `.glb` output.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-[0_30px_90px_-45px_rgba(12,35,70,.6)]">
          <div className="relative">
            <Input
              placeholder="Describe your model with materials, style, and details"
              className="h-14 border-border/60 bg-background/70 pr-12 text-sm"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              disabled={loading}
            />
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <Box className="h-5 w-5 text-muted-foreground/60" />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="mt-4 h-12 w-full rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating model script...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Create 3D Object
              </>
            )}
          </Button>

          {error && (
            <div className="mt-4 rounded-xl border border-red-300/35 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <WandSparkles className="h-4 w-4" />
            Prompt Ideas
          </p>
          <div className="grid gap-2">
            {suggestions.map((example) => (
              <button
                key={example}
                onClick={() => setPrompt(example)}
                className="rounded-xl border border-border/60 bg-card/70 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="aspect-square min-h-[420px] lg:col-span-3 lg:min-h-[640px]">
        <BlenderModel glbPath={glbPath} />
      </div>
    </div>
  )
}
