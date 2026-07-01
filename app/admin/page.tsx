'use client'

import Link from 'next/link'
import { Settings, FileText, ChevronRight, Zap, CalendarCheck, AlertTriangle, Users } from 'lucide-react'
import { categories, articles } from '@/lib/data'

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

export default function AdminPage() {
  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl" style={{ background: 'rgba(180,185,210,0.08)', border: `1px solid ${S.border}` }}>
            <Settings size={18} style={{ color: S.silver }} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-[0.2em] uppercase" style={{ color: S.silverBright }}>Panel de Administración</h1>
            <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>Gestiona el contenido del portal</p>
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-3 mb-6">
          <Link href="/admin/asistencia"
            className="flex items-center gap-3 p-4 rounded-2xl transition-all"
            style={{ background: 'rgba(100,200,120,0.06)', border: '1px solid rgba(100,200,120,0.2)' }}>
            <CalendarCheck size={20} style={{ color: '#70c080' }} />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#70c080' }}>Registro de Asistencia</p>
              <p className="text-xs" style={{ color: S.silverDim }}>Calendario, estadísticas y desempeño del equipo</p>
            </div>
            <ChevronRight size={16} style={{ color: '#70c080' }} />
          </Link>

          <Link href="/admin/incidencias"
            className="flex items-center gap-3 p-4 rounded-2xl transition-all"
            style={{ background: 'rgba(220,70,70,0.06)', border: '1px solid rgba(220,70,70,0.2)' }}>
            <AlertTriangle size={20} style={{ color: '#dc4646' }} />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#dc4646' }}>Incidencias del Equipo</p>
              <p className="text-xs" style={{ color: S.silverDim }}>Registra y gestiona actas de faltas al reglamento</p>
            </div>
            <ChevronRight size={16} style={{ color: '#dc4646' }} />
          </Link>

          <Link href="/admin/perfiles"
            className="flex items-center gap-3 p-4 rounded-2xl transition-all"
            style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)' }}>
            <Users size={20} style={{ color: '#a78bfa' }} />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#a78bfa' }}>Perfiles del Equipo</p>
              <p className="text-xs" style={{ color: S.silverDim }}>Datos personales, contacto de emergencia y salud</p>
            </div>
            <ChevronRight size={16} style={{ color: '#a78bfa' }} />
          </Link>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="p-4 rounded-2xl" style={{ background: S.card, border: `1px solid ${S.borderActive}` }}>
            <p className="text-3xl font-bold" style={{ color: S.silverBright }}>{articles.length}</p>
            <p className="text-xs mt-1" style={{ color: S.silverDim }}>Artículos totales</p>
          </div>
          <div className="p-4 rounded-2xl" style={{ background: S.card, border: `1px solid ${S.border}` }}>
            <p className="text-3xl font-bold" style={{ color: S.silver }}>{categories.length}</p>
            <p className="text-xs mt-1" style={{ color: S.silverDim }}>Categorías</p>
          </div>
        </div>

        {/* Categorías */}
        <div className="flex items-center gap-2 mb-4">
          <Zap size={12} style={{ color: S.silver }} />
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: S.silverDim }}>Contenido por categoría</h2>
        </div>

        <div className="space-y-3">
          {categories.map((cat) => {
            const catArticles = articles.filter((a) => a.category_id === cat.id)
            return (
              <div key={cat.id} className="rounded-2xl overflow-hidden" style={{ background: S.card, border: `1px solid ${S.border}` }}>
                <div className="flex items-center gap-3 px-4 py-3"
                  style={{ background: 'rgba(180,185,210,0.04)', borderBottom: `1px solid ${S.border}` }}>
                  <span className="text-lg">{cat.icon}</span>
                  <p className="font-semibold text-sm flex-1" style={{ color: S.silverBright }}>{cat.name}</p>
                  <span className="text-xs" style={{ color: S.silverDim }}>{catArticles.length} artículo{catArticles.length !== 1 ? 's' : ''}</span>
                </div>
                {catArticles.length > 0 ? (
                  <div>
                    {catArticles.map((article) => (
                      <div key={article.id} className="flex items-center gap-3 px-4 py-2.5 transition-all"
                        style={{ borderBottom: `1px solid ${S.border}` }}>
                        <FileText size={13} style={{ color: S.silverDim, flexShrink: 0 }} />
                        <p className="flex-1 text-xs" style={{ color: '#7a8090' }}>{article.title}</p>
                        <Link href={`/manual/${article.id}`}
                          className="text-xs transition-colors" style={{ color: S.silver }}>
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-4 text-xs text-center" style={{ color: S.silverDim }}>
                    Sin artículos en esta categoría
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-8 p-4 rounded-2xl text-sm"
          style={{ background: 'rgba(180,185,210,0.04)', border: `1px solid rgba(180,185,210,0.1)` }}>
          <p className="font-semibold text-xs tracking-widest uppercase mb-1" style={{ color: S.silver }}>Próximamente</p>
          <p className="text-xs" style={{ color: S.silverDim }}>El editor completo para crear y editar artículos estará disponible en la siguiente versión.</p>
        </div>
      </div>
    </div>
  )
}
