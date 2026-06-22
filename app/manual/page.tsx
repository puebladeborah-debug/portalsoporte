'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { ChevronRight, ArrowLeft, Zap } from 'lucide-react'
import { categories, articles } from '@/lib/data'
import { Suspense } from 'react'

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
  bg: '#060608', card: '#0e0e12', border: '#1e1e28',
  borderActive: 'rgba(180,185,210,0.22)', silver: '#b8bcc8',
  silverBright: '#d4d8e8', silverDim: '#3a3e4a',
}

function ManualContent() {
  const searchParams = useSearchParams()
  const categoriaSlug = searchParams.get('categoria')
  const selectedCategory = categories.find((c) => c.slug === categoriaSlug)
  const filteredArticles = categoriaSlug
    ? articles.filter((a) => {
        const cat = categories.find((c) => c.slug === categoriaSlug)
        return cat ? a.category_id === cat.id : true
      })
    : articles

  if (selectedCategory) {
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
          <div className="space-y-2">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <Link key={article.id} href={`/manual/${article.id}`}
                  className="flex items-center gap-3 p-4 rounded-2xl transition-all duration-200"
                  style={{ background: S.card, border: `1px solid ${S.border}` }}>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: S.silverBright }}>{article.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>{article.tags.slice(0,3).join(' · ')}</p>
                  </div>
                  <ChevronRight size={16} style={{ color: S.silverDim }} />
                </Link>
              ))
            ) : (
              <div className="text-center py-12" style={{ color: S.silverDim }}>
                <p className="text-lg mb-2">Sin artículos aún</p>
                <Link href="/admin" className="text-sm font-medium" style={{ color: S.silver }}>
                  Ir al panel Admin →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Zap size={14} style={{ color: S.silver }} />
          <h1 className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: S.silverDim }}>
            Todos los Manuales
          </h1>
        </div>
        <div className="space-y-2">
          {categories.map((cat) => {
            const count = articles.filter((a) => a.category_id === cat.id).length
            return (
              <Link key={cat.id} href={`/manual?categoria=${cat.slug}`}
                className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200"
                style={{ background: S.card, border: `1px solid ${S.border}` }}>
                <CatIcon slug={cat.slug} icon={cat.icon} size={36} />
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: S.silverBright }}>{cat.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>{count} artículo{count !== 1 ? 's' : ''}</p>
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
