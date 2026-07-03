'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus, X, Copy, Check, ExternalLink, Trash2, Pencil, PlayCircle } from 'lucide-react'
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

type Tutorial = { id: string; nombre: string; url: string; createdAt: string }

const SEED: { nombre: string; url: string }[] = [
  // Loom
  { nombre: '¿Cómo entrar a las clases de Skool?', url: 'https://www.loom.com/share/75a936ea318e4c388f99b209838b4ddd' },
  { nombre: 'Invitación de Skool en el correo', url: 'https://www.loom.com/share/681dc4dd8a3948f2bd92dd7ca3144c21' },
  { nombre: '¿Cómo iniciar sesión en Synergy Education?', url: 'https://www.loom.com/share/6bd17978368648621a5225de514ab2313?sid=c5de2c90-bf4a-4b7a-84a1-dd0a3534c5b5' },
  { nombre: 'Cambiar contraseña en Skool', url: 'https://www.loom.com/share/681dc4dd8a3948f2bd92dd7ca3144c21' },
  { nombre: 'Crear perfil en Skool', url: 'https://www.loom.com/share/9fef12507f2f4cca8d18190a6b5163b8?sid=d7b727a0-8f96-436f-9cf6-8af184041ddc' },
  // Drive
  { nombre: 'Cómo encuentro la plataforma del Club Sinergético', url: 'https://drive.google.com/file/d/12X3gmy7MAPRpQxZHp0b3R5839oa0FUH4/view?usp=drive_link' },
  { nombre: 'Cómo entrar a la plataforma de Kajabi', url: 'https://drive.google.com/file/d/1DAWyFZZ6TOdn6CQXEQ9SpZk9EWWeSvmi/view?usp=drive_link' },
  { nombre: 'Cómo funciona el apartado de Classroom en Skool', url: 'https://drive.google.com/file/d/1OnaFoYEQUuyekILtDX_IntfS_OaJh4Ai/view?usp=drive_link' },
  { nombre: 'Cómo funciona Kajabi', url: 'https://drive.google.com/file/d/1sFoHu9D8LVbOQIbQWHmNdOSQOD_mSTQ4/view?usp=drive_link' },
  { nombre: 'Cómo funciona la plataforma de Skool', url: 'https://drive.google.com/file/d/1FG_CQZJZ3oDGt5t5v_ectV2bkL3K0UF_/view?usp=drive_link' },
  { nombre: 'Cómo hacer preguntas en Skool', url: 'https://drive.google.com/file/d/1P7Bjp9RBoA8HqpOq-B6-_bOW8EuQhIyI/view?usp=drive_link' },
  { nombre: 'Cómo ingresar a las mentorías en vivo en Skool', url: 'https://drive.google.com/file/d/1c8ofxfMQ3xbqYpIMwtcfkWr-nfZjCLgM/view?usp=drive_link' },
  { nombre: 'Cómo me registro en Skool', url: 'https://drive.google.com/file/d/1dHVLVKxwLQijM0a7Avr0MPoPjgD4n6CG/view?usp=drive_link' },
  { nombre: 'Cómo se hacen las comunidades de WhatsApp', url: 'https://drive.google.com/file/d/1guHfrt8MSYunKVfc-bQ-5bqmYrhTYnpC/view?usp=drive_link' },
  { nombre: 'Comparativa Skool vs Kajabi', url: 'https://drive.google.com/file/d/1X-wIJ2Y292zPgHXnvRpwvgv9vIeVCCeu/view?usp=drive_link' },
  { nombre: 'Comunidad de WhatsApp', url: 'https://drive.google.com/file/d/1UgBNuLB4gopsk0e71gTM1wcKQLsOzP9r/view?usp=drive_link' },
  { nombre: 'Conoce la Landing Page del Club Sinergético', url: 'https://drive.google.com/file/d/1nnqxq3SlkyaJHolV8phHdiVKlZ-tps0-/view?usp=drive_link' },
  { nombre: 'Conoce Skool', url: 'https://drive.google.com/file/d/1LWZW7T0RpE7VuijM-biYbyRazRLG_IB8/view?usp=drive_link' },
  { nombre: 'Conoce tu recorrido en el Club Sinergético', url: 'https://drive.google.com/file/d/1CH0-s34oAvToZ3yuCLAgSQnSVsetMeHZ/view?usp=drive_link' },
  { nombre: 'Cuáles son las certificaciones del Club Sinergético', url: 'https://drive.google.com/file/d/1xTaQ_c2gLRHkfi4Xuvvro7QyuZkpn0Wi/view?usp=drive_link' },
  { nombre: 'Cuáles son las normas de Telegram', url: 'https://drive.google.com/file/d/1D0P36TfhSeproSr4d5hth7nWuNtNk7oC/view?usp=drive_link' },
  { nombre: 'Cuántos accesos tienes al Club Sinergético', url: 'https://drive.google.com/file/d/1zGYKvbqOL7DupqVhRVuibkxhayP68Y1i/view?usp=drive_link' },
  { nombre: 'Diferencia entre Telegram y WhatsApp', url: 'https://drive.google.com/file/d/14ze4ZADrXzfunyLwLLW2ugEFL2ani6cQ/view?usp=drive_link' },
  { nombre: 'Evita fraudes y engaños telefónicos', url: 'https://drive.google.com/file/d/1r9Ghi15sBmdJdUsDD5fluCQv_TJ48U1z/view?usp=drive_link' },
  { nombre: 'Qué incluye tu membresía al Club Sinergético', url: 'https://drive.google.com/file/d/1NUKk_jy703Qg6IWUTK7JGlZujSEFXuAl/view?usp=drive_link' },
]

function isLoom(url: string) { return url.includes('loom.com') }
function isDrive(url: string) { return url.includes('drive.google.com') }

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={e => {
      e.stopPropagation()
      navigator.clipboard.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
    }}
      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
      style={{ background: copied ? 'rgba(80,200,120,0.12)' : 'rgba(180,185,210,0.06)', border: `1px solid ${copied ? 'rgba(80,200,120,0.3)' : S.border}`, color: copied ? '#60c878' : S.silverDim }}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}

function TutorialModal({ item, onClose, onSave, onDelete }: {
  item: Tutorial | null; onClose: () => void
  onSave: (nombre: string, url: string) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const [nombre, setNombre] = useState(item?.nombre || '')
  const [url, setUrl] = useState(item?.url || '')
  const [saving, setSaving] = useState(false)
  const inputStyle = { background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }
  async function save() {
    if (!nombre.trim() || !url.trim()) return
    setSaving(true); await onSave(nombre.trim(), url.trim()); setSaving(false)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,var(--th-overlay-alpha))', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'var(--th-inner)', border: '1px solid rgba(180,185,210,0.2)', boxShadow: '0 0 80px rgba(0,0,0,0.9)' }}>
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
          <p className="flex-1 text-sm font-bold" style={{ color: S.silverBright }}>
            {item ? 'Editar tutorial' : 'Nuevo tutorial'}
          </p>
          <button onClick={onClose} style={{ color: S.silverDim }}><X size={16} /></button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Nombre</p>
            <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="ej. Cómo entrar a Skool"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Enlace (Loom, Drive, YouTube…)</p>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.loom.com/share/..."
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
          </div>
        </div>
        <div className="flex items-center gap-2 px-5 py-4" style={{ borderTop: `1px solid ${S.border}` }}>
          {item && onDelete && (
            <button onClick={onDelete} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold"
              style={{ color: '#e07070', border: '1px solid rgba(220,80,80,0.25)', background: 'rgba(220,80,80,0.06)' }}>
              <Trash2 size={13} /> Eliminar
            </button>
          )}
          <button onClick={save} disabled={!nombre.trim() || !url.trim() || saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)', opacity: !nombre.trim() || !url.trim() || saving ? 0.5 : 1 }}>
            {saving ? 'Guardando…' : item ? 'Guardar cambios' : 'Agregar tutorial'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TutorialesPage() {
  const { data, loading, add, update, remove } = useFirestoreCollection<Tutorial>('tutoriales_links')
  const [modal, setModal] = useState<'new' | Tutorial | null>(null)
  const [search, setSearch] = useState('')
  const seeded = useRef(false)

  useEffect(() => {
    if (loading || seeded.current || data.length > 0) return
    seeded.current = true
    SEED.forEach(s => add({ ...s, createdAt: new Date().toISOString() }))
  }, [loading, data.length, add])

  const items = [...data]
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    .filter(t => !search || t.nombre.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: S.silverBright }}>Tutoriales</h1>
          <p className="text-sm mt-1" style={{ color: S.silverDim }}>Videos de ayuda para el equipo</p>
        </div>

        {/* Buscador */}
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar tutorial…"
          className="w-full px-4 py-3 rounded-xl outline-none text-sm mb-4"
          style={{ background: S.card, border: `1px solid ${S.border}`, color: S.silverBright }} />

        <button onClick={() => setModal('new')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-5 text-sm font-bold transition-all"
          style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)' }}>
          <Plus size={16} /> Agregar tutorial
        </button>

        {loading ? (
          <p className="text-center text-sm py-10" style={{ color: S.silverDim }}>Cargando…</p>
        ) : items.length === 0 ? (
          <div className="text-center py-12" style={{ color: S.silverDim }}>
            <PlayCircle size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">{search ? 'Sin resultados' : 'Sin tutoriales guardados'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="rounded-xl overflow-hidden"
                style={{ background: S.card, border: `1px solid ${S.border}` }}>
                <div className="flex items-center gap-2 px-4 py-3">
                  {/* Ícono de plataforma */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: isLoom(item.url) ? 'rgba(99,179,237,0.12)' : isDrive(item.url) ? 'rgba(72,199,120,0.12)' : 'rgba(180,185,210,0.08)' }}>
                    <PlayCircle size={15} style={{ color: isLoom(item.url) ? '#63b3ed' : isDrive(item.url) ? '#48c878' : S.silverDim }} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" style={{ color: S.silverBright }}>{item.nombre}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: isLoom(item.url) ? '#63b3ed' : isDrive(item.url) ? '#48c878' : S.silverDim }}>
                      {isLoom(item.url) ? '🎬 Loom' : isDrive(item.url) ? '📁 Drive' : '🔗 Enlace'}
                    </p>
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
        <TutorialModal
          item={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={async (nombre, url) => {
            if (modal === 'new') await add({ nombre, url, createdAt: new Date().toISOString() })
            else await update(modal.id, { nombre, url })
            setModal(null)
          }}
          onDelete={modal !== 'new' ? async () => { await remove((modal as Tutorial).id); setModal(null) } : undefined}
        />
      )}
    </div>
  )
}
