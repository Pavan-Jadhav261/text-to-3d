"use client"

import { useState, useRef, type ChangeEvent, type DragEvent } from "react"
import { Upload, X, Sparkles, ImageIcon, Type, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PromptPanel() {
  const [prompt, setPrompt] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [imageName, setImageName] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageName(file.name)
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImage(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setImageName(file.name)
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImage(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function removeImage() {
    setImage(null)
    setImageName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function handleGenerate() {
    if (!prompt.trim()) return
    setIsGenerating(true)
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className="flex h-full flex-col gap-5">
      {/* Prompt input */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Type className="h-4 w-4 text-primary" />
          Describe your 3D model
        </label>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A futuristic spaceship with metallic hull, glowing blue thrusters, and intricate panel details..."
            className="w-full resize-none rounded-lg border border-border/60 bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors min-h-[120px]"
            rows={5}
          />
          <span className="absolute bottom-3 right-3 text-xs text-muted-foreground/50">
            {prompt.length}/500
          </span>
        </div>
      </div>

      {/* Image upload */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <ImageIcon className="h-4 w-4 text-primary" />
          Reference image
          <span className="text-xs text-muted-foreground">(optional)</span>
        </label>

        {image ? (
          <div className="relative overflow-hidden rounded-lg border border-border/60 bg-secondary/30">
            <img
              src={image}
              alt="Reference preview"
              className="h-40 w-full object-cover"
            />
            <div className="absolute inset-0 bg-background/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={removeImage}
                className="flex items-center gap-2 rounded-full bg-destructive/90 px-4 py-2 text-xs font-medium text-foreground"
                type="button"
              >
                <X className="h-3 w-3" />
                Remove
              </button>
            </div>
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-secondary/80 px-2.5 py-1 backdrop-blur-md">
              <ImageIcon className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[150px]">
                {imageName}
              </span>
            </div>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-8 transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border/40 bg-secondary/20 hover:border-primary/30 hover:bg-secondary/40"
            }`}
            role="button"
            tabIndex={0}
            aria-label="Upload reference image"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                fileInputRef.current?.click()
              }
            }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Drag and drop or{" "}
                <span className="text-primary font-medium">browse</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                PNG, JPG, WEBP up to 10MB
              </p>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          aria-label="Upload image file"
        />
      </div>

      {/* Style options */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Settings2 className="h-4 w-4 text-primary" />
          Style preset
        </label>
        <div className="flex flex-wrap gap-2">
          {["Realistic", "Stylized", "Low Poly", "Sculpted"].map((style) => (
            <button
              key={style}
              type="button"
              className="rounded-full border border-border/60 bg-secondary/40 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus:border-primary focus:text-primary focus:outline-none"
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <div className="mt-auto pt-2">
        <Button
          size="lg"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-medium"
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
        >
          {isGenerating ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate 3D Model
            </>
          )}
        </Button>
        <p className="mt-2 text-center text-[10px] text-muted-foreground/50">
          Generation takes approximately 15-30 seconds
        </p>
      </div>
    </div>
  )
}
