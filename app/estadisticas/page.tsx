'use client'

import { useEffect, useState, useCallback } from 'react'
import { Users, Globe, ShieldCheck, ShieldOff, RefreshCw, TrendingUp, AlertTriangle, Clock, Star, UserPlus, Loader2, Zap } from 'lucide-react'

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

type Stats = {
  total: number
  mexico: number; usa: number; latam: number
  conAcceso: number; sinAcceso: number
  skoolActivo: number; skoolVencido: number
  skool3: number; skool6: number; skool12: number
  proxVencer: number; vencidos: number
  renovados: number; nuevosEsteMes: number
  bgi: number; mas: number
  actualizadoEn: string
}

function StatCard({ label, value, total, icon, color, sub }: {
  label: string; value: number; total?: number
  icon: React.ReactNode; color: string; sub?: string
}) {
  const pct = total ? Math.round((value / total) * 100) : null
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: S.card, border: `1px solid ${S.border}` }}>
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <span style={{ color }}>{icon}</span>
        </div>
        {pct !== null && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${color}15`, color }}>
            {pct}%
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-black" style={{ color: S.silverBright }}>{value.toLocaleString()}</p>
        <p className="text-xs font-semibold mt-0.5" style={{ color: S.silverDim }}>{label}</p>
        {sub && <p className="text-[10px] mt-0.5" style={{ color: S.silverDim }}>{sub}</p>}
      </div>
      {total != null && pct !== null && (
        <div className="h-1 rounded-full overflow-hidden" style={{ background: `${color}18` }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
        </div>
      )}
    </div>
  )
}

function MiniCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl px-3 py-2.5 flex items-center gap-3"
      style={{ background: S.card, border: `1px solid ${S.border}` }}>
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
      <p className="text-xs flex-1" style={{ color: S.silverDim }}>{label}</p>
      <p className="text-sm font-black" style={{ color: S.silverBright }}>{value.toLocaleString()}</p>
    </div>
  )
}

export default function EstadisticasPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const r = await fetch('/api/estadisticas')
      if (!r.ok) throw new Error(`Error ${r.status}`)
      const data = await r.json()
      if (data.error) throw new Error(data.error)
      setStats(data)
    } catch (e) { setError(String(e)) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const mesActual = new Date().toLocaleString('es-MX', { month: 'long', year: 'numeric' })
  const fmtDate   = (iso: string) =>
    new Date(iso).toLocaleString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Encabezado */}
        <div className="flex items-start justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: S.silverBright }}>Estadísticas</h1>
            <p className="text-sm mt-1" style={{ color: S.silverDim }}>Registro de Atención · Club Sinergético</p>
          </div>
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0"
            style={{ background: S.card, border: `1px solid ${S.border}`, color: S.silver, opacity: loading ? 0.5 : 1 }}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        {loading && !stats && (
          <div className="flex flex-col items-center gap-3 py-20">
            <Loader2 size={32} className="animate-spin" style={{ color: S.silverDim }} />
            <p className="text-sm" style={{ color: S.silverDim }}>Cargando datos…</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl p-4 mb-4"
            style={{ background: 'rgba(220,80,80,0.08)', border: '1px solid rgba(220,80,80,0.25)' }}>
            <p className="text-sm font-semibold" style={{ color: '#e07070' }}>Error al cargar</p>
            <p className="text-xs mt-1" style={{ color: '#c06060' }}>{error}</p>
          </div>
        )}

        {stats && (
          <div className="space-y-5">

            {/* Total + nuevos */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Total de alumnos" value={stats.total}
                icon={<Users size={18} />} color="#6ab0ff" />
              <StatCard label={`Nuevos en ${mesActual}`} value={stats.nuevosEsteMes}
                total={stats.total} icon={<UserPlus size={18} />} color="#70e0a8"
                sub="inscritos este mes" />
            </div>

            {/* Por país */}
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-2 px-1" style={{ color: S.silverDim }}>Por país</p>
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="México"  value={stats.mexico} total={stats.total} icon={<Globe size={18} />} color="#4ade80" />
                <StatCard label="USA"     value={stats.usa}    total={stats.total} icon={<Globe size={18} />} color="#60a5fa" />
                <StatCard label="LATAM"   value={stats.latam}  total={stats.total} icon={<Globe size={18} />} color="#f472b6" />
              </div>
            </div>

            {/* Acceso */}
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-2 px-1" style={{ color: S.silverDim }}>Acceso a plataforma</p>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Con acceso"  value={stats.conAcceso}  total={stats.total} icon={<ShieldCheck size={18} />} color="#4ade80" />
                <StatCard label="Sin acceso"  value={stats.sinAcceso}  total={stats.total} icon={<ShieldOff size={18} />}   color="#f87171" />
              </div>
            </div>

            {/* Tipo de membresía */}
            <div>
              <p className="text-[10px] tracking-widests uppercase mb-2 px-1" style={{ color: S.silverDim }}>Tipo de evento / membresía</p>
              <div className="space-y-2">
                <MiniCard label="BGI" value={stats.bgi} color="#f59e0b" />
                <MiniCard label="MAS" value={stats.mas} color="#a78bfa" />
                <MiniCard label="Renovados" value={stats.renovados} color="#34d399" />
              </div>
            </div>

            {/* Skool */}
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-2 px-1" style={{ color: S.silverDim }}>Skool</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <StatCard label="Skool activo"  value={stats.skoolActivo}  total={stats.total} icon={<Star size={18} />} color="#a78bfa" />
                <StatCard label="Sin Skool"     value={stats.skoolVencido} total={stats.total} icon={<Star size={18} />} color="#94a3b8" />
              </div>
              <p className="text-[10px] tracking-widest uppercase mb-2 px-1" style={{ color: S.silverDim }}>Duración Skool</p>
              <div className="space-y-2">
                <MiniCard label="3 Meses"  value={stats.skool3}  color="#c084fc" />
                <MiniCard label="6 Meses"  value={stats.skool6}  color="#a855f7" />
                <MiniCard label="12 Meses" value={stats.skool12} color="#7c3aed" />
              </div>
            </div>

            {/* Vencimientos */}
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-2 px-1" style={{ color: S.silverDim }}>Estado de membresía</p>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Próximos a vencer" value={stats.proxVencer}
                  sub="en 30 días" icon={<Clock size={18} />} color="#fbbf24" />
                <StatCard label="Vencidos" value={stats.vencidos}
                  total={stats.total} icon={<AlertTriangle size={18} />} color="#f87171" />
              </div>
            </div>

            <p className="text-center text-[10px] pb-2" style={{ color: S.silverDim }}>
              Actualizado: {fmtDate(stats.actualizadoEn)} · datos de Google Sheets
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
