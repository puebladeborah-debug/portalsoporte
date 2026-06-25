'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Search, BookOpen, CalendarClock, ChevronRight, Zap } from 'lucide-react'
import { categories, articles } from '@/lib/data'
import Fuse from 'fuse.js'
import ParticleCanvas from '@/components/ParticleCanvas'
import TeamSidebar from '@/components/TeamSidebar'
import ClockWidget from '@/components/ClockWidget'
import QuickResponses from '@/components/QuickResponses'
import CountdownBanner from '@/components/CountdownBanner'
import ContactarCliente from '@/components/ContactarCliente'

const S = {
  bg: '#060608', card: '#0e0e12', border: '#1e1e28',
  borderActive: 'rgba(180,185,210,0.25)', silver: '#b8bcc8',
  silverBright: '#d4d8e8', silverDim: '#3a3e4a',
}

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<typeof articles>([])

  const fuse = new Fuse(articles, {
    keys: [{ name: 'title', weight: 2 }, { name: 'tags', weight: 1.5 }, { name: 'content', weight: 1 }],
    threshold: 0.5,
    ignoreLocation: true,
    minMatchCharLength: 2,
  })

  function handleSearch(value: string) {
    setQuery(value)
    setResults(value.trim().length > 1 ? fuse.search(value).map((r) => r.item) : [])
  }

  return (
    <div className="flex md:h-[calc(100vh-112px)] md:overflow-hidden" style={{ background: S.bg, position: 'relative' }}>

      {/* Particle animation background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <ParticleCanvas />
      </div>

      {/* Columna izquierda — Logo (solo escritorio, compacto) */}
      <aside className="hidden md:flex flex-col items-center pt-5 px-4 flex-shrink-0"
        style={{ width: '150px', borderRight: `1px solid ${S.border}`, position: 'sticky', top: '112px', alignSelf: 'flex-start', height: '100%', zIndex: 1 }}>
        <Image
          src="/logo.jpg"
          alt="Club Sinergetico Soporte"
          width={120}
          height={120}
          className="rounded-xl"
          style={{ boxShadow: '0 0 30px rgba(180,185,210,0.15)' }}
        />
        <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-center mt-3"
          style={{ background: 'linear-gradient(135deg,#d4d8e8,#8890a8,#d4d8e8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Club Sinergetico
        </p>
        <p className="text-[9px] tracking-[0.3em] uppercase mt-0.5" style={{ color: S.silverDim }}>Soporte</p>
      </aside>

      {/* Contenido principal — scroll interno si es necesario */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ position: 'relative', zIndex: 1 }}>

        {/* Header móvil con logo pequeño */}
        <div className="flex md:hidden items-center gap-3 mb-4">
          <Image src="/logo.jpg" alt="Logo" width={44} height={44} className="rounded-lg"
            style={{ boxShadow: '0 0 14px rgba(180,185,210,0.2)' }} />
          <div>
            <h1 className="text-lg font-bold"
              style={{ background: 'linear-gradient(135deg,#f0f2ff,#b8bcc8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Bienvenida, DLP
            </h1>
            <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: S.silverDim }}>Portal de Soporte</p>
          </div>
        </div>

        {/* Header escritorio */}
        <div className="hidden md:flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold"
              style={{ background: 'linear-gradient(135deg,#f0f2ff 0%,#b8bcc8 60%,#f0f2ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Bienvenida, DLP
            </h1>
            <p className="text-[10px] tracking-[0.25em] uppercase mt-0.5" style={{ color: S.silverDim }}>
              Portal de Soporte · Club Sinergetico
            </p>
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(180,185,210,0.08)', color: S.silver, border: '1px solid rgba(180,185,210,0.15)' }}>
              {articles.length} artículos
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(180,185,210,0.08)', color: S.silver, border: '1px solid rgba(180,185,210,0.15)' }}>
              {categories.length} categorías
            </span>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={15} style={{ color: S.silverDim }} />
          <input
            type="text"
            placeholder="Buscar en todos los manuales..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm outline-none transition-all duration-300"
            style={{
              background: S.card, borderRadius: '12px',
              border: `1px solid ${query ? S.borderActive : S.border}`,
              color: '#d4d8e8',
            }}
          />
          {results.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 z-10 overflow-hidden"
              style={{ background: '#0e0e12', border: `1px solid ${S.borderActive}`, borderRadius: '12px', boxShadow: '0 8px 40px rgba(0,0,0,0.8)' }}>
              {results.map((article) => (
                <Link key={article.id} href={`/manual/${article.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 transition-all"
                  style={{ borderBottom: `1px solid ${S.border}` }}
                  onClick={() => { setQuery(''); setResults([]) }}>
                  <BookOpen size={13} style={{ color: S.silver, flexShrink: 0 }} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#d4d8e8' }}>{article.title}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: S.silverDim }}>{article.tags.slice(0, 3).join(' · ')}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Acceso rápido */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Link href="/agenda"
            className="flex items-center gap-2.5 p-2 rounded-xl transition-all duration-200"
            style={{ background: 'linear-gradient(135deg,#1a1a24,#0e0e16)', border: `1px solid ${S.borderActive}` }}>
            <div className="p-1.5 rounded-lg" style={{ background: 'rgba(180,185,210,0.1)' }}>
              <CalendarClock size={16} style={{ color: S.silverBright }} />
            </div>
            <div>
              <p className="font-semibold text-xs" style={{ color: S.silverBright }}>Agenda</p>
              <p className="text-[10px]" style={{ color: S.silverDim }}>Privada, solo tuya</p>
            </div>
          </Link>
          <Link href="/buscar"
            className="flex items-center gap-2.5 p-2 rounded-xl transition-all duration-200"
            style={{ background: S.card, border: `1px solid ${S.border}` }}>
            <div className="p-1.5 rounded-lg" style={{ background: 'rgba(180,185,210,0.05)' }}>
              <Search size={16} style={{ color: S.silver }} />
            </div>
            <div>
              <p className="font-semibold text-xs" style={{ color: S.silver }}>Buscar</p>
              <p className="text-[10px]" style={{ color: S.silverDim }}>Búsqueda avanzada</p>
            </div>
          </Link>
        </div>

        <ContactarCliente />

        {/* Categorías */}
        <div className="flex items-center gap-2 mb-1.5">
          <Zap size={11} style={{ color: S.silver }} />
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: S.silverDim }}>
            Manuales y Categorías
          </h2>
        </div>
        <div className="space-y-1">
          {categories.map((cat) => (
            <div key={cat.id} className="cat-glow">
              <Link href={`/manual?categoria=${cat.slug}`}
                className="cat-glow-inner flex items-center gap-3 p-2 rounded-xl transition-all duration-200"
                style={{ background: S.card }}>
                {cat.slug === 'estructura-organizacional'
                  ? <Image src="/estructura.png" alt={cat.name} width={24} height={24} className="rounded-md object-cover flex-shrink-0" style={{ minWidth: 24 }} />
                  : cat.slug === 'manual-operacion'
                  ? <Image src="/manual.png" alt={cat.name} width={24} height={24} className="rounded-md object-cover flex-shrink-0" style={{ minWidth: 24 }} />
                  : cat.slug === 'procedimientos-politicas'
                  ? <Image src="/procedimientos.png" alt={cat.name} width={24} height={24} className="rounded-md object-cover flex-shrink-0" style={{ minWidth: 24 }} />
                  : cat.slug === 'preguntas-frecuentes'
                  ? <Image src="/preguntas.png" alt={cat.name} width={24} height={24} className="rounded-md object-cover flex-shrink-0" style={{ minWidth: 24 }} />
                  : cat.slug === 'rutas-criticas'
                  ? <Image src="/ruta.png" alt={cat.name} width={24} height={24} className="rounded-md object-cover flex-shrink-0" style={{ minWidth: 24 }} />
                  : <span className="text-lg flex-shrink-0">{cat.icon}</span>
                }
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs" style={{ color: '#d4d8e8' }}>{cat.name}</p>
                  <p className="text-[10px] mt-0.5 truncate" style={{ color: S.silverDim }}>{cat.description}</p>
                </div>
                <ChevronRight size={13} style={{ color: S.silverDim, flexShrink: 0 }} />
              </Link>
            </div>
          ))}
        </div>

        {/* Fechas importantes — contador regresivo */}
        <CountdownBanner />

      </div>

      {/* Team sidebar — derecha */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <TeamSidebar />
      </div>

      {/* Respuestas Rápidas — botón flotante */}
      <QuickResponses />

    </div>
  )
}
