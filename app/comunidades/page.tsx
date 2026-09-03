'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Copy, Check, ExternalLink, Trash2, Pencil, Send, Users, RefreshCw, Sheet as SheetIcon } from 'lucide-react'
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

type Comunidad = {
  id: string; ciudad: string; url: string; createdAt: string
}

// Comunidad tal como viene del sheet — de solo lectura, cualquier cambio
// (incluido el enlace) debe hacerse en el sheet y se refleja solo.
type ComunidadSheet = { id: string; pais: string; ciudad: string; url: string; fromSheet: true }

type ComunidadItem = (Comunidad & { fromSheet?: false }) | ComunidadSheet

function buildMensaje(ciudad: string, url: string, pais?: string) {
  const lugar = pais ? `${ciudad}, ${pais}` : ciudad
  return `¡Claro! 🙌 Te comparto el grupo oficial de la comunidad de WhatsApp de *${lugar}*.\n\n🔗 Enlace de acceso: ${url}\n\nTe recomendamos unirte para mantenerte al tanto de avisos, novedades e información importante de la comunidad.`
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
      }}
      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
      style={{ background: copied ? 'rgba(80,200,120,0.12)' : 'rgba(180,185,210,0.06)', border: `1px solid ${copied ? 'rgba(80,200,120,0.3)' : S.border}`, color: copied ? '#60c878' : S.silverDim }}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}

function ComunidadModal({ item, onClose, onSave, onDelete }: {
  item: Comunidad | null
  onClose: () => void
  onSave: (ciudad: string, url: string) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const [ciudad, setCiudad] = useState(item?.ciudad || '')
  const [url, setUrl] = useState(item?.url || '')
  const [saving, setSaving] = useState(false)

  const inputStyle = { background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }

  async function save() {
    if (!ciudad.trim() || !url.trim()) return
    setSaving(true)
    await onSave(ciudad.trim(), url.trim())
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
            {item ? 'Editar comunidad' : 'Nueva comunidad'}
          </p>
          <button onClick={onClose} style={{ color: S.silverDim }}><X size={16} /></button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Ciudad / Comunidad</p>
            <input value={ciudad} onChange={e => setCiudad(e.target.value)}
              placeholder="ej. Guadalajara"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Enlace del grupo de WhatsApp</p>
            <input value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
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
          <button onClick={save} disabled={!ciudad.trim() || !url.trim() || saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)', opacity: !ciudad.trim() || !url.trim() || saving ? 0.5 : 1 }}>
            {saving ? 'Guardando…' : item ? 'Guardar cambios' : 'Agregar comunidad'}
          </button>
        </div>
      </div>
    </div>
  )
}

function MensajeModal({ item, onClose }: { item: ComunidadItem; onClose: () => void }) {
  const mensaje = buildMensaje(item.ciudad, item.url, item.fromSheet ? item.pais : undefined)
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(mensaje).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,var(--th-overlay-alpha))', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'var(--th-inner)', border: '1px solid rgba(180,185,210,0.2)', boxShadow: '0 0 80px rgba(0,0,0,0.9)' }}>

        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
          <Send size={15} style={{ color: S.silver }} />
          <p className="flex-1 text-sm font-bold" style={{ color: S.silverBright }}>Mensaje para {item.ciudad}</p>
          <button onClick={onClose} style={{ color: S.silverDim }}><X size={16} /></button>
        </div>

        <div className="px-5 py-5">
          <div className="rounded-xl px-4 py-3.5"
            style={{ background: 'var(--th-input)', border: `1px solid ${S.border}` }}>
            <p className="text-[13px] leading-relaxed whitespace-pre-line" style={{ color: S.silverBright }}>
              {mensaje}
            </p>
          </div>
        </div>

        <div className="px-5 py-4" style={{ borderTop: `1px solid ${S.border}` }}>
          <button onClick={copy}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={copied
              ? { background: 'rgba(92,184,122,0.15)', color: '#5cb87a', border: '1px solid rgba(92,184,122,0.3)' }
              : { background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)' }
            }>
            {copied ? <><Check size={15} /> ¡Copiado!</> : <><Copy size={15} /> Copiar mensaje</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ComunidadesPage() {
  const { data, loading, add, update, remove } = useFirestoreCollection<Comunidad>('whatsapp_comunidades')
  const [modal, setModal] = useState<'new' | Comunidad | null>(null)
  const [mensajeItem, setMensajeItem] = useState<ComunidadItem | null>(null)

  const [sheetItems, setSheetItems] = useState<ComunidadSheet[]>([])
  const [loadingSheet, setLoadingSheet] = useState(true)
  const [sheetError, setSheetError] = useState('')

  async function cargarSheet() {
    setLoadingSheet(true)
    setSheetError('')
    try {
      const res = await fetch('/api/comunidades-sheet', { cache: 'no-store' })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const list: { pais: string; ciudad: string; url: string }[] = json.comunidades || []
      setSheetItems(list.map((c, i) => ({ id: `sheet-${i}`, pais: c.pais, ciudad: c.ciudad, url: c.url, fromSheet: true as const })))
    } catch (err) {
      setSheetError(err instanceof Error ? err.message : 'No se pudo cargar el sheet')
    } finally {
      setLoadingSheet(false)
    }
  }

  useEffect(() => { cargarSheet() }, [])

  const manuales: ComunidadItem[] = data.map(c => ({ ...c, fromSheet: false as const }))
  const items = [...sheetItems, ...manuales].sort((a, b) => a.ciudad.localeCompare(b.ciudad, 'es'))

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: S.silverBright }}>Comunidades WhatsApp</h1>
            <p className="text-sm mt-1" style={{ color: S.silverDim }}>
              Grupos oficiales de WhatsApp por ciudad
            </p>
          </div>
          <button onClick={cargarSheet} disabled={loadingSheet}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(180,185,210,0.06)', color: S.silverDim, border: `1px solid ${S.border}`, opacity: loadingSheet ? 0.6 : 1 }}
            title="Volver a leer el sheet">
            <RefreshCw size={12} className={loadingSheet ? 'animate-spin' : ''} /> Actualizar
          </button>
        </div>

        {sheetError && (
          <div className="mb-4 px-3 py-2 rounded-xl text-[11px] leading-relaxed"
            style={{ background: 'rgba(220,80,80,0.08)', border: '1px solid rgba(220,80,80,0.25)', color: '#e07070' }}>
            No se pudo leer el sheet de comunidades: {sheetError}
          </div>
        )}

        <button onClick={() => setModal('new')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-5 text-sm font-bold transition-all"
          style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)' }}>
          <Plus size={16} /> Agregar comunidad
        </button>

        {loading || loadingSheet ? (
          <p className="text-center text-sm py-10" style={{ color: S.silverDim }}>Cargando…</p>
        ) : items.length === 0 ? (
          <div className="text-center py-12" style={{ color: S.silverDim }}>
            <Users size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Sin comunidades guardadas todavía</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map(item => (
              <ComunidadCard key={item.id} item={item}
                onEdit={item.fromSheet ? undefined : () => setModal(item)}
                onMensaje={() => setMensajeItem(item)} />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <ComunidadModal
          item={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={async (ciudad, url) => {
            if (modal === 'new') {
              await add({ ciudad, url, createdAt: new Date().toISOString() })
            } else {
              await update(modal.id, { ciudad, url })
            }
            setModal(null)
          }}
          onDelete={modal !== 'new' ? async () => {
            await remove((modal as Comunidad).id)
            setModal(null)
          } : undefined}
        />
      )}

      {mensajeItem && (
        <MensajeModal item={mensajeItem} onClose={() => setMensajeItem(null)} />
      )}
    </div>
  )
}

function ComunidadCard({ item, onEdit, onMensaje }: { item: ComunidadItem; onEdit?: () => void; onMensaje: () => void }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: S.card, border: `1px solid ${S.border}` }}>
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold truncate" style={{ color: S.silverBright }}>
              {item.ciudad}{item.fromSheet && item.pais ? `, ${item.pais}` : ''}
            </p>
            {item.fromSheet && (
              <span className="flex-shrink-0 flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(70,140,220,0.1)', color: '#6aaddc', border: '1px solid rgba(70,140,220,0.25)' }}
                title="Viene del sheet — para cambiarlo, edita el sheet">
                <SheetIcon size={9} /> Sheet
              </span>
            )}
          </div>
          <a href={item.url} target="_blank" rel="noopener noreferrer"
            className="text-[11px] truncate block mt-0.5 hover:underline"
            style={{ color: S.silverDim }}>
            {item.url}
          </a>
        </div>
        <button onClick={onMensaje}
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{ background: 'rgba(80,180,120,0.08)', border: '1px solid rgba(80,180,120,0.25)', color: '#5cb87a' }}
          title="Generar mensaje">
          <Send size={13} />
        </button>
        <CopyButton value={item.url} />
        <a href={item.url} target="_blank" rel="noopener noreferrer"
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{ background: 'rgba(180,185,210,0.06)', border: `1px solid ${S.border}`, color: S.silverDim }}>
          <ExternalLink size={14} />
        </a>
        {onEdit && (
          <button onClick={onEdit}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: 'rgba(180,185,210,0.06)', border: `1px solid ${S.border}`, color: S.silverDim }}>
            <Pencil size={13} />
          </button>
        )}
      </div>
    </div>
  )
}
