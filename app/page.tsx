import { HeroSection } from "@/components/hero-section"
import { GenerateSection } from "@/components/generate-section"

export default function Home() {
  return (
    <div className="min-h-screen pt-4">
      <HeroSection />
      <GenerateSection />
    </div>
  )
}
