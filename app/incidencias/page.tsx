'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Headset, Video, MapPin, Gem, Plus, X, Calendar, FileText,
  CheckCircle2, Clock, AlertCircle, Ban, Trash2, DollarSign,
  BarChart3, List, Trophy, Banknote, Phone, Mail, MessageCircle, UserRound,
} from 'lucide-react'
import { useAuth } from '@/components/LoginGate'
import { useFirestoreCollection } from '@/lib/firestoreCollection'
import { getMembers, TeamMember } from '@/lib/teamStore'

const S = {
  bg:           '#060608',
  card:         '#0c0c14',
  border:       '#1a1a28',
  borderLight:  'rgba(180,185,210,0.18)',
  silver:       '#b8bcc8',
  silverBright: '#d4d8e8',
  silverDim:    '#3a3e4a',
}

/* ─── Tipos ─────────────────────────────────────────────────────────────── */
type Categoria = 'soporte' | 'webinar' | 'presenciales' | 'high-ticket'
type Situacion = 'abierta' | 'en-proceso' | 'resuelta' | 'cancelada'
type Moneda = 'USD' | 'MXN'

type Caso = {
  id: string
  categoria: Categoria
  nombre: string
  vendedor: string
  situacion: Situacion
  fecha: string
  notas: string
  resolucion: string
  reembolso: boolean
  montoReembolso: number
  monedaReembolso: Moneda
  createdAt: string
  createdBy: string
  updatedAt: string
}

const CATEGORIAS: { id: Categoria; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'soporte',      label: 'Soporte',      icon: <Headset size={16} />, color: '#6aaddc' },
  { id: 'webinar',      label: 'Webinar',      icon: <Video size={16} />,   color: '#70c878' },
  { id: 'presenciales', label: 'Presenciales', icon: <MapPin size={16} />,  color: '#dcaa50' },
  { id: 'high-ticket',  label: 'High Ticket',  icon: <Gem size={16} />,     color: '#b070e0' },
]

const SITUACIONES: { id: Situacion; label: string; color: string; icon: React.ReactNode }[] = [
  { id: 'abierta',     label: 'Abierta',     color: '#dc6060', icon: <AlertCircle size={12} /> },
  { id: 'en-proceso',  label: 'En Proceso',  color: '#dcbe3c', icon: <Clock size={12} /> },
  { id: 'resuelta',    label: 'Resuelta',    color: '#60c878', icon: <CheckCircle2 size={12} /> },
  { id: 'cancelada',   label: 'Cancelada',   color: '#5a5e6a', icon: <Ban size={12} /> },
]

function situacionInfo(s: Situacion) {
  return SITUACIONES.find(x => x.id === s) || SITUACIONES[0]
}
function categoriaInfo(c: Categoria) {
  return CATEGORIAS.find(x => x.id === c)!
}

/* ─── Contacto Cliente (archivo de contactos completados) ───────────────── */
type MetodoContacto = 'whatsapp' | 'correo' | 'llamada'

type ContactoCliente = {
  id: string
  clienteNombre: string
  fecha: string
  hora: string
  metodo: MetodoContacto
  lada?: string
  telefono?: string
  asignadoA: string
  asignadoPor: string
  estado: 'pendiente' | 'completada'
  resolucion?: string
  createdAt: string
  completedAt?: string
}

const METODO_CONTACTO_INFO: Record<MetodoContacto, { label: string; icon: React.ReactNode }> = {
  whatsapp: { label: 'WhatsApp', icon: <MessageCircle size={13} /> },
  correo:   { label: 'Correo',   icon: <Mail size={13} /> },
  llamada:  { label: 'Llamada',  icon: <Phone size={13} /> },
}

function nombreCortoMiembro(nombre: string) {
  return nombre.includes(' · ') ? nombre.split(' · ').pop()! : nombre
}

const fmtMXN = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
const fmtUSD = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

/* ─── Modal de formulario (crear / editar) ──────────────────────────────── */
function CasoModal({ categoria, caso, onClose, onSaved, addCaso, updateCaso, removeCaso }: {
  categoria: Categoria
  caso: Caso | null
  onClose: () => void
  onSaved: () => void
  addCaso: (item: Omit<Caso, 'id'>) => Promise<string>
  updateCaso: (id: string, item: Partial<Caso>) => Promise<void>
  removeCaso: (id: string) => Promise<void>
}) {
  const { session } = useAuth()
  const [nombre, setNombre] = useState(caso?.nombre || '')
  const [vendedor, setVendedor] = useState(caso?.vendedor || '')
  const [situacion, setSituacion] = useState<Situacion>(caso?.situacion || 'abierta')
  const [fecha, setFecha] = useState(caso?.fecha || new Date().toISOString().split('T')[0])
  const [notas, setNotas] = useState(caso?.notas || '')
  const [resolucion, setResolucion] = useState(caso?.resolucion || '')
  const [reembolso, setReembolso] = useState(caso?.reembolso || false)
  const [montoReembolso, setMontoReembolso] = useState(caso?.montoReembolso ? String(caso.montoReembolso) : '')
  const [monedaReembolso, setMonedaReembolso] = useState<Moneda>(caso?.monedaReembolso || 'MXN')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!nombre.trim()) return
    setSaving(true)
    const payload = {
      nombre, vendedor, situacion, fecha, notas, resolucion,
      reembolso,
      montoReembolso: reembolso ? parseFloat(montoReembolso.replace(/,/g, '')) || 0 : 0,
      monedaReembolso,
    }
    const now = new Date().toISOString()
    if (caso) {
      await updateCaso(caso.id, { ...payload, updatedAt: now })
    } else {
      await addCaso({
        categoria, ...payload,
        createdBy: session?.memberName || '',
        createdAt: now,
        updatedAt: now,
      })
    }
    setSaving(false)
    onSaved()
  }

  async function remove() {
    if (!caso) return
    await removeCaso(caso.id)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#09090f', border: '1px solid rgba(180,185,210,0.2)', boxShadow: '0 0 80px rgba(0,0,0,0.9)', maxHeight: '88vh' }}>

        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
          <p className="flex-1 text-sm font-bold" style={{ color: S.silverBright }}>
            {caso ? 'Editar caso' : 'Nuevo caso'}
          </p>
          <button onClick={onClose} style={{ color: S.silverDim }}><X size={16} /></button>
        </div>

        <div className="px-5 py-5 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(88vh - 130px)' }}>
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Nombre</p>
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              placeholder="Nombre del cliente o caso"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
              style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Vendedor</p>
            <input value={vendedor} onChange={e => setVendedor(e.target.value)}
              placeholder="Nombre del vendedor"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
              style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Situación</p>
            <div className="flex flex-wrap gap-2">
              {SITUACIONES.map(s => (
                <button key={s.id} onClick={() => setSituacion(s.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={situacion === s.id
                    ? { background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}55` }
                    : { background: 'rgba(180,185,210,0.05)', color: S.silverDim, border: `1px solid ${S.border}` }
                  }>
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Fecha</p>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
              style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Notas</p>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={3}
              placeholder="Detalles de la situación…"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm resize-none"
              style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Resolución</p>
            <textarea value={resolucion} onChange={e => setResolucion(e.target.value)} rows={3}
              placeholder="¿Cómo se resolvió o qué sigue?"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm resize-none"
              style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
          </div>

          {/* Botón Reembolso */}
          <div>
            <button onClick={() => setReembolso(r => !r)}
              className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all"
              style={reembolso
                ? { background: 'rgba(220,80,80,0.14)', color: '#e07070', border: '1px solid rgba(220,80,80,0.4)' }
                : { background: 'rgba(180,185,210,0.05)', color: S.silverDim, border: `1px solid ${S.border}` }
              }>
              <DollarSign size={16} />
              {reembolso ? 'La solución fue Reembolso' : 'Marcar como Reembolso'}
            </button>

            {reembolso && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Monto</p>
                  <input type="number" value={montoReembolso} onChange={e => setMontoReembolso(e.target.value)}
                    placeholder="ej. 1500"
                    className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                    style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
                </div>
                <div>
                  <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Moneda</p>
                  <div className="flex gap-2">
                    {(['MXN', 'USD'] as Moneda[]).map(m => (
                      <button key={m} onClick={() => setMonedaReembolso(m)}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                        style={monedaReembolso === m
                          ? { background: 'rgba(220,80,80,0.14)', color: '#e07070', border: '1px solid rgba(220,80,80,0.4)' }
                          : { background: 'rgba(180,185,210,0.05)', color: S.silverDim, border: `1px solid ${S.border}` }
                        }>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 px-5 py-4" style={{ borderTop: `1px solid ${S.border}` }}>
          {caso && (
            <button onClick={remove}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{ color: '#e07070', border: '1px solid rgba(220,80,80,0.25)', background: 'rgba(220,80,80,0.06)' }}>
              <Trash2 size={13} /> Eliminar
            </button>
          )}
          <button onClick={save} disabled={!nombre.trim() || saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)', opacity: !nombre.trim() || saving ? 0.5 : 1 }}>
            {saving ? 'Guardando…' : caso ? 'Guardar cambios' : 'Crear caso'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Tarjeta de caso ───────────────────────────────────────────────────── */
function CasoCard({ caso, onClick }: { caso: Caso; onClick: () => void }) {
  const sit = situacionInfo(caso.situacion)
  return (
    <button onClick={onClick} className="w-full text-left rounded-xl overflow-hidden transition-all"
      style={{ background: S.card, border: `1px solid ${S.border}` }}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className="text-sm font-bold truncate" style={{ color: S.silverBright }}>{caso.nombre}</p>
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0"
            style={{ background: `${sit.color}18`, color: sit.color, border: `1px solid ${sit.color}40` }}>
            {sit.icon} {sit.label}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] mb-2 flex-wrap" style={{ color: S.silverDim }}>
          <span className="flex items-center gap-1"><Calendar size={11} />
            {new Date(caso.fecha + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          {caso.vendedor && (
            <span>Vendedor: <span style={{ color: S.silver }}>{caso.vendedor}</span></span>
          )}
        </div>
        {caso.notas && (
          <p className="text-xs leading-relaxed mb-1.5" style={{ color: '#9094a4' }}>
            <span style={{ color: S.silverDim }}>Notas: </span>{caso.notas}
          </p>
        )}
        {caso.resolucion && (
          <p className="text-xs leading-relaxed mb-1.5" style={{ color: '#70c878' }}>
            <span style={{ color: S.silverDim }}>Resolución: </span>{caso.resolucion}
          </p>
        )}
        {caso.reembolso && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
            style={{ background: 'rgba(220,80,80,0.12)', color: '#e07070', border: '1px solid rgba(220,80,80,0.3)' }}>
            <DollarSign size={11} /> Reembolso · {caso.monedaReembolso === 'USD' ? fmtUSD(caso.montoReembolso) : fmtMXN(caso.montoReembolso)}
          </span>
        )}
      </div>
    </button>
  )
}

/* ─── Ranking de barras genérico ─────────────────────────────────────────── */
function RankingBars({ data, formatValue }: {
  data: { label: string; value: number; color?: string }[]
  formatValue?: (v: number) => string
}) {
  if (data.length === 0) {
    return <p className="text-xs text-center py-6" style={{ color: S.silverDim }}>Sin datos todavía</p>
  }
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-5 text-[11px] font-bold flex-shrink-0 text-center"
            style={{ color: i === 0 ? '#dcaa50' : S.silverDim }}>
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium truncate" style={{ color: S.silver }}>{d.label}</p>
              <p className="text-xs font-bold flex-shrink-0 ml-2" style={{ color: d.color || S.silverBright }}>
                {formatValue ? formatValue(d.value) : d.value}
              </p>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(180,185,210,0.08)' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${Math.max(4, (d.value / max) * 100)}%`, background: d.color || S.silver }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Tarjeta contenedora de sección de stats ───────────────────────────── */
function StatCard({ titulo, subtitulo, icon, children }: {
  titulo: string; subtitulo?: string; icon: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: S.card, border: `1px solid ${S.borderLight}` }}>
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.02)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(180,185,210,0.08)', border: `1px solid ${S.border}` }}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: S.silverBright }}>{titulo}</h3>
          {subtitulo && <p className="text-[11px] mt-0.5" style={{ color: S.silverDim }}>{subtitulo}</p>}
        </div>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

/* ─── Vista de Estadísticas ──────────────────────────────────────────────── */
function Estadisticas({ casos }: { casos: Caso[] }) {
  const stats = useMemo(() => {
    // Ranking de incidencias por vendedor
    const porVendedor = new Map<string, number>()
    for (const c of casos) {
      const v = c.vendedor.trim() || 'Sin asignar'
      porVendedor.set(v, (porVendedor.get(v) || 0) + 1)
    }
    const rankingVendedores = [...porVendedor.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)

    // Ranking de incidencias por departamento
    const porDepto = new Map<Categoria, number>()
    for (const c of casos) porDepto.set(c.categoria, (porDepto.get(c.categoria) || 0) + 1)
    const rankingDeptos = CATEGORIAS
      .map(cat => ({ label: cat.label, value: porDepto.get(cat.id) || 0, color: cat.color }))
      .sort((a, b) => b.value - a.value)

    // Reembolsos
    const reembolsos = casos.filter(c => c.reembolso)
    const totalUSD = reembolsos.filter(c => c.monedaReembolso === 'USD').reduce((a, c) => a + c.montoReembolso, 0)
    const totalMXN = reembolsos.filter(c => c.monedaReembolso === 'MXN').reduce((a, c) => a + c.montoReembolso, 0)

    // Reembolsos por vendedor
    const vendRe = new Map<string, { count: number; usd: number; mxn: number }>()
    for (const c of reembolsos) {
      const v = c.vendedor.trim() || 'Sin asignar'
      const cur = vendRe.get(v) || { count: 0, usd: 0, mxn: 0 }
      cur.count++
      if (c.monedaReembolso === 'USD') cur.usd += c.montoReembolso
      else cur.mxn += c.montoReembolso
      vendRe.set(v, cur)
    }
    const tablaVendedoresReembolso = [...vendRe.entries()]
      .map(([nombre, v]) => ({ nombre, ...v }))
      .sort((a, b) => b.count - a.count)

    // Reembolsos por departamento
    const deptoRe = new Map<Categoria, { count: number; usd: number; mxn: number }>()
    for (const c of reembolsos) {
      const cur = deptoRe.get(c.categoria) || { count: 0, usd: 0, mxn: 0 }
      cur.count++
      if (c.monedaReembolso === 'USD') cur.usd += c.montoReembolso
      else cur.mxn += c.montoReembolso
      deptoRe.set(c.categoria, cur)
    }
    const tablaDeptosReembolso = CATEGORIAS
      .map(cat => ({ ...cat, ...(deptoRe.get(cat.id) || { count: 0, usd: 0, mxn: 0 }) }))
      .sort((a, b) => b.count - a.count)

    // % del total de reembolso por departamento (separado por moneda)
    const pctDeptoUSD = CATEGORIAS.map(cat => {
      const v = deptoRe.get(cat.id)?.usd || 0
      return { ...cat, monto: v, pct: totalUSD > 0 ? (v / totalUSD) * 100 : 0 }
    }).filter(d => d.monto > 0).sort((a, b) => b.monto - a.monto)

    const pctDeptoMXN = CATEGORIAS.map(cat => {
      const v = deptoRe.get(cat.id)?.mxn || 0
      return { ...cat, monto: v, pct: totalMXN > 0 ? (v / totalMXN) * 100 : 0 }
    }).filter(d => d.monto > 0).sort((a, b) => b.monto - a.monto)

    // Monto de reembolso por mes
    const porMes = new Map<string, { usd: number; mxn: number }>()
    for (const c of reembolsos) {
      const mes = c.fecha.slice(0, 7) // YYYY-MM
      const cur = porMes.get(mes) || { usd: 0, mxn: 0 }
      if (c.monedaReembolso === 'USD') cur.usd += c.montoReembolso
      else cur.mxn += c.montoReembolso
      porMes.set(mes, cur)
    }
    const mensual = [...porMes.entries()]
      .map(([mes, v]) => ({ mes, ...v }))
      .sort((a, b) => b.mes.localeCompare(a.mes))

    return {
      rankingVendedores, rankingDeptos,
      totalUSD, totalMXN, countReembolsos: reembolsos.length,
      tablaVendedoresReembolso, tablaDeptosReembolso,
      pctDeptoUSD, pctDeptoMXN, mensual,
    }
  }, [casos])

  function mesLabel(mes: string) {
    const [y, m] = mes.split('-')
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="space-y-5">

      {/* Totales acumulados */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl px-4 py-4" style={{ background: 'rgba(220,80,80,0.08)', border: '1px solid rgba(220,80,80,0.25)' }}>
          <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: 'rgba(224,112,112,0.7)' }}>Reembolsado MXN</p>
          <p className="text-xl font-black" style={{ color: '#e07070' }}>{fmtMXN(stats.totalMXN)}</p>
        </div>
        <div className="rounded-2xl px-4 py-4" style={{ background: 'rgba(220,80,80,0.08)', border: '1px solid rgba(220,80,80,0.25)' }}>
          <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: 'rgba(224,112,112,0.7)' }}>Reembolsado USD</p>
          <p className="text-xl font-black" style={{ color: '#e07070' }}>{fmtUSD(stats.totalUSD)}</p>
        </div>
      </div>

      {/* Ranking vendedores por incidencias */}
      <StatCard titulo="Ranking · Vendedores con más incidencias" icon={<Trophy size={16} style={{ color: '#dcaa50' }} />}>
        <RankingBars data={stats.rankingVendedores} />
      </StatCard>

      {/* Ranking departamentos por incidencias */}
      <StatCard titulo="Ranking · Departamento con más incidencias" icon={<BarChart3 size={16} style={{ color: '#6aaddc' }} />}>
        <RankingBars data={stats.rankingDeptos} />
      </StatCard>

      {/* Tabla vendedores con más reembolsos */}
      <StatCard titulo="Vendedores con más reembolsos" icon={<Banknote size={16} style={{ color: '#e07070' }} />}>
        {stats.tablaVendedoresReembolso.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: S.silverDim }}>Sin reembolsos registrados</p>
        ) : (
          <div className="space-y-2">
            {stats.tablaVendedoresReembolso.map((v, i) => (
              <div key={v.nombre} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: '#08080e', border: `1px solid ${S.border}` }}>
                <span className="w-5 text-[11px] font-bold text-center flex-shrink-0" style={{ color: i === 0 ? '#dcaa50' : S.silverDim }}>{i + 1}</span>
                <p className="flex-1 text-xs font-medium truncate" style={{ color: S.silver }}>{v.nombre}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: 'rgba(220,80,80,0.1)', color: '#e07070', border: '1px solid rgba(220,80,80,0.25)' }}>
                  {v.count} caso{v.count !== 1 ? 's' : ''}
                </span>
                <div className="text-right flex-shrink-0">
                  {v.mxn > 0 && <p className="text-[11px] font-bold" style={{ color: S.silverBright }}>{fmtMXN(v.mxn)}</p>}
                  {v.usd > 0 && <p className="text-[11px] font-bold" style={{ color: S.silverBright }}>{fmtUSD(v.usd)}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </StatCard>

      {/* Tabla departamentos con más reembolsos */}
      <StatCard titulo="Departamento que ocasiona más reembolsos" icon={<Banknote size={16} style={{ color: '#e07070' }} />}>
        {stats.tablaDeptosReembolso.every(d => d.count === 0) ? (
          <p className="text-xs text-center py-4" style={{ color: S.silverDim }}>Sin reembolsos registrados</p>
        ) : (
          <div className="space-y-2">
            {stats.tablaDeptosReembolso.map((d, i) => (
              <div key={d.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: '#08080e', border: `1px solid ${S.border}` }}>
                <span className="w-5 text-[11px] font-bold text-center flex-shrink-0" style={{ color: i === 0 ? '#dcaa50' : S.silverDim }}>{i + 1}</span>
                <span style={{ color: d.color }}>{d.icon}</span>
                <p className="flex-1 text-xs font-medium truncate" style={{ color: S.silver }}>{d.label}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: `${d.color}18`, color: d.color, border: `1px solid ${d.color}40` }}>
                  {d.count} caso{d.count !== 1 ? 's' : ''}
                </span>
                <div className="text-right flex-shrink-0">
                  {d.mxn > 0 && <p className="text-[11px] font-bold" style={{ color: S.silverBright }}>{fmtMXN(d.mxn)}</p>}
                  {d.usd > 0 && <p className="text-[11px] font-bold" style={{ color: S.silverBright }}>{fmtUSD(d.usd)}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </StatCard>

      {/* % del total de reembolso por departamento */}
      <StatCard titulo="% del total reembolsado por departamento" subtitulo="Separado por moneda" icon={<BarChart3 size={16} style={{ color: '#b070e0' }} />}>
        <div className="space-y-5">
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: S.silverDim }}>Pesos Mexicanos (MXN)</p>
            {stats.pctDeptoMXN.length === 0 ? (
              <p className="text-xs" style={{ color: S.silverDim }}>Sin reembolsos en MXN</p>
            ) : (
              <>
                <div className="h-3 rounded-full overflow-hidden flex mb-2" style={{ background: 'rgba(180,185,210,0.08)' }}>
                  {stats.pctDeptoMXN.map(d => (
                    <div key={d.id} style={{ width: `${d.pct}%`, background: d.color }} title={`${d.label} ${d.pct.toFixed(0)}%`} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  {stats.pctDeptoMXN.map(d => (
                    <span key={d.id} className="flex items-center gap-1.5 text-[11px]" style={{ color: S.silver }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      {d.label} · {d.pct.toFixed(0)}% ({fmtMXN(d.monto)})
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: S.silverDim }}>Dólares (USD)</p>
            {stats.pctDeptoUSD.length === 0 ? (
              <p className="text-xs" style={{ color: S.silverDim }}>Sin reembolsos en USD</p>
            ) : (
              <>
                <div className="h-3 rounded-full overflow-hidden flex mb-2" style={{ background: 'rgba(180,185,210,0.08)' }}>
                  {stats.pctDeptoUSD.map(d => (
                    <div key={d.id} style={{ width: `${d.pct}%`, background: d.color }} title={`${d.label} ${d.pct.toFixed(0)}%`} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  {stats.pctDeptoUSD.map(d => (
                    <span key={d.id} className="flex items-center gap-1.5 text-[11px]" style={{ color: S.silver }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      {d.label} · {d.pct.toFixed(0)}% ({fmtUSD(d.monto)})
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </StatCard>

      {/* Monto de reembolso por mes */}
      <StatCard titulo="Reembolsos por mes" icon={<Calendar size={16} style={{ color: '#6aaddc' }} />}>
        {stats.mensual.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: S.silverDim }}>Sin reembolsos registrados</p>
        ) : (
          <div className="space-y-3">
            {stats.mensual.map(m => (
              <div key={m.mes}>
                <p className="text-xs font-semibold capitalize mb-1.5" style={{ color: S.silver }}>{mesLabel(m.mes)}</p>
                <div className="flex gap-4">
                  {m.mxn > 0 && (
                    <div className="flex-1">
                      <div className="h-2 rounded-full mb-1" style={{ background: 'rgba(220,80,80,0.5)' }} />
                      <p className="text-[11px]" style={{ color: S.silverDim }}>MXN: <span style={{ color: S.silverBright }}>{fmtMXN(m.mxn)}</span></p>
                    </div>
                  )}
                  {m.usd > 0 && (
                    <div className="flex-1">
                      <div className="h-2 rounded-full mb-1" style={{ background: 'rgba(106,173,220,0.5)' }} />
                      <p className="text-[11px]" style={{ color: S.silverDim }}>USD: <span style={{ color: S.silverBright }}>{fmtUSD(m.usd)}</span></p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </StatCard>
    </div>
  )
}

/* ─── Archivo de Contacto Cliente (se llenan solos al completarse) ───────── */
function ArchivoContactos() {
  const [members, setMembers] = useState<TeamMember[]>([])
  useEffect(() => { getMembers().then(setMembers) }, [])

  const { data: todos, loading, remove } = useFirestoreCollection<ContactoCliente>('contactos_cliente')
  const completados = todos
    .filter(c => c.estado === 'completada')
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  function nombreDe(memberId: string) {
    const m = members.find(x => x.id === memberId)
    return m ? nombreCortoMiembro(m.name) : '—'
  }

  async function eliminar(id: string) {
    await remove(id)
    setConfirmDelete(null)
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-sm font-bold" style={{ color: S.silverBright }}>Contacto Cliente — completados</h3>
        <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>
          Se archivan aquí automáticamente al marcarse como completados en Inicio
        </p>
      </div>

      {loading ? (
        <p className="text-center text-sm py-10" style={{ color: S.silverDim }}>Cargando…</p>
      ) : completados.length === 0 ? (
        <div className="text-center py-12" style={{ color: S.silverDim }}>
          <Phone size={32} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">Sin contactos completados todavía</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {completados.map(c => {
            const mInfo = METODO_CONTACTO_INFO[c.metodo]
            return (
              <div key={c.id} className="rounded-2xl overflow-hidden" style={{ background: S.card, border: `1px solid ${S.border}` }}>
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="text-sm font-bold truncate" style={{ color: S.silverBright }}>{c.clienteNombre}</p>
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0"
                      style={{ background: 'rgba(100,200,120,0.12)', color: '#70c080', border: '1px solid rgba(100,200,120,0.3)' }}>
                      <CheckCircle2 size={11} /> Completada
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] mb-2 flex-wrap" style={{ color: S.silverDim }}>
                    <span className="flex items-center gap-1"><Calendar size={11} />
                      {new Date(c.fecha + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })} · {c.hora}
                    </span>
                    <span className="flex items-center gap-1">{mInfo.icon} {mInfo.label}</span>
                    {c.metodo === 'llamada' && c.telefono && <span>{c.lada} {c.telefono}</span>}
                    <span className="flex items-center gap-1"><UserRound size={11} /> {nombreDe(c.asignadoA)}</span>
                  </div>
                  {c.resolucion && (
                    <p className="text-xs leading-relaxed mb-2" style={{ color: '#9094a4' }}>
                      <span style={{ color: S.silverDim }}>Resolución: </span>{c.resolucion}
                    </p>
                  )}

                  {confirmDelete === c.id ? (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[11px] flex-1" style={{ color: S.silverDim }}>¿Eliminar este registro?</p>
                      <button onClick={() => setConfirmDelete(null)}
                        className="text-[11px] px-2.5 py-1 rounded-lg" style={{ color: S.silverDim, border: `1px solid ${S.border}` }}>
                        Cancelar
                      </button>
                      <button onClick={() => eliminar(c.id)}
                        className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg"
                        style={{ color: '#e07070', border: '1px solid rgba(220,80,80,0.3)', background: 'rgba(220,80,80,0.08)' }}>
                        <Trash2 size={11} /> Eliminar
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(c.id)}
                      className="flex items-center gap-1 text-[10px] mt-1" style={{ color: S.silverDim }}>
                      <Trash2 size={10} /> Eliminar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─── Página principal ───────────────────────────────────────────────────── */
export default function IncidenciasPage() {
  const [vista, setVista] = useState<'lista' | 'stats' | 'contactos'>('lista')
  const [categoria, setCategoria] = useState<Categoria>('soporte')
  const [modal, setModal] = useState<'new' | Caso | null>(null)

  const { data: todos, loading, add: addCaso, update: updateCaso, remove: removeCaso } =
    useFirestoreCollection<Caso>('incidencias')

  const casos = todos.filter(c => c.categoria === categoria)

  function cerrarModal() {
    setModal(null)
  }

  const catActual = categoriaInfo(categoria)

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: S.silverBright }}>Incidencias</h1>
          <p className="text-sm mt-1" style={{ color: S.silverDim }}>Registro de casos por área</p>
        </div>

        {/* Toggle Lista / Estadísticas */}
        <div className="flex gap-2 mb-5">
          <button onClick={() => setVista('lista')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={vista === 'lista'
              ? { background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)' }
              : { background: 'rgba(180,185,210,0.03)', color: S.silverDim, border: `1px solid ${S.border}` }
            }>
            <List size={15} /> Lista
          </button>
          <button onClick={() => setVista('stats')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={vista === 'stats'
              ? { background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)' }
              : { background: 'rgba(180,185,210,0.03)', color: S.silverDim, border: `1px solid ${S.border}` }
            }>
            <BarChart3 size={15} /> Estadísticas
          </button>
          <button onClick={() => setVista('contactos')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={vista === 'contactos'
              ? { background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)' }
              : { background: 'rgba(180,185,210,0.03)', color: S.silverDim, border: `1px solid ${S.border}` }
            }>
            <Phone size={15} /> Contacto Cliente
          </button>
        </div>

        {vista === 'contactos' ? (
          <ArchivoContactos />
        ) : vista === 'lista' ? (
          <>
            {/* Tabs de categoría */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {CATEGORIAS.map(c => (
                <button key={c.id} onClick={() => setCategoria(c.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex-shrink-0"
                  style={categoria === c.id
                    ? { background: `${c.color}1c`, color: c.color, border: `1px solid ${c.color}50` }
                    : { background: 'rgba(180,185,210,0.04)', color: S.silverDim, border: `1px solid ${S.border}` }
                  }>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>

            {/* Botón nuevo caso */}
            <button onClick={() => setModal('new')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-5 text-sm font-bold transition-all"
              style={{ background: `${catActual.color}14`, color: catActual.color, border: `1px solid ${catActual.color}40` }}>
              <Plus size={16} /> Nuevo caso de {catActual.label}
            </button>

            {/* Lista de casos */}
            {loading ? (
              <p className="text-center text-sm py-10" style={{ color: S.silverDim }}>Cargando…</p>
            ) : casos.length === 0 ? (
              <div className="text-center py-12" style={{ color: S.silverDim }}>
                <FileText size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">Sin casos registrados en {catActual.label}</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {casos.map(caso => (
                  <CasoCard key={caso.id} caso={caso} onClick={() => setModal(caso)} />
                ))}
              </div>
            )}
          </>
        ) : (
          <Estadisticas casos={todos} />
        )}
      </div>

      {modal && (
        <CasoModal
          categoria={categoria}
          caso={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={cerrarModal}
          addCaso={addCaso}
          updateCaso={updateCaso}
          removeCaso={removeCaso}
        />
      )}
    </div>
  )
}
