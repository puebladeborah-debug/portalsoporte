'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, X, Copy, Check, ChevronDown, ChevronUp, Download, Plus, Pencil, Trash2 } from 'lucide-react'
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

const RESPUESTAS = [
  {
    id: 'bienvenida',
    titulo: 'Sesión de Bienvenida',
    emoji: '🎉',
    contenido: 'https://youtu.be/oTYz6dAtnwU',
  },
  {
    id: 'facturacion',
    titulo: 'Facturación',
    emoji: '🧾',
    contenido: 'Hola buen día!\nCon gusto te comparto el link de facturación:\nhttps://www.synergyforeducation.com/tutorial-de-facturacion',
  },
  {
    id: 'videoteca',
    titulo: 'Videoteca',
    emoji: '🎬',
    contenido: 'https://www.synergyforeducation.com/products/videoteca-de-lunes-sinergetico-y-miercoles-especialista',
  },
  {
    id: 'soporte-viejo',
    titulo: 'Soporte (número anterior)',
    emoji: '📞',
    contenido: '3326308292',
  },
  {
    id: 'soporte-nuevo',
    titulo: 'Soporte (número nuevo)',
    emoji: '📱',
    contenido: '3328116675',
  },
  {
    id: 'skool',
    titulo: 'SKOOL',
    emoji: '🎓',
    contenido: '3329467702',
  },
  {
    id: 'ghl',
    titulo: 'GHL',
    emoji: '⚙️',
    contenido: '3310645065',
  },
  {
    id: 'telegram',
    titulo: 'Grupos Telegram',
    emoji: '✈️',
    contenido: 'Hay que accesar a los siguientes enlaces para poder estar en el grupo de Telegram y obtener cada semana tu ingreso a las clases en vivo y noticias importantes del Club.\n\n👥 Canal de noticias Telegram (solo los administradores pueden publicar):\nhttps://t.me/+G5Ll8lcJkvw1Yzhh\n\n👥 Chat de networking Telegram (Todos los miembros pueden publicar):\nhttps://t.me/+QU4Lv8w9H3hiY2I5',
  },
  {
    id: 'terminos',
    titulo: 'Términos y Condiciones',
    emoji: '📋',
    contenido: 'https://www.synergyforeducation.com/terminos-y-condiciones-club-sinergetico',
  },
  {
    id: 'clases-skool',
    titulo: '¿Cómo entrar a las clases de Skool?',
    emoji: '🖥️',
    contenido: 'https://www.loom.com/share/75a936ea318e4c388f99b209838b4ddd',
  },
  {
    id: 'invitacion-skool',
    titulo: 'Invitación de Skool en el correo',
    emoji: '📧',
    contenido: 'https://www.loom.com/share/681dc4dd8a3948f2bd92dd7ca3144c21',
  },
  {
    id: 'login-synergy',
    titulo: '¿Cómo iniciar sesión en Synergy Education?',
    emoji: '🔑',
    contenido: 'https://www.loom.com/share/6bd1797836864621a5225de514ab2313?sid=c5de2c90-bf4a-4b7a-84a1-dd0a3534c5b5',
  },
  {
    id: 'password-skool',
    titulo: 'Cambiar contraseña en Skool',
    emoji: '🔒',
    contenido: 'https://www.loom.com/share/681dc4dd8a3948f2bd92dd7ca3144c21',
  },
  {
    id: 'perfil-skool',
    titulo: 'Crear perfil en Skool',
    emoji: '👤',
    contenido: 'https://www.loom.com/share/9fef12507f2f4cca8d18190a6b5163b8?sid=d7b727a0-8f96-436f-9cf6-8af184041ddc',
  },
  {
    id: 'idioma-skool',
    titulo: 'Idioma en Skool',
    emoji: '🌐',
    imagen: '/respuestas-imgs/idioma-en-skool.jpeg',
    contenido: 'IDIOMA EN SKOOL\n\nRespuesta: Esto pasa mucho en Skool, y no depende del grupo o del administrador, sino del idioma configurado en el navegador o dispositivo del usuario, no dentro de la plataforma.\n\nSkool detecta automáticamente el idioma según:\n1. El idioma principal del navegador (por ejemplo, Chrome, Safari, Edge, etc.).\n2. La configuración de idioma del sistema operativo (en el celular o computadora).\n3. No hay todavía una opción interna en Skool para "forzar" el idioma desde la cuenta o el grupo.\n\nCómo cambiarlo (instrucciones para tus miembros):\n\nEn computadora:\n1. Abre Skool en el navegador.\n2. Entra a Configuración del navegador → Idiomas (en Chrome: chrome://settings/languages).\n3. Asegúrate de que Español (México o España) esté arriba en la lista de idiomas preferidos.\n4. Cierra y vuelve a abrir Skool. → Ya debería mostrarse todo en español.\n\nEn celular:\n- iPhone: Ajustes → General → Idioma y región → Pon Español primero.\n- Android: Ajustes → Sistema → Idiomas y entrada → Idiomas → Mueve Español al primer lugar.\n- Luego cierra y vuelve a abrir la app de Skool o el navegador.',
  },
  {
    id: 'obtener-boleto',
    titulo: 'Obtener boleto Synergy Unlimited 2026',
    emoji: '🎟️',
    imagen: '/respuestas-imgs/obtener-boleto.jpeg',
    contenido: '🎟️ ¡Tus boletos para Synergy Unlimited 2026 ya están listos!\n\nIngresa con el correo con el que te registraste, consulta tus accesos y descarga tus boletos. 🚀\n\n👉 https://synergyunlimited.com/mis-boletos\n\n¡Guárdalos y prepárate para vivir Synergy Unlimited! 🔥',
  },
]

type RespuestaCustom = { id: string; titulo: string; emoji: string; contenido: string; createdAt: string }

function RespuestaModal({ item, onClose, onSave, onDelete }: {
  item: RespuestaCustom | null
  onClose: () => void
  onSave: (titulo: string, emoji: string, contenido: string) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const [titulo, setTitulo] = useState(item?.titulo || '')
  const [emoji, setEmoji] = useState(item?.emoji || '💬')
  const [contenido, setContenido] = useState(item?.contenido || '')
  const [saving, setSaving] = useState(false)
  const [confirmarBorrar, setConfirmarBorrar] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const inputStyle = { background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }
  const valido = titulo.trim() && contenido.trim()

  async function save() {
    if (!valido) return
    setSaving(true)
    await onSave(titulo.trim(), emoji.trim() || '💬', contenido.trim())
    setSaving(false)
  }

  async function eliminar() {
    if (!onDelete) return
    setDeleting(true)
    await onDelete()
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,var(--th-overlay-alpha))', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'var(--th-inner)', border: '1px solid rgba(180,185,210,0.2)', boxShadow: '0 0 80px rgba(0,0,0,0.9)' }}>

        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
          <p className="flex-1 text-sm font-bold" style={{ color: S.silverBright }}>
            {item ? 'Editar respuesta' : 'Nueva respuesta rápida'}
          </p>
          <button onClick={onClose} style={{ color: S.silverDim }}><X size={16} /></button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="flex gap-3">
            <div className="w-16 flex-shrink-0">
              <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Emoji</p>
              <input value={emoji} onChange={e => setEmoji(e.target.value)}
                placeholder="💬" maxLength={4}
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm text-center" style={inputStyle} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Título</p>
              <input value={titulo} onChange={e => setTitulo(e.target.value)}
                placeholder="ej. Link de pago Skool"
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
            </div>
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Contenido a copiar</p>
            <textarea value={contenido} onChange={e => setContenido(e.target.value)} rows={5}
              placeholder="El texto o enlace que se copiará al portapapeles…"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm resize-none" style={inputStyle} />
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
                {saving ? 'Guardando…' : item ? 'Guardar cambios' : 'Agregar respuesta'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function QuickResponses() {
  const [open, setOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [teamModalOpen, setTeamModalOpen] = useState(false)
  const [modal, setModal] = useState<'new' | RespuestaCustom | null>(null)

  const { data: custom, add, update, remove } = useFirestoreCollection<RespuestaCustom>('respuestas_rapidas')

  useEffect(() => {
    function handleSidebar(e: Event) { setSidebarOpen((e as CustomEvent).detail.active) }
    function handleModal(e: Event)   { setTeamModalOpen((e as CustomEvent).detail.active) }
    window.addEventListener('sidebarActiveChange', handleSidebar)
    window.addEventListener('teamModalChange', handleModal)
    return () => {
      window.removeEventListener('sidebarActiveChange', handleSidebar)
      window.removeEventListener('teamModalChange', handleModal)
    }
  }, [])

  function copy(id: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  function toggleExpand(id: string) {
    setExpandedId(prev => prev === id ? null : id)
  }

  const isMultiLine = (text: string) => text.includes('\n') || text.length > 80

  const personalizadas = [...custom].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const total = RESPUESTAS.length + personalizadas.length

  return (
    <>
      {/* Botón flotante — se oculta cuando hay un perfil o panel abierto */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all z-30 quick-resp-bottom ${sidebarOpen || teamModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        style={{
          background: 'var(--th-card)',
          border: `1px solid ${S.borderLight}`,
          color: S.silverBright,
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        }}>
        <MessageSquare size={14} />
        Respuestas Rápidas
      </button>

      {/* Panel modal */}
      {open && (
        <div className="fixed inset-0 z-[400] flex items-end md:items-center justify-center"
          style={{ background: 'rgba(0,0,0,var(--th-overlay-alpha))' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>

          <div className="w-full max-w-lg mx-0 md:mx-4 rounded-t-3xl md:rounded-2xl flex flex-col"
            style={{
              background: S.bg,
              border: '1px solid rgba(180,185,210,0.15)',
              boxShadow: '0 0 60px rgba(0,0,0,0.95)',
              maxHeight: '85vh',
            }}>

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
              style={{ borderBottom: `1px solid ${S.border}` }}>
              <MessageSquare size={15} style={{ color: S.silver }} />
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: S.silverBright }}>Respuestas Rápidas</p>
                <p className="text-[10px] mt-0.5" style={{ color: S.silverDim }}>
                  Toca una respuesta para copiarla al portapapeles
                </p>
              </div>
              <button onClick={() => setModal('new')}
                className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex-shrink-0"
                style={{ background: 'rgba(180,185,210,0.08)', color: S.silver, border: `1px solid ${S.border}` }}>
                <Plus size={12} /> Agregar
              </button>
              <button onClick={() => setOpen(false)} style={{ color: S.silverDim }}>
                <X size={18} />
              </button>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
              style={{ scrollbarWidth: 'thin', scrollbarColor: `${S.silverDim} transparent` }}>
              {[...RESPUESTAS, ...personalizadas].map(r => {
                const esPersonalizada = personalizadas.some(p => p.id === r.id)
                const imagen = 'imagen' in r ? r.imagen : undefined
                const multi = isMultiLine(r.contenido)
                const expanded = expandedId === r.id
                const copied = copiedId === r.id

                return (
                  <div key={r.id} className="rounded-2xl overflow-hidden"
                    style={{ background: S.card, border: `1px solid ${S.border}` }}>

                    {/* Título + acciones */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <span className="text-lg flex-shrink-0">{r.emoji}</span>
                      <p className="flex-1 text-xs font-semibold" style={{ color: S.silverBright }}>
                        {r.titulo}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {/* Botón expandir (solo si es texto largo) */}
                        {multi && (
                          <button
                            onClick={() => toggleExpand(r.id)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: S.silverDim, background: 'rgba(180,185,210,0.06)' }}>
                            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                        )}
                        {/* Editar (solo respuestas agregadas desde la app) */}
                        {esPersonalizada && (
                          <button
                            onClick={() => setModal(r as RespuestaCustom)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: S.silverDim, background: 'rgba(180,185,210,0.06)' }}>
                            <Pencil size={12} />
                          </button>
                        )}
                        {/* Botón copiar */}
                        <button
                          onClick={() => copy(r.id, r.contenido)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                          style={copied
                            ? { background: 'rgba(92,184,122,0.15)', color: '#5cb87a', border: '1px solid rgba(92,184,122,0.3)' }
                            : { background: 'rgba(180,185,210,0.08)', color: S.silver, border: `1px solid ${S.border}` }
                          }>
                          {copied ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
                        </button>
                      </div>
                    </div>

                    {/* Imagen adjunta (si la respuesta trae una) */}
                    {imagen && (
                      <div className="px-4 pb-3">
                        <img src={imagen} alt={r.titulo}
                          className="rounded-xl max-w-full mb-2"
                          style={{ border: `1px solid ${S.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.35)' }} />
                        <a href={imagen} download
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                          style={{ background: 'rgba(180,185,210,0.08)', color: S.silver, border: `1px solid ${S.border}` }}>
                          <Download size={11} /> Descargar imagen
                        </a>
                      </div>
                    )}

                    {/* Preview del contenido */}
                    {(!multi || expanded) && (
                      <div className="px-4 pb-3">
                        <p className="text-[10px] leading-relaxed break-all whitespace-pre-line"
                          style={{ color: S.silverDim }}>
                          {r.contenido}
                        </p>
                      </div>
                    )}

                    {/* Preview compacto (solo primer línea cuando está colapsado) */}
                    {multi && !expanded && (
                      <div className="px-4 pb-2.5">
                        <p className="text-[10px] truncate" style={{ color: S.silverDim }}>
                          {r.contenido.split('\n')[0]}
                          <span style={{ color: 'rgba(180,185,210,0.3)' }}> ···</span>
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 flex-shrink-0 text-center"
              style={{ borderTop: `1px solid ${S.border}` }}>
              <p className="text-[9px]" style={{ color: S.silverDim }}>
                {total} respuesta{total !== 1 ? 's' : ''} disponible{total !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <RespuestaModal
          item={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={async (titulo, emoji, contenido) => {
            if (modal === 'new') {
              await add({ titulo, emoji, contenido, createdAt: new Date().toISOString() })
            } else {
              await update(modal.id, { titulo, emoji, contenido })
            }
            setModal(null)
          }}
          onDelete={modal !== 'new' ? async () => {
            await remove((modal as RespuestaCustom).id)
            setModal(null)
          } : undefined}
        />
      )}
    </>
  )
}
