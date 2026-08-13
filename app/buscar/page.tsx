'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Search, BookOpen, Tag, Zap, FileCheck, Banknote, AlertCircle,
  MessageCircle, Users, ClipboardList, MapPin, CalendarDays,
  FileSpreadsheet, Video, ExternalLink,
} from 'lucide-react'
import { articles, categories } from '@/lib/data'
import { documentos, CATEGORIA_LABELS } from '@/lib/acuerdos'
import { useAuth } from '@/components/LoginGate'
import { useFirestoreCollection } from '@/lib/firestoreCollection'
import { getMembers, TeamMember, Guardia, GiraEvento } from '@/lib/teamStore'
import Fuse from 'fuse.js'

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

/* ─── Tipos de datos externos usados aquí ────────────────────────────────── */
type Reembolso = {
  id: string; evento: string; plataforma: string; correo: string; nombre?: string
  telefono?: string; producto: string; numeroTarjeta: string; numeroOperacion: string; notas: string
}
type Caso = {
  id: string; nombre: string; correo?: string; telefono?: string; vendedor: string
  notas: string; resolucion: string
}
type ContactoCliente = {
  id: string; clienteNombre: string; telefono?: string; lada?: string; resolucion?: string
}
type TareaDia = { id: string; personaNombre: string; tarea: string; fecha: string }
type SheetLink = { id: string; nombre: string; url: string }
type Tutorial = { id: string; nombre: string; url: string }

/* ─── Ítem unificado de búsqueda ─────────────────────────────────────────── */
type Item = {
  id: string
  categoria: string
  icono: React.ReactNode
  titulo: string
  subtitulo?: string
  detalle?: string
  numeros?: string
  href?: string
  externo?: boolean
}

export default function BuscarPage() {
  const { member } = useAuth()
  const isAdmin = !!member?.isAdmin

  const [query, setQuery] = useState('')
  const [equipo, setEquipo] = useState<TeamMember[]>([])

  useEffect(() => { getMembers().then(setEquipo) }, [])

  const { data: reembolsos } = useFirestoreCollection<Reembolso>('reembolsos')
  const { data: casos } = useFirestoreCollection<Caso>('incidencias')
  const { data: contactos } = useFirestoreCollection<ContactoCliente>('contactos_cliente')
  const { data: tareas } = useFirestoreCollection<TareaDia>('tareas_dia')
  const { data: giras } = useFirestoreCollection<GiraEvento>('giras_eventos')
  const { data: guardias } = useFirestoreCollection<Guardia>('guardias')
  const { data: sheets } = useFirestoreCollection<SheetLink>('sheets_links')
  const { data: tutoriales } = useFirestoreCollection<Tutorial>('tutoriales_links')

  const items = useMemo<Item[]>(() => {
    const list: Item[] = []

    for (const a of articles) {
      const category = categories.find(c => c.id === a.category_id)
      list.push({
        id: `manual-${a.id}`, categoria: 'Manual', icono: <BookOpen size={14} />,
        titulo: a.title, subtitulo: category?.name, detalle: [a.content, ...a.tags].join(' '),
        href: `/manual/${a.id}`,
      })
    }

    for (const d of documentos) {
      list.push({
        id: `acuerdo-${d.id}`, categoria: 'Acuerdos', icono: <FileCheck size={14} />,
        titulo: d.titulo, subtitulo: `${CATEGORIA_LABELS[d.categoria]} · ${d.subtitulo}`,
        detalle: d.descripcion, href: '/acuerdos',
      })
    }

    for (const r of reembolsos) {
      list.push({
        id: `reembolso-${r.id}`, categoria: 'Reembolsos', icono: <Banknote size={14} />,
        titulo: r.nombre || r.correo, subtitulo: `${r.producto} · ${r.plataforma} · ${r.evento}`,
        detalle: r.notas, numeros: [r.telefono, r.numeroTarjeta, r.numeroOperacion].filter(Boolean).join(' '),
        href: '/reembolsos',
      })
    }

    for (const c of casos) {
      list.push({
        id: `caso-${c.id}`, categoria: 'Incidencias', icono: <AlertCircle size={14} />,
        titulo: c.nombre, subtitulo: `Atendido por ${c.vendedor}`,
        detalle: [c.notas, c.resolucion].filter(Boolean).join(' · '),
        numeros: [c.telefono, c.correo].filter(Boolean).join(' '),
        href: '/incidencias',
      })
    }

    for (const c of contactos) {
      list.push({
        id: `contacto-${c.id}`, categoria: 'Contactos Cliente', icono: <MessageCircle size={14} />,
        titulo: c.clienteNombre, subtitulo: c.resolucion,
        numeros: [c.lada, c.telefono].filter(Boolean).join(' '),
        href: '/incidencias',
      })
    }

    for (const t of tareas) {
      list.push({
        id: `tarea-${t.id}`, categoria: 'Tareas del Día', icono: <ClipboardList size={14} />,
        titulo: t.tarea, subtitulo: `${t.personaNombre} · ${t.fecha}`,
        href: '/tareas-dia',
      })
    }

    for (const g of giras) {
      list.push({
        id: `gira-${g.id}`, categoria: 'Giras', icono: <MapPin size={14} />,
        titulo: g.nombre, subtitulo: [g.fecha, g.lugar].filter(Boolean).join(' · '),
        href: '/giras',
      })
    }

    for (const g of guardias) {
      const nombres = g.memberIds.map(id => {
        const m = equipo.find(x => x.id === id)
        return m ? (m.name.includes(' · ') ? m.name.split(' · ').pop()! : m.name) : null
      }).filter(Boolean).join(', ')
      if (nombres || g.nota) {
        list.push({
          id: `guardia-${g.id}`, categoria: 'Guardias', icono: <CalendarDays size={14} />,
          titulo: `Guardia ${g.fecha}`, subtitulo: nombres, detalle: g.nota,
          href: '/guardias',
        })
      }
    }

    for (const s of sheets) {
      list.push({
        id: `sheet-${s.id}`, categoria: 'Sheets', icono: <FileSpreadsheet size={14} />,
        titulo: s.nombre, subtitulo: 'Google Sheet', href: s.url, externo: true,
      })
    }

    for (const t of tutoriales) {
      list.push({
        id: `tutorial-${t.id}`, categoria: 'Tutoriales', icono: <Video size={14} />,
        titulo: t.nombre, subtitulo: 'Video tutorial', href: t.url, externo: true,
      })
    }

    // Equipo: nombre/rol son visibles para todos (igual que en la barra lateral).
    // El teléfono es información privada — solo se indexa y muestra si quien
    // busca es administrador, igual que en /admin/perfiles.
    for (const m of equipo) {
      const nombre = m.name.includes(' · ') ? m.name.split(' · ').pop()! : m.name
      list.push({
        id: `equipo-${m.id}`, categoria: 'Equipo', icono: <Users size={14} />,
        titulo: nombre, subtitulo: m.role,
        numeros: isAdmin ? [m.telefonoPersonal, m.telefonoTrabajo].filter(Boolean).join(' ') : undefined,
        detalle: isAdmin ? m.email : undefined,
        href: isAdmin ? '/admin/perfiles' : undefined,
      })
    }

    return list
  }, [reembolsos, casos, contactos, tareas, giras, guardias, sheets, tutoriales, equipo, isAdmin])

  const fuse = useMemo(() => new Fuse(items, {
    keys: [
      { name: 'titulo', weight: 2 },
      { name: 'numeros', weight: 2 },
      { name: 'subtitulo', weight: 1.3 },
      { name: 'detalle', weight: 1 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 2,
  }), [items])

  const results = query.trim().length > 1 ? fuse.search(query).map(r => r.item) : []

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
            placeholder="Busca un nombre, teléfono, número, palabra..."
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
            {results.map((item) => {
              const cardClass = "block p-4 rounded-2xl transition-all duration-200"
              const cardStyle = { background: S.card, border: `1px solid ${S.border}` }
              const content = (
                <div className="flex items-start gap-3">
                  <span style={{ color: S.silver, marginTop: '2px', flexShrink: 0 }}>{item.icono}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(180,185,210,0.08)', color: S.silverDim, border: `1px solid ${S.border}` }}>
                        <Tag size={8} />{item.categoria}
                      </span>
                      {item.externo && <ExternalLink size={11} style={{ color: S.silverDim }} />}
                    </div>
                    <p className="font-semibold text-sm mt-1.5 truncate" style={{ color: S.silverBright }}>{item.titulo}</p>
                    {item.subtitulo && (
                      <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>{item.subtitulo}</p>
                    )}
                    {item.numeros && (
                      <p className="text-xs mt-0.5 font-mono" style={{ color: S.silver }}>{item.numeros}</p>
                    )}
                    {item.detalle && (
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: S.silverDim }}>{item.detalle}</p>
                    )}
                  </div>
                </div>
              )

              if (!item.href) {
                return <div key={item.id} className={cardClass} style={cardStyle}>{content}</div>
              }
              if (item.externo) {
                return (
                  <a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer"
                    className={cardClass} style={cardStyle}>
                    {content}
                  </a>
                )
              }
              return (
                <Link key={item.id} href={item.href} className={cardClass} style={cardStyle}>
                  {content}
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
            <p className="text-xs mt-2" style={{ opacity: 0.7 }}>
              Busca en manuales, acuerdos, reembolsos, incidencias, contactos,<br />
              tareas, giras, guardias, sheets, tutoriales y equipo
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
