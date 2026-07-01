'use client'

import { useState, useMemo } from 'react'
import {
  Plus, X, Calendar, FileText, Trash2, BarChart3, List,
  Trophy, Banknote, ShieldCheck, ShieldOff, ShieldAlert,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
} from 'lucide-react'
import { useAuth } from '@/components/LoginGate'
import { useFirestoreCollection } from '@/lib/firestoreCollection'

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

/* ─── Constantes ────────────────────────────────────────────────────────── */
type Divisa = 'MXN' | 'USD'
type Acceso = 'activo' | 'sin-acceso' | 'revocado'

type Reembolso = {
  id: string
  evento: string
  mes: string
  plataforma: string
  fechaDevolucion: string
  monto: number
  divisa: Divisa
  correo: string
  producto: string
  productoDetalle: string
  acceso: Acceso
  banco: string
  bancoDetalle: string
  numeroTarjeta: string
  numeroOperacion: string
  notas: string
  costoEmpresa: number
  costoEmpresaDivisa: Divisa
  createdAt: string
  createdBy: string
  updatedAt: string
}

const PLATAFORMAS = [
  'Kajabi', 'Stripe LLC', 'Stripe Meses', 'Stripe Contado', 'Hotmart',
  'Mercado Libre', 'Zelle', 'Transferencia', 'Cripto', 'PayPal', 'Klarna', 'Afterpay',
]

const PRODUCTOS = ['Club Sinergetico', 'Apartado', 'MAS', 'Legendar-IA', 'Black', 'Otro']
const BANCOS = ['Visa', 'Amex', 'Mastercard', 'Otro']

const ACCESOS: { id: Acceso; label: string; color: string; icon: React.ReactNode }[] = [
  { id: 'activo',      label: 'Activo',      color: '#60c878', icon: <ShieldCheck size={13} /> },
  { id: 'sin-acceso',  label: 'Sin acceso',  color: '#dcbe3c', icon: <ShieldAlert size={13} /> },
  { id: 'revocado',    label: 'Revocado',    color: '#dc6060', icon: <ShieldOff size={13} /> },
]

function accesoInfo(a: Acceso) { return ACCESOS.find(x => x.id === a) || ACCESOS[0] }

const fmtMXN = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
const fmtUSD = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const MESES_NOMBRE = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

/* ─── Modal de formulario (crear / editar) ──────────────────────────────── */
function ReembolsoModal({ reembolso, onClose, onSaved, addReembolso, updateReembolso, removeReembolso }: {
  reembolso: Reembolso | null
  onClose: () => void
  onSaved: () => void
  addReembolso: (item: Omit<Reembolso, 'id'>) => Promise<string>
  updateReembolso: (id: string, item: Partial<Reembolso>) => Promise<void>
  removeReembolso: (id: string) => Promise<void>
}) {
  const { session } = useAuth()
  const [evento, setEvento] = useState(reembolso?.evento || '')
  const [mes, setMes] = useState(reembolso?.mes || new Date().toISOString().slice(0, 7))
  const [plataforma, setPlataforma] = useState(reembolso?.plataforma || PLATAFORMAS[0])
  const [fechaDevolucion, setFechaDevolucion] = useState(reembolso?.fechaDevolucion || new Date().toISOString().split('T')[0])
  const [monto, setMonto] = useState(reembolso ? String(reembolso.monto) : '')
  const [divisa, setDivisa] = useState<Divisa>(reembolso?.divisa || 'MXN')
  const [correo, setCorreo] = useState(reembolso?.correo || '')
  const [producto, setProducto] = useState(reembolso?.producto || PRODUCTOS[0])
  const [productoDetalle, setProductoDetalle] = useState(reembolso?.productoDetalle || '')
  const [acceso, setAcceso] = useState<Acceso>(reembolso?.acceso || 'activo')
  const [banco, setBanco] = useState(reembolso?.banco || BANCOS[0])
  const [bancoDetalle, setBancoDetalle] = useState(reembolso?.bancoDetalle || '')
  const [numeroTarjeta, setNumeroTarjeta] = useState(reembolso?.numeroTarjeta || '')
  const [numeroOperacion, setNumeroOperacion] = useState(reembolso?.numeroOperacion || '')
  const [notas, setNotas] = useState(reembolso?.notas || '')
  const [costoEmpresa, setCostoEmpresa] = useState(reembolso ? String(reembolso.costoEmpresa) : '')
  const [costoEmpresaDivisa, setCostoEmpresaDivisa] = useState<Divisa>(reembolso?.costoEmpresaDivisa || 'MXN')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!evento.trim()) return
    setSaving(true)
    const payload = {
      evento, mes, plataforma, fechaDevolucion,
      monto: parseFloat(monto.replace(/,/g, '')) || 0, divisa,
      correo, producto, productoDetalle, acceso,
      banco, bancoDetalle, numeroTarjeta, numeroOperacion, notas,
      costoEmpresa: parseFloat(costoEmpresa.replace(/,/g, '')) || 0, costoEmpresaDivisa,
    }
    const now = new Date().toISOString()
    if (reembolso) {
      await updateReembolso(reembolso.id, { ...payload, updatedAt: now })
    } else {
      await addReembolso({ ...payload, createdBy: session?.memberName || '', createdAt: now, updatedAt: now })
    }
    setSaving(false)
    onSaved()
  }

  async function remove() {
    if (!reembolso) return
    await removeReembolso(reembolso.id)
    onSaved()
  }

  const inputStyle = { background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,var(--th-overlay-alpha))', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'var(--th-inner)', border: '1px solid rgba(180,185,210,0.2)', boxShadow: '0 0 80px rgba(0,0,0,0.9)', maxHeight: '90vh' }}>

        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
          <p className="flex-1 text-sm font-bold" style={{ color: S.silverBright }}>
            {reembolso ? 'Editar reembolso' : 'Nuevo reembolso'}
          </p>
          <button onClick={onClose} style={{ color: S.silverDim }}><X size={16} /></button>
        </div>

        <div className="px-5 py-5 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 130px)' }}>

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Evento</p>
            <input value={evento} onChange={e => setEvento(e.target.value)}
              placeholder="ej. Webinar Marzo, Bootcamp CDMX…"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Mes del evento</p>
              <input type="month" value={mes} onChange={e => setMes(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Fecha de devolución</p>
              <input type="date" value={fechaDevolucion} onChange={e => setFechaDevolucion(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
            </div>
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Plataforma</p>
            <select value={plataforma} onChange={e => setPlataforma(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle}>
              {PLATAFORMAS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Monto</p>
              <input type="number" value={monto} onChange={e => setMonto(e.target.value)}
                placeholder="ej. 1500"
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Divisa</p>
              <div className="flex gap-2">
                {(['MXN', 'USD'] as Divisa[]).map(m => (
                  <button key={m} onClick={() => setDivisa(m)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={divisa === m
                      ? { background: 'rgba(220,80,80,0.14)', color: '#e07070', border: '1px solid rgba(220,80,80,0.4)' }
                      : { background: 'rgba(180,185,210,0.05)', color: S.silverDim, border: `1px solid ${S.border}` }
                    }>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Correo</p>
            <input type="email" value={correo} onChange={e => setCorreo(e.target.value)}
              placeholder="cliente@correo.com"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Producto</p>
            <select value={producto} onChange={e => setProducto(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle}>
              {PRODUCTOS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {producto === 'Otro' && (
              <input value={productoDetalle} onChange={e => setProductoDetalle(e.target.value)}
                placeholder="Especifica el producto…"
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm mt-2" style={inputStyle} />
            )}
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Acceso</p>
            <div className="flex flex-wrap gap-2">
              {ACCESOS.map(a => (
                <button key={a.id} onClick={() => setAcceso(a.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={acceso === a.id
                    ? { background: `${a.color}22`, color: a.color, border: `1px solid ${a.color}55` }
                    : { background: 'rgba(180,185,210,0.05)', color: S.silverDim, border: `1px solid ${S.border}` }
                  }>
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Banco</p>
            <select value={banco} onChange={e => setBanco(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle}>
              {BANCOS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            {banco === 'Otro' && (
              <input value={bancoDetalle} onChange={e => setBancoDetalle(e.target.value)}
                placeholder="Especifica el banco…"
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm mt-2" style={inputStyle} />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Número de tarjeta</p>
              <input value={numeroTarjeta} onChange={e => setNumeroTarjeta(e.target.value)}
                placeholder="•••• 1234"
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Número de operación</p>
              <input value={numeroOperacion} onChange={e => setNumeroOperacion(e.target.value)}
                placeholder="ID de transacción"
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
            </div>
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Notas</p>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={3}
              placeholder="Detalles adicionales…"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm resize-none" style={inputStyle} />
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Costo a la empresa</p>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={costoEmpresa} onChange={e => setCostoEmpresa(e.target.value)}
                placeholder="ej. 200"
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
              <div className="flex gap-2">
                {(['MXN', 'USD'] as Divisa[]).map(m => (
                  <button key={m} onClick={() => setCostoEmpresaDivisa(m)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={costoEmpresaDivisa === m
                      ? { background: 'rgba(220,80,80,0.14)', color: '#e07070', border: '1px solid rgba(220,80,80,0.4)' }
                      : { background: 'rgba(180,185,210,0.05)', color: S.silverDim, border: `1px solid ${S.border}` }
                    }>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-5 py-4" style={{ borderTop: `1px solid ${S.border}` }}>
          {reembolso && (
            <button onClick={remove}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{ color: '#e07070', border: '1px solid rgba(220,80,80,0.25)', background: 'rgba(220,80,80,0.06)' }}>
              <Trash2 size={13} /> Eliminar
            </button>
          )}
          <button onClick={save} disabled={!evento.trim() || saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)', opacity: !evento.trim() || saving ? 0.5 : 1 }}>
            {saving ? 'Guardando…' : reembolso ? 'Guardar cambios' : 'Crear reembolso'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Tarjeta de reembolso ───────────────────────────────────────────────── */
function ReembolsoCard({ r, onClick }: { r: Reembolso; onClick: () => void }) {
  const acc = accesoInfo(r.acceso)
  const producto = r.producto === 'Otro' && r.productoDetalle ? r.productoDetalle : r.producto
  const banco = r.banco === 'Otro' && r.bancoDetalle ? r.bancoDetalle : r.banco

  return (
    <button onClick={onClick} className="w-full text-left rounded-xl overflow-hidden transition-all"
      style={{ background: S.card, border: `1px solid ${S.border}` }}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className="text-sm font-bold truncate" style={{ color: S.silverBright }}>{r.evento}</p>
          <span className="text-sm font-black flex-shrink-0" style={{ color: '#e07070' }}>
            {r.divisa === 'USD' ? fmtUSD(r.monto) : fmtMXN(r.monto)}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] mb-2 flex-wrap" style={{ color: S.silverDim }}>
          <span className="flex items-center gap-1"><Calendar size={11} />
            {new Date(r.fechaDevolucion + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span>{r.plataforma}</span>
          <span>{producto}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
            style={{ background: `${acc.color}18`, color: acc.color, border: `1px solid ${acc.color}40` }}>
            {acc.icon} {acc.label}
          </span>
          {banco && (
            <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: 'rgba(180,185,210,0.06)', color: S.silverDim, border: `1px solid ${S.border}` }}>
              {banco}
            </span>
          )}
          {r.costoEmpresa > 0 && (
            <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: 'rgba(180,185,210,0.06)', color: S.silverDim, border: `1px solid ${S.border}` }}>
              Costo: {r.costoEmpresaDivisa === 'USD' ? fmtUSD(r.costoEmpresa) : fmtMXN(r.costoEmpresa)}
            </span>
          )}
        </div>
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

/* ─── Desglose mensual por plataforma (colapsable) ──────────────────────── */
function PlataformaMensual({ plataforma, registros }: { plataforma: string; registros: Reembolso[] }) {
  const [open, setOpen] = useState(false)
  const porMes = useMemo(() => {
    const m = new Map<string, { mxn: number; usd: number }>()
    for (const r of registros) {
      const cur = m.get(r.fechaDevolucion.slice(0, 7)) || { mxn: 0, usd: 0 }
      if (r.divisa === 'USD') cur.usd += r.monto
      else cur.mxn += r.monto
      m.set(r.fechaDevolucion.slice(0, 7), cur)
    }
    return [...m.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [registros])

  const totalMXN = registros.filter(r => r.divisa === 'MXN').reduce((a, r) => a + r.monto, 0)
  const totalUSD = registros.filter(r => r.divisa === 'USD').reduce((a, r) => a + r.monto, 0)

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${S.border}` }}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 px-3 py-2.5"
        style={{ background: 'var(--th-inner)' }}>
        <p className="flex-1 text-left text-xs font-semibold" style={{ color: S.silver }}>{plataforma}</p>
        <span className="text-[11px] font-bold" style={{ color: S.silverDim }}>{registros.length} caso{registros.length !== 1 ? 's' : ''}</span>
        {open ? <ChevronUp size={14} style={{ color: S.silverDim }} /> : <ChevronDown size={14} style={{ color: S.silverDim }} />}
      </button>
      {open && (
        <div className="px-3 py-3 space-y-2" style={{ borderTop: `1px solid ${S.border}` }}>
          <div className="flex gap-4 mb-2">
            {totalMXN > 0 && <p className="text-xs font-bold" style={{ color: '#e07070' }}>Total MXN: {fmtMXN(totalMXN)}</p>}
            {totalUSD > 0 && <p className="text-xs font-bold" style={{ color: '#e07070' }}>Total USD: {fmtUSD(totalUSD)}</p>}
          </div>
          {porMes.map(([mes, v]) => {
            const [y, mo] = mes.split('-')
            return (
              <div key={mes} className="flex items-center justify-between text-[11px]">
                <span style={{ color: S.silverDim }}>{MESES_NOMBRE[Number(mo) - 1]} {y}</span>
                <span style={{ color: S.silverBright }}>
                  {v.mxn > 0 && fmtMXN(v.mxn)} {v.mxn > 0 && v.usd > 0 ? ' · ' : ''}{v.usd > 0 && fmtUSD(v.usd)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─── Vista de Estadísticas ──────────────────────────────────────────────── */
function Estadisticas({ todos }: { todos: Reembolso[] }) {
  const anios = useMemo(() => {
    const set = new Set(todos.map(r => r.fechaDevolucion.slice(0, 4)))
    set.add(String(new Date().getFullYear()))
    return [...set].sort((a, b) => b.localeCompare(a))
  }, [todos])

  const [anio, setAnio] = useState(() => String(new Date().getFullYear()))

  const idx = anios.indexOf(anio)
  function cambiarAnio(dir: 1 | -1) {
    const i = anios.indexOf(anio) - dir
    if (i >= 0 && i < anios.length) setAnio(anios[i])
  }

  const delAnio = useMemo(() => todos.filter(r => r.fechaDevolucion.slice(0, 4) === anio), [todos, anio])

  const stats = useMemo(() => {
    const totalMXN = delAnio.filter(r => r.divisa === 'MXN').reduce((a, r) => a + r.monto, 0)
    const totalUSD = delAnio.filter(r => r.divisa === 'USD').reduce((a, r) => a + r.monto, 0)
    const costoMXN = delAnio.filter(r => r.costoEmpresaDivisa === 'MXN').reduce((a, r) => a + r.costoEmpresa, 0)
    const costoUSD = delAnio.filter(r => r.costoEmpresaDivisa === 'USD').reduce((a, r) => a + r.costoEmpresa, 0)

    const porPlataforma = new Map<string, number>()
    for (const r of delAnio) porPlataforma.set(r.plataforma, (porPlataforma.get(r.plataforma) || 0) + 1)
    const rankingPlataformas = [...porPlataforma.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)

    const tablaPlataformas = PLATAFORMAS
      .map(p => {
        const regs = delAnio.filter(r => r.plataforma === p)
        return {
          plataforma: p,
          count: regs.length,
          mxn: regs.filter(r => r.divisa === 'MXN').reduce((a, r) => a + r.monto, 0),
          usd: regs.filter(r => r.divisa === 'USD').reduce((a, r) => a + r.monto, 0),
          regs,
        }
      })
      .filter(p => p.count > 0)
      .sort((a, b) => b.count - a.count)

    const mensualMXN = new Array(12).fill(0)
    const mensualUSD = new Array(12).fill(0)
    for (const r of delAnio) {
      const mIdx = Number(r.fechaDevolucion.slice(5, 7)) - 1
      if (r.divisa === 'MXN') mensualMXN[mIdx] += r.monto
      else mensualUSD[mIdx] += r.monto
    }

    return { totalMXN, totalUSD, costoMXN, costoUSD, rankingPlataformas, tablaPlataformas, mensualMXN, mensualUSD }
  }, [delAnio])

  return (
    <div className="space-y-5">

      {/* Selector de año */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => cambiarAnio(1)} disabled={idx >= anios.length - 1}
          style={{ color: idx >= anios.length - 1 ? '#2a2e3a' : S.silver }}>
          <ChevronLeft size={20} />
        </button>
        <p className="text-lg font-black" style={{ color: S.silverBright }}>{anio}</p>
        <button onClick={() => cambiarAnio(-1)} disabled={idx <= 0}
          style={{ color: idx <= 0 ? '#2a2e3a' : S.silver }}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Totales del año */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl px-4 py-4" style={{ background: 'rgba(220,80,80,0.08)', border: '1px solid rgba(220,80,80,0.25)' }}>
          <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: 'rgba(224,112,112,0.7)' }}>Total reembolsado MXN</p>
          <p className="text-xl font-black" style={{ color: '#e07070' }}>{fmtMXN(stats.totalMXN)}</p>
        </div>
        <div className="rounded-2xl px-4 py-4" style={{ background: 'rgba(220,80,80,0.08)', border: '1px solid rgba(220,80,80,0.25)' }}>
          <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: 'rgba(224,112,112,0.7)' }}>Total reembolsado USD</p>
          <p className="text-xl font-black" style={{ color: '#e07070' }}>{fmtUSD(stats.totalUSD)}</p>
        </div>
        <div className="rounded-2xl px-4 py-4" style={{ background: 'rgba(220,160,60,0.08)', border: '1px solid rgba(220,160,60,0.25)' }}>
          <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: 'rgba(220,170,80,0.7)' }}>Costo a la empresa MXN</p>
          <p className="text-xl font-black" style={{ color: '#dcaa50' }}>{fmtMXN(stats.costoMXN)}</p>
        </div>
        <div className="rounded-2xl px-4 py-4" style={{ background: 'rgba(220,160,60,0.08)', border: '1px solid rgba(220,160,60,0.25)' }}>
          <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: 'rgba(220,170,80,0.7)' }}>Costo a la empresa USD</p>
          <p className="text-xl font-black" style={{ color: '#dcaa50' }}>{fmtUSD(stats.costoUSD)}</p>
        </div>
      </div>

      {/* Ranking plataformas por número de reembolsos */}
      <StatCard titulo="Plataforma con más reembolsos" icon={<Trophy size={16} style={{ color: '#dcaa50' }} />}>
        <RankingBars data={stats.rankingPlataformas} />
      </StatCard>

      {/* Tabla de plataformas con monto total */}
      <StatCard titulo="Monto total por plataforma" subtitulo={`Año ${anio}`} icon={<Banknote size={16} style={{ color: '#e07070' }} />}>
        {stats.tablaPlataformas.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: S.silverDim }}>Sin reembolsos registrados</p>
        ) : (
          <div className="space-y-2">
            {stats.tablaPlataformas.map((p, i) => (
              <div key={p.plataforma} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: 'var(--th-inner)', border: `1px solid ${S.border}` }}>
                <span className="w-5 text-[11px] font-bold text-center flex-shrink-0" style={{ color: i === 0 ? '#dcaa50' : S.silverDim }}>{i + 1}</span>
                <p className="flex-1 text-xs font-medium truncate" style={{ color: S.silver }}>{p.plataforma}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: 'rgba(220,80,80,0.1)', color: '#e07070', border: '1px solid rgba(220,80,80,0.25)' }}>
                  {p.count}
                </span>
                <div className="text-right flex-shrink-0">
                  {p.mxn > 0 && <p className="text-[11px] font-bold" style={{ color: S.silverBright }}>{fmtMXN(p.mxn)}</p>}
                  {p.usd > 0 && <p className="text-[11px] font-bold" style={{ color: S.silverBright }}>{fmtUSD(p.usd)}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </StatCard>

      {/* Desglose mensual por plataforma */}
      <StatCard titulo="Monto por plataforma · por mes" subtitulo="Toca para expandir" icon={<BarChart3 size={16} style={{ color: '#b070e0' }} />}>
        {stats.tablaPlataformas.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: S.silverDim }}>Sin reembolsos registrados</p>
        ) : (
          <div className="space-y-2">
            {stats.tablaPlataformas.map(p => (
              <PlataformaMensual key={p.plataforma} plataforma={p.plataforma} registros={p.regs} />
            ))}
          </div>
        )}
      </StatCard>

      {/* Monto total de reembolso por mes — MXN */}
      <StatCard titulo="Reembolsos por mes · MXN" subtitulo={`Año ${anio} · Total ${fmtMXN(stats.totalMXN)}`} icon={<Calendar size={16} style={{ color: '#e07070' }} />}>
        <RankingBars
          data={MESES_NOMBRE.map((m, i) => ({ label: m, value: stats.mensualMXN[i], color: '#e07070' })).filter(d => d.value > 0)}
          formatValue={fmtMXN}
        />
      </StatCard>

      {/* Monto total de reembolso por mes — USD */}
      <StatCard titulo="Reembolsos por mes · USD" subtitulo={`Año ${anio} · Total ${fmtUSD(stats.totalUSD)}`} icon={<Calendar size={16} style={{ color: '#6aaddc' }} />}>
        <RankingBars
          data={MESES_NOMBRE.map((m, i) => ({ label: m, value: stats.mensualUSD[i], color: '#6aaddc' })).filter(d => d.value > 0)}
          formatValue={fmtUSD}
        />
      </StatCard>
    </div>
  )
}

/* ─── Página principal ───────────────────────────────────────────────────── */
export default function ReembolsosPage() {
  const [vista, setVista] = useState<'lista' | 'stats'>('lista')
  const [modal, setModal] = useState<'new' | Reembolso | null>(null)

  const { data: todos, loading, add: addReembolso, update: updateReembolso, remove: removeReembolso } =
    useFirestoreCollection<Reembolso>('reembolsos')

  const reembolsos = [...todos].sort((a, b) => b.fechaDevolucion.localeCompare(a.fechaDevolucion))

  function cerrarModal() {
    setModal(null)
  }

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: S.silverBright }}>Reembolsos</h1>
          <p className="text-sm mt-1" style={{ color: S.silverDim }}>Registro y estadísticas de devoluciones</p>
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
        </div>

        {vista === 'lista' ? (
          <>
            <button onClick={() => setModal('new')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-5 text-sm font-bold transition-all"
              style={{ background: 'rgba(220,80,80,0.1)', color: '#e07070', border: '1px solid rgba(220,80,80,0.3)' }}>
              <Plus size={16} /> Nuevo reembolso
            </button>

            {loading ? (
              <p className="text-center text-sm py-10" style={{ color: S.silverDim }}>Cargando…</p>
            ) : reembolsos.length === 0 ? (
              <div className="text-center py-12" style={{ color: S.silverDim }}>
                <FileText size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">Sin reembolsos registrados</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {reembolsos.map(r => (
                  <ReembolsoCard key={r.id} r={r} onClick={() => setModal(r)} />
                ))}
              </div>
            )}
          </>
        ) : (
          <Estadisticas todos={reembolsos} />
        )}
      </div>

      {modal && (
        <ReembolsoModal
          reembolso={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={cerrarModal}
          addReembolso={addReembolso}
          updateReembolso={updateReembolso}
          removeReembolso={removeReembolso}
        />
      )}
    </div>
  )
}
