'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/components/LoginGate'
import { getMembers, TeamMember } from '@/lib/teamStore'
import { useFirestoreCollection } from '@/lib/firestoreCollection'
import {
  MessageCircle, Plus, Users, User, Send, ArrowLeft, X, ChevronDown, Smile,
} from 'lucide-react'

const S = {
  bg:          '#060608',
  panel:       '#08080e',
  card:        '#0c0c14',
  cardHover:   '#10101c',
  border:      '#1a1a28',
  borderLight: 'rgba(180,185,210,0.14)',
  silver:      '#b8bcc8',
  silverBright:'#d4d8e8',
  silverDim:   '#3a3e4a',
  myMsg:       'rgba(180,185,210,0.11)',
  otherMsg:    '#0e0e1a',
}

/* ─── Types ─────────────────────────────────────────────────────────────── */
type Conversation = {
  id: string
  type: 'individual' | 'group'
  name: string | null
  participantIds: string[]
  createdBy: string
  createdAt: string
  lastMessage: string | null
  lastMessageAt: string | null
}

type Message = {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  content: string
  createdAt: string
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function convLabel(conv: Conversation, myId: string, members: TeamMember[]): string {
  if (conv.type === 'group') return conv.name || 'Grupo'
  const other = members.find(m => m.id !== myId && conv.participantIds.includes(m.id))
  return other ? (other.name.split(' · ').pop() ?? other.name) : 'Usuario'
}

function convInitial(conv: Conversation, myId: string, members: TeamMember[]): string {
  if (conv.type === 'group') return '#'
  const other = members.find(m => m.id !== myId && conv.participantIds.includes(m.id))
  return other?.initial ?? '?'
}

function convSubtitle(conv: Conversation, myId: string, members: TeamMember[]): string {
  if (conv.type === 'group') {
    return conv.participantIds
      .map(id => {
        const m = members.find(x => x.id === id)
        return m ? (m.name.split(' · ').pop()?.split(' ')[0] ?? m.name) : id
      })
      .join(', ')
  }
  const other = members.find(m => m.id !== myId && conv.participantIds.includes(m.id))
  return other?.role ?? ''
}

function fmtTime(iso: string): string {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  if (diff < 60_000) return 'ahora'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`
  if (diff < 86_400_000) return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

function fmtHour(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Hoy'
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer'
  return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
}

/* ─── Selector de emojis ─────────────────────────────────────────────────── */
const EMOJIS = [
  '😀','😂','🤣','😅','😊','😍','😘','😜','🤔','😐','🙄','😢','😭','😡','😱','🥳',
  '😴','🤗','🤝','👍','👎','👏','🙏','💪','✌️','👌','🤞','👋','❤️','💔','💛','💚',
  '💙','💜','🧡','🖤','💯','🔥','⭐','✅','❌','⚠️','🎉','📌','📅','⏰','💰','📞',
]

function EmojiPicker({ onPick, onClose }: { onPick: (emoji: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [onClose])

  return (
    <div ref={ref} className="absolute bottom-full mb-2 left-0 rounded-2xl overflow-hidden z-20"
      style={{ background: '#0c0c14', border: `1px solid ${S.borderLight}`, boxShadow: '0 8px 40px rgba(0,0,0,0.7)' }}>
      <div className="grid grid-cols-8 gap-1 p-3" style={{ maxWidth: '280px' }}>
        {EMOJIS.map(e => (
          <button key={e} onClick={() => onPick(e)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-all"
            style={{ background: 'transparent' }}
            onMouseEnter={ev => (ev.currentTarget.style.background = 'rgba(180,185,210,0.1)')}
            onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}>
            {e}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── New Conversation Modal ─────────────────────────────────────────────── */
function NewConvModal({
  myId, members, existing, onClose, onCreate, addConv,
}: {
  myId: string
  members: TeamMember[]
  existing: Conversation[]
  onClose: () => void
  onCreate: (conv: Conversation) => void
  addConv: (item: Omit<Conversation, 'id'>) => Promise<string>
}) {
  const [tipo, setTipo] = useState<'individual' | 'group'>('individual')
  const [selected, setSelected] = useState<string[]>([])
  const [groupName, setGroupName] = useState('')
  const [loading, setLoading] = useState(false)

  const others = members.filter(m => m.id !== myId)

  function toggle(id: string) {
    setSelected(prev =>
      tipo === 'individual'
        ? [id]
        : prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  async function create() {
    if (selected.length === 0) return
    setLoading(true)
    const participantIds = [myId, ...selected]

    if (tipo === 'individual') {
      const dup = existing.find(c =>
        c.type === 'individual' &&
        c.participantIds.length === 2 &&
        participantIds.every(id => c.participantIds.includes(id))
      )
      if (dup) {
        onCreate(dup)
        setLoading(false)
        onClose()
        return
      }
    }

    const item: Omit<Conversation, 'id'> = {
      type: tipo,
      name: tipo === 'group' ? (groupName.trim() || null) : null,
      participantIds,
      createdBy: myId,
      createdAt: new Date().toISOString(),
      lastMessage: null,
      lastMessageAt: null,
    }
    const id = await addConv(item)
    onCreate({ ...item, id })
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
      <div className="w-80 mx-4 rounded-2xl overflow-hidden"
        style={{ background: '#080812', border: `1px solid ${S.borderLight}`, boxShadow: '0 0 60px rgba(0,0,0,0.9)' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: `1px solid ${S.border}` }}>
          <Plus size={15} style={{ color: S.silver }} />
          <p className="flex-1 text-sm font-bold" style={{ color: S.silverBright }}>Nueva conversación</p>
          <button onClick={onClose} style={{ color: S.silverDim }}><X size={16} /></button>
        </div>

        {/* Type toggle */}
        <div className="flex gap-2 px-5 pt-4">
          {(['individual', 'group'] as const).map(t => (
            <button key={t} onClick={() => { setTipo(t); setSelected([]) }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
              style={tipo === t
                ? { background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: `1px solid rgba(180,185,210,0.22)` }
                : { background: 'transparent', color: S.silverDim, border: `1px solid ${S.border}` }}>
              {t === 'individual' ? <User size={12} /> : <Users size={12} />}
              {t === 'individual' ? 'Individual' : 'Grupo'}
            </button>
          ))}
        </div>

        {/* Group name */}
        {tipo === 'group' && (
          <div className="px-5 pt-4">
            <input
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="Nombre del grupo (opcional)"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
              style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }}
            />
          </div>
        )}

        {/* Member list */}
        <div className="px-5 py-3 max-h-56 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: S.silverDim }}>
            {tipo === 'individual' ? 'Selecciona un miembro' : 'Selecciona miembros'}
          </p>
          <div className="space-y-1">
            {others.map(m => {
              const active = selected.includes(m.id)
              return (
                <button key={m.id} onClick={() => toggle(m.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                  style={{
                    background: active ? 'rgba(180,185,210,0.1)' : 'transparent',
                    border: `1px solid ${active ? 'rgba(180,185,210,0.22)' : 'transparent'}`,
                  }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: 'rgba(180,185,210,0.1)', color: S.silver }}>
                    {m.initial}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: active ? S.silverBright : S.silver }}>
                      {m.name.split(' · ').pop()}
                    </p>
                    <p className="text-[10px] truncate" style={{ color: S.silverDim }}>{m.role}</p>
                  </div>
                  {active && (
                    <div className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ background: 'rgba(180,185,210,0.3)' }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Create button */}
        <div className="px-5 pb-5">
          <button onClick={create} disabled={selected.length === 0 || loading}
            className="w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
            style={{
              background: selected.length > 0 ? 'rgba(180,185,210,0.12)' : 'rgba(180,185,210,0.04)',
              color: selected.length > 0 ? S.silverBright : S.silverDim,
              border: `1px solid ${selected.length > 0 ? 'rgba(180,185,210,0.25)' : S.border}`,
            }}>
            {loading ? 'Creando...' : tipo === 'group' ? <><Users size={14} /> Crear grupo</> : <><MessageCircle size={14} /> Iniciar chat</>}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Conversation list item ─────────────────────────────────────────────── */
function ConvItem({
  conv, myId, members, active, onClick,
}: {
  conv: Conversation
  myId: string
  members: TeamMember[]
  active: boolean
  onClick: () => void
}) {
  const label    = convLabel(conv, myId, members)
  const initial  = convInitial(conv, myId, members)
  const subtitle = convSubtitle(conv, myId, members)

  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 transition-all"
      style={{
        background: active ? S.card : 'transparent',
        borderLeft: `2px solid ${active ? S.silver : 'transparent'}`,
      }}>
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
        style={{ background: conv.type === 'group' ? 'rgba(100,160,220,0.15)' : 'rgba(180,185,210,0.1)',
                 color: conv.type === 'group' ? '#6aaddc' : S.silver }}>
        {conv.type === 'group' ? <Users size={16} /> : initial}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold truncate"
            style={{ color: active ? S.silverBright : S.silver }}>
            {label}
          </p>
          {conv.lastMessageAt && (
            <span className="text-[10px] flex-shrink-0" style={{ color: S.silverDim }}>
              {fmtTime(conv.lastMessageAt)}
            </span>
          )}
        </div>
        <p className="text-[11px] truncate mt-0.5"
          style={{ color: conv.lastMessage ? '#5a5e6a' : S.silverDim }}>
          {conv.lastMessage ?? subtitle}
        </p>
      </div>
    </button>
  )
}

/* ─── Message bubble ─────────────────────────────────────────────────────── */
function MsgBubble({
  msg, isMine, showName, showTime, isGroup,
}: {
  msg: Message
  isMine: boolean
  showName: boolean
  showTime: boolean
  isGroup: boolean
}) {
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
      <div style={{ maxWidth: '72%' }}>
        {showName && !isMine && isGroup && (
          <p className="text-[10px] mb-1 px-1" style={{ color: S.silverDim }}>
            {msg.senderName.split(' · ').pop()}
          </p>
        )}
        <div className="px-3.5 py-2 rounded-2xl"
          style={{
            background: isMine ? S.myMsg : S.otherMsg,
            border: `1px solid ${isMine ? 'rgba(180,185,210,0.18)' : S.border}`,
            borderBottomRightRadius: isMine ? '4px' : '16px',
            borderBottomLeftRadius:  isMine ? '16px' : '4px',
          }}>
          <p className="text-sm leading-relaxed" style={{ color: S.silverBright, wordBreak: 'break-word' }}>
            {msg.content}
          </p>
        </div>
        {showTime && (
          <p className={`text-[10px] mt-1 px-1 ${isMine ? 'text-right' : 'text-left'}`}
            style={{ color: S.silverDim }}>
            {fmtHour(msg.createdAt)}
          </p>
        )}
      </div>
    </div>
  )
}

/* ─── Chat area ──────────────────────────────────────────────────────────── */
function ChatArea({
  conv, myId, members, onBack, updateConv,
}: {
  conv: Conversation
  myId: string
  members: TeamMember[]
  onBack: () => void
  updateConv: (id: string, item: Partial<Conversation>) => Promise<void>
}) {
  const { data: rawMessages, add: addMessage } = useFirestoreCollection<Message>(
    'chat_mensajes',
    { where: ['conversationId', '==', conv.id] },
  )
  const messages = [...rawMessages].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { member } = useAuth()

  function pickEmoji(emoji: string) {
    setInput(prev => prev + emoji)
    inputRef.current?.focus()
  }

  const label   = convLabel(conv, myId, members)
  const isGroup = conv.type === 'group'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    if (!input.trim() || sending || !member) return
    setSending(true)
    const content = input.trim()
    setInput('')
    const createdAt = new Date().toISOString()

    await addMessage({
      conversationId: conv.id,
      senderId: myId,
      senderName: member.name,
      content,
      createdAt,
    })
    await updateConv(conv.id, { lastMessage: content, lastMessageAt: createdAt })

    setSending(false)
    inputRef.current?.focus()
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  // Group messages by date + consecutive sender
  let lastDate = ''
  let lastSender = ''

  return (
    <div className="flex flex-col h-full" style={{ background: S.bg }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: `1px solid ${S.border}`, background: S.panel }}>
        <button onClick={onBack} className="md:hidden mr-1" style={{ color: S.silver }}>
          <ArrowLeft size={18} />
        </button>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: isGroup ? 'rgba(100,160,220,0.15)' : 'rgba(180,185,210,0.1)',
                   color: isGroup ? '#6aaddc' : S.silver }}>
          {isGroup ? <Users size={15} /> : convInitial(conv, myId, members)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: S.silverBright }}>{label}</p>
          <p className="text-[10px] truncate" style={{ color: S.silverDim }}>
            {convSubtitle(conv, myId, members)}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4"
        style={{ scrollbarWidth: 'thin', scrollbarColor: `${S.silverDim} transparent` }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full"
            style={{ color: S.silverDim }}>
            <MessageCircle size={32} className="mb-3 opacity-30" />
            <p className="text-sm">Sé el primero en escribir</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMine = msg.senderId === myId
          const msgDate = msg.createdAt.slice(0, 10)
          const showDate = msgDate !== lastDate
          const showName = msg.senderId !== lastSender
          const nextMsg = messages[i + 1]
          const showTime = !nextMsg || nextMsg.senderId !== msg.senderId || showDate

          if (showDate) lastDate = msgDate
          lastSender = msg.senderId

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px" style={{ background: S.border }} />
                  <span className="text-[10px] px-2" style={{ color: S.silverDim }}>
                    {fmtDate(msg.createdAt)}
                  </span>
                  <div className="flex-1 h-px" style={{ background: S.border }} />
                </div>
              )}
              <MsgBubble
                msg={msg}
                isMine={isMine}
                showName={showName}
                showTime={showTime}
                isGroup={isGroup}
              />
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3 relative"
        style={{ borderTop: `1px solid ${S.border}`, background: S.panel }}>
        {showEmoji && (
          <EmojiPicker onPick={e => { pickEmoji(e); }} onClose={() => setShowEmoji(false)} />
        )}
        <div className="flex items-end gap-2">
          <button onClick={() => setShowEmoji(o => !o)}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: showEmoji ? 'rgba(180,185,210,0.15)' : 'rgba(180,185,210,0.05)',
              color: showEmoji ? S.silverBright : S.silverDim,
              border: `1px solid ${showEmoji ? 'rgba(180,185,210,0.25)' : S.border}`,
            }}>
            <Smile size={18} />
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Escribe un mensaje..."
            rows={1}
            className="flex-1 px-4 py-2.5 rounded-2xl outline-none text-sm resize-none"
            style={{
              background: S.card,
              border: `1px solid ${S.border}`,
              color: S.silverBright,
              maxHeight: '120px',
              lineHeight: '1.5',
            }}
          />
          <button onClick={send}
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: input.trim() ? 'rgba(180,185,210,0.15)' : 'rgba(180,185,210,0.05)',
              color: input.trim() ? S.silverBright : S.silverDim,
              border: `1px solid ${input.trim() ? 'rgba(180,185,210,0.25)' : S.border}`,
            }}>
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] mt-1.5 text-center" style={{ color: '#2a2e3a' }}>
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  )
}

/* ─── Empty state ────────────────────────────────────────────────────────── */
function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full"
      style={{ background: S.bg }}>
      <MessageCircle size={40} className="mb-4 opacity-20" style={{ color: S.silver }} />
      <p className="text-sm font-medium mb-1" style={{ color: S.silver }}>Selecciona una conversación</p>
      <p className="text-xs mb-4" style={{ color: S.silverDim }}>o empieza una nueva</p>
      <button onClick={onNew}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
        style={{ background: 'rgba(180,185,210,0.08)', color: S.silver, border: `1px solid ${S.border}` }}>
        <Plus size={15} /> Nueva conversación
      </button>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function ChatPage() {
  const { session, member } = useAuth()
  const [members, setMembers]   = useState<TeamMember[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showNew, setShowNew]   = useState(false)
  const [showList, setShowList] = useState(true) // mobile toggle

  const myId = session?.memberId ?? ''

  const { data: allConversations, add: addConv, update: updateConv } =
    useFirestoreCollection<Conversation>('chat_conversaciones', {
      where: ['participantIds', 'array-contains', myId],
    })

  const conversations = [...allConversations].sort((a, b) => {
    const ta = a.lastMessageAt ?? a.createdAt
    const tb = b.lastMessageAt ?? b.createdAt
    return tb.localeCompare(ta)
  })

  const selected = conversations.find(c => c.id === selectedId) ?? null

  useEffect(() => { setMembers(getMembers()) }, [])

  function selectConv(conv: Conversation) {
    setSelectedId(conv.id)
    setShowList(false)
  }

  function handleCreate(conv: Conversation) {
    selectConv(conv)
  }

  if (!session) return null

  return (
    <div className="flex h-screen md:h-[calc(100vh-4rem)]"
      style={{ background: S.bg, marginTop: 0 }}>

      {/* ── Conversations sidebar ── */}
      <div className={`${showList ? 'flex' : 'hidden'} md:flex flex-col border-r flex-shrink-0`}
        style={{ width: '280px', borderColor: S.border, background: S.panel }}>

        {/* Sidebar header */}
        <div className="flex items-center gap-3 px-4 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${S.border}` }}>
          <MessageCircle size={16} style={{ color: S.silver }} />
          <p className="flex-1 text-sm font-bold" style={{ color: S.silverBright }}>Mensajes</p>
          <button onClick={() => setShowNew(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ background: 'rgba(180,185,210,0.08)', color: S.silver, border: `1px solid ${S.border}` }}
            title="Nueva conversación">
            <Plus size={14} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <MessageCircle size={28} className="mb-3 opacity-20" style={{ color: S.silver }} />
              <p className="text-xs text-center px-6" style={{ color: S.silverDim }}>
                No hay conversaciones aún.<br />Crea una con el botón +
              </p>
            </div>
          ) : (
            conversations.map(conv => (
              <ConvItem
                key={conv.id}
                conv={conv}
                myId={myId}
                members={members}
                active={selected?.id === conv.id}
                onClick={() => selectConv(conv)}
              />
            ))
          )}
        </div>

        {/* My user info */}
        <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ borderTop: `1px solid ${S.border}` }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'rgba(180,185,210,0.12)', color: S.silver }}>
            {member?.initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: S.silver }}>
              {member?.name.split(' · ').pop()}
            </p>
            <p className="text-[10px] truncate" style={{ color: S.silverDim }}>
              {member?.role}
            </p>
          </div>
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className={`${!showList ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-w-0`}>
        {selected ? (
          <ChatArea
            conv={selected}
            myId={myId}
            members={members}
            onBack={() => setShowList(true)}
            updateConv={updateConv}
          />
        ) : (
          <EmptyState onNew={() => setShowNew(true)} />
        )}
      </div>

      {/* ── Mobile: show list button when in chat ── */}
      {!showList && (
        <button
          onClick={() => setShowList(true)}
          className="md:hidden fixed bottom-28 left-4 w-10 h-10 rounded-full flex items-center justify-center z-40 shadow-lg"
          style={{ background: S.card, border: `1px solid ${S.borderLight}`, color: S.silver }}>
          <ChevronDown size={18} style={{ transform: 'rotate(90deg)' }} />
        </button>
      )}

      {/* ── Modal nueva conversación ── */}
      {showNew && (
        <NewConvModal
          myId={myId}
          members={members}
          existing={conversations}
          onClose={() => setShowNew(false)}
          onCreate={handleCreate}
          addConv={addConv}
        />
      )}
    </div>
  )
}
