'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, BookOpen, Tag, Zap } from 'lucide-react'
import { articles, categories } from '@/lib/data'
import Fuse from 'fuse.js'

const S = {
  bg: '#060608', card: '#0e0e12', border: '#1e1e28',
  borderActive: 'rgba(180,185,210,0.22)', silver: '#b8bcc8',
  silverBright: '#d4d8e8', silverDim: '#3a3e4a',
}

export default function BuscarPage() {
  const [query, setQuery] = useState('')
  const fuse = new Fuse(articles, {
    keys: [
      { name: 'title', weight: 2 },
      { name: 'tags', weight: 1.5 },
      { name: 'content', weight: 1 },
    ],
    threshold: 0.5,
    ignoreLocation: true,
    minMatchCharLength: 2,
  })
  const results = query.trim().length > 1 ? fuse.search(query).map((r) => r.item) : []

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Zap size={14} style={{ color: S.silver }} />
          <h1 className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: S.silverDim }}>Búsqueda</h1>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: S.silverDim }} />
          <input
            type="text"
            placeholder="Escribe una palabra para buscar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-12 pr-4 py-4 text-base outline-none transition-all duration-300"
            style={{
              background: S.card, borderRadius: '14px',
              border: `1px solid ${query ? S.borderActive : S.border}`,
              color: S.silverBright,
              boxShadow: query ? '0 0 20px rgba(180,185,210,0.08)' : 'none',
            }}
          />
        </div>

        {query.trim().length > 1 && (
          <p className="text-xs mb-4 tracking-wider" style={{ color: S.silverDim }}>
            {results.length} resultado{results.length !== 1 ? 's' : ''} para &ldquo;{query}&rdquo;
          </p>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((article) => {
              const category = categories.find((c) => c.id === article.category_id)
              return (
                <Link key={article.id} href={`/manual/${article.id}`}
                  className="block p-4 rounded-2xl transition-all duration-200"
                  style={{ background: S.card, border: `1px solid ${S.border}` }}>
                  <div className="flex items-start gap-3">
                    <BookOpen size={16} style={{ color: S.silver, marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <p className="font-semibold text-sm" style={{ color: S.silverBright }}>{article.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>{category?.icon} {category?.name}</p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {article.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(180,185,210,0.06)', color: S.silverDim, border: `1px solid ${S.border}` }}>
                            <Tag size={8} />{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {query.trim().length > 1 && results.length === 0 && (
          <div className="text-center py-12" style={{ color: S.silverDim }}>
            <p className="text-lg mb-1">Sin resultados</p>
            <p className="text-sm">Intenta con otra palabra clave</p>
          </div>
        )}

        {query.trim().length <= 1 && (
          <div className="text-center py-16" style={{ color: S.silverDim }}>
            <Search size={48} className="mx-auto mb-3" style={{ opacity: 0.2 }} />
            <p className="text-base">Escribe para comenzar a buscar</p>
          </div>
        )}
      </div>
    </div>
  )
}
