'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { ChevronRight, ArrowLeft, Zap, Download, FileText, FileSpreadsheet, X } from 'lucide-react'
import { categories, articles } from '@/lib/data'
import { Suspense, useState } from 'react'

const CAT_IMAGES: Record<string, string> = {
  'estructura-organizacional': '/estructura.png',
  'manual-operacion':          '/manual.png',
  'procedimientos-politicas':  '/procedimientos.png',
  'preguntas-frecuentes':      '/preguntas.png',
  'rutas-criticas':            '/ruta.png',
}

function CatIcon({ slug, icon, size }: { slug: string; icon: string; size: number }) {
  const src = CAT_IMAGES[slug]
  return src
    ? <Image src={src} alt={slug} width={size} height={size} className="rounded-lg object-cover flex-shrink-0" />
    : <span style={{ fontSize: size * 0.7 }}>{icon}</span>
}

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

type ArchivoDescargable = {
  nombre: string
  descripcion: string
  archivo: string
  tipo: 'pdf' | 'docx' | 'xlsx' | 'csv' | 'pptx'
  categoria: string
  tamaño: string
}

const ARCHIVOS: ArchivoDescargable[] = [
  {
    nombre: 'Manual Operativo de Soporte',
    descripcion: 'Guía completa de operaciones del departamento de soporte',
    archivo: '/manuales/manual-operativo-soporte.pdf',
    tipo: 'pdf',
    categoria: 'Manual de Operación',
    tamaño: '7.4 MB',
  },
  {
    nombre: 'Manual Maestro — Disputas',
    descripcion: 'Manual de atención y resolución de disputas Club Sinergético',
    archivo: '/manuales/manual-disputas.pdf',
    tipo: 'pdf',
    categoria: 'Procedimientos y Políticas',
    tamaño: '389 KB',
  },
  {
    nombre: 'Reglas del Equipo de Atención',
    descripcion: 'Manual de reglas del equipo de atención al cliente',
    archivo: '/manuales/reglas-equipo.pdf',
    tipo: 'pdf',
    categoria: 'Procedimientos y Políticas',
    tamaño: '113 KB',
  },
  {
    nombre: 'Reglas del Equipo (Word)',
    descripcion: 'Versión editable del manual de reglas del equipo',
    archivo: '/manuales/reglas-equipo.docx',
    tipo: 'docx',
    categoria: 'Procedimientos y Políticas',
    tamaño: '29 KB',
  },
  {
    nombre: 'Reglas Atención al Cliente',
    descripcion: 'Documento de reglas del equipo de atención',
    archivo: '/manuales/reglas-atencion-cliente.pdf',
    tipo: 'pdf',
    categoria: 'Procedimientos y Políticas',
    tamaño: '4 KB',
  },
  {
    nombre: 'Manual de Skool',
    descripcion: 'Presentación del manual de la plataforma Skool',
    archivo: '/manuales/manual-skool.pdf',
    tipo: 'pdf',
    categoria: 'Manual de Operación',
    tamaño: '5.0 MB',
  },
  {
    nombre: 'Domina Skool desde Cero',
    descripcion: 'Guía completa para el uso de la plataforma Skool',
    archivo: '/manuales/domina-skool.pdf',
    tipo: 'pdf',
    categoria: 'Manual de Operación',
    tamaño: '9.1 MB',
  },
  {
    nombre: 'Soporte — Documento General',
    descripcion: 'Documento general del área de soporte',
    archivo: '/manuales/soporte.pdf',
    tipo: 'pdf',
    categoria: 'Manual de Operación',
    tamaño: '232 KB',
  },
  {
    nombre: 'Soporte Técnico Synergy',
    descripcion: 'Manual de soporte técnico de la plataforma',
    archivo: '/manuales/soporte-tecnico.pdf',
    tipo: 'pdf',
    categoria: 'Rutas Críticas',
    tamaño: '982 KB',
  },
  {
    nombre: 'Evaluación de Capacitación',
    descripcion: 'Formato de evaluación de capacitación del equipo',
    archivo: '/manuales/evaluacion-capacitacion.pdf',
    tipo: 'pdf',
    categoria: 'Estructura Organizacional',
    tamaño: '52 KB',
  },
  {
    nombre: 'Manual de Estructura Organizacional',
    descripcion: 'Estructura organizacional del departamento de soporte',
    archivo: '/manuales/manual-estructura-organizacional.pdf',
    tipo: 'pdf',
    categoria: 'Estructura Organizacional',
    tamaño: '1.5 MB',
  },
  {
    nombre: 'Checklist Gira Operativo',
    descripcion: 'Lista de verificación operativa para giras',
    archivo: '/manuales/checklist-gira-operativo.docx',
    tipo: 'docx',
    categoria: 'Manual de Operación',
    tamaño: '14 KB',
  },
  {
    nombre: 'Checklist Gira Soporte Remoto',
    descripcion: 'Lista de verificación para soporte remoto en giras',
    archivo: '/manuales/checklist-gira-remoto.docx',
    tipo: 'docx',
    categoria: 'Manual de Operación',
    tamaño: '19 KB',
  },
]

const TIPO_COLOR: Record<string, string> = {
  pdf:  'rgba(220,80,80,0.12)',
  docx: 'rgba(100,140,220,0.12)',
  xlsx: 'rgba(80,180,80,0.12)',
  csv:  'rgba(80,180,80,0.12)',
  pptx: 'rgba(220,120,50,0.12)',
}
const TIPO_TEXT: Record<string, string> = {
  pdf:  '#e07070',
  docx: '#7ab0f0',
  xlsx: '#70c080',
  csv:  '#70c080',
  pptx: '#e09050',
}

function FileIcon({ tipo }: { tipo: string }) {
  if (tipo === 'xlsx' || tipo === 'csv') return <FileSpreadsheet size={18} />
  return <FileText size={18} />
}

function ListaArchivos({ archivos, onViewPdf }: { archivos: ArchivoDescargable[]; onViewPdf: (url: string, nombre: string) => void }) {
  return (
    <div className="space-y-2">
      {archivos.map(ar => {
        const isPdf = ar.tipo === 'pdf'
        const inner = (
          <>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: TIPO_COLOR[ar.tipo], color: TIPO_TEXT[ar.tipo] }}>
              <FileIcon tipo={ar.tipo} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--th-bright)' }}>{ar.nombre}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--th-dim)' }}>{ar.descripcion}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                style={{ background: TIPO_COLOR[ar.tipo], color: TIPO_TEXT[ar.tipo] }}>
                {ar.tipo}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--th-dim)' }}>{ar.tamaño}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(122,176,240,0.12)', color: '#7ab0f0' }}>
                <Download size={13} />
              </div>
            </div>
          </>
        )

        return isPdf ? (
          <button key={ar.archivo} onClick={() => onViewPdf(ar.archivo, ar.nombre)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left"
            style={{ background: 'rgba(122,176,240,0.04)', border: '1px solid rgba(122,176,240,0.15)' }}>
            {inner}
          </button>
        ) : (
          <a key={ar.archivo} href={ar.archivo} download
            className="flex items-center gap-3 p-3 rounded-2xl transition-all"
            style={{ background: 'rgba(122,176,240,0.04)', border: '1px solid rgba(122,176,240,0.15)', textDecoration: 'none' }}>
            {inner}
          </a>
        )
      })}
    </div>
  )
}

function ManualContent() {
  const searchParams = useSearchParams()
  const [openPdf, setOpenPdf] = useState<{ url: string; nombre: string } | null>(null)
  const categoriaSlug = searchParams.get('categoria')
  const vistaDescargas = searchParams.get('vista') === 'descargas'
  const selectedCategory = categories.find((c) => c.slug === categoriaSlug)
  const filteredArticles = categoriaSlug
    ? articles.filter((a) => {
        const cat = categories.find((c) => c.slug === categoriaSlug)
        return cat ? a.category_id === cat.id : true
      })
    : articles

  function handleViewPdf(url: string, nombre: string) {
    setOpenPdf({ url, nombre })
  }

  // ── Visor de PDF (overlay de pantalla completa) ────────────────────────────
  if (openPdf) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col" style={{ background: '#06060a' }}>
        {/* Barra superior con botón cerrar */}
        <div className="flex items-center justify-between gap-3 px-4 flex-shrink-0"
          style={{
            paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))',
            paddingBottom: '0.75rem',
            background: 'rgba(12,12,20,0.97)',
            borderBottom: '1px solid rgba(180,185,210,0.1)',
          }}>
          <button
            onClick={() => setOpenPdf(null)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(220,80,80,0.1)', color: '#e07070', border: '1px solid rgba(220,80,80,0.2)' }}>
            <X size={16} />
            <span className="text-sm font-semibold">Cerrar</span>
          </button>
          <p className="text-xs font-medium flex-1 truncate text-center" style={{ color: 'var(--th-silver)' }}>
            {openPdf.nombre}
          </p>
          <a href={openPdf.url} download
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(122,176,240,0.1)', color: '#7ab0f0', border: '1px solid rgba(122,176,240,0.2)', textDecoration: 'none' }}>
            <Download size={14} />
            <span className="text-sm font-semibold">Guardar</span>
          </a>
        </div>

        {/* Contenido PDF */}
        <iframe
          src={openPdf.url}
          className="flex-1 w-full"
          style={{ border: 'none' }}
          title={openPdf.nombre}
        />
      </div>
    )
  }

  // Vista: archivos descargables (tarjeta dedicada)
  if (vistaDescargas) {
    return (
      <div style={{ background: S.bg, minHeight: '100vh' }}>
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link href="/manual" className="flex items-center gap-2 text-sm mb-6"
            style={{ color: S.silver }}>
            <ArrowLeft size={15} /> Volver a Manuales
          </Link>
          <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl"
            style={{ background: 'rgba(122,176,240,0.06)', border: '1px solid rgba(122,176,240,0.25)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(122,176,240,0.12)', color: '#7ab0f0' }}>
              <Download size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#7ab0f0' }}>Archivos Descargables</h1>
              <p className="text-sm mt-0.5" style={{ color: S.silverDim }}>{ARCHIVOS.length} documentos disponibles para descarga</p>
            </div>
          </div>
          <ListaArchivos archivos={ARCHIVOS} onViewPdf={handleViewPdf} />
        </div>
      </div>
    )
  }

  // Vista de categoría seleccionada
  if (selectedCategory) {
    const archivosCategoria = ARCHIVOS.filter(a => a.categoria === selectedCategory.name)

    return (
      <div style={{ background: S.bg, minHeight: '100vh' }}>
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link href="/manual" className="flex items-center gap-2 text-sm mb-6 transition-colors"
            style={{ color: S.silver }}>
            <ArrowLeft size={15} /> Volver a Manuales
          </Link>
          <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl" style={{ background: S.card, border: `1px solid ${S.borderActive}` }}>
            <CatIcon slug={selectedCategory.slug} icon={selectedCategory.icon} size={52} />
            <div>
              <h1 className="text-xl font-bold" style={{ color: S.silverBright }}>{selectedCategory.name}</h1>
              <p className="text-sm mt-0.5" style={{ color: S.silverDim }}>{selectedCategory.description}</p>
            </div>
          </div>

          {archivosCategoria.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Download size={14} style={{ color: S.silver }} />
                <p className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: S.silverDim }}>
                  Archivos descargables ({archivosCategoria.length})
                </p>
              </div>
              <ListaArchivos archivos={archivosCategoria} onViewPdf={handleViewPdf} />
            </div>
          )}

          {filteredArticles.length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={14} style={{ color: S.silver }} />
                <p className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: S.silverDim }}>
                  Artículos ({filteredArticles.length})
                </p>
              </div>
              <div className="space-y-2">
                {filteredArticles.map((article) => (
                  <Link key={article.id} href={`/manual/${article.id}`}
                    className="flex items-center gap-3 p-4 rounded-2xl transition-all duration-200"
                    style={{ background: S.card, border: `1px solid ${S.border}` }}>
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ color: S.silverBright }}>{article.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>{article.tags.slice(0,3).join(' · ')}</p>
                    </div>
                    <ChevronRight size={16} style={{ color: S.silverDim }} />
                  </Link>
                ))}
              </div>
            </>
          )}

          {archivosCategoria.length === 0 && filteredArticles.length === 0 && (
            <div className="text-center py-12" style={{ color: S.silverDim }}>
              <p className="text-lg mb-2">Sin contenido aún</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Vista principal — categorías + tarjeta de descargas
  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-4 py-6">

        <div className="flex items-center gap-2 mb-4">
          <Zap size={14} style={{ color: S.silver }} />
          <h1 className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: S.silverDim }}>
            Todos los manuales
          </h1>
        </div>

        <div className="space-y-2">
          {/* Tarjeta de archivos descargables */}
          <Link href="/manual?vista=descargas"
            className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200"
            style={{ background: 'rgba(122,176,240,0.06)', border: '1px solid rgba(122,176,240,0.25)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(122,176,240,0.14)', color: '#7ab0f0' }}>
              <Download size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: '#7ab0f0' }}>Archivos Descargables</p>
              <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>
                {ARCHIVOS.length} documentos · PDFs y Word listos para descargar
              </p>
            </div>
            <ChevronRight size={16} style={{ color: '#7ab0f0' }} />
          </Link>

          {/* Categorías de artículos */}
          {categories.map((cat) => {
            const count = articles.filter((a) => a.category_id === cat.id).length
            const archivosCount = ARCHIVOS.filter(a => a.categoria === cat.name).length
            return (
              <Link key={cat.id} href={`/manual?categoria=${cat.slug}`}
                className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200"
                style={{ background: S.card, border: `1px solid ${S.border}` }}>
                <CatIcon slug={cat.slug} icon={cat.icon} size={36} />
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: S.silverBright }}>{cat.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>
                    {count} artículo{count !== 1 ? 's' : ''}
                    {archivosCount > 0 && <span style={{ color: '#7ab0f0' }}> · {archivosCount} archivo{archivosCount !== 1 ? 's' : ''}</span>}
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: S.silverDim }} />
              </Link>
            )
          })}
        </div>

      </div>
    </div>
  )
}

export default function ManualPage() {
  return <Suspense><ManualContent /></Suspense>
}
