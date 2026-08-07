'use client'

import { useState } from 'react'
import { Bell, X, Plus, Send, AlertCircle, CheckCircle2, ClipboardList, Lock } from 'lucide-react'
import { useFirestoreCollection } from '@/lib/firestoreCollection'
import { useAuth } from './LoginGate'

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

export type AvisoEquipo = {
  id: string
  author: string
  role: string
  message: string
  timestamp: string
  priority: 'normal' | 'urgente'
  type?: 'normal' | 'hojas_listas' | 'tarea_asignada'
  eventoNombre?: string
  // Si viene lleno, el aviso es privado — solo lo ve esa persona (y el admin, para dar seguimiento)
  targetMemberId?: string
  targetMemberName?: string
}

export default function NoticesPanel() {
  const { member } = useAuth()
  const { data: notices, add, remove } = useFirestoreCollection<AvisoEquipo>(
    'avisos_equipo',
    { orderByField: 'timestamp' }
  )
  // Avisos públicos para todos, más los dirigidos a mí — el admin ve todo, para dar seguimiento
  const visibles = notices.filter(n => !n.targetMemberId || n.targetMemberId === member?.id || member?.isAdmin)
  // mostrar más recientes primero
  const sorted = [...visibles].sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  const [open, setOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState<'normal' | 'urgente'>('normal')
  const [lastSeen, setLastSeen] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('notices_seen_v2') || '' : ''
  )

  const unread = sorted.filter(n => n.timestamp > lastSeen).length

  function openPanel() {
    setOpen(true)
    const now = new Date().toISOString()
    setLastSeen(now)
    localStorage.setItem('notices_seen_v2', now)
  }

  async function publish() {
    if (!message.trim() || !member) return
    await add({
      author: member.name,
      role: member.role,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      priority,
      type: 'normal',
    })
    setMessage('')
    setShowForm(false)
    const waMsg = encodeURIComponent(`🔔 *AVISO DE SOPORTE - ${priority.toUpperCase()}*\n\n${message.trim()}\n\n— ${member.name}`)
    window.open(`https://wa.me/?text=${waMsg}`, '_blank')
  }

  return (
    <div className="relative">
      {/* Bell button */}
      <button onClick={openPanel}
        className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
        style={{
          color: unread > 0 ? S.silverBright : S.silverDim,
          border: `1px solid ${unread > 0 ? S.borderActive : S.border}`,
          background: unread > 0 ? 'rgba(180,185,210,0.08)' : 'transparent',
        }}>
        <Bell size={15} />
        <span className="hidden sm:inline text-xs">Avisos</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
            style={{ background: '#e05050', color: '#fff' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="fixed top-24 right-2 w-80 max-h-[80vh] z-50 rounded-2xl overflow-hidden flex flex-col"
            style={{ background: 'var(--th-inner)', border: `1px solid ${S.borderActive}`, boxShadow: '0 8px 40px rgba(0,0,0,0.8)' }}>

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{ borderBottom: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.04)' }}>
              <Bell size={15} style={{ color: S.silver }} />
              <p className="flex-1 text-sm font-bold tracking-wider" style={{ color: S.silverBright }}>Avisos del Equipo</p>
              {member?.isAdmin && (
                <button onClick={() => setShowForm(!showForm)}
                  className="p-1.5 rounded-lg transition-all"
                  style={{ color: S.silver, border: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.05)' }}>
                  <Plus size={13} />
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{ color: S.silverDim }}>
                <X size={15} />
              </button>
            </div>

            {/* Compose form — solo admin */}
            {showForm && member?.isAdmin && (
              <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.03)' }}>
                <textarea value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Escribe el aviso para el equipo..." rows={3}
                  className="w-full text-xs p-2 rounded-lg resize-none outline-none mb-2"
                  style={{ background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }} />
                <div className="flex items-center gap-2">
                  {(['normal', 'urgente'] as const).map(p => (
                    <button key={p} onClick={() => setPriority(p)}
                      className="text-[10px] px-2 py-1 rounded-full transition-all"
                      style={priority === p
                        ? p === 'urgente'
                          ? { background: 'rgba(220,80,80,0.15)', color: '#f08080', border: '1px solid rgba(220,80,80,0.3)' }
                          : { background: 'rgba(180,185,210,0.15)', color: S.silver, border: `1px solid ${S.borderActive}` }
                        : { color: S.silverDim, border: `1px solid ${S.border}` }}>
                      {p === 'urgente' ? 'Urgente' : 'Normal'}
                    </button>
                  ))}
                  <button onClick={publish}
                    className="ml-auto flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-xl"
                    style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: `1px solid ${S.borderActive}` }}>
                    <Send size={11} /> Publicar
                  </button>
                </div>
              </div>
            )}

            {/* Notices list */}
            <div className="flex-1 overflow-y-auto">
              {sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12" style={{ color: S.silverDim }}>
                  <Bell size={32} style={{ opacity: 0.2, marginBottom: '8px' }} />
                  <p className="text-xs">Sin avisos</p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {sorted.map(notice => {
                    const isHojas = notice.type === 'hojas_listas'
                    const isTarea = notice.type === 'tarea_asignada'
                    return (
                      <div key={notice.id} className="rounded-xl p-3 relative"
                        style={{
                          background: isHojas
                            ? 'rgba(220,170,60,0.08)'
                            : isTarea
                            ? 'rgba(106,173,220,0.06)'
                            : notice.priority === 'urgente'
                            ? 'rgba(220,80,80,0.06)'
                            : 'rgba(180,185,210,0.04)',
                          border: `1px solid ${isHojas ? 'rgba(220,170,60,0.35)' : isTarea ? 'rgba(106,173,220,0.3)' : notice.priority === 'urgente' ? 'rgba(220,80,80,0.2)' : S.border}`,
                        }}>
                        <div className="flex items-start gap-2">
                          {isHojas
                            ? <CheckCircle2 size={13} style={{ color: '#dcaa3c', flexShrink: 0, marginTop: '2px' }} />
                            : isTarea
                            ? <ClipboardList size={13} style={{ color: '#6aaddc', flexShrink: 0, marginTop: '2px' }} />
                            : notice.priority === 'urgente'
                            ? <AlertCircle size={13} style={{ color: '#e07070', flexShrink: 0, marginTop: '2px' }} />
                            : null}
                          <div className="flex-1">
                            {notice.targetMemberId && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full mb-1"
                                style={{ background: 'rgba(180,185,210,0.1)', color: S.silver, border: `1px solid ${S.border}` }}>
                                <Lock size={8} /> Para: {notice.targetMemberName || 'una persona'}
                              </span>
                            )}
                            <p className="text-xs leading-relaxed" style={{ color: S.silverBright }}>{notice.message}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px]" style={{ color: S.silverDim }}>{notice.author.split(' · ').pop()}</span>
                              <span className="text-[10px]" style={{ color: S.silverDim }}>·</span>
                              <span className="text-[10px]" style={{ color: S.silverDim }}>
                                {new Date(notice.timestamp).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          {member?.isAdmin && (
                            <button onClick={() => remove(notice.id)} style={{ color: S.silverDim }} className="flex-shrink-0">
                              <X size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
