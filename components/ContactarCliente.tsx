'use client'

import { useState, useEffect } from 'react'
import {
  Phone, Mail, MessageCircle, Plus, X, AlertCircle, CheckCircle2, Check,
} from 'lucide-react'
import { useAuth } from './LoginGate'
import { getMembers, TeamMember, EXEC_IDS } from '@/lib/teamStore'
import { useFirestoreCollection } from '@/lib/firestoreCollection'

const S = {
  card: '#0e0e12', border: '#1e1e28', borderActive: 'rgba(180,185,210,0.22)',
  silver: '#b8bcc8', silverBright: '#d4d8e8', silverDim: '#3a3e4a',
}

type Metodo = 'whatsapp' | 'correo' | 'llamada'

type ContactoCliente = {
  id: string
  clienteNombre: string
  fecha: string
  hora: string
  metodo: Metodo
  lada?: string
  telefono?: string
  asignadoA: string
  asignadoPor: string
  estado: 'pendiente' | 'completada'
  resolucion?: string
  createdAt: string
  completedAt?: string
}

const METODO_INFO: Record<Metodo, { label: string; icon: React.ReactNode }> = {
  whatsapp: { label: 'WhatsApp', icon: <MessageCircle size={13} /> },
  correo:   { label: 'Correo',   icon: <Mail size={13} /> },
  llamada:  { label: 'Llamada',  icon: <Phone size={13} /> },
}

function nombreCorto(nombre: string) {
  return nombre.includes(' · ') ? nombre.split(' · ').pop()! : nombre
}

/* ─── Modal: nuevo contacto ──────────────────────────────────────────────── */
function NuevoContactoModal({ members, myId, onClose, onCreate }: {
  members: TeamMember[]
  myId: string
  onClose: () => void
  onCreate: (item: Omit<ContactoCliente, 'id'>) => Promise<void>
}) {
  const [clienteNombre, setClienteNombre] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [metodo, setMetodo] = useState<Metodo>('whatsapp')
  const [lada, setLada] = useState('+52')
  const [telefono, setTelefono] = useState('')
  const [asignadoA, setAsignadoA] = useState(myId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const valido = clienteNombre.trim() && fecha && hora && asignadoA && (metodo !== 'llamada' || telefono.trim())

  async function crear() {
    if (!valido) return
    setSaving(true)
    setError('')
    try {
      await onCreate({
        clienteNombre: clienteNombre.trim(), fecha, hora, metodo,
        ...(metodo === 'llamada' ? { lada: lada.trim(), telefono: telefono.trim() } : {}),
        asignadoA, asignadoPor: myId, estado: 'pendiente', createdAt: new Date().toISOString(),
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: '#09090f', border: '1px solid rgba(180,185,210,0.2)', boxShadow: '0 0 80px rgba(0,0,0,0.9)', maxHeight: '88vh' }}>

        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
          <p className="flex-1 text-sm font-bold" style={{ color: S.silverBright }}>Nuevo contacto de cliente</p>
          <button onClick={onClose} style={{ color: S.silverDim }}><X size={16} /></button>
        </div>

        <div className="px-5 py-5 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(88vh - 140px)' }}>
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Nombre del cliente</p>
            <input value={clienteNombre} onChange={e => setClienteNombre(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
              style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Fecha</p>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Hora</p>
              <input type="time" value={hora} onChange={e => setHora(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
            </div>
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Método de contacto</p>
            <div className="flex gap-2">
              {(Object.keys(METODO_INFO) as Metodo[]).map(m => (
                <button key={m} onClick={() => setMetodo(m)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={metodo === m
                    ? { background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: `1px solid ${S.borderActive}` }
                    : { background: 'rgba(180,185,210,0.03)', color: S.silverDim, border: `1px solid ${S.border}` }}>
                  {METODO_INFO[m].icon} {METODO_INFO[m].label}
                </button>
              ))}
            </div>
          </div>

          {metodo === 'llamada' && (
            <div className="flex gap-2.5">
              <input value={lada} onChange={e => setLada(e.target.value)} placeholder="Lada"
                className="w-20 flex-shrink-0 px-3 py-2.5 rounded-xl outline-none text-sm"
                style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
              <input value={telefono} onChange={e => setTelefono(e.target.value)} type="tel" placeholder="Número de teléfono"
                className="flex-1 px-3 py-2.5 rounded-xl outline-none text-sm"
                style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
            </div>
          )}

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Asignar a</p>
            <div className="space-y-1.5">
              {members.map(m => (
                <button key={m.id} onClick={() => setAsignadoA(m.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all"
                  style={asignadoA === m.id
                    ? { background: 'rgba(180,185,210,0.1)', border: `1px solid ${S.borderActive}` }
                    : { background: 'rgba(180,185,210,0.03)', border: `1px solid ${S.border}` }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background: 'rgba(180,185,210,0.1)', color: S.silver }}>
                    {m.initial}
                  </div>
                  <span className="text-xs font-medium" style={{ color: asignadoA === m.id ? S.silverBright : S.silver }}>
                    {nombreCorto(m.name)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-4" style={{ borderTop: `1px solid ${S.border}` }}>
          {error && <p className="text-[11px] font-semibold text-center mb-2" style={{ color: '#e07070' }}>{error}</p>}
          <button onClick={crear} disabled={!valido || saving}
            className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: valido ? 'rgba(180,185,210,0.1)' : 'rgba(180,185,210,0.04)', color: valido ? S.silverBright : S.silverDim, border: `1px solid ${valido ? S.borderActive : S.border}`, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Guardando…' : 'Crear contacto'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Tarjeta de contacto ─────────────────────────────────────────────────── */
function ContactoCard({ c, members, puedeCompletar, onComplete }: {
  c: ContactoCliente
  members: TeamMember[]
  puedeCompletar: boolean
  onComplete: (id: string, resolucion: string) => Promise<void>
}) {
  const [showResolver, setShowResolver] = useState(false)
  const [resolucion, setResolucion] = useState('')
  const [saving, setSaving] = useState(false)

  const asignado = members.find(m => m.id === c.asignadoA)
  const pendiente = c.estado === 'pendiente'
  const mInfo = METODO_INFO[c.metodo]

  async function completar() {
    if (!resolucion.trim()) return
    setSaving(true)
    await onComplete(c.id, resolucion.trim())
    setSaving(false)
  }

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: pendiente ? 'rgba(220,70,70,0.07)' : S.card,
        border: `1px solid ${pendiente ? 'rgba(220,70,70,0.35)' : S.border}`,
      }}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className="text-sm font-bold truncate" style={{ color: pendiente ? '#e07070' : S.silverBright }}>{c.clienteNombre}</p>
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0"
            style={pendiente
              ? { background: 'rgba(220,70,70,0.15)', color: '#e07070', border: '1px solid rgba(220,70,70,0.35)' }
              : { background: 'rgba(100,200,120,0.12)', color: '#70c080', border: '1px solid rgba(100,200,120,0.3)' }}>
            {pendiente ? <AlertCircle size={11} /> : <CheckCircle2 size={11} />}
            {pendiente ? 'Pendiente' : 'Completada'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] mb-2 flex-wrap" style={{ color: pendiente ? 'rgba(224,112,112,0.8)' : S.silverDim }}>
          <span>{new Date(c.fecha + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} · {c.hora}</span>
          <span className="flex items-center gap-1">{mInfo.icon} {mInfo.label}</span>
          {c.metodo === 'llamada' && c.telefono && <span>{c.lada} {c.telefono}</span>}
          <span>Asignado: <span style={{ color: pendiente ? '#e07070' : S.silver }}>{asignado ? nombreCorto(asignado.name) : '—'}</span></span>
        </div>

        {c.estado === 'completada' && c.resolucion && (
          <p className="text-xs leading-relaxed mb-1" style={{ color: '#9094a4' }}>
            <span style={{ color: S.silverDim }}>Resolución: </span>{c.resolucion}
          </p>
        )}

        {pendiente && puedeCompletar && (
          showResolver ? (
            <div className="mt-2 space-y-2">
              <textarea value={resolucion} onChange={e => setResolucion(e.target.value)}
                placeholder="¿Cómo se resolvió el contacto?" rows={2}
                className="w-full px-3 py-2 rounded-xl outline-none text-xs resize-none"
                style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
              <div className="flex gap-2">
                <button onClick={() => setShowResolver(false)}
                  className="flex-1 py-1.5 rounded-lg text-[11px]" style={{ color: S.silverDim, border: `1px solid ${S.border}` }}>
                  Cancelar
                </button>
                <button onClick={completar} disabled={!resolucion.trim() || saving}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold"
                  style={{ background: 'rgba(100,200,120,0.15)', color: '#70c080', border: '1px solid rgba(100,200,120,0.3)' }}>
                  <Check size={12} /> Confirmar
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowResolver(true)}
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg mt-1"
              style={{ background: 'rgba(220,70,70,0.12)', color: '#e07070', border: '1px solid rgba(220,70,70,0.3)' }}>
              Marcar completada
            </button>
          )
        )}
      </div>
    </div>
  )
}

/* ─── Componente principal ───────────────────────────────────────────────── */
export default function ContactarCliente() {
  const { session, member } = useAuth()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { getMembers().then(setMembers) }, [])

  const { data: contactos, add, update } = useFirestoreCollection<ContactoCliente>('contactos_cliente')

  if (!session || !member || EXEC_IDS.includes(member.id)) return null

  const asignables = members.filter(m => !EXEC_IDS.includes(m.id))
  const ordenados = [...contactos].sort((a, b) => {
    if (a.estado !== b.estado) return a.estado === 'pendiente' ? -1 : 1
    return `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`)
  })

  async function completar(id: string, resolucion: string) {
    await update(id, { estado: 'completada', resolucion, completedAt: new Date().toISOString() })
  }

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Phone size={13} style={{ color: S.silver }} />
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: S.silverDim }}>
            Contactar Cliente
          </h2>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg"
          style={{ background: 'rgba(180,185,210,0.08)', color: S.silver, border: `1px solid ${S.border}` }}>
          <Plus size={12} /> Nuevo
        </button>
      </div>

      {ordenados.length === 0 ? (
        <p className="text-xs py-3" style={{ color: S.silverDim }}>Sin contactos pendientes</p>
      ) : (
        <div className="space-y-2">
          {ordenados.map(c => (
            <ContactoCard key={c.id} c={c} members={members}
              puedeCompletar={c.asignadoA === member.id || !!member.isAdmin}
              onComplete={completar} />
          ))}
        </div>
      )}

      {showModal && (
        <NuevoContactoModal members={asignables} myId={member.id}
          onClose={() => setShowModal(false)}
          onCreate={async item => { await add(item) }} />
      )}
    </div>
  )
}
