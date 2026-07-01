'use client'

import { useState } from 'react'
import { MessageSquare, X, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'

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
]

export default function QuickResponses() {
  const [open, setOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

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

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all z-30 md:bottom-5"
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
              <button onClick={() => setOpen(false)} style={{ color: S.silverDim }}>
                <X size={18} />
              </button>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
              style={{ scrollbarWidth: 'thin', scrollbarColor: `${S.silverDim} transparent` }}>
              {RESPUESTAS.map(r => {
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
                {RESPUESTAS.length} respuestas disponibles
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
