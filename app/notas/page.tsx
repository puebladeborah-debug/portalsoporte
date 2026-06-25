'use client'

import { useState } from 'react'
import { NotebookPen, Plus, Trash2, Lock } from 'lucide-react'
import { useAuth } from '@/components/LoginGate'
import { useFirestoreCollection } from '@/lib/firestoreCollection'
import { auth } from '@/lib/firebase'
import { TeamMember } from '@/lib/teamStore'

const S = {
  bg: '#060608', card: '#0e0e12', border: '#1e1e28',
  borderActive: 'rgba(180,185,210,0.22)', silver: '#b8bcc8',
  silverBright: '#d4d8e8', silverDim: '#3a3e4a',
}

type Nota = { id: string; ownerUid: string; texto: string; createdAt: string; updatedAt: string }

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function NotaCard({ nota, onSave, onDelete }: {
  nota: Nota
  onSave: (id: string, texto: string) => void
  onDelete: (id: string) => void
}) {
  const [texto, setTexto] = useState(nota.texto)
  const [dirty, setDirty] = useState(false)

  return (
    <div className="p-3.5 rounded-2xl" style={{ background: S.card, border: `1px solid ${S.border}` }}>
      <textarea
        value={texto}
        onChange={e => { setTexto(e.target.value); setDirty(true) }}
        onBlur={() => { if (dirty && texto.trim()) { onSave(nota.id, texto.trim()); setDirty(false) } }}
        rows={3}
        className="w-full text-sm outline-none resize-none mb-2"
        style={{ background: 'transparent', color: S.silverBright }}
      />
      <div className="flex items-center justify-between">
        <p className="text-[10px]" style={{ color: S.silverDim }}>{fmtFecha(nota.updatedAt)}</p>
        <button onClick={() => onDelete(nota.id)} style={{ color: S.silverDim }} className="transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

function NotasInner({ uid }: { uid: string; member: TeamMember }) {
  const { data: notasRaw, add, update, remove } = useFirestoreCollection<Nota>('notas_personales', {
    where: ['ownerUid', '==', uid],
  })
  const notas = [...notasRaw].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const [nueva, setNueva] = useState('')

  async function crear() {
    if (!nueva.trim()) return
    const now = new Date().toISOString()
    await add({ ownerUid: uid, texto: nueva.trim(), createdAt: now, updatedAt: now })
    setNueva('')
  }

  async function guardar(id: string, texto: string) {
    await update(id, { texto, updatedAt: new Date().toISOString() })
  }

  async function eliminar(id: string) {
    await remove(id)
  }

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <NotebookPen size={14} style={{ color: S.silver }} />
            <h1 className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: S.silverDim }}>Notas Personales</h1>
          </div>
          <p className="text-xs flex items-center gap-1.5" style={{ color: S.silverDim }}>
            <Lock size={11} /> Solo tú puedes ver esto — ni siquiera el administrador tiene acceso
          </p>
        </div>

        {/* Nueva nota */}
        <div className="p-3.5 rounded-2xl mb-5" style={{ background: S.card, border: `1px solid ${S.borderActive}`, boxShadow: '0 0 20px rgba(180,185,210,0.06)' }}>
          <textarea
            value={nueva}
            onChange={e => setNueva(e.target.value)}
            placeholder="Escribe una nota nueva..."
            rows={3}
            className="w-full text-sm outline-none resize-none mb-2"
            style={{ background: 'transparent', color: S.silverBright }}
          />
          <button onClick={crear} disabled={!nueva.trim()}
            className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-xl transition-all"
            style={{
              background: nueva.trim() ? 'rgba(180,185,210,0.1)' : 'rgba(180,185,210,0.04)',
              color: nueva.trim() ? S.silverBright : S.silverDim,
              border: `1px solid ${nueva.trim() ? S.borderActive : S.border}`,
            }}>
            <Plus size={14} /> Agregar nota
          </button>
        </div>

        {/* Lista de notas */}
        {notas.length === 0 ? (
          <div className="text-center py-16" style={{ color: S.silverDim }}>
            <NotebookPen size={48} className="mx-auto mb-3" style={{ opacity: 0.15 }} />
            <p className="text-base">Sin notas todavía</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notas.map(n => (
              <NotaCard key={n.id} nota={n} onSave={guardar} onDelete={eliminar} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function NotasPage() {
  const { session, member } = useAuth()
  const uid = auth.currentUser?.uid

  if (!session || !member || !uid) return null

  return <NotasInner uid={uid} member={member} />
}
