'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { PenLine, MessageSquare, RotateCcw, CheckCircle2, AlertCircle, FileText } from 'lucide-react'
import { saveSignature, ReglamentoSignature, getMembers, saveMembers } from '@/lib/teamStore'

const S = {
  bg:           'var(--th-bg)',
  card:         'var(--th-card)',
  border:       'var(--th-border)',
  borderLight:  'var(--th-border-light)',
  borderActive: 'var(--th-border-active)',
  silver:       'var(--th-silver)',
  silverBright: 'var(--th-bright)',
  silverDim:    'var(--th-dim)',
}

const REGLAS = [
  {
    titulo: 'Reglas de Comunicación',
    items: [
      'Avisar antes de actuar en cualquier decisión que pueda afectar al cliente, al equipo o a la imagen de la empresa.',
      'Usar siempre el canal oficial de comunicación para informar cambios, dudas o avances.',
      'Responder dentro de un tiempo establecido (máx. 15 min en horario laboral) a mensajes internos.',
      'Escalar situaciones críticas al líder antes de dar una respuesta definitiva al cliente.',
    ],
  },
  {
    titulo: 'Reglas de Coordinación',
    items: [
      'Registrar las decisiones importantes en un documento compartido o tablero.',
      'Seguir la cadena de comunicación: decisiones operativas se toman en equipo, decisiones estratégicas se consultan con dirección.',
      'Respetar los acuerdos de las juntas: una vez definidos los lineamientos, se aplican de manera uniforme.',
    ],
  },
  {
    titulo: 'Reglas de Respeto y Cultura',
    items: [
      'Puntualidad en juntas y horarios de trabajo como señal de respeto al equipo.',
      'Retroalimentación siempre en tono constructivo, nunca personal.',
      'Actuar con iniciativa, pero nunca en aislamiento: toda acción debe estar alineada a la visión del equipo.',
    ],
  },
  {
    titulo: 'Reglas de Calidad en el Servicio',
    items: [
      'No cerrar un caso sin documentarlo (qué pasó, cómo se resolvió).',
      'Seguir guías y protocolos de atención al cliente de manera uniforme, salvo autorización expresa de cambios.',
      'Cuidar el tono de comunicación con clientes y compañeros, manteniendo amabilidad y profesionalismo.',
    ],
  },
]

type Props = {
  memberId: string
  memberName: string
  onDone: () => void
}

export default function ReglamentoGate({ memberId, memberName, onDone }: Props) {
  const [tab, setTab] = useState<'firma' | 'mensaje'>('firma')
  const [signed, setSigned] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [scrolledToBottom, setScrolledToBottom] = useState(false)

  // Structured declaration fields
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [ciudad, setCiudad] = useState('')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  const displayName = memberName.split(' · ').pop() || memberName
  const [memberRole, setMemberRole] = useState('Equipo de Soporte')

  useEffect(() => {
    getMembers().then(all => {
      const role = all.find(m => m.id === memberId)?.role
      if (role) setMemberRole(role)
    })
  }, [memberId])

  const today = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })

  const declaracionPreview = `Yo, ${nombreCompleto.trim() || '___________________'}, desempeñando el puesto de ${memberRole} en Club Sinergetico Soporte, con residencia en ${ciudad.trim() || '___________________'}, declaro el día ${today} haber leído, entendido y aceptado en su totalidad el Reglamento del Equipo de Atención al Cliente. Me comprometo a cumplir y aplicar cada una de las reglas establecidas en mi desempeño diario.`

  const declaracionFinal = `Yo, ${nombreCompleto.trim()}, desempeñando el puesto de ${memberRole} en Club Sinergetico Soporte, con residencia en ${ciudad.trim()}, declaro el día ${today} haber leído, entendido y aceptado en su totalidad el Reglamento del Equipo de Atención al Cliente. Me comprometo a cumplir y aplicar cada una de las reglas establecidas en mi desempeño diario.`

  const mensajeValid = nombreCompleto.trim().length >= 3 && ciudad.trim().length >= 2
  const canSubmit = scrolledToBottom && (tab === 'firma' ? hasDrawn : mensajeValid)

  // ── Canvas ─────────────────────────────────────────────────────────────────

  function drawBaseline(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.save()
    ctx.strokeStyle = 'rgba(180,185,210,0.18)'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(20, h - 18)
    ctx.lineTo(w - 20, h - 18)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()
  }

  function getPos(e: MouseEvent | Touch, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const startDraw = useCallback((e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas || !scrolledToBottom) return
    e.preventDefault()
    isDrawing.current = true
    const touch = 'touches' in e ? e.touches[0] : e as MouseEvent
    lastPos.current = getPos(touch, canvas)
  }, [scrolledToBottom])

  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDrawing.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    e.preventDefault()
    const ctx = canvas.getContext('2d')
    if (!ctx || !lastPos.current) return
    const touch = 'touches' in e ? e.touches[0] : e as MouseEvent
    const pos = getPos(touch, canvas)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = '#d4d8e8'
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    lastPos.current = pos
    setHasDrawn(true)
  }, [])

  const endDraw = useCallback(() => {
    isDrawing.current = false
    lastPos.current = null
  }, [])

  // Initialize canvas when the firma tab is shown
  useEffect(() => {
    if (tab !== 'firma') return
    const canvas = canvasRef.current
    if (!canvas) return

    const init = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0) { requestAnimationFrame(init); return }
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.scale(dpr, dpr)
      drawBaseline(ctx, rect.width, rect.height / dpr)
    }
    requestAnimationFrame(init)

    canvas.addEventListener('mousedown', startDraw)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', endDraw)
    canvas.addEventListener('mouseleave', endDraw)
    canvas.addEventListener('touchstart', startDraw, { passive: false })
    canvas.addEventListener('touchmove', draw, { passive: false })
    canvas.addEventListener('touchend', endDraw)
    return () => {
      canvas.removeEventListener('mousedown', startDraw)
      canvas.removeEventListener('mousemove', draw)
      canvas.removeEventListener('mouseup', endDraw)
      canvas.removeEventListener('mouseleave', endDraw)
      canvas.removeEventListener('touchstart', startDraw)
      canvas.removeEventListener('touchmove', draw)
      canvas.removeEventListener('touchend', endDraw)
    }
  }, [tab, startDraw, draw, endDraw])

  function clearCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const dpr = window.devicePixelRatio || 1
    drawBaseline(ctx, canvas.width / dpr, canvas.height / dpr)
    setHasDrawn(false)
  }

  // ── Scroll detection ────────────────────────────────────────────────────────

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 40) {
      setScrolledToBottom(true)
    }
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  function handleSubmit() {
    if (!canSubmit) return
    let data = ''
    if (tab === 'firma') {
      data = canvasRef.current?.toDataURL('image/png') ?? ''
    } else {
      data = declaracionFinal
    }
    const sig: ReglamentoSignature = {
      memberId,
      memberName,
      signedAt: new Date().toISOString(),
      method: tab,
      data,
    }
    saveSignature(sig)
    // Persistir en Firestore para que no se pida de nuevo en otros dispositivos ni al reiniciar sesión
    getMembers().then(members => {
      const updated = members.map(m =>
        m.id === memberId
          ? { ...m, reglamentoFirmado: true, reglamentoFirmadoAt: new Date().toISOString() }
          : m
      )
      saveMembers(updated)
    })
    setSigned(true)
    setTimeout(onDone, 2000)
  }

  // ── Success screen ──────────────────────────────────────────────────────────

  if (signed) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: S.bg }}>
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <CheckCircle2 size={56} style={{ color: '#70c080' }} />
          <p className="text-lg font-bold" style={{ color: S.silverBright }}>¡Registro completado!</p>
          <p className="text-sm" style={{ color: S.silverDim }}>Bienvenid@ al portal, {displayName}.</p>
        </div>
      </div>
    )
  }

  // ── Main gate ───────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ background: 'rgba(4,4,6,0.98)' }}>

      <div className="w-full max-w-lg mx-4 flex flex-col rounded-3xl overflow-hidden"
        style={{
          background: S.card,
          border: '1px solid rgba(180,185,210,0.18)',
          boxShadow: '0 0 100px rgba(0,0,0,0.95)',
          maxHeight: '92vh',
        }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.02)' }}>
          <Image src="/logo.jpg" alt="Club Sinergetico" width={36} height={36} className="rounded-xl" />
          <div className="flex-1">
            <p className="text-xs font-bold tracking-[0.2em] uppercase"
              style={{ background: 'linear-gradient(135deg,#d4d8e8,#8890a8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Reglamento del Equipo
            </p>
            <p className="text-[10px] tracking-widest uppercase mt-0.5" style={{ color: S.silverDim }}>
              Club Sinergetico · Soporte
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
            style={{ background: 'rgba(220,140,60,0.1)', border: '1px solid rgba(220,140,60,0.25)' }}>
            <AlertCircle size={11} style={{ color: '#dc8c3c' }} />
            <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: '#dc8c3c' }}>Requiere firma</span>
          </div>
        </div>

        {/* Scrollable rules */}
        <div onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
          style={{ scrollbarWidth: 'thin', scrollbarColor: `${S.silverDim} transparent` }}>

          <p className="text-xs leading-relaxed" style={{ color: S.silver }}>
            Hola <span style={{ color: S.silverBright, fontWeight: 600 }}>{displayName}</span>, para ingresar al portal debes leer y firmar el reglamento del equipo.
            Este registro queda guardado de forma permanente y se solicita solo una vez.
          </p>

          {REGLAS.map((seccion) => (
            <div key={seccion.titulo}>
              <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: S.silver }}>
                {seccion.titulo}
              </p>
              <ul className="space-y-1.5">
                {seccion.items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: '#9094a4' }}>
                    <span style={{ color: S.silverDim, flexShrink: 0 }}>{i + 1}.</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="py-3 px-4 rounded-2xl"
            style={{ background: 'rgba(180,185,210,0.04)', border: `1px solid ${S.border}` }}>
            <p className="text-xs leading-relaxed italic" style={{ color: S.silver }}>
              IX Compromiso: Reconozco haber leído estas reglas y me comprometo a aplicarlas en mi trabajo diario.
            </p>
          </div>

          {!scrolledToBottom && (
            <p className="text-center text-[10px] animate-pulse pb-2" style={{ color: S.silverDim }}>
              ↓ Desplázate hasta el final para activar la firma
            </p>
          )}
        </div>

        {/* Signature section */}
        <div className="flex-shrink-0 px-5 pt-3 pb-5"
          style={{ borderTop: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.01)' }}>

          {/* Tab selector */}
          <div className="flex gap-2 mb-3">
            <button onClick={() => { setTab('firma'); setHasDrawn(false) }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
              style={tab === 'firma'
                ? { background: 'rgba(180,185,210,0.12)', color: S.silverBright, border: `1px solid ${S.borderActive}` }
                : { background: 'transparent', color: S.silverDim, border: `1px solid ${S.border}` }
              }>
              <PenLine size={13} /> Firma digital
            </button>
            <button onClick={() => setTab('mensaje')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
              style={tab === 'mensaje'
                ? { background: 'rgba(180,185,210,0.12)', color: S.silverBright, border: `1px solid ${S.borderActive}` }
                : { background: 'transparent', color: S.silverDim, border: `1px solid ${S.border}` }
              }>
              <MessageSquare size={13} /> Declaración escrita
            </button>
          </div>

          {/* ── Tab: Firma digital ───────────────────────────────────────────── */}
          {tab === 'firma' && (
            <div>
              <p className="text-[10px] mb-2" style={{ color: S.silverDim }}>
                Dibuja tu firma con el mouse o con el dedo en el área de abajo:
              </p>
              <div className="relative rounded-2xl overflow-hidden mb-1"
                style={{
                  border: `1px solid ${scrolledToBottom ? (hasDrawn ? 'rgba(100,200,120,0.35)' : S.borderActive) : S.border}`,
                  background: scrolledToBottom ? '#04040c' : '#02020a',
                  opacity: scrolledToBottom ? 1 : 0.35,
                  transition: 'opacity 0.3s, border-color 0.3s',
                }}>
                <canvas
                  ref={canvasRef}
                  style={{
                    width: '100%',
                    height: '110px',
                    display: 'block',
                    cursor: scrolledToBottom ? 'crosshair' : 'not-allowed',
                    touchAction: 'none',
                  }}
                />
                {!scrolledToBottom && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-[10px]" style={{ color: S.silverDim }}>Lee el reglamento completo primero</p>
                  </div>
                )}
                {scrolledToBottom && !hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingBottom: '24px' }}>
                    <p className="text-[10px]" style={{ color: 'rgba(180,185,210,0.25)' }}>✍ Firma aquí</p>
                  </div>
                )}
                {/* "Firma del Colaborador" label */}
                <div className="absolute bottom-1 right-4 pointer-events-none">
                  <p className="text-[8px] tracking-widest" style={{ color: 'rgba(180,185,210,0.2)' }}>Firma del Colaborador</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                {hasDrawn ? (
                  <button onClick={clearCanvas}
                    className="flex items-center gap-1 text-[10px] transition-colors"
                    style={{ color: S.silverDim }}>
                    <RotateCcw size={10} /> Borrar y reintentar
                  </button>
                ) : (
                  <span />
                )}
                {hasDrawn && (
                  <span className="text-[10px]" style={{ color: '#70c080' }}>✓ Firma capturada</span>
                )}
              </div>
            </div>
          )}

          {/* ── Tab: Declaración escrita ─────────────────────────────────────── */}
          {tab === 'mensaje' && (
            <div className="space-y-3 mb-2"
              style={{ opacity: scrolledToBottom ? 1 : 0.35, transition: 'opacity 0.3s', pointerEvents: scrolledToBottom ? 'auto' : 'none' }}>

              <p className="text-[10px] leading-relaxed" style={{ color: S.silverDim }}>
                Completa los siguientes campos para generar tu declaración formal de compromiso:
              </p>

              {/* Fields */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] tracking-widest uppercase block mb-1" style={{ color: S.silverDim }}>
                    Nombre completo *
                  </label>
                  <input
                    value={nombreCompleto}
                    onChange={e => setNombreCompleto(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full px-3 py-2 rounded-xl outline-none text-xs"
                    style={{
                      background: 'var(--th-inner)',
                      border: `1px solid ${nombreCompleto.trim().length >= 3 ? 'rgba(100,200,120,0.3)' : S.border}`,
                      color: S.silverBright,
                    }}
                  />
                </div>
                <div>
                  <label className="text-[9px] tracking-widest uppercase block mb-1" style={{ color: S.silverDim }}>
                    Ciudad de residencia *
                  </label>
                  <input
                    value={ciudad}
                    onChange={e => setCiudad(e.target.value)}
                    placeholder="Tu ciudad"
                    className="w-full px-3 py-2 rounded-xl outline-none text-xs"
                    style={{
                      background: 'var(--th-inner)',
                      border: `1px solid ${ciudad.trim().length >= 2 ? 'rgba(100,200,120,0.3)' : S.border}`,
                      color: S.silverBright,
                    }}
                  />
                </div>
              </div>

              {/* Auto-filled fields (read-only) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] tracking-widest uppercase block mb-1" style={{ color: S.silverDim }}>
                    Puesto
                  </label>
                  <div className="px-3 py-2 rounded-xl text-xs"
                    style={{ background: 'rgba(180,185,210,0.03)', border: `1px solid ${S.border}`, color: S.silver }}>
                    {memberRole}
                  </div>
                </div>
                <div>
                  <label className="text-[9px] tracking-widest uppercase block mb-1" style={{ color: S.silverDim }}>
                    Fecha
                  </label>
                  <div className="px-3 py-2 rounded-xl text-xs"
                    style={{ background: 'rgba(180,185,210,0.03)', border: `1px solid ${S.border}`, color: S.silver }}>
                    {today}
                  </div>
                </div>
              </div>

              {/* Declaration preview */}
              <div className="rounded-2xl p-3"
                style={{
                  background: 'rgba(180,185,210,0.03)',
                  border: `1px solid ${mensajeValid ? 'rgba(100,200,120,0.2)' : S.border}`,
                }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <FileText size={10} style={{ color: S.silverDim }} />
                  <p className="text-[9px] tracking-widest uppercase font-bold" style={{ color: S.silverDim }}>
                    Declaración de compromiso
                  </p>
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: mensajeValid ? S.silver : '#4a4e5a', fontStyle: 'italic' }}>
                  {declaracionPreview}
                </p>
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all"
            style={{
              background: canSubmit ? 'rgba(100,200,120,0.15)' : 'rgba(180,185,210,0.04)',
              color: canSubmit ? '#70c080' : S.silverDim,
              border: canSubmit ? '1px solid rgba(100,200,120,0.35)' : `1px solid ${S.border}`,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}>
            Confirmar y entrar al portal
          </button>

          <p className="text-center text-[9px] mt-2" style={{ color: S.silverDim }}>
            Este registro es permanente y queda vinculado a tu cuenta · {today}
          </p>
        </div>
      </div>
    </div>
  )
}
