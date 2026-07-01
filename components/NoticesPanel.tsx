'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Plus, Send, AlertCircle } from 'lucide-react'

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

type Notice = {
  id: string
  author: string
  role: string
  message: string
  timestamp: string
  priority: 'normal' | 'urgente'
}

// Simulated team phone numbers for WhatsApp (in real deployment, use Twilio API)
const TEAM_PHONES = [
  { name: 'Mariana Fonseca', phone: '' },
  { name: 'Samuel Otniel', phone: '' },
  { name: 'Jacob Aguayo', phone: '' },
  { name: 'Galilea Enciso', phone: '' },
  { name: 'Moises Ramos', phone: '' },
]

export default function NoticesPanel() {
  const [open, setOpen] = useState(false)
  const [notices, setNotices] = useState<Notice[]>([])
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState<'normal' | 'urgente'>('normal')
  const [unread, setUnread] = useState(0)
  const [lastSeen, setLastSeen] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('notices_v1')
    const seenTime = localStorage.getItem('notices_seen') || ''
    setLastSeen(seenTime)
    if (saved) {
      const list: Notice[] = JSON.parse(saved)
      setNotices(list)
      setUnread(list.filter(n => n.timestamp > seenTime).length)
    }
  }, [])

  function openPanel() {
    setOpen(true)
    const now = new Date().toISOString()
    setLastSeen(now)
    setUnread(0)
    localStorage.setItem('notices_seen', now)
  }

  function publish() {
    if (!message.trim()) return
    const notice: Notice = {
      id: Date.now().toString(),
      author: 'DLP · Deborah Puebla',
      role: 'Directora Soporte',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      priority,
    }
    const updated = [notice, ...notices]
    setNotices(updated)
    localStorage.setItem('notices_v1', JSON.stringify(updated))
    setMessage('')
    setShowForm(false)

    // WhatsApp link (opens WhatsApp Web with the message — user sends manually)
    const waMsg = encodeURIComponent(`🔔 *AVISO DE SOPORTE - ${priority.toUpperCase()}*\n\n${notice.message}\n\n— ${notice.author}`)
    const waUrl = `https://wa.me/?text=${waMsg}`
    // Open WhatsApp in new tab for director to send
    window.open(waUrl, '_blank')
  }

  function deleteNotice(id: string) {
    const updated = notices.filter(n => n.id !== id)
    setNotices(updated)
    localStorage.setItem('notices_v1', JSON.stringify(updated))
  }

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={openPanel}
        className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
        style={{
          color: unread > 0 ? S.silverBright : S.silverDim,
          border: `1px solid ${unread > 0 ? S.borderActive : S.border}`,
          background: unread > 0 ? 'rgba(180,185,210,0.08)' : 'transparent',
        }}
      >
        <Bell size={15} />
        <span className="hidden sm:inline text-xs">Avisos</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
            style={{ background: '#e05050', color: '#fff' }}>
            {unread}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="fixed top-24 right-2 w-80 max-h-[80vh] z-50 rounded-2xl overflow-hidden flex flex-col"
            style={{ background: 'var(--th-inner)', border: `1px solid ${S.borderActive}`, boxShadow: '0 8px 40px rgba(0,0,0,0.8)' }}>

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{ borderBottom: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.04)' }}>
              <Bell size={15} style={{ color: S.silver }} />
              <p className="flex-1 text-sm font-bold tracking-wider" style={{ color: S.silverBright }}>Avisos del Equipo</p>
              <button onClick={() => { setShowForm(!showForm) }}
                className="p-1.5 rounded-lg transition-all"
                style={{ color: S.silver, border: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.05)' }}
                title="Publicar aviso (solo Director)">
                <Plus size={13} />
              </button>
              <button onClick={() => setOpen(false)} style={{ color: S.silverDim }}>
                <X size={15} />
              </button>
            </div>

            {/* Compose form (Director only) */}
            {showForm && (
              <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.03)' }}>
                <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: S.silverDim }}>
                  Nuevo aviso — Solo Director/Líder
                </p>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Escribe el aviso para el equipo..."
                  rows={3}
                  className="w-full text-xs p-2 rounded-lg resize-none outline-none mb-2"
                  style={{ background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }}
                />
                <div className="flex items-center gap-2">
                  <button onClick={() => setPriority('normal')}
                    className="text-[10px] px-2 py-1 rounded-full transition-all"
                    style={priority === 'normal' ? { background: 'rgba(180,185,210,0.15)', color: S.silver, border: `1px solid ${S.borderActive}` } : { color: S.silverDim, border: `1px solid ${S.border}` }}>
                    Normal
                  </button>
                  <button onClick={() => setPriority('urgente')}
                    className="text-[10px] px-2 py-1 rounded-full transition-all"
                    style={priority === 'urgente' ? { background: 'rgba(220,80,80,0.15)', color: '#f08080', border: '1px solid rgba(220,80,80,0.3)' } : { color: S.silverDim, border: `1px solid ${S.border}` }}>
                    Urgente
                  </button>
                  <button onClick={publish}
                    className="ml-auto flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-xl transition-all"
                    style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: `1px solid ${S.borderActive}` }}>
                    <Send size={11} /> Publicar + WhatsApp
                  </button>
                </div>
                <p className="text-[9px] mt-2" style={{ color: S.silverDim }}>
                  Al publicar, se abre WhatsApp para enviar el aviso al equipo.
                </p>
              </div>
            )}

            {/* Notices list */}
            <div className="flex-1 overflow-y-auto">
              {notices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12" style={{ color: S.silverDim }}>
                  <Bell size={32} style={{ opacity: 0.2, marginBottom: '8px' }} />
                  <p className="text-xs">Sin avisos</p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {notices.map(notice => (
                    <div key={notice.id} className="rounded-xl p-3 relative"
                      style={{
                        background: notice.priority === 'urgente' ? 'rgba(220,80,80,0.06)' : 'rgba(180,185,210,0.04)',
                        border: `1px solid ${notice.priority === 'urgente' ? 'rgba(220,80,80,0.2)' : S.border}`,
                      }}>
                      <div className="flex items-start gap-2">
                        {notice.priority === 'urgente' && <AlertCircle size={13} style={{ color: '#e07070', flexShrink: 0, marginTop: '2px' }} />}
                        <div className="flex-1">
                          <p className="text-xs leading-relaxed" style={{ color: S.silverBright }}>{notice.message}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px]" style={{ color: S.silverDim }}>{notice.author}</span>
                            <span className="text-[10px]" style={{ color: S.silverDim }}>·</span>
                            <span className="text-[10px]" style={{ color: S.silverDim }}>
                              {new Date(notice.timestamp).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <button onClick={() => deleteNotice(notice.id)} style={{ color: S.silverDim }} className="flex-shrink-0">
                          <X size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
