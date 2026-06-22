'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from './LoginGate'
import { getMembers, getHorarioHoy } from '@/lib/teamStore'

function pad(n: number) { return String(n).padStart(2, '0') }

const DIAS_ES = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']
const MESES_ES = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']

function minutesUntil(hora: string, now: Date) {
  const [h, m] = hora.split(':').map(Number)
  return (h * 60 + m) - (now.getHours() * 60 + now.getMinutes())
}

export default function ClockWidget() {
  const { session } = useAuth()
  const [now, setNow] = useState<Date | null>(null)
  const [showColon, setShowColon] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [totalTasks, setTotalTasks] = useState(0)
  const [horaSalida, setHoraSalida] = useState('')
  const [sidebarActive, setSidebarActive] = useState(false)

  useEffect(() => {
    const onAdmin    = (e: Event) => setSidebarActive((e as CustomEvent).detail.active)
    const onSidebar  = (e: Event) => setSidebarActive((e as CustomEvent).detail.active)
    window.addEventListener('adminModeChange',    onAdmin)
    window.addEventListener('sidebarActiveChange', onSidebar)
    return () => {
      window.removeEventListener('adminModeChange',    onAdmin)
      window.removeEventListener('sidebarActiveChange', onSidebar)
    }
  }, [])

  useEffect(() => {
    if (!session) return

    function readTasks(t: Date) {
      const members = getMembers()
      const member = members.find(m => m.id === session!.memberId)
      if (!member) return
      const horario = getHorarioHoy(member)
      setHoraSalida(horario?.activo ? (horario.salida || '') : '')
      setTotalTasks(member.tasks.length)
      const key = t.toISOString().split('T')[0]
      const raw = localStorage.getItem(`teamchecks_${key}`)
      if (raw) {
        const checks: Record<string, boolean[]> = JSON.parse(raw)
        const arr = checks[session!.memberId] || []
        setPendingCount(member.tasks.filter((_, i) => !arr[i]).length)
      } else {
        setPendingCount(member.tasks.length)
      }
    }

    const start = new Date()
    setNow(start)
    readTasks(start)

    let tick = 0
    const id = setInterval(() => {
      tick++
      const t = new Date()
      setNow(t)
      setShowColon(c => !c)
      if (tick % 5 === 0) readTasks(t)
    }, 500)

    return () => clearInterval(id)
  }, [session?.memberId]) // usar solo el ID estable, no el objeto completo

  if (!now) return null

  const hh = pad(now.getHours())
  const mm = pad(now.getMinutes())
  const ss = pad(now.getSeconds())
  const dia = DIAS_ES[now.getDay()]
  const fecha = `${now.getDate()} ${MESES_ES[now.getMonth()]} ${now.getFullYear()}`

  const minsLeft = horaSalida ? minutesUntil(horaSalida, now) : null
  const doneTasks = totalTasks - pendingCount
  const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const alertLevel: 'none' | 'info' | 'warn' | 'urgent' | 'done' =
    minsLeft === null || minsLeft < 0 ? 'none'
    : pendingCount === 0 ? 'done'
    : minsLeft <= 15 ? 'urgent'
    : minsLeft <= 30 ? 'warn'
    : minsLeft <= 60 ? 'info'
    : 'none'

  const alertColors = {
    none:   { text: 'rgba(180,185,210,0.5)',  border: 'rgba(180,185,210,0.1)',  bg: 'rgba(180,185,210,0.04)' },
    info:   { text: '#8890b8',                border: 'rgba(136,144,184,0.3)',  bg: 'rgba(136,144,184,0.06)' },
    warn:   { text: '#dcaa3c',                border: 'rgba(220,170,60,0.35)',  bg: 'rgba(220,170,60,0.07)' },
    urgent: { text: '#dc4646',                border: 'rgba(220,70,70,0.4)',    bg: 'rgba(220,70,70,0.08)' },
    done:   { text: '#5cb87a',                border: 'rgba(92,184,122,0.35)', bg: 'rgba(92,184,122,0.07)' },
  }
  const ac = alertColors[alertLevel]

  const F = 'Impact, Haettenschweiler, "Arial Narrow Bold", "Arial Black", sans-serif'
  const chrome = {
    fontFamily: F, fontWeight: 900, letterSpacing: '0.03em',
    color: '#ffffff',
    textShadow: '0 0 4px #fff, 0 0 12px rgba(255,255,255,0.95), 0 0 28px rgba(255,255,255,0.7), 0 0 55px rgba(255,255,255,0.35)',
  }
  const chromeDim = {
    fontFamily: F, fontWeight: 900, letterSpacing: '0.03em',
    color: 'rgba(255,255,255,0.4)',
    textShadow: '0 0 5px rgba(255,255,255,0.5)',
  }
  const chromeSecond = {
    fontFamily: F, fontWeight: 900, letterSpacing: '0.03em',
    color: 'rgba(255,255,255,0.78)',
    textShadow: '0 0 5px rgba(255,255,255,0.9), 0 0 14px rgba(255,255,255,0.5)',
  }
  const glow = chrome
  const glowDim = chromeDim
  const glowSecond = chromeSecond

  return (
    <>
      {/* ── Desktop: reloj compacto esquina inferior derecha ────────────────── */}
      <div className="hidden md:block fixed select-none"
        style={{
          width: '164px',
          zIndex: 200,
          right:     sidebarActive ? 'auto'   : '20px',
          left:      sidebarActive ? '20px'   : 'auto',
          top:       sidebarActive ? '50%'    : 'auto',
          bottom:    sidebarActive ? 'auto'   : '20px',
          transform: sidebarActive ? 'translateY(-50%)' : 'none',
          transition: 'left 0.35s ease, right 0.35s ease, top 0.35s ease, bottom 0.35s ease, transform 0.35s ease',
        }}>

        <div className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(5,5,10,0.82)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: [
              '0 0 0 1px rgba(180,185,210,0.14)',
              '0 4px 24px rgba(0,0,0,0.7)',
              'inset 0 1px 0 rgba(255,255,255,0.05)',
            ].join(', '),
          }}>

          <div className="px-3 pt-2.5 pb-2.5">

            {/* Fecha */}
            <p className="text-[8px] tracking-[0.24em] mb-1"
              style={{ color: 'rgba(180,185,210,0.38)', fontFamily: '"Courier New", monospace' }}>
              {dia} · {fecha}
            </p>

            {/* Hora principal */}
            <div className="flex items-baseline gap-0.5 mb-2">
              <span style={{ ...chrome, fontSize: '2.6rem', lineHeight: 1 }}>{hh}</span>
              <span style={{ ...chrome, fontSize: '2.2rem', lineHeight: 1,
                opacity: showColon ? 1 : 0.07, transition: 'opacity 0.08s' }}>:</span>
              <span style={{ ...chrome, fontSize: '2.6rem', lineHeight: 1 }}>{mm}</span>
              <span style={{ ...chromeSecond, fontSize: '0.9rem', lineHeight: 1,
                marginLeft: '4px', alignSelf: 'flex-end', paddingBottom: '3px' }}>{ss}</span>

              {/* Indicador de alerta (punto de color) */}
              {alertLevel !== 'none' && (
                <span className="ml-auto flex-shrink-0 w-2 h-2 rounded-full self-center mb-1"
                  style={{ background: ac.text, boxShadow: `0 0 6px ${ac.text}` }} />
              )}
            </div>

            {/* Progreso de ruta */}
            {totalTasks > 0 && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[8px] tracking-widest" style={{ color: 'rgba(180,185,210,0.35)',
                    fontFamily: '"Courier New",monospace' }}>RUTA</span>
                  <span className="text-[8px] tabular-nums font-mono"
                    style={{ color: pendingCount === 0 ? '#5cb87a' : 'rgba(180,185,210,0.45)' }}>
                    {doneTasks}/{totalTasks}
                  </span>
                </div>
                <div className="h-0.5 w-full rounded-full overflow-hidden"
                  style={{ background: 'rgba(180,185,210,0.07)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: pendingCount === 0
                        ? 'linear-gradient(90deg,#3a8a52,#5cb87a)'
                        : 'linear-gradient(90deg,#3a3e5a,#6870a0)',
                      boxShadow: pendingCount === 0 ? '0 0 4px rgba(92,184,122,0.5)' : 'none',
                    }} />
                </div>
              </div>
            )}

            {/* Alerta compacta */}
            {alertLevel !== 'none' && minsLeft !== null && (
              <div className="flex items-center gap-1 mt-2">
                <p className="text-[8px] flex-1 leading-tight"
                  style={{ color: ac.text, fontFamily: '"Courier New",monospace' }}>
                  {alertLevel === 'done' && `✓ OK · ${minsLeft}m`}
                  {alertLevel !== 'done' && minsLeft > 0 && `${minsLeft}m · ${pendingCount} pend.`}
                  {alertLevel !== 'done' && minsLeft === 0 && `¡Salida! ${pendingCount} pend.`}
                </p>
                {alertLevel !== 'done' && pendingCount > 0 && (
                  <Link href="/tareas"
                    className="text-[7px] px-1.5 py-0.5 rounded-md flex-shrink-0"
                    style={{ color: ac.text, border: `1px solid ${ac.border}`,
                      background: ac.bg, fontFamily: '"Courier New",monospace' }}>
                    Ver
                  </Link>
                )}
              </div>
            )}

            {/* Hora de salida (solo info pasiva) */}
            {horaSalida && alertLevel === 'none' && (
              <p className="mt-1.5 text-[7px] tracking-widest"
                style={{ color: 'rgba(180,185,210,0.25)', fontFamily: '"Courier New",monospace' }}>
                SALIDA {horaSalida}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile: barra compacta al inicio del contenido ──────────────────── */}
      <div className="md:hidden flex items-center gap-3 px-3 py-2 rounded-xl mb-4"
        style={{ background: 'rgba(5,5,10,0.7)', border: '1px solid rgba(180,185,210,0.1)' }}>
        <div className="flex items-baseline gap-0.5">
          <span style={{ ...chrome, fontSize: '1.8rem', lineHeight: 1 }}>{hh}</span>
          <span style={{ ...chrome, fontSize: '1.6rem', lineHeight: 1,
            opacity: showColon ? 1 : 0.08, transition: 'opacity 0.08s' }}>:</span>
          <span style={{ ...chrome, fontSize: '1.8rem', lineHeight: 1 }}>{mm}</span>
          <span style={{ ...chromeSecond, fontSize: '0.75rem', marginLeft: '3px',
            alignSelf: 'flex-end', paddingBottom: '2px' }}>{ss}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[8px] tracking-widest truncate"
            style={{ color: 'rgba(180,185,210,0.35)', fontFamily: '"Courier New",monospace' }}>
            {dia} · {fecha}
          </p>
          {totalTasks > 0 && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="flex-1 h-0.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(180,185,210,0.08)' }}>
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`,
                    background: pendingCount === 0 ? '#5cb87a' : '#6870a0' }} />
              </div>
              <span className="text-[8px] tabular-nums flex-shrink-0"
                style={{ color: pendingCount === 0 ? '#5cb87a' : 'rgba(180,185,210,0.4)',
                  fontFamily: '"Courier New",monospace' }}>
                {doneTasks}/{totalTasks}
              </span>
            </div>
          )}
        </div>
        {alertLevel !== 'none' && (
          <span className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: ac.text, boxShadow: `0 0 5px ${ac.text}` }} />
        )}
      </div>
    </>
  )
}
