import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useScrollStore } from '@/animation/scrollStore'
import { singularityStrength } from '@/eggs/fx'
import type { QualityTier } from './quality'
import starVert from './shaders/starfield.vert'
import starFrag from './shaders/starfield.frag'
import nebulaFrag from './shaders/nebula.frag'

/** Deterministic PRNG so the sky is the same on every visit. */
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const NEBULA_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

interface SceneProps {
  tier: QualityTier
  onFirstFrame: () => void
}

function Starfield({ tier }: { tier: QualityTier }) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const pointer = useRef({ x: 0, y: -2 })
  const smoothed = useRef({ velocity: 0, pointerX: 0, pointerY: -2, develop: 0 })
  const { size, viewport } = useThree()
  const aspect = size.width / size.height

  const { geometry, uniforms } = useMemo(() => {
    const count = tier === 2 ? 5500 : 2200
    const rand = mulberry32(20260711)
    const positions = new Float32Array(count * 3)
    const depth = new Float32Array(count)
    const sizes = new Float32Array(count)
    const phase = new Float32Array(count)
    const twinkle = new Float32Array(count)
    const delay = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rand() * 2 - 1) * 2.2 // generous x for wide screens
      positions[i * 3 + 1] = rand() * 2.3 - 1.15
      positions[i * 3 + 2] = 0
      const d = 0.2 + rand() * 0.8
      depth[i] = d
      const brightRoll = rand()
      sizes[i] = (brightRoll > 0.97 ? 2.6 : brightRoll > 0.8 ? 1.9 : 1.2) * (0.6 + d * 0.6)
      phase[i] = rand()
      twinkle[i] = rand() < 0.06 ? 1 : 0
      // Dimmest stars develop first: invert brightness into the delay.
      delay[i] = Math.min(0.75, brightRoll * 0.7 + rand() * 0.15)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aDepth', new THREE.BufferAttribute(depth, 1))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
    geo.setAttribute('aTwinkle', new THREE.BufferAttribute(twinkle, 1))
    geo.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1))

    const uni = {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uVelocity: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, -2) },
      uDevelop: { value: 0 },
      uAspect: { value: 1 },
      uDpr: { value: 1 },
      uDepthGrade: { value: 0 },
      uSingularity: { value: 0 },
    }
    return { geometry: geo, uniforms: uni }
  }, [tier])

  useEffect(() => () => geometry.dispose(), [geometry])

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    const onLeave = () => {
      pointer.current.x = 0
      pointer.current.y = -2 // park it far away
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  useFrame((_, delta) => {
    const mat = material.current
    if (!mat) return
    const dt = Math.min(delta, 0.1)
    const { progress, velocity } = useScrollStore.getState()
    const s = smoothed.current

    // 200ms EMA on velocity; damped pointer follow; develop-in over ~1.8s.
    s.velocity += (velocity - s.velocity) * Math.min(1, dt / 0.2)
    s.pointerX += (pointer.current.x - s.pointerX) * Math.min(1, dt / 0.12)
    s.pointerY += (pointer.current.y - s.pointerY) * Math.min(1, dt / 0.12)
    s.develop = Math.min(1, s.develop + dt / 1.8)

    mat.uniforms.uTime!.value += dt
    mat.uniforms.uScroll!.value = progress
    mat.uniforms.uVelocity!.value = THREE.MathUtils.clamp(s.velocity, -1.5, 1.5)
    ;(mat.uniforms.uPointer!.value as THREE.Vector2).set(s.pointerX * aspect, s.pointerY)
    mat.uniforms.uDevelop!.value = s.develop
    mat.uniforms.uAspect!.value = aspect
    mat.uniforms.uDpr!.value = viewport.dpr
    mat.uniforms.uDepthGrade!.value = progress
    mat.uniforms.uSingularity!.value = singularityStrength(performance.now())
  })

  return (
    <points frustumCulled={false} geometry={geometry}>
      <shaderMaterial
        ref={material}
        vertexShader={starVert}
        fragmentShader={starFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function Nebula() {
  const material = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDepthGrade: { value: 0 },
    }),
    [],
  )

  useFrame((_, delta) => {
    const mat = material.current
    if (!mat) return
    mat.uniforms.uTime!.value += Math.min(delta, 0.1)
    mat.uniforms.uDepthGrade!.value = useScrollStore.getState().progress
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={NEBULA_VERT}
        fragmentShader={nebulaFrag}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
        transparent
      />
    </mesh>
  )
}

function FirstFrame({ onFirstFrame }: { onFirstFrame: () => void }) {
  const fired = useRef(false)
  useFrame(() => {
    if (!fired.current) {
      fired.current = true
      onFirstFrame()
    }
  })
  return null
}

export default function SceneRoot({ tier, onFirstFrame }: SceneProps) {
  return (
    <Canvas
      dpr={[1, tier === 2 ? 2 : 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      orthographic
      camera={{ position: [0, 0, 1], zoom: 1 }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Nebula />
      <Starfield tier={tier} />
      <FirstFrame onFirstFrame={onFirstFrame} />
    </Canvas>
  )
}
