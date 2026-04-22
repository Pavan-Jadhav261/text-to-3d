"use client"

import { Suspense, useRef, useEffect, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import {
  OrbitControls,
  Float,
  useGLTF,
  MeshDistortMaterial,
  RoundedBox,
  Torus,
  Sphere,
  Center,
} from "@react-three/drei"
import type { Mesh, Group } from "three"

// ─── Fallback shapes ─────────────────────────────────────────
function FallbackShapes() {
  const groupRef = useRef<Group>(null)
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })
  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <RoundedBox args={[1.4, 1.4, 1.4]} radius={0.15} smoothness={4}>
          <MeshDistortMaterial
            color="#22d3ee"
            roughness={0.1}
            metalness={0.8}
            distort={0.2}
            speed={2}
          />
        </RoundedBox>
      </Float>

      <Float speed={1.5} rotationIntensity={0.8} floatIntensity={0.8}>
        <Torus args={[1.2, 0.3, 16, 32]} position={[0, 0, -1]}>
          <meshStandardMaterial color="#06b6d4" roughness={0.15} metalness={0.9} />
        </Torus>
      </Float>

      <Float speed={3} rotationIntensity={0.2} floatIntensity={1.5}>
        <Sphere args={[0.5, 32, 32]} position={[1.8, 0.5, -0.5]}>
          <MeshDistortMaterial
            color="#67e8f9"
            roughness={0.05}
            metalness={0.95}
            distort={0.3}
            speed={2}
          />
        </Sphere>
      </Float>
    </group>
  )
}

// ─── GLB Model ───────────────────────────────────────────────
// ─── GLB Model ───────────────────────────────────────────────
function GLBModel({ url }: { url: string }) {
  const groupRef = useRef<Group>(null)
  const { scene } = useGLTF(url)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <group ref={groupRef}>
        <Center>
          <primitive object={scene} scale={1.5} />
        </Center>
      </group>
    </Float>
  )
}

// ─── Loading spinner ─────────────────────────────────────────
function LoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-xs text-muted-foreground">Loading 3D Preview...</span>
      </div>
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────
export function ScenePreview() {
  const [modelUrl, setModelUrl] = useState<string | null>(null)

  useEffect(() => {
    // Check if model exists and set URL with timestamp to force reload
    const checkModel = async () => {
      try {
        const res = await fetch("/models/output.glb", { method: "HEAD" })
        if (res.ok) {
          setModelUrl(`/models/output.glb?t=${Date.now()}`)
        }
      } catch (e) {
        console.error("Error checking model:", e)
      }
    }

    checkModel()
  }, []) // Check once on mount

  return (
    <div className="relative h-full w-full min-h-[400px] rounded-xl overflow-hidden border border-border/50 bg-secondary/30">

      {/* Corner accents */}
      <div className="absolute top-0 left-0 h-16 w-16 border-l-2 border-t-2 border-primary/30 rounded-tl-xl z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-16 w-16 border-r-2 border-b-2 border-primary/30 rounded-br-xl z-10 pointer-events-none" />

      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]} // Limit DPR to save GPU
        gl={{
          antialias: true,
          powerPreference: "default",
          preserveDrawingBuffer: true
        }}
        className="touch-none"
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
        <pointLight position={[-3, 2, -2]} intensity={0.5} color="#22d3ee" />

        <Suspense fallback={null}>
          {modelUrl ? (
            <GLBModel url={modelUrl} />
          ) : (
            <FallbackShapes />
          )}
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>

      {/* Overlay label */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-full bg-secondary/80 px-3 py-1.5 backdrop-blur-md pointer-events-none">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs font-medium text-muted-foreground">
          {modelUrl ? "3D Model" : "3D Preview"}
        </span>
      </div>

    </div>
  )
}
// Preload not needed if we want to force refresh, but good for initial load
// useGLTF.preload("/models/output.glb")