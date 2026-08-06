'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronLeft, ChevronRight, TrendingUp, BarChart2, Users, RefreshCw, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useFirestoreCollection } from '@/lib/firestoreCollection'
import { useAuth } from '@/components/LoginGate'

const S = {
  bg:           'var(--th-bg)',
  card:         'var(--th-card)',
  border:       'var(--th-border)',
  silver:       'var(--th-silver)',
  silverBright: 'var(--th-bright)',
  silverDim:    'var(--th-dim)',
  green:  '#5cb87a',
  orange: '#dcaa3c',
  red:    '#dc4646',
  blue:   '#7ab0f0',
}

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

type JornadaDoc = {
  id: string
  memberId: string
  memberName: string
  memberRole: string
  fecha: string
  tipo: 'inicio' | 'fin'
  createdAt: string
  // canales
  whatsapp: number
  zendesk: number
  correo: number
  llamadas: number
  telegram: number
  instagram: number
  facebook: number
  whatsappViejito: number
  whatsappSoporte: number
  whatsappSkool: number
  ghl: number
  skoolMdl: number
  skoolCs: number
  skoolLegendaria: number
  whatsLegendaria: number
  // inicio
  horaEntrada?: string
  energia?: number
  // fin
  horaSalida?: string
  casosResueltos?: number
  casosPendientes?: number
  escaladoDLP?: boolean
  calidadPercibida?: number
  devolucionesSolicitadas?: number
  devolucionesAutorizadas?: number
  tareasExtra?: string[]
  status?: string
}

const CANALES = [
  { key: 'whatsapp'        as const, label: 'WhatsApp',   emoji: '💬' },
  { key: 'zendesk'         as const, label: 'Zendesk',    emoji: '🎫' },
  { key: 'correo'          as const, label: 'Correo',     emoji: '📧' },
  { key: 'llamadas'        as const, label: 'Llamadas',   emoji: '📞' },
  { key: 'telegram'        as const, label: 'Telegram',   emoji: '✈️' },
  { key: 'instagram'       as const, label: 'Instagram',  emoji: '📸' },
  { key: 'facebook'        as const, label: 'Facebook',   emoji: '👤' },
  { key: 'whatsappViejito' as const, label: 'WA Viejito', emoji: '📲' },
  { key: 'whatsappSoporte' as const, label: 'WA Soporte', emoji: '💬' },
  { key: 'whatsappSkool'   as const, label: 'WA Skool',   emoji: '🎓' },
  { key: 'ghl'             as const, label: 'GHL',        emoji: '⚙️' },
  { key: 'skoolMdl'        as const, label: 'Skool MDL',        emoji: '🎓' },
  { key: 'skoolCs'         as const, label: 'Skool CS',         emoji: '🎓' },
  { key: 'skoolLegendaria' as const, label: 'Skool Legendaria', emoji: '🎓' },
  { key: 'whatsLegendaria' as const, label: 'Whats Legendaria', emoji: '💬' },
]

function totalCanales(d: JornadaDoc) {
  return CANALES.reduce((s, c) => s + (d[c.key] || 0), 0)
}

export default function KPIsPage() {
  const { session, member } = useAuth()
  const router = useRouter()
  const puedeVer = !!member?.isAdmin || !!member?.permissions?.includes('verKPIs')

  useEffect(() => {
    if (session && !puedeVer) router.replace('/')
  }, [session, puedeVer, router])

  const today   = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const [modo, setModo]   = useState<'dia' | 'mes' | 'anio'>('mes')
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [dia, setDia]     = useState(todayStr)
  const [tab, setTab]     = useState<'resumen' | 'miembros' | 'canales' | 'devoluciones'>('resumen')

  const { data: allDocs, loading } = useFirestoreCollection<JornadaDoc>('reportes_jornada')

  // Filtrar por período
  const filtered = useMemo(() => {
    if (modo === 'dia')  return allDocs.filter(d => d.fecha === dia)
    if (modo === 'mes')  return allDocs.filter(d => d.fecha.startsWith(`${year}-${String(month+1).padStart(2,'0')}`))
    return allDocs.filter(d => d.fecha.startsWith(String(year)))
  }, [allDocs, modo, year, month, dia])

  if (!puedeVer) return null

  const fins   = filtered.filter(d => d.tipo === 'fin')
  const inicios = filtered.filter(d => d.tipo === 'inicio')

  // ── Totales globales ──────────────────────────────────────────────────────
  const totalMensajes = fins.reduce((s, d) => s + totalCanales(d), 0)
  const totalResueltos = fins.reduce((s, d) => s + (d.casosResueltos || 0), 0)
  const totalPendientes = fins.reduce((s, d) => s + (d.casosPendientes || 0), 0)
  const totalEscalados = fins.filter(d => d.escaladoDLP).length
  const devSolicitadas = fins.reduce((s, d) => s + (d.devolucionesSolicitadas || 0), 0)
  const devAutorizadas = fins.reduce((s, d) => s + (d.devolucionesAutorizadas || 0), 0)
  const devTasaAuth    = devSolicitadas > 0 ? Math.round((devAutorizadas / devSolicitadas) * 100) : 0

  const avgCalidad = fins.length > 0
    ? (fins.reduce((s, d) => s + (d.calidadPercibida || 3), 0) / fins.length).toFixed(1)
    : '—'
  const avgEnergia = inicios.length > 0
    ? (inicios.reduce((s, d) => s + (d.energia || 3), 0) / inicios.length).toFixed(1)
    : '—'
  const tasaResolucion = (totalResueltos + totalPendientes) > 0
    ? Math.round((totalResueltos / (totalResueltos + totalPendientes)) * 100)
    : 0

  // ── Por miembro ───────────────────────────────────────────────────────────
  const memberIds = [...new Set(filtered.map(d => d.memberId))]
  const memberStats = memberIds.map(mid => {
    const mFins   = fins.filter(d => d.memberId === mid)
    const mInicios = inicios.filter(d => d.memberId === mid)
    const name    = filtered.find(d => d.memberId === mid)?.memberName ?? mid
    const role    = filtered.find(d => d.memberId === mid)?.memberRole ?? ''
    const msgs    = mFins.reduce((s, d) => s + totalCanales(d), 0)
    const resueltos = mFins.reduce((s, d) => s + (d.casosResueltos || 0), 0)
    const pendsMañana = mFins.reduce((s, d) => s + (d.casosPendientes || 0), 0)
    const escalaciones = mFins.filter(d => d.escaladoDLP).length
    const calidad = mFins.length > 0
      ? (mFins.reduce((s, d) => s + (d.calidadPercibida || 3), 0) / mFins.length).toFixed(1)
      : '—'
    const energia = mInicios.length > 0
      ? (mInicios.reduce((s, d) => s + (d.energia || 3), 0) / mInicios.length).toFixed(1)
      : '—'
    const mDevSol = mFins.reduce((s, d) => s + (d.devolucionesSolicitadas || 0), 0)
    const mDevAut = mFins.reduce((s, d) => s + (d.devolucionesAutorizadas || 0), 0)
    const dias = mFins.length
    return { mid, name, role, msgs, resueltos, pendsMañana, escalaciones, calidad, energia, mDevSol, mDevAut, dias }
  }).sort((a, b) => b.msgs - a.msgs)

  const maxMsgs = Math.max(1, ...memberStats.map(m => m.msgs))

  // ── Por canal ─────────────────────────────────────────────────────────────
  const canalTotals = CANALES.map(c => ({
    ...c,
    fin:   fins.reduce((s, d) => s + (d[c.key] || 0), 0),
    ini:   inicios.reduce((s, d) => s + (d[c.key] || 0), 0),
  })).sort((a, b) => b.fin - a.fin)
  const maxCanal = Math.max(1, ...canalTotals.map(c => c.fin))

  // ── Helpers de navegación ─────────────────────────────────────────────────
  function prevPeriodo() {
    if (modo === 'mes') { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1) }
    else if (modo === 'anio') setYear(y => y-1)
    else setDia(d => { const dt = new Date(d); dt.setDate(dt.getDate()-1); return dt.toISOString().split('T')[0] })
  }
  function nextPeriodo() {
    if (modo === 'mes') { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1) }
    else if (modo === 'anio') setYear(y => y+1)
    else setDia(d => { const dt = new Date(d); dt.setDate(dt.getDate()+1); return dt.toISOString().split('T')[0] })
  }
  const periodoLabel = modo === 'dia' ? new Date(dia+'T12:00:00').toLocaleDateString('es-MX',{weekday:'short',day:'numeric',month:'long',year:'numeric'})
    : modo === 'mes' ? `${MONTHS_ES[month]} ${year}`
    : String(year)

  // Chip KPI
  function Chip({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
    return (
      <div className="rounded-2xl p-3" style={{ background: S.card, border: `1px solid ${S.border}` }}>
        <p className="text-[9px] tracking-widest uppercase mb-1" style={{ color: S.silverDim }}>{label}</p>
        <p className="text-2xl font-bold" style={{ color: color ?? S.silverBright }}>{value}</p>
        {sub && <p className="text-[10px] mt-0.5" style={{ color: S.silverDim }}>{sub}</p>}
      </div>
    )
  }

  // Barra horizontal
  function Bar({ pct, color }: { pct: number; color: string }) {
    return (
      <div style={{ flex: 1, height: '5px', background: 'rgba(180,185,210,0.1)', borderRadius: '3px' }}>
        <div style={{ height: '100%', width: `${Math.min(100, pct)}%`, background: color, borderRadius: '3px', transition: 'width 0.4s' }} />
      </div>
    )
  }

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link href="/admin" className="p-2 rounded-xl" style={{ color: S.silver, border: `1px solid ${S.border}` }}>
            <ArrowLeft size={16} />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold" style={{ color: S.silverBright }}>KPIs de Atención al Cliente</h1>
            <p className="text-xs" style={{ color: S.silverDim }}>
              {loading ? 'Cargando...' : `${fins.length} reportes de fin · ${inicios.length} de inicio`}
            </p>
          </div>
          <TrendingUp size={18} style={{ color: S.blue }} />
        </div>

        {/* Selector de modo */}
        <div className="flex gap-2 mb-4">
          {(['dia','mes','anio'] as const).map(m => (
            <button key={m} onClick={() => setModo(m)}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
              style={modo === m
                ? { background: 'rgba(180,185,210,0.12)', color: S.silverBright, border: `1px solid rgba(180,185,210,0.22)` }
                : { color: S.silverDim, border: `1px solid ${S.border}` }}>
              {m === 'dia' ? 'Día' : m === 'mes' ? 'Mes' : 'Año'}
            </button>
          ))}
        </div>

        {/* Navegación de período */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={prevPeriodo} className="p-2 rounded-lg" style={{ color: S.silver, border: `1px solid ${S.border}` }}>
            <ChevronLeft size={16} />
          </button>
          {modo === 'dia' ? (
            <input type="date" value={dia} onChange={e => setDia(e.target.value)}
              className="text-sm font-bold outline-none text-center"
              style={{ background: 'transparent', color: S.silverBright, border: 'none' }} />
          ) : (
            <span className="text-sm font-bold" style={{ color: S.silverBright }}>{periodoLabel}</span>
          )}
          <button onClick={nextPeriodo} className="p-2 rounded-lg" style={{ color: S.silver, border: `1px solid ${S.border}` }}>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { key: 'resumen', label: 'Resumen', icon: <BarChart2 size={12}/> },
            { key: 'miembros', label: 'Por colaborador', icon: <Users size={12}/> },
            { key: 'canales', label: 'Por canal', icon: <TrendingUp size={12}/> },
            { key: 'devoluciones', label: 'Devoluciones', icon: <RefreshCw size={12}/> },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
              style={tab === t.key
                ? { background: 'rgba(180,185,210,0.12)', color: S.silverBright, border: `1px solid rgba(180,185,210,0.22)` }
                : { color: S.silverDim, border: `1px solid ${S.border}` }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Sin datos */}
        {!loading && fins.length === 0 && (
          <div className="rounded-2xl p-8 text-center" style={{ background: S.card, border: `1px solid ${S.border}` }}>
            <p className="text-sm" style={{ color: S.silverDim }}>Sin reportes para este período</p>
            <p className="text-xs mt-1" style={{ color: S.silverDim }}>Los datos aparecen cuando los colaboradores completan el formulario de fin de jornada</p>
          </div>
        )}

        {/* ── RESUMEN ────────────────────────────────────────────────────────── */}
        {tab === 'resumen' && fins.length > 0 && (
          <div className="space-y-4">
            {/* KPI chips fila 1 */}
            <div className="grid grid-cols-2 gap-3">
              <Chip label="Total mensajes atendidos" value={totalMensajes.toLocaleString()} sub={`${fins.length} reportes de fin`} color={S.silverBright} />
              <Chip label="Tasa de resolución" value={`${tasaResolucion}%`} sub={`${totalResueltos} resueltos / ${totalPendientes} pend.`} color={tasaResolucion >= 70 ? S.green : tasaResolucion >= 40 ? S.orange : S.red} />
            </div>

            {/* KPI chips fila 2 */}
            <div className="grid grid-cols-2 gap-3">
              <Chip label="Casos escalados a DLP" value={totalEscalados} sub={fins.length > 0 ? `${Math.round((totalEscalados/fins.length)*100)}% de los días` : ''} color={totalEscalados > 0 ? S.orange : S.green} />
              <Chip label="Promedio de calidad percibida" value={`${avgCalidad}/5`} sub="autoevaluación fin de jornada" color={Number(avgCalidad) >= 4 ? S.green : Number(avgCalidad) >= 3 ? S.orange : S.red} />
            </div>

            {/* KPI chips fila 3 */}
            <div className="grid grid-cols-2 gap-3">
              <Chip label="Promedio de energía al inicio" value={`${avgEnergia}/5`} sub={`${inicios.length} reportes de inicio`} color={S.blue} />
              <Chip label="Canal más activo" value={canalTotals[0]?.emoji + ' ' + canalTotals[0]?.label} sub={`${canalTotals[0]?.fin ?? 0} mensajes`} />
            </div>

            {/* Resumen de devoluciones */}
            <div className="rounded-2xl p-4" style={{ background: S.card, border: `1px solid ${S.border}` }}>
              <p className="text-xs font-bold mb-3" style={{ color: S.silverBright }}>Devoluciones del período</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xl font-bold" style={{ color: S.orange }}>{devSolicitadas}</p>
                  <p className="text-[10px]" style={{ color: S.silverDim }}>Solicitadas</p>
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: S.green }}>{devAutorizadas}</p>
                  <p className="text-[10px]" style={{ color: S.silverDim }}>Autorizadas</p>
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: devTasaAuth >= 70 ? S.green : S.orange }}>{devTasaAuth}%</p>
                  <p className="text-[10px]" style={{ color: S.silverDim }}>Tasa de autorización</p>
                </div>
              </div>
              {devSolicitadas > 0 && (
                <div className="mt-3" style={{ height: '6px', background: 'rgba(180,185,210,0.1)', borderRadius: '3px' }}>
                  <div style={{ height: '100%', width: `${devTasaAuth}%`, background: devTasaAuth >= 70 ? S.green : S.orange, borderRadius: '3px', transition: 'width 0.5s' }} />
                </div>
              )}
            </div>

            {/* Top canal */}
            <div className="rounded-2xl p-4" style={{ background: S.card, border: `1px solid ${S.border}` }}>
              <p className="text-xs font-bold mb-3" style={{ color: S.silverBright }}>Distribución de canales (fin de jornada)</p>
              <div className="space-y-2">
                {canalTotals.slice(0,5).map(c => (
                  <div key={c.key} className="flex items-center gap-2">
                    <span className="text-xs w-20 truncate" style={{ color: S.silverDim }}>{c.emoji} {c.label}</span>
                    <Bar pct={(c.fin / maxCanal) * 100} color={S.blue} />
                    <span className="text-xs font-bold w-8 text-right" style={{ color: S.silverBright }}>{c.fin}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── POR COLABORADOR ────────────────────────────────────────────────── */}
        {tab === 'miembros' && fins.length > 0 && (
          <div className="space-y-3">
            {memberStats.map((m, idx) => (
              <div key={m.mid} className="rounded-2xl p-4" style={{ background: S.card, border: `1px solid ${S.border}` }}>
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-bold" style={{ color: idx === 0 ? '#d4a050' : S.silverDim }}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx+1}.`}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-bold" style={{ color: S.silverBright }}>{m.name.split(' · ').pop()}</p>
                    <p className="text-[10px]" style={{ color: S.silverDim }}>{m.role} · {m.dias} día{m.dias !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: S.silverBright }}>{m.msgs.toLocaleString()}</p>
                    <p className="text-[10px]" style={{ color: S.silverDim }}>mensajes</p>
                  </div>
                </div>
                {/* Barra de msgs */}
                <Bar pct={(m.msgs / maxMsgs) * 100} color='linear-gradient(90deg,#3a6aba,#7ab0f0)' />
                {/* Chips de datos */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="text-center px-2 py-1.5 rounded-xl" style={{ background: 'rgba(100,200,120,0.07)', border: '1px solid rgba(100,200,120,0.15)' }}>
                    <p className="text-sm font-bold" style={{ color: S.green }}>{m.resueltos}</p>
                    <p className="text-[9px]" style={{ color: S.silverDim }}>Resueltos</p>
                  </div>
                  <div className="text-center px-2 py-1.5 rounded-xl" style={{ background: 'rgba(220,150,50,0.07)', border: '1px solid rgba(220,150,50,0.15)' }}>
                    <p className="text-sm font-bold" style={{ color: S.orange }}>{m.pendsMañana}</p>
                    <p className="text-[9px]" style={{ color: S.silverDim }}>Pend. mañana</p>
                  </div>
                  <div className="text-center px-2 py-1.5 rounded-xl" style={{ background: m.escalaciones > 0 ? 'rgba(220,80,80,0.07)' : 'rgba(100,200,120,0.07)', border: `1px solid ${m.escalaciones > 0 ? 'rgba(220,80,80,0.15)' : 'rgba(100,200,120,0.15)'}` }}>
                    <p className="text-sm font-bold" style={{ color: m.escalaciones > 0 ? S.red : S.green }}>{m.escalaciones}</p>
                    <p className="text-[9px]" style={{ color: S.silverDim }}>Escalaciones</p>
                  </div>
                </div>
                {/* Energía y calidad */}
                <div className="flex gap-2 mt-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(122,176,240,0.06)', border: '1px solid rgba(122,176,240,0.15)' }}>
                    <span className="text-[10px]" style={{ color: S.silverDim }}>☀️ Energía</span>
                    <span className="text-sm font-bold ml-auto" style={{ color: S.blue }}>{m.energia}/5</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(212,160,80,0.06)', border: '1px solid rgba(212,160,80,0.15)' }}>
                    <span className="text-[10px]" style={{ color: S.silverDim }}>⭐ Calidad</span>
                    <span className="text-sm font-bold ml-auto" style={{ color: S.orange }}>{m.calidad}/5</span>
                  </div>
                </div>
                {/* Devoluciones por miembro */}
                {(m.mDevSol > 0 || m.mDevAut > 0) && (
                  <div className="flex gap-2 mt-2">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(220,150,50,0.06)', border: '1px solid rgba(220,150,50,0.15)' }}>
                      <span className="text-[10px]" style={{ color: S.silverDim }}>↩ Dev. sol.</span>
                      <span className="text-sm font-bold ml-auto" style={{ color: S.orange }}>{m.mDevSol}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(100,200,120,0.06)', border: '1px solid rgba(100,200,120,0.15)' }}>
                      <span className="text-[10px]" style={{ color: S.silverDim }}>✓ Dev. aut.</span>
                      <span className="text-sm font-bold ml-auto" style={{ color: S.green }}>{m.mDevAut}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── POR CANAL ──────────────────────────────────────────────────────── */}
        {tab === 'canales' && fins.length > 0 && (
          <div className="space-y-3">
            <div className="rounded-2xl overflow-hidden" style={{ background: S.card, border: `1px solid ${S.border}` }}>
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.03)' }}>
                <p className="text-sm font-bold" style={{ color: S.silverBright }}>Mensajes por canal — comparativa inicio vs fin</p>
                <p className="text-[10px] mt-0.5" style={{ color: S.silverDim }}>Inicio = backlog heredado · Fin = mensajes atendidos</p>
              </div>
              <div className="p-4 space-y-4">
                {canalTotals.map(c => {
                  const maxVal = Math.max(1, c.fin, c.ini)
                  return (
                    <div key={c.key}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm">{c.emoji}</span>
                        <span className="text-xs font-semibold flex-1" style={{ color: S.silverBright }}>{c.label}</span>
                        <span className="text-xs font-bold" style={{ color: S.blue }}>{c.fin}</span>
                        <span className="text-xs" style={{ color: S.silverDim }}>atendidos</span>
                      </div>
                      {/* Fin (atendidos) */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] w-10" style={{ color: S.silverDim }}>Fin</span>
                        <Bar pct={(c.fin / maxVal) * 100} color='linear-gradient(90deg,#3a6aba,#7ab0f0)' />
                        <span className="text-[10px] w-6 text-right" style={{ color: S.blue }}>{c.fin}</span>
                      </div>
                      {/* Inicio (backlog) */}
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] w-10" style={{ color: S.silverDim }}>Inicio</span>
                        <Bar pct={(c.ini / maxVal) * 100} color='linear-gradient(90deg,#5c4a1a,#d4a050)' />
                        <span className="text-[10px] w-6 text-right" style={{ color: S.orange }}>{c.ini}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tabla resumen canales */}
            <div className="rounded-2xl overflow-hidden" style={{ background: S.card, border: `1px solid ${S.border}` }}>
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${S.border}` }}>
                <p className="text-sm font-bold" style={{ color: S.silverBright }}>Por colaborador × canal (mensajes atendidos)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${S.border}` }}>
                      <th className="px-3 py-2 text-left font-medium" style={{ color: S.silverDim }}>Colaborador</th>
                      {CANALES.slice(0,6).map(c => (
                        <th key={c.key} className="px-2 py-2 text-center font-medium" style={{ color: S.silverDim }} title={c.label}>{c.emoji}</th>
                      ))}
                      <th className="px-3 py-2 text-center font-medium" style={{ color: S.silverDim }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberStats.map(m => (
                      <tr key={m.mid} style={{ borderBottom: `1px solid ${S.border}` }}>
                        <td className="px-3 py-2" style={{ color: S.silverBright }}>{m.name.split(' · ').pop()?.split(' ')[0]}</td>
                        {CANALES.slice(0,6).map(c => {
                          const val = fins.filter(d => d.memberId === m.mid).reduce((s, d) => s + (d[c.key] || 0), 0)
                          return <td key={c.key} className="px-2 py-2 text-center" style={{ color: val > 0 ? S.silverBright : S.silverDim }}>{val || '—'}</td>
                        })}
                        <td className="px-3 py-2 text-center font-bold" style={{ color: S.blue }}>{m.msgs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── DEVOLUCIONES ───────────────────────────────────────────────────── */}
        {tab === 'devoluciones' && (
          <div className="space-y-4">
            {/* KPI globales */}
            <div className="grid grid-cols-3 gap-3">
              <Chip label="Solicitadas" value={devSolicitadas} color={S.orange} />
              <Chip label="Autorizadas" value={devAutorizadas} color={S.green} />
              <Chip label="Tasa aut." value={`${devTasaAuth}%`} color={devTasaAuth >= 70 ? S.green : devTasaAuth >= 40 ? S.orange : S.red} />
            </div>

            {/* Barra tasa */}
            {devSolicitadas > 0 && (
              <div className="rounded-2xl p-4" style={{ background: S.card, border: `1px solid ${S.border}` }}>
                <div className="flex justify-between mb-2">
                  <p className="text-xs font-bold" style={{ color: S.silverBright }}>Tasa de autorización</p>
                  <p className="text-xs font-bold" style={{ color: devTasaAuth >= 70 ? S.green : S.orange }}>{devTasaAuth}%</p>
                </div>
                <div style={{ height: '10px', background: 'rgba(180,185,210,0.1)', borderRadius: '5px' }}>
                  <div style={{ height: '100%', width: `${devTasaAuth}%`, background: devTasaAuth >= 70 ? S.green : devTasaAuth >= 40 ? S.orange : S.red, borderRadius: '5px', transition: 'width 0.5s' }} />
                </div>
                <div className="flex justify-between mt-1">
                  <p className="text-[10px]" style={{ color: S.silverDim }}>0%</p>
                  <p className="text-[10px]" style={{ color: S.silverDim }}>100%</p>
                </div>
              </div>
            )}

            {/* Por colaborador */}
            <div className="rounded-2xl overflow-hidden" style={{ background: S.card, border: `1px solid ${S.border}` }}>
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.03)' }}>
                <p className="text-sm font-bold" style={{ color: S.silverBright }}>Devoluciones por colaborador</p>
              </div>
              {memberStats.filter(m => m.mDevSol > 0 || m.mDevAut > 0).length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <AlertCircle size={24} style={{ color: S.silverDim, margin: '0 auto 8px' }} />
                  <p className="text-xs" style={{ color: S.silverDim }}>Sin devoluciones registradas en este período</p>
                </div>
              ) : (
                <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
                  {memberStats.filter(m => m.mDevSol > 0 || m.mDevAut > 0).map(m => {
                    const tasa = m.mDevSol > 0 ? Math.round((m.mDevAut / m.mDevSol) * 100) : 0
                    return (
                      <div key={m.mid} className="px-4 py-3 flex items-center gap-3" style={{ borderColor: S.border }}>
                        <div className="flex-1">
                          <p className="text-xs font-semibold" style={{ color: S.silverBright }}>{m.name.split(' · ').pop()}</p>
                          <p className="text-[10px]" style={{ color: S.silverDim }}>{m.role}</p>
                        </div>
                        <div className="text-center px-3">
                          <p className="text-sm font-bold" style={{ color: S.orange }}>{m.mDevSol}</p>
                          <p className="text-[9px]" style={{ color: S.silverDim }}>sol.</p>
                        </div>
                        <div className="text-center px-3">
                          <p className="text-sm font-bold" style={{ color: S.green }}>{m.mDevAut}</p>
                          <p className="text-[9px]" style={{ color: S.silverDim }}>aut.</p>
                        </div>
                        <div className="text-center px-3">
                          <p className="text-sm font-bold" style={{ color: tasa >= 70 ? S.green : tasa >= 40 ? S.orange : S.red }}>{tasa}%</p>
                          <p className="text-[9px]" style={{ color: S.silverDim }}>tasa</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Detalle por día (solo en modo día/mes) */}
            {fins.filter(d => (d.devolucionesSolicitadas || 0) > 0 || (d.devolucionesAutorizadas || 0) > 0).length > 0 && (
              <div className="rounded-2xl overflow-hidden" style={{ background: S.card, border: `1px solid ${S.border}` }}>
                <div className="px-4 py-3" style={{ borderBottom: `1px solid ${S.border}` }}>
                  <p className="text-sm font-bold" style={{ color: S.silverBright }}>Registro detallado</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${S.border}` }}>
                        {['Fecha','Colaborador','Solicitadas','Autorizadas','Tasa'].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-medium" style={{ color: S.silverDim }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {fins
                        .filter(d => (d.devolucionesSolicitadas || 0) > 0 || (d.devolucionesAutorizadas || 0) > 0)
                        .sort((a, b) => b.fecha.localeCompare(a.fecha))
                        .map(d => {
                          const sol  = d.devolucionesSolicitadas || 0
                          const aut  = d.devolucionesAutorizadas || 0
                          const tasa = sol > 0 ? Math.round((aut / sol) * 100) : 0
                          return (
                            <tr key={d.id} style={{ borderBottom: `1px solid ${S.border}` }}>
                              <td className="px-3 py-2" style={{ color: S.silverDim }}>{d.fecha}</td>
                              <td className="px-3 py-2" style={{ color: S.silverBright }}>{d.memberName.split(' · ').pop()?.split(' ')[0]}</td>
                              <td className="px-3 py-2 font-bold" style={{ color: S.orange }}>{sol}</td>
                              <td className="px-3 py-2 font-bold" style={{ color: S.green }}>{aut}</td>
                              <td className="px-3 py-2 font-bold" style={{ color: tasa >= 70 ? S.green : tasa >= 40 ? S.orange : S.red }}>{tasa}%</td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
