'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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

type QRData = {
  mid: string
  name: string
  role: string
  date: string
  done: number
  total: number
  status: 'completo' | 'incompleto'
  rid: string
}

function AttendancePage() {
  const params = useSearchParams()
  const [data, setData] = useState<QRData | null>(null)
  const [confirmed, setConfirmed] = useState<'completo' | 'incompleto' | null>(null)
  const [alreadySaved, setAlreadySaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const raw = params.get('d')
    if (!raw) { setError('QR inválido o expirado'); return }
    try {
      const decoded: QRData = JSON.parse(decodeURIComponent(atob(raw)))
      setData(decoded)

      // Check server for existing record
      fetch(`/api/attendance`)
        .then(r => r.json())
        .then((records: Array<{ id: string; status: string }>) => {
          const existing = records.find(r => r.id === decoded.rid)
          if (existing && existing.status !== 'pending') {
            setConfirmed(existing.status as 'completo' | 'incompleto')
            setAlreadySaved(true)
          }
        })
        .catch(() => {})
    } catch {
      setError('QR no válido o expirado')
    }
  }, [params])

  async function confirm(status: 'completo' | 'incompleto') {
    if (!data || loading) return
    setLoading(true)
    try {
      // Save/update on server so Mac calendar can see it
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: data.rid,
          memberId: data.mid,
          memberName: data.name,
          memberRole: data.role,
          date: data.date,
          completedAt: new Date().toISOString(),
          scannedAt: new Date().toISOString(),
          status,
          tasksTotal: data.total,
          tasksDone: data.done,
        }),
      })
      setConfirmed(status)
    } catch {
      setError('Error al guardar. Verifica tu conexión WiFi.')
    } finally {
      setLoading(false)
    }
  }

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: S.bg }}>
      <div className="text-center max-w-xs">
        <XCircle size={48} style={{ color: '#e07070', margin: '0 auto 16px' }} />
        <p className="text-sm mb-4" style={{ color: S.silverBright }}>{error}</p>
        <p className="text-xs" style={{ color: S.silverDim }}>Pide al colaborador que genere el QR de nuevo</p>
      </div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: S.bg }}>
      <div className="text-sm animate-pulse" style={{ color: S.silverDim }}>Cargando...</div>
    </div>
  )

  const pct = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0
  const isComplete = data.status === 'completo'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: S.bg }}>

      {/* Grid bg */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.03 }}>
        <svg width="100%" height="100%">
          <defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0L0 0 0 40" fill="none" stroke="#b8bcc8" strokeWidth="0.5"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#g)" />
        </svg>
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="rounded-3xl overflow-hidden"
          style={{ background: 'rgba(8,8,16,0.98)', border: '1px solid rgba(180,185,210,0.15)', boxShadow: '0 0 60px rgba(0,0,0,0.9)' }}>

          {/* Header */}
          <div className="px-6 py-5 text-center"
            style={{
              background: isComplete ? 'rgba(100,200,120,0.05)' : 'rgba(220,150,50,0.05)',
              borderBottom: `1px solid ${S.border}`,
            }}>
            <p className="text-[10px] tracking-[0.25em] uppercase mb-2" style={{ color: S.silverDim }}>
              Registro de Asistencia
            </p>
            <p className="text-xl font-bold" style={{ color: S.silverBright }}>{data.name}</p>
            <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>{data.role}</p>
            <p className="text-[10px] mt-2" style={{ color: S.silverDim }}>
              {new Date(data.date + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* Progress */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span style={{ color: S.silverDim }}>Tareas del día</span>
                <span style={{ color: isComplete ? '#70c080' : '#d4a050', fontWeight: 700 }}>
                  {data.done}/{data.total} ({pct}%)
                </span>
              </div>
              <div style={{ height: '8px', background: S.border, borderRadius: '4px' }}>
                <div style={{
                  height: '100%', width: `${pct}%`, borderRadius: '4px',
                  background: isComplete ? 'linear-gradient(90deg,#50c878,#70e090)' : 'linear-gradient(90deg,#c87832,#e09050)',
                  boxShadow: isComplete ? '0 0 8px rgba(80,200,120,0.5)' : '0 0 8px rgba(200,120,50,0.4)',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>

            {/* Status */}
            <div className="text-center">
              <span className="text-xs px-4 py-1.5 rounded-full font-medium"
                style={{
                  background: isComplete ? 'rgba(100,200,120,0.12)' : 'rgba(220,150,50,0.12)',
                  color: isComplete ? '#70c080' : '#d4a050',
                  border: `1px solid ${isComplete ? 'rgba(100,200,120,0.3)' : 'rgba(220,150,50,0.3)'}`,
                }}>
                {isComplete ? '✓ Todas las tareas completadas' : `⚠ ${data.total - data.done} tareas sin completar`}
              </span>
            </div>

            {/* Confirmation */}
            {confirmed ? (
              <div className="text-center py-4">
                {confirmed === 'completo'
                  ? <CheckCircle2 size={56} style={{ color: '#70c080', margin: '0 auto 12px' }} />
                  : <XCircle size={56} style={{ color: '#d4a050', margin: '0 auto 12px' }} />
                }
                <p className="font-bold text-lg" style={{ color: S.silverBright }}>
                  {confirmed === 'completo' ? '¡Asistencia Confirmada!' : 'Marcado como Incompleto'}
                </p>
                <p className="text-sm font-semibold mt-1" style={{ color: confirmed === 'completo' ? '#70c080' : '#d4a050' }}>
                  {data.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>
                  {alreadySaved ? 'Ya estaba registrado' : 'Guardado correctamente'}
                </p>
                <div className="mt-3 mb-5">
                  <span className="text-xs px-3 py-1.5 rounded-full"
                    style={{
                      background: confirmed === 'completo' ? 'rgba(100,200,120,0.1)' : 'rgba(220,150,50,0.1)',
                      color: confirmed === 'completo' ? '#70c080' : '#d4a050',
                      border: `1px solid ${confirmed === 'completo' ? 'rgba(100,200,120,0.2)' : 'rgba(220,150,50,0.2)'}`,
                    }}>
                    Desempeño: {confirmed === 'completo' ? '100%' : `${pct}%`}
                  </span>
                </div>

                {/* Close / next scan button */}
                <button
                  onClick={() => { window.location.href = '/asistencia-ready' }}
                  className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all"
                  style={{
                    background: 'rgba(180,185,210,0.12)',
                    color: S.silverBright,
                    border: '2px solid rgba(180,185,210,0.25)',
                    boxShadow: '0 0 20px rgba(180,185,210,0.06)',
                    letterSpacing: '0.03em',
                  }}>
                  📷 Escanear siguiente QR
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 pt-2">
                <p className="text-[10px] text-center tracking-widest uppercase" style={{ color: S.silverDim }}>
                  Confirmar asistencia
                </p>
                <button onClick={() => confirm('completo')} disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: 'rgba(100,200,120,0.15)',
                    color: '#70c080',
                    border: '2px solid rgba(100,200,120,0.4)',
                    boxShadow: '0 0 24px rgba(100,200,120,0.1)',
                    opacity: loading ? 0.7 : 1,
                  }}>
                  <CheckCircle2 size={20} />
                  {loading ? 'Guardando...' : 'LISTO — Asistencia Completa'}
                </button>
                <button onClick={() => confirm('incompleto')} disabled={loading}
                  className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: 'rgba(220,150,50,0.08)',
                    color: '#d4a050',
                    border: '1px solid rgba(220,150,50,0.3)',
                    opacity: loading ? 0.7 : 1,
                  }}>
                  <XCircle size={16} />
                  {loading ? 'Guardando...' : 'INCOMPLETO'}
                </button>
              </div>
            )}
          </div>

          <div className="px-6 pb-5 text-center">
            <p className="text-[10px]" style={{ color: S.silverDim }}>
              Club Sinergetico · Portal de Soporte
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AsistenciaPage() {
  return <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#040406' }}>
      <p style={{ color: '#3a3e4a', fontSize: '14px' }}>Cargando...</p>
    </div>
  }>
    <AttendancePage />
  </Suspense>
}
