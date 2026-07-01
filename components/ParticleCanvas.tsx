'use client'

import { useEffect, useRef } from 'react'

const LOGO_POINTS = [
  [0.45,0.15],[0.50,0.12],[0.55,0.15],[0.58,0.20],[0.55,0.28],[0.50,0.30],[0.45,0.28],[0.42,0.20],
  [0.46,0.20],[0.48,0.19],[0.48,0.22],[0.53,0.19],[0.56,0.18],[0.57,0.22],[0.55,0.24],
  [0.40,0.35],[0.50,0.33],[0.60,0.35],[0.63,0.50],[0.60,0.62],[0.50,0.65],[0.40,0.62],[0.37,0.50],
  [0.35,0.38],[0.28,0.42],[0.25,0.50],[0.28,0.55],[0.33,0.52],
  [0.65,0.35],[0.72,0.30],[0.78,0.22],[0.75,0.18],[0.70,0.20],[0.68,0.25],
  [0.72,0.10],[0.75,0.08],[0.79,0.10],[0.80,0.14],[0.77,0.17],[0.73,0.15],
  [0.68,0.06],[0.73,0.05],[0.75,0.03],[0.79,0.05],[0.82,0.06],
  [0.73,0.11],[0.76,0.11],[0.74,0.13],[0.77,0.13],
  [0.72,0.07],[0.70,0.04],[0.79,0.07],[0.81,0.04],
  [0.44,0.68],[0.42,0.78],[0.40,0.85],[0.56,0.68],[0.58,0.78],[0.60,0.85],
  [0.30,0.88],[0.40,0.88],[0.50,0.88],[0.60,0.88],[0.70,0.88],
  [0.35,0.92],[0.50,0.92],[0.65,0.92],
]

type Particle = {
  x: number; y: number; vx: number; vy: number
  targetX: number; targetY: number; size: number; alpha: number
}

type TrailDot = { x: number; y: number; alpha: number; r: number }

type Rocket = {
  x: number; y: number; vx: number; vy: number
  angle: number; size: number
  trail: TrailDot[]; active: boolean
  nextLaunch: number
}

function spawnRocket(w: number, h: number, now: number): Rocket {
  // Garantiza que el cohete atraviese toda la pantalla de borde a borde,
  // pasando siempre por la zona central visible (no solo por la esquina superior).
  const speed = 3 + Math.random() * 2

  // Punto de entrada en un borde aleatorio
  const edge = Math.floor(Math.random() * 4)
  let startX = 0, startY = 0

  if (edge === 0)      { startX = -60;    startY = h * (0.1 + Math.random() * 0.8) }  // izquierda
  else if (edge === 1) { startX = w + 60; startY = h * (0.1 + Math.random() * 0.8) }  // derecha
  else if (edge === 2) { startY = -60;    startX = w * (0.1 + Math.random() * 0.8) }  // arriba
  else                 { startY = h + 60; startX = w * (0.1 + Math.random() * 0.8) }  // abajo

  // El destino es el borde opuesto, en la zona central (30%-70%) para que pase por el medio
  let endX = 0, endY = 0
  if (edge === 0)      { endX = w + 60;   endY = h * (0.2 + Math.random() * 0.6) }
  else if (edge === 1) { endX = -60;      endY = h * (0.2 + Math.random() * 0.6) }
  else if (edge === 2) { endY = h + 60;   endX = w * (0.2 + Math.random() * 0.6) }
  else                 { endY = -60;      endX = w * (0.2 + Math.random() * 0.6) }

  // Velocidad en la dirección del vector entrada→salida normalizado
  const dx = endX - startX, dy = endY - startY
  const len = Math.sqrt(dx * dx + dy * dy)
  const vx = (dx / len) * speed
  const vy = (dy / len) * speed

  return {
    x: startX, y: startY, vx, vy,
    angle: Math.atan2(vy, vx),
    size: 36 + Math.random() * 16,
    trail: [],
    active: true,
    nextLaunch: now + 18000 + Math.random() * 12000,
  }
}

function drawRocket(ctx: CanvasRenderingContext2D, r: Rocket, isLight: boolean) {
  ctx.save()
  ctx.translate(r.x, r.y)
  ctx.rotate(r.angle + Math.PI / 2) // nose apunta en dirección del movimiento

  const s = r.size
  const bodyColor  = isLight ? '#060614' : '#d4d8e8'
  const noseColor  = isLight ? '#0f0f28' : '#b0b4c8'
  const windowCol  = isLight ? '#0a5abf' : '#6ab0ff'
  const finColor   = isLight ? '#03030e' : '#aab0c0'
  const flameOuter = isLight ? 'rgba(160,165,180,0.95)' : 'rgba(180,185,210,0.9)'
  const flameInner = isLight ? 'rgba(230,235,255,1.0)'  : 'rgba(240,245,255,1.0)'

  // Sombra del cohete para que resalte sobre el fondo blanco
  if (isLight) {
    ctx.shadowColor = 'rgba(0,0,80,0.35)'
    ctx.shadowBlur  = 14
  }

  // Llama (atrás del cohete) — más larga
  const flameLen = s * 1.6 + Math.random() * s * 0.7
  const grad = ctx.createRadialGradient(0, s * 0.35, 0, 0, s * 0.35 + flameLen * 0.5, flameLen)
  grad.addColorStop(0, flameInner)
  grad.addColorStop(0.4, flameOuter)
  grad.addColorStop(1, 'rgba(180,185,210,0)')
  ctx.beginPath()
  ctx.moveTo(-s * 0.18, s * 0.35)
  ctx.quadraticCurveTo(-s * 0.3, s * 0.35 + flameLen * 0.6, 0, s * 0.35 + flameLen)
  ctx.quadraticCurveTo(s * 0.3, s * 0.35 + flameLen * 0.6, s * 0.18, s * 0.35)
  ctx.fillStyle = grad
  ctx.fill()

  // Aletas
  ctx.fillStyle = finColor
  ctx.beginPath()
  ctx.moveTo(-s * 0.18, s * 0.3)
  ctx.lineTo(-s * 0.5, s * 0.5)
  ctx.lineTo(-s * 0.18, s * 0.15)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(s * 0.18, s * 0.3)
  ctx.lineTo(s * 0.5, s * 0.5)
  ctx.lineTo(s * 0.18, s * 0.15)
  ctx.closePath()
  ctx.fill()

  // Cuerpo principal
  ctx.fillStyle = bodyColor
  ctx.beginPath()
  ctx.roundRect(-s * 0.22, -s * 0.5, s * 0.44, s * 0.85, [s * 0.22, s * 0.22, s * 0.06, s * 0.06])
  ctx.fill()

  // Nariz
  ctx.fillStyle = noseColor
  ctx.beginPath()
  ctx.moveTo(-s * 0.22, -s * 0.5)
  ctx.quadraticCurveTo(-s * 0.22, -s * 1.05, 0, -s * 1.1)
  ctx.quadraticCurveTo(s * 0.22, -s * 1.05, s * 0.22, -s * 0.5)
  ctx.closePath()
  ctx.fill()

  // Ventana
  ctx.beginPath()
  ctx.arc(0, -s * 0.12, s * 0.13, 0, Math.PI * 2)
  ctx.fillStyle = windowCol
  ctx.fill()
  ctx.beginPath()
  ctx.arc(-s * 0.04, -s * 0.16, s * 0.05, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fill()

  ctx.restore()
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef   = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const phaseRef     = useRef<'floating' | 'converging' | 'formed' | 'dispersing'>('floating')
  const phaseTimerRef = useRef(0)
  const rocketRef    = useRef<Rocket | null>(null)

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
      const w = canvas!.width, h = canvas!.height
      particlesRef.current = Array.from({ length: 80 }, (_, i) => {
        const lp = LOGO_POINTS[i % LOGO_POINTS.length]
        return {
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
          targetX: lp[0] * w, targetY: lp[1] * h,
          size: Math.random() * 1.5 + 0.5, alpha: Math.random() * 0.5 + 0.2,
        }
      })
    }

    function updatePhase(now: number) {
      const e = now - phaseTimerRef.current
      if (phaseRef.current === 'floating'   && e > 5000) { phaseRef.current = 'converging'; phaseTimerRef.current = now }
      if (phaseRef.current === 'converging' && e > 4000) { phaseRef.current = 'formed';     phaseTimerRef.current = now }
      if (phaseRef.current === 'formed'     && e > 3000) { phaseRef.current = 'dispersing'; phaseTimerRef.current = now }
      if (phaseRef.current === 'dispersing' && e > 2000) { phaseRef.current = 'floating';   phaseTimerRef.current = now }
    }

    function draw(now: number) {
      const w = canvas!.width, h = canvas!.height
      ctx!.clearRect(0, 0, w, h)

      // Detecta tema en tiempo real
      const isLight    = document.documentElement.dataset.theme === 'white'
      const pColor     = isLight ? '15,15,25'    : '212,216,232'
      const lColor     = isLight ? '15,15,30'    : '180,185,210'
      // En tema blanco: partículas más oscuras y opacas, líneas más visibles
      const alphaBoost = isLight ? 1.9 : 1.0
      const lineBoost  = isLight ? 3.8 : 1.0
      const sizeBoost  = isLight ? 1.6 : 1.0

      updatePhase(now)
      const phase     = phaseRef.current
      const particles = particlesRef.current

      // Actualizar partículas
      particles.forEach(p => {
        if (phase === 'converging' || phase === 'formed') {
          const dx = p.targetX - p.x, dy = p.targetY - p.y
          const speed = phase === 'formed' ? 0.02 : 0.04
          p.x += dx * speed; p.y += dy * speed
          p.vx *= 0.95; p.vy *= 0.95
        } else if (phase === 'dispersing') {
          p.vx += (Math.random() - 0.5) * 0.3; p.vy += (Math.random() - 0.5) * 0.3
          p.x += p.vx; p.y += p.vy
        } else {
          p.x += p.vx; p.y += p.vy
          if (p.x < 0 || p.x > w) p.vx *= -1
          if (p.y < 0 || p.y > h) p.vy *= -1
          p.x = Math.max(0, Math.min(w, p.x))
          p.y = Math.max(0, Math.min(h, p.y))
        }
      })

      // Conexiones entre partículas
      const maxDist = phase === 'formed' ? 60 : 80
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDist) {
            const baseAlpha = (1 - dist / maxDist) * (phase === 'formed' ? 0.35 : 0.18)
            const alpha = Math.min(baseAlpha * lineBoost, 0.85)
            ctx!.beginPath()
            ctx!.moveTo(particles[i].x, particles[i].y)
            ctx!.lineTo(particles[j].x, particles[j].y)
            ctx!.strokeStyle = `rgba(${lColor},${alpha})`
            ctx!.lineWidth = phase === 'formed' ? 1.2 : 0.8
            ctx!.stroke()
          }
        }
      }

      // Dibujar partículas (estrellas)
      particles.forEach(p => {
        const a = Math.min((phase === 'formed' ? 0.95 : p.alpha) * alphaBoost, 0.95)
        const sz = p.size * sizeBoost
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, sz, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${pColor},${a})`
        ctx!.fill()
        // Halo suave alrededor de cada estrella (más grande en blanco)
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, sz * (isLight ? 4 : 3), 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${pColor},${isLight ? 0.12 : 0.05})`
        ctx!.fill()
      })

      // ── Cohete ──────────────────────────────────────────────────────────
      let rocket = rocketRef.current
      if (!rocket || (!rocket.active && now >= rocket.nextLaunch)) {
        rocketRef.current = spawnRocket(w, h, now)
        rocket = rocketRef.current
      }

      if (rocket && rocket.active) {
        // Mover
        rocket.x += rocket.vx
        rocket.y += rocket.vy

        // Estela de humo
        rocket.trail.unshift({ x: rocket.x, y: rocket.y, alpha: 0.35, r: 4 + Math.random() * 3 })
        if (rocket.trail.length > 40) rocket.trail.pop()
        rocket.trail.forEach(d => { d.alpha *= 0.93; d.r *= 0.97 })

        // Dibujar estela
        rocket.trail.forEach(d => {
          ctx!.beginPath()
          ctx!.arc(d.x, d.y, d.r, 0, Math.PI * 2)
          ctx!.fillStyle = isLight
            ? `rgba(100,105,130,${Math.min(d.alpha * 2.2, 0.7)})`
            : `rgba(190,195,220,${d.alpha * 1.3})`
          ctx!.fill()
        })

        // Dibujar cohete
        drawRocket(ctx!, rocket, isLight)

        // Sale por el otro lado
        const margin = 120
        if (rocket.x < -margin || rocket.x > w + margin || rocket.y < -margin || rocket.y > h + margin) {
          rocket.active = false
          rocket.nextLaunch = now + 18000 + Math.random() * 12000
        }
      }

      animRef.current = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    phaseTimerRef.current = performance.now()
    // Primer lanzamiento del cohete a los 5 segundos
    rocketRef.current = { x: -100, y: -100, vx: 0, vy: 0, angle: 0, size: 24, trail: [], active: false, nextLaunch: performance.now() + 5000 }
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
      style={{ opacity: 0.7, pointerEvents: 'none', zIndex: 0 }}
    />
  )
}
