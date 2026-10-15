'use client'

import { useState, useMemo } from 'react'
import { Plus, X, Trash2, Pencil, Search, MessageSquareHeart, FileText, Download } from 'lucide-react'
import { useFirestoreCollection } from '@/lib/firestoreCollection'
import { useAuth } from '@/components/LoginGate'
import FechaInput from '@/components/FechaInput'
import { TEMPORALIDADES, CANALES, MENSAJES, Temporalidad, Canal } from '@/lib/seguimientoSkool'

const S = {
  bg:           'var(--th-bg)',
  card:         'var(--th-card)',
  border:       'var(--th-border)',
  borderLight:  'var(--th-border-light)',
  silver:       'var(--th-silver)',
  silverBright: 'var(--th-bright)',
  silverDim:    'var(--th-dim)',
}

const PDFS = [
  { titulo: 'Mensajes de acompañamiento', detalle: 'Planes de 3, 6 y 12 meses', href: '/seguimiento-skool/Mensajes_acompanamiento_Club_Sinergetico.pdf' },
  { titulo: 'WhatsApp · GHL', detalle: 'Máximo 990 caracteres por mensaje', href: '/seguimiento-skool/WhatsApp_GHL_Club_Sinergetico_990_caracteres.pdf' },
]

type Seguimiento = {
  id: string
  fecha: string            // AAAA-MM-DD — día en que se envió el mensaje
  miembro: string
  temporalidad: Temporalidad
  mensaje: string
  canal: Canal
  asignadoA: string        // quien envió el seguimiento
  asignadoId: string
  createdAt: string
}

function hoyISO() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

function formatFecha(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

type Datos = Pick<Seguimiento, 'fecha' | 'miembro' | 'temporalidad' | 'mensaje' | 'canal'>

function SeguimientoModal({ item, onClose, onSave, onDelete }: {
  item: Seguimiento | null
  onClose: () => void
  onSave: (d: Datos) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const [fecha, setFecha] = useState(item?.fecha || hoyISO())
  const [miembro, setMiembro] = useState(item?.miembro || '')
  const [temporalidad, setTemporalidad] = useState<Temporalidad>(item?.temporalidad || '3')
  const [mensaje, setMensaje] = useState(item?.mensaje || '')
  const [canal, setCanal] = useState<Canal>(item?.canal || CANALES[0])
  const [saving, setSaving] = useState(false)

  const inputStyle = { background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }
  const lista = MENSAJES[temporalidad]
  const valido = !!fecha && !!miembro.trim() && !!mensaje

  // Los mensajes cambian según los meses del plan; al cambiar el plan se
  // limpia la selección para no dejar un mensaje que no pertenece a ese plan.
  function cambiarTemporalidad(t: Temporalidad) {
    setTemporalidad(t)
    setMensaje('')
  }

  async function save() {
    if (!valido) return
    setSaving(true)
    await onSave({ fecha, miembro: miembro.trim(), temporalidad, mensaje, canal })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,var(--th-overlay-alpha))', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'var(--th-inner)', border: '1px solid rgba(180,185,210,0.2)', boxShadow: '0 0 80px rgba(0,0,0,0.9)' }}>

        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
          <p className="flex-1 text-sm font-bold" style={{ color: S.silverBright }}>
            {item ? 'Editar seguimiento' : 'Nuevo seguimiento'}
          </p>
          <button onClick={onClose} style={{ color: S.silverDim }}><X size={16} /></button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Fecha en que se envió</p>
            <FechaInput value={fecha} onChange={setFecha} />
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Miembro</p>
            <input value={miembro} onChange={e => setMiembro(e.target.value)}
              placeholder="Nombre del miembro"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Temporalidad de membresía</p>
            <select value={temporalidad} onChange={e => cambiarTemporalidad(e.target.value as Temporalidad)}
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle}>
              {TEMPORALIDADES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Mensaje enviado</p>
            <select value={mensaje} onChange={e => setMensaje(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle}>
              <option value="">Selecciona el mensaje…</option>
              {lista.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Documento / canal</p>
            <select value={canal} onChange={e => setCanal(e.target.value as Canal)}
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle}>
              {CANALES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 px-5 py-4" style={{ borderTop: `1px solid ${S.border}` }}>
          {item && onDelete && (
            <button onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{ color: '#e07070', border: '1px solid rgba(220,80,80,0.25)', background: 'rgba(220,80,80,0.06)' }}>
              <Trash2 size={13} /> Eliminar
            </button>
          )}
          <button onClick={save} disabled={!valido || saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)', opacity: !valido || saving ? 0.5 : 1 }}>
            {saving ? 'Guardando…' : item ? 'Guardar cambios' : 'Registrar seguimiento'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SeguimientoSkoolPage() {
  const { session } = useAuth()
  const { data, loading, add, update, remove } = useFirestoreCollection<Seguimiento>('seguimiento_skool')
  const [modal, setModal] = useState<Seguimiento | 'new' | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTemp, setFiltroTemp] = useState<'todas' | Temporalidad>('todas')

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return data
      .filter(s => filtroTemp === 'todas' || s.temporalidad === filtroTemp)
      .filter(s => !q || s.miembro.toLowerCase().includes(q) || s.asignadoA.toLowerCase().includes(q))
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.createdAt.localeCompare(a.createdAt))
  }, [data, busqueda, filtroTemp])

  const selectStyle = { background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: S.silverBright }}>Seguimiento Skool</h1>
          <p className="text-sm mt-1" style={{ color: S.silverDim }}>
            Registro de los mensajes de seguimiento enviados a los miembros
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
          {PDFS.map(p => (
            <a key={p.href} href={p.href} download target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
              style={{ background: S.card, border: `1px solid ${S.borderLight}` }}>
              <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(220,80,80,0.08)', border: '1px solid rgba(220,80,80,0.2)', color: '#e07070' }}>
                <FileText size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate" style={{ color: S.silverBright }}>{p.titulo}</p>
                <p className="text-[11px]" style={{ color: S.silverDim }}>PDF · {p.detalle}</p>
              </div>
              <Download size={15} style={{ color: S.silverDim }} />
            </a>
          ))}
        </div>

        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: S.silverDim }} />
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por miembro o persona…"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl outline-none text-sm" style={selectStyle} />
            {busqueda && (
              <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: S.silverDim }}>
                <X size={14} />
              </button>
            )}
          </div>
          <select value={filtroTemp} onChange={e => setFiltroTemp(e.target.value as 'todas' | Temporalidad)}
            className="px-3 py-2.5 rounded-xl outline-none text-sm" style={selectStyle}>
            <option value="todas">Todas</option>
            {TEMPORALIDADES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <button onClick={() => setModal('new')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-5 text-sm font-bold transition-all"
          style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)' }}>
          <Plus size={16} /> Registrar seguimiento
        </button>

        {loading ? (
          <p className="text-center text-sm py-10" style={{ color: S.silverDim }}>Cargando…</p>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-12" style={{ color: S.silverDim }}>
            <MessageSquareHeart size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">{busqueda || filtroTemp !== 'todas' ? 'Sin resultados' : 'Aún no hay seguimientos registrados'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtrados.map(s => (
              <div key={s.id} className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background: S.card, border: `1px solid ${S.borderLight}` }}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate" style={{ color: S.silverBright }}>{s.miembro}</p>
                    <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(70,140,220,0.1)', color: '#6aaddc', border: '1px solid rgba(70,140,220,0.25)' }}>
                      {s.temporalidad} meses
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: S.silver }}>{s.mensaje} · {s.canal}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: S.silverDim }}>
                    {formatFecha(s.fecha)} · {s.asignadoA}
                  </p>
                </div>
                <button onClick={() => setModal(s)}
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: 'rgba(180,185,210,0.06)', border: `1px solid ${S.border}`, color: S.silverDim }}>
                  <Pencil size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <SeguimientoModal
          item={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={async datos => {
            if (modal === 'new') {
              await add({
                ...datos,
                asignadoA: session?.memberName ?? '',
                asignadoId: session?.memberId ?? '',
                createdAt: new Date().toISOString(),
              })
            } else {
              await update(modal.id, datos)
            }
            setModal(null)
          }}
          onDelete={modal !== 'new' ? async () => {
            await remove(modal.id)
            setModal(null)
          } : undefined}
        />
      )}
    </div>
  )
}
