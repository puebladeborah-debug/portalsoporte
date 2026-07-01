'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus, X, Copy, Check, ExternalLink, Trash2, Pencil, Sheet as SheetIcon } from 'lucide-react'
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

type SheetLink = { id: string; nombre: string; url: string; createdAt: string }

// Enlaces que ya existían antes de crear esta sección — se cargan una sola
// vez si la colección llega vacía, para no perder lo que ya se tenía.
const SEED: { nombre: string; url: string }[] = [
  { nombre: 'LINKS', url: 'https://docs.google.com/spreadsheets/d/1ClJSoO4s4vc-a1DQr-cvnBX9gVv_tYm7FS8EWc4FmOE/edit?gid=822020124#gid=822020124' },
  { nombre: 'ATENCIÓN Y SEGUIMIENTO', url: 'https://docs.google.com/spreadsheets/d/1IkFQJW8kMcwQ9hwl0ixalQFUyribvDYDahbrBOFQf_g/edit' },
  { nombre: 'PAGOS DEB', url: 'https://docs.google.com/spreadsheets/d/1AuNf4OMs-efJzxWRbmcnmNLaBDAuDlP7BQb1yM4ewSI/edit?gid=1878041276#gid=1878041276' },
  { nombre: 'PAGOS HIGH TICKET', url: 'https://docs.google.com/spreadsheets/d/1YgjVvX2Z8D4GYDDAD6V6st3X10JeXO6F8z9X0HR-DuQ/edit?gid=0#gid=0' },
  { nombre: 'SEGUIMIENTOS CLUB 2026', url: 'https://docs.google.com/spreadsheets/d/1-n_i1lR9ZsQEEwC6cBoKYxNrq3h8iM3SZWbt3aV_Qc4/edit?gid=436150850#gid=436150850' },
  { nombre: 'WEBINAR REVOLUCION', url: 'https://docs.google.com/spreadsheets/d/1LaldIZLNdgjt9taTDzyIXAMDSdEYYpl5By-KLJAlPLk/edit?gid=257400821#gid=257400821&fvid=1467044208' },
  { nombre: 'WEBINAR SEED MX', url: 'https://docs.google.com/spreadsheets/d/1HoCW7JnnJVhi7B9wrCmUvGNw5Pmm_2zXBBzg6wsgyZo/edit?gid=1759324868#gid=1759324868' },
  { nombre: 'WEBINAR SEED USA', url: 'https://docs.google.com/spreadsheets/d/1VHQCENBm4Vhe0DQ_RVFhNttWbHvjd34HSMk1ejqDAZs/edit?pli=1&gid=157060739#gid=157060739' },
  { nombre: 'WEBINAR SEED LATAM CENTRO JS', url: 'https://docs.google.com/spreadsheets/d/1Bn6RDJGFLHC9sLpidr9wCSF2socFB8tPU0D8bzshCwQ/edit?pli=1&gid=1759324868#gid=1759324868' },
  { nombre: 'WEBINAR SEED MX MDL', url: 'https://docs.google.com/spreadsheets/d/1JRr37y5lIYzWkrPbYs1HN_ZxIWwBFJNUXzQ_-G7_Ilw/edit?gid=0#gid=0' },
  { nombre: 'PRESENCIALES 1ER SEMESTRE USA | 2026', url: 'https://docs.google.com/spreadsheets/d/1voYi5PDO3FMIKs8J1WoRMJ2XlZepu1rFMDXnZPa9sVE/edit?gid=451105980#gid=451105980' },
  { nombre: 'RESPALDO PRESENCIALES 1ER SEMESTRE MX', url: 'https://docs.google.com/spreadsheets/d/1bs26n-MM8242zefTTC3mvaa7E7DmDDoiJjy3ZHHZaWl/edit?gid=1001601828#gid=1001601828' },
  { nombre: 'PABLITO RESPALDO PRESENCIALES 1ER SEMESTRE MX', url: 'https://docs.google.com/spreadsheets/d/1WfLvDcgulZRb5g0CNWGdczN7hqNSgIbVVdWTHmv7tpY/edit?gid=473451013#gid=473451013' },
]

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

function SheetModal({ item, onClose, onSave, onDelete }: {
  item: SheetLink | null
  onClose: () => void
  onSave: (nombre: string, url: string) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const [nombre, setNombre] = useState(item?.nombre || '')
  const [url, setUrl] = useState(item?.url || '')
  const [saving, setSaving] = useState(false)

  const inputStyle = { background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }

  async function save() {
    if (!nombre.trim() || !url.trim()) return
    setSaving(true)
    await onSave(nombre.trim(), url.trim())
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#09090f', border: '1px solid rgba(180,185,210,0.2)', boxShadow: '0 0 80px rgba(0,0,0,0.9)' }}>

        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
          <p className="flex-1 text-sm font-bold" style={{ color: S.silverBright }}>
            {item ? 'Editar sheet' : 'Nuevo sheet'}
          </p>
          <button onClick={onClose} style={{ color: S.silverDim }}><X size={16} /></button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Nombre</p>
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              placeholder="ej. Pagos High Ticket"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Enlace</p>
            <input value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/..."
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm break-all" style={inputStyle} />
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
          <button onClick={save} disabled={!nombre.trim() || !url.trim() || saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)', opacity: !nombre.trim() || !url.trim() || saving ? 0.5 : 1 }}>
            {saving ? 'Guardando…' : item ? 'Guardar cambios' : 'Agregar sheet'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SheetsPage() {
  const { data, loading, add, update, remove } = useFirestoreCollection<SheetLink>('sheets_links')
  const [modal, setModal] = useState<'new' | SheetLink | null>(null)
  const seeded = useRef(false)

  useEffect(() => {
    if (loading || seeded.current || data.length > 0) return
    seeded.current = true
    SEED.forEach(s => add({ ...s, createdAt: new Date().toISOString() }))
  }, [loading, data.length, add])

  const items = [...data].sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: S.silverBright }}>Sheets</h1>
          <p className="text-sm mt-1" style={{ color: S.silverDim }}>Enlaces a las hojas de Google Sheets del equipo</p>
        </div>

        <button onClick={() => setModal('new')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-5 text-sm font-bold transition-all"
          style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)' }}>
          <Plus size={16} /> Agregar sheet
        </button>

        {loading ? (
          <p className="text-center text-sm py-10" style={{ color: S.silverDim }}>Cargando…</p>
        ) : items.length === 0 ? (
          <div className="text-center py-12" style={{ color: S.silverDim }}>
            <SheetIcon size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Sin sheets guardados todavía</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map(item => (
              <div key={item.id} className="rounded-xl overflow-hidden" style={{ background: S.card, border: `1px solid ${S.border}` }}>
                <div className="flex items-center gap-2 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" style={{ color: S.silverBright }}>{item.nombre}</p>
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      className="text-[11px] truncate block mt-0.5 hover:underline"
                      style={{ color: S.silverDim }}>
                      {item.url}
                    </a>
                  </div>
                  <CopyButton value={item.url} />
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: 'rgba(180,185,210,0.06)', border: `1px solid ${S.border}`, color: S.silverDim }}>
                    <ExternalLink size={14} />
                  </a>
                  <button onClick={() => setModal(item)}
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: 'rgba(180,185,210,0.06)', border: `1px solid ${S.border}`, color: S.silverDim }}>
                    <Pencil size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <SheetModal
          item={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={async (nombre, url) => {
            if (modal === 'new') {
              await add({ nombre, url, createdAt: new Date().toISOString() })
            } else {
              await update(modal.id, { nombre, url })
            }
            setModal(null)
          }}
          onDelete={modal !== 'new' ? async () => {
            await remove((modal as SheetLink).id)
            setModal(null)
          } : undefined}
        />
      )}
    </div>
  )
}
