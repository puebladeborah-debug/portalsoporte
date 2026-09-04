'use client'

import { useState, useEffect } from 'react'
import {
  Copy, Check, Smartphone, Building2, CreditCard, Hash,
  MapPin, Mail, FileText, Landmark, ExternalLink, ChevronDown, ChevronUp, Link2,
  Calculator, ChevronRight, Search, X as XIcon, Plus, Trash2, Pencil,
} from 'lucide-react'
import { useFirestoreCollection } from '@/lib/firestoreCollection'
import { LinkItem, Subseccion, BLACK_ACCESS, WEBINARS_LINKS, PRESENCIALES } from '@/lib/pagosLinks'

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

/* ─── Datos de cuenta ───────────────────────────────────────────────────── */
const ZELLE = [
  { label: 'Cuenta',   value: 'SINERGETICOS LLC',     icon: <Building2 size={14} /> },
  { label: 'Teléfono', value: '(305) 903 2686',        icon: <Smartphone size={14} /> },
  { label: 'Correo',   value: 'jmdeleon@zigma3.com',   icon: <Mail size={14} /> },
]
const FISCALES = [
  { label: 'Razón Social',  value: 'JAC/ SAPI DE CV',                          icon: <Building2 size={14} /> },
  { label: 'RFC',           value: 'JAC2001305B8',                              icon: <Hash size={14} /> },
  { label: 'Dirección',     value: 'Colima 130 El Mante, Zapopan, Jalisco CP. 45235', icon: <MapPin size={14} /> },
  { label: 'Correo',        value: 'sdominguez@aslcorporativo.com',             icon: <Mail size={14} /> },
  { label: 'Uso de CFDI',   value: 'Gastos en General',                         icon: <FileText size={14} /> },
  { label: 'Forma de Pago', value: 'Transferencia Electrónica de Fondos',       icon: <CreditCard size={14} /> },
]
const BANCARIOS = [
  { label: 'Banco',  value: 'SANTANDER',         icon: <Landmark size={14} /> },
  { label: 'Cuenta', value: '65508021375',        icon: <CreditCard size={14} /> },
  { label: 'CLABE',  value: '014320655080213750', icon: <Hash size={14} /> },
]

/* ─── Componente campo copiable ─────────────────────────────────────────── */
function CopyField({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
      style={{ background: 'var(--th-inner)', border: `1px solid ${S.border}` }}>
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <span className="mt-0.5 flex-shrink-0" style={{ color: S.silverDim }}>{icon}</span>
        <div className="min-w-0">
          <p className="text-[10px] tracking-widest uppercase mb-0.5" style={{ color: S.silverDim }}>{label}</p>
          <p className="text-sm font-medium break-all" style={{ color: S.silverBright }}>{value}</p>
        </div>
      </div>
      <button onClick={copy}
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
        style={{ background: copied ? 'rgba(80,200,120,0.12)' : 'rgba(180,185,210,0.06)', border: `1px solid ${copied ? 'rgba(80,200,120,0.3)' : S.border}`, color: copied ? '#60c878' : S.silverDim }}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  )
}

/* ─── Componente sección de cuenta ─────────────────────────────────────── */
function PaySection({ title, subtitle, badge, badgeColor, fields }: {
  title: string; subtitle: string; badge: string
  badgeColor: { bg: string; text: string; border: string }
  fields: { label: string; value: string; icon: React.ReactNode }[]
}) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: S.card, border: `1px solid ${S.borderLight}` }}>
      <div className="px-5 py-4 flex items-center gap-4" style={{ borderBottom: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.02)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: badgeColor.bg, border: `1px solid ${badgeColor.border}` }}>
          <span className="text-base font-black" style={{ color: badgeColor.text }}>{badge}</span>
        </div>
        <div>
          <h2 className="text-base font-bold" style={{ color: S.silverBright }}>{title}</h2>
          <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>{subtitle}</p>
        </div>
      </div>
      <div className="px-4 py-4 space-y-2">
        {fields.map(f => <CopyField key={f.label} label={f.label} value={f.value} icon={f.icon} />)}
      </div>
    </div>
  )
}

/* ─── Componente fila de link de pago ───────────────────────────────────── */
function LinkRow({ item }: { item: LinkItem }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    if (!item.url) return
    navigator.clipboard.writeText(item.url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
      style={{ background: 'var(--th-inner)', border: `1px solid ${S.border}` }}>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate" style={{ color: item.url ? S.silver : S.silverDim }}>
          {item.nombre}
        </p>
      </div>
      <span className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ background: 'rgba(80,200,120,0.1)', color: '#60c878', border: '1px solid rgba(80,200,120,0.2)', whiteSpace: 'nowrap' }}>
        {item.precio}
      </span>
      {item.url ? (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={copy}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ background: copied ? 'rgba(80,200,120,0.12)' : 'rgba(180,185,210,0.06)', border: `1px solid ${copied ? 'rgba(80,200,120,0.3)' : S.border}`, color: copied ? '#60c878' : S.silverDim }}
            title="Copiar enlace">
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
          <a href={item.url} target="_blank" rel="noopener noreferrer"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ background: 'rgba(180,185,210,0.06)', border: `1px solid ${S.border}`, color: S.silverDim }}
            title="Abrir enlace">
            <ExternalLink size={12} />
          </a>
        </div>
      ) : (
        <div className="flex-shrink-0 text-[10px] px-2" style={{ color: '#2a2e3a' }}>sin link</div>
      )}
    </div>
  )
}

/* ─── Componente sección de links colapsable ────────────────────────────── */
function LinkSection({ titulo, subtitulo, badge, badgeColor, secciones }: {
  titulo: string; subtitulo: string; badge: string
  badgeColor: { bg: string; text: string; border: string }
  secciones: Subseccion[]
}) {
  const [open, setOpen] = useState(true)
  const [openSubs, setOpenSubs] = useState<Record<string, boolean>>(
    Object.fromEntries(secciones.map((s, i) => [i, true]))
  )
  const total = secciones.reduce((acc, s) => acc + s.items.length, 0)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: S.card, border: `1px solid ${S.borderLight}` }}>
      {/* Header principal */}
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 transition-all"
        style={{ borderBottom: open ? `1px solid ${S.border}` : 'none', background: 'rgba(180,185,210,0.02)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: badgeColor.bg, border: `1px solid ${badgeColor.border}` }}>
          <Link2 size={16} style={{ color: badgeColor.text }} />
        </div>
        <div className="flex-1 text-left">
          <h2 className="text-base font-bold" style={{ color: S.silverBright }}>{titulo}</h2>
          <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>{subtitulo} · {total} enlaces</p>
        </div>
        {open ? <ChevronUp size={16} style={{ color: S.silverDim }} /> : <ChevronDown size={16} style={{ color: S.silverDim }} />}
      </button>

      {open && (
        <div className="px-4 py-4 space-y-4">
          {secciones.map((sec, i) => (
            <div key={i}>
              {/* Subsección header */}
              <button
                onClick={() => setOpenSubs(prev => ({ ...prev, [i]: !prev[i] }))}
                className="w-full flex items-center justify-between mb-2 px-1">
                <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: badgeColor.text }}>
                  {sec.titulo}
                </p>
                <span style={{ color: S.silverDim }}>
                  {openSubs[i] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </span>
              </button>
              {openSubs[i] && (
                <div className="space-y-1.5">
                  {sec.items.map((item, j) => <LinkRow key={j} item={item} />)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Buscador de links (modal) ─────────────────────────────────────────── */
type ResultadoBusqueda = LinkItem & { seccion: string; subseccion: string }

function todasLasEntradas(): ResultadoBusqueda[] {
  const grupos = [
    { seccion: 'Black Access · Bootcamp', lista: BLACK_ACCESS },
    { seccion: 'Nuevos Webinars Links',   lista: WEBINARS_LINKS },
    { seccion: 'Presenciales',            lista: PRESENCIALES },
  ]
  const out: ResultadoBusqueda[] = []
  for (const g of grupos) {
    for (const sub of g.lista) {
      for (const item of sub.items) {
        out.push({ ...item, seccion: g.seccion, subseccion: sub.titulo })
      }
    }
  }
  return out
}

function BuscadorModal({ onClose }: { onClose: () => void }) {
  const [query,  setQuery]  = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const q = query.trim().toLowerCase()
  const resultados: ResultadoBusqueda[] = q.length < 1 ? [] : todasLasEntradas().filter(e =>
    e.nombre.toLowerCase().includes(q) ||
    e.precio.toLowerCase().includes(q) ||
    (e.url ?? '').toLowerCase().includes(q) ||
    e.subseccion.toLowerCase().includes(q) ||
    e.seccion.toLowerCase().includes(q)
  )

  function copy(url: string, key: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
      style={{ background: 'rgba(0,0,0,var(--th-overlay-alpha))', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>

      <div className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--th-inner)', border: '1px solid rgba(180,185,210,0.2)', boxShadow: '0 0 80px rgba(0,0,0,0.9)', maxHeight: '80vh' }}>

        {/* Barra de búsqueda */}
        <div className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: `1px solid ${S.border}` }}>
          <Search size={18} style={{ color: '#6aaddc', flexShrink: 0 }} />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre, precio o sección…"
            className="flex-1 bg-transparent outline-none text-base"
            style={{ color: S.silverBright }}
          />
          {query
            ? <button onClick={() => setQuery('')} style={{ color: S.silverDim, flexShrink: 0 }}><XIcon size={16} /></button>
            : <button onClick={onClose} style={{ color: S.silverDim, flexShrink: 0 }}><XIcon size={16} /></button>
          }
        </div>

        {/* Resultados */}
        <div className="overflow-y-auto flex-1 px-3 py-3 space-y-2"
          style={{ scrollbarWidth: 'thin', scrollbarColor: `${S.silverDim} transparent` }}>

          {q.length === 0 && (
            <div className="text-center py-10" style={{ color: S.silverDim }}>
              <Search size={32} className="mx-auto mb-3 opacity-15" />
              <p className="text-sm">Escribe una palabra clave o monto</p>
              <p className="text-xs mt-1 opacity-60">ej. Black Access, 9997, USA, Centurion…</p>
            </div>
          )}

          {q.length > 0 && resultados.length === 0 && (
            <div className="text-center py-10" style={{ color: S.silverDim }}>
              <Search size={32} className="mx-auto mb-3 opacity-15" />
              <p className="text-sm">Sin resultados para "<span style={{ color: S.silver }}>{query}</span>"</p>
            </div>
          )}

          {resultados.length > 0 && (
            <>
              <p className="text-[10px] tracking-widest uppercase px-1 pb-1" style={{ color: S.silverDim }}>
                {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
              </p>
              {resultados.map((r, i) => {
                const key = `${i}-${r.nombre}`
                const isCopied = copied === key
                return (
                  <div key={key} className="rounded-xl overflow-hidden"
                    style={{ border: `1px solid ${S.border}` }}>
                    <div className="flex items-center gap-1.5 px-3 py-1.5"
                      style={{ background: 'rgba(70,140,220,0.05)', borderBottom: `1px solid ${S.border}` }}>
                      <span className="text-[9px] tracking-widest uppercase" style={{ color: 'rgba(106,173,220,0.6)' }}>
                        {r.seccion}
                      </span>
                      <ChevronRight size={10} style={{ color: S.silverDim }} />
                      <span className="text-[9px]" style={{ color: S.silverDim }}>{r.subseccion}</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2.5" style={{ background: 'var(--th-inner)' }}>
                      <p className="flex-1 text-xs font-medium truncate" style={{ color: r.url ? S.silver : S.silverDim }}>
                        {r.nombre}
                      </p>
                      <span className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(80,200,120,0.1)', color: '#60c878', border: '1px solid rgba(80,200,120,0.2)', whiteSpace: 'nowrap' }}>
                        {r.precio}
                      </span>
                      {r.url ? (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button onClick={() => copy(r.url!, key)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                            style={{ background: isCopied ? 'rgba(80,200,120,0.12)' : 'rgba(180,185,210,0.06)', border: `1px solid ${isCopied ? 'rgba(80,200,120,0.3)' : S.border}`, color: isCopied ? '#60c878' : S.silverDim }}>
                            {isCopied ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                          <a href={r.url} target="_blank" rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: 'rgba(180,185,210,0.06)', border: `1px solid ${S.border}`, color: S.silverDim }}>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      ) : (
                        <span className="flex-shrink-0 text-[10px] px-2" style={{ color: '#2a2e3a' }}>sin link</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>

        <div className="px-4 py-2 text-[10px] text-center" style={{ color: '#2a2e3a', borderTop: `1px solid ${S.border}` }}>
          Esc para cerrar
        </div>
      </div>
    </div>
  )
}

/* ─── Calculadora de pagos ──────────────────────────────────────────────── */
const PRESETS = [
  { label: 'Skool 3 meses',  precio: 9997 },
  { label: 'Skool 6 meses',  precio: 12997 },
  { label: 'Skool 12 meses', precio: 14997 },
]

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 })

function Calculadora({ nombre, multiplicador, accentColor, presets }: {
  nombre: string
  multiplicador: number
  accentColor: { bg: string; border: string; text: string }
  presets?: { label: string; precio: number }[]
}) {
  const [contado, setContado] = useState('')
  const [abonos,  setAbonos]  = useState('')
  const [open,    setOpen]    = useState(true)

  const precioContado = parseFloat(contado.replace(/,/g, '')) || 0
  const precioMeses   = Math.round(precioContado * multiplicador * 100) / 100
  const totalAbonos   = parseFloat(abonos.replace(/,/g, ''))  || 0
  const faltaContado  = Math.max(0, precioContado - totalAbonos)
  const faltaMeses    = Math.max(0, precioMeses   - totalAbonos)
  const hayDatos      = precioContado > 0

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: S.card, border: `1px solid ${S.borderLight}` }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 transition-all"
        style={{ borderBottom: open ? `1px solid ${S.border}` : 'none', background: 'rgba(180,185,210,0.02)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: accentColor.bg, border: `1px solid ${accentColor.border}` }}>
          <Calculator size={16} style={{ color: accentColor.text }} />
        </div>
        <div className="flex-1 text-left">
          <h2 className="text-base font-bold" style={{ color: S.silverBright }}>{nombre}</h2>
          <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>
            Interés ×{multiplicador} · contado vs a meses · abonos
          </p>
        </div>
        {open ? <ChevronUp size={16} style={{ color: S.silverDim }} /> : <ChevronDown size={16} style={{ color: S.silverDim }} />}
      </button>

      {open && (
        <div className="px-4 py-5 space-y-5">

          {/* Presets opcionales */}
          {presets && presets.length > 0 && (
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: S.silverDim }}>Precios rápidos · Presenciales</p>
              <div className="flex flex-wrap gap-2">
                {presets.map(p => {
                  const sel = contado === String(p.precio)
                  return (
                    <button key={p.label}
                      onClick={() => { setContado(String(p.precio)); setAbonos('') }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: sel ? `${accentColor.bg}` : 'rgba(180,185,210,0.05)',
                        border:     `1px solid ${sel ? accentColor.border : S.border}`,
                        color:      sel ? accentColor.text : S.silverDim,
                      }}>
                      {p.label}
                      <span className="font-bold" style={{ color: sel ? accentColor.text : S.silver }}>
                        ${p.precio.toLocaleString()}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Precio de contado ($)</p>
              <input type="number" value={contado} onChange={e => setContado(e.target.value)}
                placeholder="ej. 9997"
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                style={{ background: 'var(--th-inner)', border: `1px solid ${S.border}`, color: S.silverBright }} />
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Total abonos recibidos ($)</p>
              <input type="number" value={abonos} onChange={e => setAbonos(e.target.value)}
                placeholder="ej. 3000"
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                style={{ background: 'var(--th-inner)', border: `1px solid ${S.border}`, color: S.silverBright }} />
            </div>
          </div>

          {/* Resultados */}
          {hayDatos ? (
            <div className="space-y-2.5">
              {/* Precio a meses */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: 'rgba(70,140,220,0.06)', border: '1px solid rgba(70,140,220,0.18)' }}>
                <div>
                  <p className="text-[10px] tracking-widest uppercase" style={{ color: 'rgba(106,173,220,0.7)' }}>
                    Precio a meses (×{multiplicador})
                  </p>
                  <p className="text-lg font-black mt-0.5" style={{ color: '#6aaddc' }}>{fmt(precioMeses)}</p>
                </div>
                <div className="flex items-center gap-1 text-xs" style={{ color: 'rgba(106,173,220,0.5)' }}>
                  <span>{fmt(precioContado)}</span>
                  <ChevronRight size={12} />
                  <span style={{ color: '#6aaddc' }}>{fmt(precioMeses)}</span>
                </div>
              </div>

              {/* Falta contado */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: 'rgba(90,160,90,0.06)', border: '1px solid rgba(90,160,90,0.18)' }}>
                <div>
                  <p className="text-[10px] tracking-widest uppercase" style={{ color: 'rgba(112,200,120,0.7)' }}>Falta para contado</p>
                  <p className="text-lg font-black mt-0.5" style={{ color: faltaContado === 0 ? '#50e070' : '#70c878' }}>
                    {faltaContado === 0 ? '¡Pagado!' : fmt(faltaContado)}
                  </p>
                </div>
                {totalAbonos > 0 && (
                  <div className="text-right text-[11px]" style={{ color: 'rgba(112,200,120,0.5)' }}>
                    <p>Abonado: <span style={{ color: '#70c878' }}>{fmt(totalAbonos)}</span></p>
                    <p>de <span style={{ color: S.silver }}>{fmt(precioContado)}</span></p>
                  </div>
                )}
              </div>

              {/* Falta a meses */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: 'rgba(220,160,60,0.06)', border: '1px solid rgba(220,160,60,0.18)' }}>
                <div>
                  <p className="text-[10px] tracking-widest uppercase" style={{ color: 'rgba(220,170,80,0.7)' }}>Falta para precio a meses</p>
                  <p className="text-lg font-black mt-0.5" style={{ color: faltaMeses === 0 ? '#50e070' : '#dcaa50' }}>
                    {faltaMeses === 0 ? '¡Pagado!' : fmt(faltaMeses)}
                  </p>
                </div>
                {totalAbonos > 0 && (
                  <div className="text-right text-[11px]" style={{ color: 'rgba(220,170,80,0.5)' }}>
                    <p>Abonado: <span style={{ color: '#dcaa50' }}>{fmt(totalAbonos)}</span></p>
                    <p>de <span style={{ color: S.silver }}>{fmt(precioMeses)}</span></p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4" style={{ color: S.silverDim }}>
              <Calculator size={28} className="mx-auto mb-2 opacity-20" />
              <p className="text-xs">Ingresa un precio para calcular</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Enlaces de pago agregados manualmente por el equipo ───────────────── */
type EnlacePago = {
  id: string; nombre: string; plataforma: string; url: string; createdAt: string
}

function EnlacePagoModal({ item, onClose, onSave, onDelete }: {
  item: EnlacePago | null
  onClose: () => void
  onSave: (nombre: string, plataforma: string, url: string) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const [nombre, setNombre] = useState(item?.nombre || '')
  const [plataforma, setPlataforma] = useState(item?.plataforma || '')
  const [url, setUrl] = useState(item?.url || '')
  const [saving, setSaving] = useState(false)
  const [confirmarBorrar, setConfirmarBorrar] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const inputStyle = { background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }
  const valido = nombre.trim() && plataforma.trim() && url.trim()

  async function save() {
    if (!valido) return
    setSaving(true)
    await onSave(nombre.trim(), plataforma.trim(), url.trim())
    setSaving(false)
  }

  async function eliminar() {
    if (!onDelete) return
    setDeleting(true)
    await onDelete()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,var(--th-overlay-alpha))', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'var(--th-inner)', border: '1px solid rgba(180,185,210,0.2)', boxShadow: '0 0 80px rgba(0,0,0,0.9)' }}>

        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
          <p className="flex-1 text-sm font-bold" style={{ color: S.silverBright }}>
            {item ? 'Editar enlace de pago' : 'Nuevo enlace de pago'}
          </p>
          <button onClick={onClose} style={{ color: S.silverDim }}><XIcon size={16} /></button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Nombre del enlace</p>
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              placeholder="ej. Apartado 500 USD"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Plataforma de pago</p>
            <input value={plataforma} onChange={e => setPlataforma(e.target.value)}
              placeholder="ej. Stripe, Hotmart, Mercado Pago…"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Enlace</p>
            <input value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://…"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
          </div>
        </div>

        <div className="px-5 py-4" style={{ borderTop: `1px solid ${S.border}` }}>
          {confirmarBorrar ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setConfirmarBorrar(false)} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold"
                style={{ color: S.silverDim, border: `1px solid ${S.border}` }}>
                Cancelar
              </button>
              <button onClick={eliminar} disabled={deleting}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(220,80,80,0.15)', color: '#e07070', border: '1px solid rgba(220,80,80,0.35)', opacity: deleting ? 0.6 : 1 }}>
                <Trash2 size={13} /> {deleting ? 'Eliminando…' : '¿Seguro? Eliminar'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {item && onDelete && (
                <button onClick={() => setConfirmarBorrar(true)}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
                  style={{ color: '#e07070', border: '1px solid rgba(220,80,80,0.25)', background: 'rgba(220,80,80,0.06)' }}>
                  <Trash2 size={13} /> Eliminar
                </button>
              )}
              <button onClick={save} disabled={!valido || saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)', opacity: !valido || saving ? 0.5 : 1 }}>
                {saving ? 'Guardando…' : item ? 'Guardar cambios' : 'Agregar enlace'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EnlacePagoCard({ item, onEdit }: { item: EnlacePago; onEdit: () => void }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(item.url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
      style={{ background: 'var(--th-inner)', border: `1px solid ${S.border}` }}>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate" style={{ color: S.silver }}>{item.nombre}</p>
        <p className="text-[10px] truncate mt-0.5" style={{ color: S.silverDim }}>{item.url}</p>
      </div>
      <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
        style={{ background: 'rgba(70,140,220,0.1)', color: '#6aaddc', border: '1px solid rgba(70,140,220,0.25)', whiteSpace: 'nowrap' }}>
        {item.plataforma}
      </span>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button onClick={copy}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
          style={{ background: copied ? 'rgba(80,200,120,0.12)' : 'rgba(180,185,210,0.06)', border: `1px solid ${copied ? 'rgba(80,200,120,0.3)' : S.border}`, color: copied ? '#60c878' : S.silverDim }}
          title="Copiar enlace">
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
        <a href={item.url} target="_blank" rel="noopener noreferrer"
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
          style={{ background: 'rgba(180,185,210,0.06)', border: `1px solid ${S.border}`, color: S.silverDim }}
          title="Abrir enlace">
          <ExternalLink size={12} />
        </a>
        <button onClick={onEdit}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
          style={{ background: 'rgba(180,185,210,0.06)', border: `1px solid ${S.border}`, color: S.silverDim }}
          title="Editar">
          <Pencil size={12} />
        </button>
      </div>
    </div>
  )
}

function EnlacesManualesSection() {
  const { data, loading, add, update, remove } = useFirestoreCollection<EnlacePago>('enlaces_pago_manual')
  const [modal, setModal] = useState<'new' | EnlacePago | null>(null)
  const [open, setOpen] = useState(true)

  const items = [...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: S.card, border: `1px solid ${S.borderLight}` }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 transition-all"
        style={{ borderBottom: open ? `1px solid ${S.border}` : 'none', background: 'rgba(180,185,210,0.02)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(90,160,90,0.12)', border: '1px solid rgba(90,160,90,0.28)' }}>
          <Link2 size={16} style={{ color: '#70c878' }} />
        </div>
        <div className="flex-1 text-left">
          <h2 className="text-base font-bold" style={{ color: S.silverBright }}>Enlaces agregados por el equipo</h2>
          <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>{items.length} enlaces</p>
        </div>
        {open ? <ChevronUp size={16} style={{ color: S.silverDim }} /> : <ChevronDown size={16} style={{ color: S.silverDim }} />}
      </button>

      {open && (
        <div className="px-4 py-4 space-y-3">
          <button onClick={() => setModal('new')}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
            style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)' }}>
            <Plus size={14} /> Agregar enlace de pago
          </button>

          {loading ? (
            <p className="text-center text-xs py-4" style={{ color: S.silverDim }}>Cargando…</p>
          ) : items.length === 0 ? (
            <p className="text-center text-xs py-4" style={{ color: S.silverDim }}>Sin enlaces agregados todavía</p>
          ) : (
            <div className="space-y-1.5">
              {items.map(item => (
                <EnlacePagoCard key={item.id} item={item} onEdit={() => setModal(item)} />
              ))}
            </div>
          )}
        </div>
      )}

      {modal && (
        <EnlacePagoModal
          item={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={async (nombre, plataforma, url) => {
            if (modal === 'new') {
              await add({ nombre, plataforma, url, createdAt: new Date().toISOString() })
            } else {
              await update(modal.id, { nombre, plataforma, url })
            }
            setModal(null)
          }}
          onDelete={modal !== 'new' ? async () => {
            await remove((modal as EnlacePago).id)
            setModal(null)
          } : undefined}
        />
      )}
    </div>
  )
}

/* ─── Página principal ───────────────────────────────────────────────────── */
export default function PagosPage() {
  const [buscar, setBuscar] = useState(false)

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      {buscar && <BuscadorModal onClose={() => setBuscar(false)} />}

      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: S.silverBright }}>Datos de Pago</h1>
            <p className="text-sm mt-1" style={{ color: S.silverDim }}>
              Toca <Copy size={11} className="inline mx-1" /> para copiar · <ExternalLink size={11} className="inline mx-1" /> para abrir el link
            </p>
          </div>
        </div>

        {/* ── Botón de búsqueda grande ── */}
        <button
          onClick={() => setBuscar(true)}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl mb-6 transition-all group"
          style={{
            background: 'rgba(70,140,220,0.06)',
            border: '1px solid rgba(70,140,220,0.22)',
          }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
            style={{ background: 'rgba(70,140,220,0.14)', border: '1px solid rgba(70,140,220,0.32)' }}>
            <Search size={20} style={{ color: '#6aaddc' }} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-base font-bold" style={{ color: '#6aaddc' }}>Buscar enlace de pago</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(106,173,220,0.55)' }}>
              Escribe un nombre, precio o categoría…
            </p>
          </div>
          <ChevronRight size={18} style={{ color: 'rgba(106,173,220,0.4)' }} />
        </button>

        <div className="space-y-5">

          {/* ── Zelle ── */}
          <PaySection
            title="Pagos con Zelle" subtitle="Sinergeticos LLC · USA" badge="Z"
            badgeColor={{ bg: 'rgba(100,60,200,0.15)', text: '#8860e0', border: 'rgba(100,60,200,0.3)' }}
            fields={ZELLE}
          />

          {/* ── Fiscal ── */}
          <PaySection
            title="Datos Fiscales" subtitle="Transferencia · México" badge="F"
            badgeColor={{ bg: 'rgba(220,50,50,0.12)', text: '#dc6060', border: 'rgba(220,50,50,0.28)' }}
            fields={FISCALES}
          />

          {/* ── Bancarios ── */}
          <PaySection
            title="Datos Bancarios" subtitle="Santander · México" badge="B"
            badgeColor={{ bg: 'rgba(220,50,50,0.12)', text: '#dc6060', border: 'rgba(220,50,50,0.28)' }}
            fields={BANCARIOS}
          />

          {/* ── Calculadora Presencial / Webinar (×1.14) ── */}
          <Calculadora
            nombre="Presencial / Webinar"
            multiplicador={1.14}
            accentColor={{ bg: 'rgba(90,160,90,0.12)', border: 'rgba(90,160,90,0.28)', text: '#70c878' }}
            presets={PRESETS}
          />

          {/* ── Calculadora High Ticket (×1.16) ── */}
          <Calculadora
            nombre="High Ticket"
            multiplicador={1.16}
            accentColor={{ bg: 'rgba(160,100,220,0.12)', border: 'rgba(160,100,220,0.28)', text: '#b070e0' }}
          />

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px" style={{ background: S.border }} />
            <span className="text-[10px] tracking-widest uppercase" style={{ color: S.silverDim }}>Links de pago</span>
            <div className="flex-1 h-px" style={{ background: S.border }} />
          </div>

          {/* ── Enlaces de pago agregados manualmente por el equipo ── */}
          <EnlacesManualesSection />

          {/* ── Black Access / Bootcamp ── */}
          <LinkSection
            titulo="Black Access · Bootcamp"
            subtitulo="México · USA · LATAM · Centurion"
            badge="B"
            badgeColor={{ bg: 'rgba(220,80,160,0.12)', text: '#dc60b0', border: 'rgba(220,80,160,0.28)' }}
            secciones={BLACK_ACCESS}
          />

          {/* ── Nuevos Webinars Links ── */}
          <LinkSection
            titulo="Nuevos Webinars Links"
            subtitulo="USA · Webinar · Presenciales MX · Renovación"
            badge="W"
            badgeColor={{ bg: 'rgba(70,140,220,0.12)', text: '#6aaddc', border: 'rgba(70,140,220,0.28)' }}
            secciones={WEBINARS_LINKS}
          />

          {/* ── Presenciales ── */}
          <LinkSection
            titulo="Presenciales"
            subtitulo="LATAM · México · USA"
            badge="P"
            badgeColor={{ bg: 'rgba(180,130,60,0.12)', text: '#dcaa50', border: 'rgba(180,130,60,0.28)' }}
            secciones={PRESENCIALES}
          />

        </div>

        <p className="text-center text-[11px] mt-8" style={{ color: '#2a2e3a' }}>
          Información confidencial — solo visible para el equipo de soporte
        </p>
      </div>
    </div>
  )
}
