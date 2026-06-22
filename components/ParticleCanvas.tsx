'use client'

import { useEffect, useRef } from 'react'

// Logo silhouette keypoints (normalized 0-1, representing the robot+bee shape)
const LOGO_POINTS = [
  // Robot head
  [0.45,0.15],[0.50,0.12],[0.55,0.15],[0.58,0.20],[0.55,0.28],[0.50,0.30],[0.45,0.28],[0.42,0.20],
  // Robot eye left
  [0.46,0.20],[0.48,0.19],[0.48,0.22],
  // Robot eye right (glowing)
  [0.53,0.19],[0.56,0.18],[0.57,0.22],[0.55,0.24],
  // Robot body
  [0.40,0.35],[0.50,0.33],[0.60,0.35],[0.63,0.50],[0.60,0.62],[0.50,0.65],[0.40,0.62],[0.37,0.50],
  // Robot arm left
  [0.35,0.38],[0.28,0.42],[0.25,0.50],[0.28,0.55],[0.33,0.52],
  // Robot arm right (raised - holding bee)
  [0.65,0.35],[0.72,0.30],[0.78,0.22],[0.75,0.18],[0.70,0.20],[0.68,0.25],
  // Bee body
  [0.72,0.10],[0.75,0.08],[0.79,0.10],[0.80,0.14],[0.77,0.17],[0.73,0.15],
  // Bee wings
  [0.68,0.06],[0.73,0.05],[0.75,0.03],[0.79,0.05],[0.82,0.06],
  // Bee stripes
  [0.73,0.11],[0.76,0.11],[0.74,0.13],[0.77,0.13],
  // Bee antennae
  [0.72,0.07],[0.70,0.04],[0.79,0.07],[0.81,0.04],
  // Robot legs
  [0.44,0.68],[0.42,0.78],[0.40,0.85],[0.56,0.68],[0.58,0.78],[0.60,0.85],
  // Club Sinergetico text area dots
  [0.30,0.88],[0.40,0.88],[0.50,0.88],[0.60,0.88],[0.70,0.88],
  [0.35,0.92],[0.50,0.92],[0.65,0.92],
]

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  targetX: number
  targetY: number
  size: number
  alpha: number
  converging: boolean
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const phaseRef = useRef<'floating' | 'converging' | 'formed' | 'dispersing'>('floating')
  const phaseTimerRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      initParticles()
    }

    function initParticles() {
      const w = canvas!.width
      const h = canvas!.height
      const count = 80

      particlesRef.current = Array.from({ length: count }, (_, i) => {
        const logoPoint = LOGO_POINTS[i % LOGO_POINTS.length]
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          targetX: logoPoint[0] * w,
          targetY: logoPoint[1] * h,
          size: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.5 + 0.2,
          converging: false,
        }
      })
    }

    function updatePhase(now: number) {
      const elapsed = now - phaseTimerRef.current
      switch (phaseRef.current) {
        case 'floating':
          if (elapsed > 5000) { phaseRef.current = 'converging'; phaseTimerRef.current = now }
          break
        case 'converging':
          if (elapsed > 4000) { phaseRef.current = 'formed'; phaseTimerRef.current = now }
          break
        case 'formed':
          if (elapsed > 3000) { phaseRef.current = 'dispersing'; phaseTimerRef.current = now }
          break
        case 'dispersing':
          if (elapsed > 2000) { phaseRef.current = 'floating'; phaseTimerRef.current = now }
          break
      }
    }

    function draw(now: number) {
      const w = canvas!.width
      const h = canvas!.height
      ctx!.clearRect(0, 0, w, h)

      updatePhase(now)
      const phase = phaseRef.current
      const particles = particlesRef.current

      particles.forEach(p => {
        if (phase === 'converging' || phase === 'formed') {
          // Move toward logo target
          const dx = p.targetX - p.x
          const dy = p.targetY - p.y
          const speed = phase === 'formed' ? 0.02 : 0.04
          p.x += dx * speed
          p.y += dy * speed
          p.vx *= 0.95
          p.vy *= 0.95
        } else if (phase === 'dispersing') {
          // Burst outward
          p.vx += (Math.random() - 0.5) * 0.3
          p.vy += (Math.random() - 0.5) * 0.3
          p.x += p.vx
          p.y += p.vy
        } else {
          // Float freely with bounce
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0 || p.x > w) p.vx *= -1
          if (p.y < 0 || p.y > h) p.vy *= -1
          p.x = Math.max(0, Math.min(w, p.x))
          p.y = Math.max(0, Math.min(h, p.y))
        }
      })

      // Draw connections
      const maxDist = phase === 'formed' ? 60 : 80
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (phase === 'formed' ? 0.35 : 0.12)
            ctx!.beginPath()
            ctx!.moveTo(particles[i].x, particles[i].y)
            ctx!.lineTo(particles[j].x, particles[j].y)
            ctx!.strokeStyle = `rgba(180,185,210,${alpha})`
            ctx!.lineWidth = phase === 'formed' ? 0.8 : 0.4
            ctx!.stroke()
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        const glowAlpha = phase === 'formed' ? 0.9 : p.alpha
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(212,216,232,${glowAlpha})`
        ctx!.fill()

        if (phase === 'formed') {
          ctx!.beginPath()
          ctx!.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(180,185,210,0.05)`
          ctx!.fill()
        }
      })

      animRef.current = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    phaseTimerRef.current = performance.now()
    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.6, pointerEvents: 'none', zIndex: 0 }}
    />
  )
}
