'use client'

import { useState } from 'react'
import { Plus, X, Copy, Check, Trash2, Pencil, KeyRound, Eye, EyeOff } from 'lucide-react'
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

type Acceso = {
  id: string; plataforma: string; usuario: string; clave: string; createdAt: string
}

function CopyButton({ value, title }: { value: string; title?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      title={title}
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

function AccesoModal({ item, onClose, onSave, onDelete }: {
  item: Acceso | null
  onClose: () => void
  onSave: (plataforma: string, usuario: string, clave: string) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const [plataforma, setPlataforma] = useState(item?.plataforma || '')
  const [usuario, setUsuario] = useState(item?.usuario || '')
  const [clave, setClave] = useState(item?.clave || '')
  const [verClave, setVerClave] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmarBorrar, setConfirmarBorrar] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const inputStyle = { background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }
  const valido = plataforma.trim() && usuario.trim() && clave.trim()

  async function save() {
    if (!valido) return
    setSaving(true)
    await onSave(plataforma.trim(), usuario.trim(), clave.trim())
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
            {item ? 'Editar acceso' : 'Nuevo acceso'}
          </p>
          <button onClick={onClose} style={{ color: S.silverDim }}><X size={16} /></button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Plataforma</p>
            <input value={plataforma} onChange={e => setPlataforma(e.target.value)}
              placeholder="ej. Skool"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Usuario</p>
            <input value={usuario} onChange={e => setUsuario(e.target.value)}
              placeholder="ej. soporte@synergy.com"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Contraseña</p>
            <div className="relative">
              <input value={clave} onChange={e => setClave(e.target.value)}
                type={verClave ? 'text' : 'password'}
                placeholder="Contraseña de acceso"
                className="w-full px-3 py-2.5 pr-10 rounded-xl outline-none text-sm" style={inputStyle} />
              <button type="button" onClick={() => setVerClave(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: S.silverDim }}>
                {verClave ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
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
                {saving ? 'Guardando…' : item ? 'Guardar cambios' : 'Agregar acceso'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AccesosPage() {
  const { member } = useAuth()
  const esAdmin = member?.isAdmin ?? false

  const { data, loading, add, update, remove } = useFirestoreCollection<Acceso>('accesos_plataformas')
  const [modal, setModal] = useState<'new' | Acceso | null>(null)

  const items = [...data].sort((a, b) => a.plataforma.localeCompare(b.plataforma, 'es'))

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: S.silverBright }}>Accesos</h1>
          <p className="text-sm mt-1" style={{ color: S.silverDim }}>
            {esAdmin ? 'Contraseñas de las plataformas del equipo' : 'Cualquiera puede agregar; solo un admin puede borrar'}
          </p>
        </div>

        <button onClick={() => setModal('new')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-5 text-sm font-bold transition-all"
          style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)' }}>
          <Plus size={16} /> Agregar acceso
        </button>

        {loading ? (
          <p className="text-center text-sm py-10" style={{ color: S.silverDim }}>Cargando…</p>
        ) : items.length === 0 ? (
          <div className="text-center py-12" style={{ color: S.silverDim }}>
            <KeyRound size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Sin accesos guardados todavía</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map(item => (
              <AccesoCard key={item.id} item={item} onEdit={() => setModal(item)} />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <AccesoModal
          item={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={async (plataforma, usuario, clave) => {
            if (modal === 'new') {
              await add({ plataforma, usuario, clave, createdAt: new Date().toISOString() })
            } else {
              await update(modal.id, { plataforma, usuario, clave })
            }
            setModal(null)
          }}
          onDelete={modal !== 'new' && esAdmin ? async () => {
            await remove((modal as Acceso).id)
            setModal(null)
          } : undefined}
        />
      )}
    </div>
  )
}

function AccesoCard({ item, onEdit }: { item: Acceso; onEdit: () => void }) {
  const [verClave, setVerClave] = useState(false)

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: S.card, border: `1px solid ${S.border}` }}>
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate" style={{ color: S.silverBright }}>{item.plataforma}</p>
          {item.usuario && (
            <p className="text-[11px] mt-0.5 truncate" style={{ color: S.silverDim }}>{item.usuario}</p>
          )}
          <p className="text-[11px] mt-0.5 font-mono" style={{ color: S.silverDim }}>
            {verClave ? item.clave : '•'.repeat(Math.max(item.clave.length, 8))}
          </p>
        </div>
        {item.usuario && <CopyButton value={item.usuario} title="Copiar usuario" />}
        <button onClick={() => setVerClave(v => !v)}
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{ background: 'rgba(180,185,210,0.06)', border: `1px solid ${S.border}`, color: S.silverDim }}>
          {verClave ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
        <CopyButton value={item.clave} title="Copiar contraseña" />
        <button onClick={onEdit}
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{ background: 'rgba(180,185,210,0.06)', border: `1px solid ${S.border}`, color: S.silverDim }}>
          <Pencil size={13} />
        </button>
      </div>
    </div>
  )
}
