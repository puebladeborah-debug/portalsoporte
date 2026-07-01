'use client'

import { useState } from 'react'
import { ArrowLeft, FileCheck, ScrollText, ChevronRight, BookOpen, ClipboardList } from 'lucide-react'
import { documentos, Documento, CATEGORIA_LABELS, CATEGORIA_COLORS } from '@/lib/acuerdos'

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

const ICONO_CAT: Record<Documento['categoria'], React.ReactNode> = {
  checklist:     <FileCheck size={20} />,
  reglamento:    <ScrollText size={20} />,
  politica:      <BookOpen size={20} />,
  procedimiento: <BookOpen size={20} />,
  formato:       <ClipboardList size={20} />,
}

function BadgeCategoria({ categoria }: { categoria: Documento['categoria'] }) {
  const c = CATEGORIA_COLORS[categoria]
  return (
    <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {CATEGORIA_LABELS[categoria]}
    </span>
  )
}

function VistaDetalle({ doc, onClose }: { doc: Documento; onClose: () => void }) {
  const catColor = CATEGORIA_COLORS[doc.categoria]
  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Back */}
        <button onClick={onClose}
          className="flex items-center gap-2 text-sm mb-6 transition-colors"
          style={{ color: S.silver }}>
          <ArrowLeft size={15} /> Volver a Acuerdos y Reglamentos
        </button>

        {/* Header del documento */}
        <div className="p-5 rounded-2xl mb-6"
          style={{ background: S.card, border: `1px solid ${S.borderActive}` }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: catColor.bg, color: catColor.text, border: `1px solid ${catColor.border}` }}>
              {ICONO_CAT[doc.categoria]}
            </div>
            <div className="flex-1 min-w-0">
              <BadgeCategoria categoria={doc.categoria} />
              <h1 className="text-xl font-bold mt-2 leading-tight" style={{ color: S.silverBright }}>
                {doc.titulo}
              </h1>
              <p className="text-sm mt-1" style={{ color: S.silver }}>{doc.subtitulo}</p>
            </div>
          </div>

          {/* Objetivo */}
          <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${S.border}` }}>
            <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: S.silverDim }}>
              Objetivo del rol
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#9094a4' }}>
              {doc.objetivo}
            </p>
          </div>
        </div>

        {/* Secciones */}
        <div className="space-y-4">
          {doc.secciones.map((seccion, i) => (
            <div key={i} className="rounded-2xl overflow-hidden"
              style={{ background: S.card, border: `1px solid ${S.border}` }}>
              <div className="px-5 py-3.5" style={{ borderBottom: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.03)' }}>
                <h2 className="text-sm font-bold" style={{ color: S.silverBright }}>{seccion.titulo}</h2>
              </div>
              <div className="px-5 py-4">
                {seccion.intro && (
                  <p className="text-xs leading-relaxed mb-3" style={{ color: '#7a7e8a' }}>
                    {seccion.intro}
                  </p>
                )}
                {seccion.items.length > 0 && (
                  <ul className="space-y-2">
                    {seccion.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-xs leading-relaxed"
                        style={{ color: '#9094a4' }}>
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: catColor.text, opacity: 0.6 }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {seccion.subsecciones && (
                  <div className="space-y-4 mt-2">
                    {seccion.subsecciones.map((sub, k) => (
                      <div key={k}>
                        <p className="text-[11px] font-bold mb-2" style={{ color: S.silver }}>
                          {sub.titulo}
                        </p>
                        <ul className="space-y-2">
                          {sub.items.map((item, l) => (
                            <li key={l} className="flex items-start gap-2.5 text-xs leading-relaxed"
                              style={{ color: '#9094a4' }}>
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ background: catColor.text, opacity: 0.6 }} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Campos del formato */}
          {doc.camposFormato && doc.camposFormato.length > 0 && (
            <div className="rounded-2xl overflow-hidden"
              style={{ background: S.card, border: `1px solid ${S.border}` }}>
              <div className="px-5 py-3.5" style={{ borderBottom: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.03)' }}>
                <h2 className="text-sm font-bold" style={{ color: S.silverBright }}>Campos del Formato</h2>
              </div>
              <div className="px-5 py-5 space-y-4">
                {doc.camposFormato.map((campo, i) => (
                  <div key={i}>
                    <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>
                      {campo.label}
                    </p>
                    <div style={{ background: 'var(--th-inner)', border: `1px solid ${S.border}`, borderRadius: '0.75rem', height: campo.altura === 'grande' ? '4rem' : '2.25rem' }} />
                  </div>
                ))}
              </div>
              <div className="px-5 pb-5 pt-2" style={{ borderTop: `1px solid ${S.border}` }}>
                <p className="text-[10px] tracking-widest uppercase mb-4" style={{ color: S.silverDim }}>
                  Firmas de conformidad
                </p>
                <div className="space-y-4">
                  {['Firma del Colaborador', 'Firma del Líder / Supervisor'].map(firma => (
                    <div key={firma}>
                      <div className="h-12 rounded-xl mb-1.5" style={{ background: 'var(--th-inner)', border: `1px solid ${S.border}` }} />
                      <p className="text-[11px]" style={{ color: S.silverDim }}>{firma}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Compromiso */}
          {doc.compromiso && (
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(180,185,210,0.03)', border: `1px solid ${S.borderActive}` }}>
              <div className="px-5 py-3.5" style={{ borderBottom: `1px solid ${S.border}` }}>
                <h2 className="text-sm font-bold" style={{ color: S.silverBright }}>
                  Compromiso y Aceptación
                </h2>
              </div>
              <div className="px-5 py-5">
                {doc.compromiso.split('\n\n').map((parrafo, i) => (
                  <p key={i} className="text-xs leading-relaxed mb-3 last:mb-0" style={{ color: '#9094a4' }}>
                    {parrafo}
                  </p>
                ))}
                {/* Campos de firma */}
                <div className="mt-6 grid grid-cols-1 gap-4">
                  {['Nombre completo', 'Fecha', 'Ciudad / Evento'].map(campo => (
                    <div key={campo}>
                      <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: S.silverDim }}>
                        {campo}
                      </p>
                      <div className="h-9 rounded-xl" style={{ background: 'var(--th-inner)', border: `1px solid ${S.border}` }} />
                    </div>
                  ))}
                  <div>
                    <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: S.silverDim }}>
                      Firma
                    </p>
                    <div className="h-16 rounded-xl" style={{ background: 'var(--th-inner)', border: `1px solid ${S.border}` }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-8" />
      </div>
    </div>
  )
}

export default function AcuerdosPage() {
  const [docSeleccionado, setDocSeleccionado] = useState<Documento | null>(null)

  if (docSeleccionado) {
    return <VistaDetalle doc={docSeleccionado} onClose={() => setDocSeleccionado(null)} />
  }

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: S.silverBright }}>
            Acuerdos y Reglamentos
          </h1>
          <p className="text-sm mt-1" style={{ color: S.silverDim }}>
            Documentos oficiales del departamento de soporte — {documentos.length} documento{documentos.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Grid de documentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documentos.map((doc) => {
            const catColor = CATEGORIA_COLORS[doc.categoria]
            return (
              <button key={doc.id} onClick={() => setDocSeleccionado(doc)}
                className="text-left p-5 rounded-2xl transition-all group"
                style={{
                  background: S.card,
                  border: `1px solid ${S.border}`,
                }}>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ background: catColor.bg, color: catColor.text, border: `1px solid ${catColor.border}` }}>
                    {ICONO_CAT[doc.categoria]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <BadgeCategoria categoria={doc.categoria} />
                    <h2 className="text-sm font-bold mt-2 leading-snug" style={{ color: S.silverBright }}>
                      {doc.titulo}
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: S.silver }}>{doc.subtitulo}</p>
                    <p className="text-[11px] mt-2 leading-relaxed line-clamp-2" style={{ color: S.silverDim }}>
                      {doc.descripcion}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3"
                  style={{ borderTop: `1px solid ${S.border}` }}>
                  <span className="text-[10px]" style={{ color: S.silverDim }}>
                    {doc.secciones.length} secciones
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-medium"
                    style={{ color: catColor.text }}>
                    Ver documento <ChevronRight size={13} />
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Placeholder para más documentos */}
        <div className="mt-4 p-5 rounded-2xl flex items-center gap-4"
          style={{ background: 'rgba(180,185,210,0.02)', border: `1px dashed ${S.border}` }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(180,185,210,0.05)', color: S.silverDim }}>
            <ScrollText size={20} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: S.silverDim }}>Más documentos próximamente</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#2a2e3a' }}>
              Aquí aparecerán los nuevos reglamentos y acuerdos que se agreguen
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
