'use client'

import { useState } from 'react'
import {
  CalendarClock, ListTodo, NotebookPen, Phone, Plus, Trash2, Lock,
  Circle, CheckCircle2,
} from 'lucide-react'
import { useAuth } from '@/components/LoginGate'
import { useFirestoreCollection } from '@/lib/firestoreCollection'
import { auth } from '@/lib/firebase'

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

type Pendiente = { id: string; ownerUid: string; texto: string; hecho: boolean; createdAt: string }
type Nota = { id: string; ownerUid: string; texto: string; createdAt: string; updatedAt: string }
type Llamada = { id: string; ownerUid: string; contacto: string; lada: string; telefono: string; fecha: string; hora: string; notas: string; createdAt: string }

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

/* ─── Tab: Pendientes ─────────────────────────────────────────────────────── */
function TabPendientes({ uid }: { uid: string }) {
  const { data: raw, add, update, remove } = useFirestoreCollection<Pendiente>('agenda_pendientes', { where: ['ownerUid', '==', uid] })
  const items = [...raw].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const pendientes = items.filter(i => !i.hecho)
  const hechos = items.filter(i => i.hecho)
  const [texto, setTexto] = useState('')
  const [error, setError] = useState('')

  async function crear() {
    if (!texto.trim()) return
    try {
      setError('')
      await add({ ownerUid: uid, texto: texto.trim(), hecho: false, createdAt: new Date().toISOString() })
      setTexto('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    }
  }

  async function marcar(id: string, hecho: boolean) {
    try { setError(''); await update(id, { hecho }) }
    catch (err) { setError(err instanceof Error ? err.message : 'No se pudo actualizar') }
  }

  async function eliminar(id: string) {
    try { setError(''); await remove(id) }
    catch (err) { setError(err instanceof Error ? err.message : 'No se pudo eliminar') }
  }

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input value={texto} onChange={e => setTexto(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && crear()}
          placeholder="¿Qué tienes pendiente?"
          className="flex-1 px-3 py-2.5 rounded-xl outline-none text-sm"
          style={{ background: S.card, border: `1px solid ${S.border}`, color: S.silverBright }} />
        <button onClick={crear} disabled={!texto.trim()}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold"
          style={{ background: texto.trim() ? 'rgba(180,185,210,0.1)' : 'rgba(180,185,210,0.04)', color: texto.trim() ? S.silverBright : S.silverDim, border: `1px solid ${texto.trim() ? S.borderActive : S.border}` }}>
          <Plus size={14} />
        </button>
      </div>
      {error && <p className="text-[11px] font-semibold mb-3" style={{ color: '#e07070' }}>{error}</p>}

      {items.length === 0 ? (
        <p className="text-center text-sm py-10" style={{ color: S.silverDim }}>Sin pendientes</p>
      ) : (
        <div className="space-y-2">
          {pendientes.map(p => (
            <button key={p.id} onClick={() => marcar(p.id, true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all"
              style={{ background: S.card, border: `1px solid ${S.borderActive}` }}>
              <Circle size={18} style={{ color: S.silverDim, flexShrink: 0 }} />
              <span className="flex-1 text-sm" style={{ color: S.silverBright }}>{p.texto}</span>
              <Trash2 size={14} style={{ color: S.silverDim, flexShrink: 0 }}
                onClick={e => { e.stopPropagation(); eliminar(p.id) }} />
            </button>
          ))}
          {hechos.map(p => (
            <button key={p.id} onClick={() => marcar(p.id, false)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all"
              style={{ background: S.card, border: `1px solid ${S.border}`, opacity: 0.5 }}>
              <CheckCircle2 size={18} style={{ color: '#70c080', flexShrink: 0 }} />
              <span className="flex-1 text-sm" style={{ color: S.silverDim, textDecoration: 'line-through' }}>{p.texto}</span>
              <Trash2 size={14} style={{ color: S.silverDim, flexShrink: 0 }}
                onClick={e => { e.stopPropagation(); eliminar(p.id) }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Tab: Notas ─────────────────────────────────────────────────────────── */
function NotaCard({ nota, onSave, onDelete }: { nota: Nota; onSave: (id: string, texto: string) => void; onDelete: (id: string) => void }) {
  const [texto, setTexto] = useState(nota.texto)
  const [dirty, setDirty] = useState(false)
  return (
    <div className="p-3.5 rounded-2xl" style={{ background: S.card, border: `1px solid ${S.border}` }}>
      <textarea value={texto} onChange={e => { setTexto(e.target.value); setDirty(true) }}
        onBlur={() => { if (dirty && texto.trim()) { onSave(nota.id, texto.trim()); setDirty(false) } }}
        rows={3} className="w-full text-sm outline-none resize-none mb-2"
        style={{ background: 'transparent', color: S.silverBright }} />
      <div className="flex items-center justify-between">
        <p className="text-[10px]" style={{ color: S.silverDim }}>{fmtFecha(nota.updatedAt)}</p>
        <button onClick={() => onDelete(nota.id)} style={{ color: S.silverDim }}><Trash2 size={14} /></button>
      </div>
    </div>
  )
}

function TabNotas({ uid }: { uid: string }) {
  const { data: raw, add, update, remove } = useFirestoreCollection<Nota>('notas_personales', { where: ['ownerUid', '==', uid] })
  const notas = [...raw].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const [nueva, setNueva] = useState('')
  const [error, setError] = useState('')

  async function crear() {
    if (!nueva.trim()) return
    try {
      setError('')
      const now = new Date().toISOString()
      await add({ ownerUid: uid, texto: nueva.trim(), createdAt: now, updatedAt: now })
      setNueva('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    }
  }

  async function guardar(id: string, texto: string) {
    try { setError(''); await update(id, { texto, updatedAt: new Date().toISOString() }) }
    catch (err) { setError(err instanceof Error ? err.message : 'No se pudo guardar') }
  }

  async function eliminar(id: string) {
    try { setError(''); await remove(id) }
    catch (err) { setError(err instanceof Error ? err.message : 'No se pudo eliminar') }
  }

  return (
    <div>
      <div className="p-3.5 rounded-2xl mb-4" style={{ background: S.card, border: `1px solid ${S.borderActive}` }}>
        <textarea value={nueva} onChange={e => setNueva(e.target.value)}
          placeholder="Escribe una nota nueva..." rows={3}
          className="w-full text-sm outline-none resize-none mb-2"
          style={{ background: 'transparent', color: S.silverBright }} />
        <button onClick={crear} disabled={!nueva.trim()}
          className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-xl"
          style={{ background: nueva.trim() ? 'rgba(180,185,210,0.1)' : 'rgba(180,185,210,0.04)', color: nueva.trim() ? S.silverBright : S.silverDim, border: `1px solid ${nueva.trim() ? S.borderActive : S.border}` }}>
          <Plus size={14} /> Agregar nota
        </button>
        {error && <p className="text-[11px] font-semibold mt-2" style={{ color: '#e07070' }}>{error}</p>}
      </div>
      {notas.length === 0 ? (
        <p className="text-center text-sm py-10" style={{ color: S.silverDim }}>Sin notas todavía</p>
      ) : (
        <div className="space-y-2">
          {notas.map(n => (
            <NotaCard key={n.id} nota={n} onSave={guardar} onDelete={eliminar} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Tab: Llamadas ──────────────────────────────────────────────────────── */
function TabLlamadas({ uid }: { uid: string }) {
  const { data: raw, add, remove } = useFirestoreCollection<Llamada>('agenda_llamadas', { where: ['ownerUid', '==', uid] })
  const llamadas = [...raw].sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`))

  const [contacto, setContacto] = useState('')
  const [lada, setLada] = useState('+52')
  const [telefono, setTelefono] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [notas, setNotas] = useState('')
  const [error, setError] = useState('')

  async function crear() {
    if (!contacto.trim() || !fecha || !hora) return
    try {
      setError('')
      await add({
        ownerUid: uid, contacto: contacto.trim(), lada: lada.trim(), telefono: telefono.trim(),
        fecha, hora, notas: notas.trim(), createdAt: new Date().toISOString(),
      })
      setContacto(''); setLada('+52'); setTelefono(''); setFecha(''); setHora(''); setNotas('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    }
  }

  async function eliminar(id: string) {
    try {
      setError('')
      await remove(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar')
    }
  }

  return (
    <div>
      <div className="p-3.5 rounded-2xl mb-4 space-y-2.5" style={{ background: S.card, border: `1px solid ${S.borderActive}` }}>
        <input value={contacto} onChange={e => setContacto(e.target.value)}
          placeholder="¿Con quién es la llamada?"
          className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
          style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
        <div className="flex gap-2.5">
          <input value={lada} onChange={e => setLada(e.target.value)}
            placeholder="Lada"
            className="w-20 flex-shrink-0 px-3 py-2.5 rounded-xl outline-none text-sm"
            style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
          <input value={telefono} onChange={e => setTelefono(e.target.value)}
            type="tel" placeholder="Número de teléfono"
            className="flex-1 px-3 py-2.5 rounded-xl outline-none text-sm"
            style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
            style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
          <input type="time" value={hora} onChange={e => setHora(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
            style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
        </div>
        <textarea value={notas} onChange={e => setNotas(e.target.value)}
          placeholder="Notas (opcional)" rows={2}
          className="w-full px-3 py-2.5 rounded-xl outline-none text-sm resize-none"
          style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
        <button onClick={crear} disabled={!contacto.trim() || !fecha || !hora}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase px-4 py-2.5 rounded-xl"
          style={{
            background: contacto.trim() && fecha && hora ? 'rgba(180,185,210,0.1)' : 'rgba(180,185,210,0.04)',
            color: contacto.trim() && fecha && hora ? S.silverBright : S.silverDim,
            border: `1px solid ${contacto.trim() && fecha && hora ? S.borderActive : S.border}`,
          }}>
          <Plus size={14} /> Programar llamada
        </button>
        {error && <p className="text-[11px] font-semibold text-center" style={{ color: '#e07070' }}>{error}</p>}
      </div>

      {llamadas.length === 0 ? (
        <p className="text-center text-sm py-10" style={{ color: S.silverDim }}>Sin llamadas programadas</p>
      ) : (
        <div className="space-y-2">
          {llamadas.map(l => (
            <div key={l.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: S.card, border: `1px solid ${S.border}` }}>
              <Phone size={16} style={{ color: '#6aaddc', flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: S.silverBright }}>{l.contacto}</p>
                <p className="text-[11px]" style={{ color: S.silverDim }}>
                  {new Date(l.fecha + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} · {l.hora}
                  {l.telefono && ` · ${l.lada} ${l.telefono}`}
                  {l.notas && ` · ${l.notas}`}
                </p>
              </div>
              <button onClick={() => eliminar(l.id)} style={{ color: S.silverDim }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Página principal ───────────────────────────────────────────────────── */
function AgendaInner({ uid }: { uid: string }) {
  const [tab, setTab] = useState<'pendientes' | 'notas' | 'llamadas'>('pendientes')

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <CalendarClock size={14} style={{ color: S.silver }} />
            <h1 className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: S.silverDim }}>Agenda</h1>
          </div>
          <p className="text-xs flex items-center gap-1.5" style={{ color: S.silverDim }}>
            <Lock size={11} /> Solo tú puedes ver esto — ni siquiera el administrador tiene acceso
          </p>
        </div>

        <div className="flex gap-2 mb-5">
          {[
            { id: 'pendientes' as const, label: 'Pendientes', icon: <ListTodo size={14} /> },
            { id: 'notas' as const, label: 'Notas', icon: <NotebookPen size={14} /> },
            { id: 'llamadas' as const, label: 'Llamadas', icon: <Phone size={14} /> },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={tab === t.id
                ? { background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: `1px solid ${S.borderActive}` }
                : { background: 'rgba(180,185,210,0.03)', color: S.silverDim, border: `1px solid ${S.border}` }
              }>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'pendientes' && <TabPendientes uid={uid} />}
        {tab === 'notas' && <TabNotas uid={uid} />}
        {tab === 'llamadas' && <TabLlamadas uid={uid} />}
      </div>
    </div>
  )
}

export default function AgendaPage() {
  const { session, member } = useAuth()
  const uid = auth.currentUser?.uid

  if (!session || !member || !uid) return null

  return <AgendaInner uid={uid} />
}
