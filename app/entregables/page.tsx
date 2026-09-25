'use client'

import { useState } from 'react'
import { FileText, Plus, X, Download, Trash2, Pencil, Copy, Check } from 'lucide-react'
import { useFirestoreCollection } from '@/lib/firestoreCollection'
import { useAuth } from '@/components/LoginGate'

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

type Entregable = {
  id: string
  nombre: string
  url: string
  createdBy: string
  createdAt: string
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
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
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
      style={{ background: copied ? 'rgba(80,200,120,0.12)' : 'rgba(180,185,210,0.06)', border: `1px solid ${copied ? 'rgba(80,200,120,0.3)' : S.border}`, color: copied ? '#60c878' : S.silverDim }}
      title="Copiar enlace">
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}

function EntregableModal({ item, onClose, onSave, onDelete }: {
  item: Entregable | null
  onClose: () => void
  onSave: (nombre: string, url: string) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const [nombre, setNombre] = useState(item?.nombre || '')
  const [url, setUrl] = useState(item?.url || '')
  const [saving, setSaving] = useState(false)
  const [confirmarBorrar, setConfirmarBorrar] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const inputStyle = { background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }
  const valido = nombre.trim() && url.trim()

  async function save() {
    if (!valido) return
    setSaving(true)
    await onSave(nombre.trim(), url.trim())
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
            {item ? 'Editar entregable' : 'Nuevo entregable'}
          </p>
          <button onClick={onClose} style={{ color: S.silverDim }}><X size={16} /></button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Nombre</p>
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              placeholder="ej. Manual de bienvenida"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Enlace al PDF</p>
            <input value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
            <p className="text-[10px] mt-1.5 leading-relaxed" style={{ color: S.silverDim }}>
              Sube el PDF a Google Drive (o donde ya guardes tus archivos), comparte el enlace y pégalo aquí.
            </p>
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
                {saving ? 'Guardando…' : item ? 'Guardar cambios' : 'Agregar entregable'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function EntregablesPage() {
  const { member } = useAuth()
  const { data, loading, add, update, remove } = useFirestoreCollection<Entregable>('entregables')
  const [modal, setModal] = useState<'new' | Entregable | null>(null)

  const items = [...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: S.silverBright }}>Entregables</h1>
          <p className="text-sm mt-1" style={{ color: S.silverDim }}>
            PDFs del equipo — nombre + enlace, para abrir o descargar cuando los necesites
          </p>
        </div>

        <button onClick={() => setModal('new')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-5 text-sm font-bold transition-all"
          style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)' }}>
          <Plus size={16} /> Nuevo
        </button>

        {loading ? (
          <p className="text-center text-sm py-10" style={{ color: S.silverDim }}>Cargando…</p>
        ) : items.length === 0 ? (
          <div className="text-center py-12" style={{ color: S.silverDim }}>
            <FileText size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Sin entregables guardados todavía</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map(item => (
              <div key={item.id} className="rounded-xl overflow-hidden" style={{ background: S.card, border: `1px solid ${S.border}` }}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(220,70,70,0.1)', border: '1px solid rgba(220,70,70,0.25)' }}>
                    <FileText size={16} style={{ color: '#e07070' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" style={{ color: S.silverBright }}>{item.nombre}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: S.silverDim }}>
                      {formatFecha(item.createdAt)} · {item.createdBy}
                    </p>
                  </div>
                  <CopyButton value={item.url} />
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: 'rgba(180,185,210,0.06)', border: `1px solid ${S.border}`, color: S.silverDim }}
                    title="Abrir / descargar">
                    <Download size={14} />
                  </a>
                  <button onClick={() => setModal(item)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: 'rgba(180,185,210,0.06)', border: `1px solid ${S.border}`, color: S.silverDim }}
                    title="Editar">
                    <Pencil size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <EntregableModal
          item={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={async (nombre, url) => {
            if (modal === 'new') {
              await add({ nombre, url, createdBy: member?.name || 'Equipo', createdAt: new Date().toISOString() })
            } else {
              await update(modal.id, { nombre, url })
            }
            setModal(null)
          }}
          onDelete={modal !== 'new' ? async () => {
            await remove((modal as Entregable).id)
            setModal(null)
          } : undefined}
        />
      )}
    </div>
  )
}
