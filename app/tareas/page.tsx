'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Zap, AlertCircle, Check } from 'lucide-react'
import { useAuth } from '@/components/LoginGate'
import { useFirestoreCollection } from '@/lib/firestoreCollection'

const S = {
  bg: '#060608', card: '#0e0e12', border: '#1e1e28',
  borderActive: 'rgba(180,185,210,0.22)', silver: '#b8bcc8',
  silverBright: '#d4d8e8', silverDim: '#3a3e4a',
}

const TODAY = new Date().toISOString().split('T')[0]

type ExtraTask = { id: string; text: string; date: string; targetMembers: string[]; createdBy: string }

export default function TareasPage() {
  const { session, member } = useAuth()
  const [checks, setChecks] = useState<boolean[]>([])
  const [confirmedExtras, setConfirmedExtras] = useState<string[]>([])

  const { data: allExtras } = useFirestoreCollection<ExtraTask>('tareas_extra', { where: ['date', '==', TODAY] })

  useEffect(() => {
    if (!member) return
    const saved = localStorage.getItem(`teamchecks_${TODAY}`)
    const parsed: Record<string, boolean[]> = saved ? JSON.parse(saved) : {}
    setChecks(parsed[member.id] || new Array(member.tasks.length).fill(false))

    const confirmed = localStorage.getItem(`extra_confirmed_${TODAY}`)
    setConfirmedExtras(confirmed ? JSON.parse(confirmed) : [])
  }, [member])

  if (!session || !member) return null

  const myExtras = allExtras.filter(t => t.targetMembers.length === 0 || t.targetMembers.includes(member.id))

  function toggle(idx: number) {
    const next = checks.map((v, i) => (i === idx ? !v : v))
    setChecks(next)
    const saved = localStorage.getItem(`teamchecks_${TODAY}`)
    const parsed: Record<string, boolean[]> = saved ? JSON.parse(saved) : {}
    parsed[member!.id] = next
    localStorage.setItem(`teamchecks_${TODAY}`, JSON.stringify(parsed))
  }

  function confirmExtra(id: string) {
    const updated = [...confirmedExtras, id]
    setConfirmedExtras(updated)
    localStorage.setItem(`extra_confirmed_${TODAY}`, JSON.stringify(updated))
  }

  const total = member.tasks.length
  const done = checks.filter(Boolean).length
  const pendingIdx = member.tasks.map((_, i) => i).filter(i => !checks[i])
  const doneIdx = member.tasks.map((_, i) => i).filter(i => checks[i])
  const displayName = member.name.split(' · ').pop() || member.name

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} style={{ color: S.silver }} />
            <h1 className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: S.silverDim }}>Mis Tareas</h1>
          </div>
          <p className="text-sm" style={{ color: S.silverBright }}>{displayName}</p>
          <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>
            {total > 0 ? `${done}/${total} completadas hoy` : 'Sin tareas asignadas'}
          </p>
        </div>

        {/* Tareas extra de hoy */}
        {myExtras.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={13} style={{ color: '#d4a050' }} />
              <span className="text-xs font-bold tracking-wider uppercase" style={{ color: '#d4a050' }}>Tareas extra de hoy</span>
            </div>
            <div className="space-y-2">
              {myExtras.map(et => {
                const confirmed = confirmedExtras.includes(et.id)
                return (
                  <div key={et.id} className="p-3 rounded-2xl"
                    style={{ background: 'rgba(212,160,80,0.06)', border: `1px solid ${confirmed ? 'rgba(100,200,120,0.25)' : 'rgba(212,160,80,0.25)'}` }}>
                    <p className="text-sm mb-2" style={{ color: confirmed ? S.silverDim : '#e0c080' }}>{et.text}</p>
                    {confirmed ? (
                      <p className="text-xs flex items-center gap-1" style={{ color: '#70c080' }}>
                        <Check size={12} /> Lectura confirmada
                      </p>
                    ) : (
                      <button onClick={() => confirmExtra(et.id)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg"
                        style={{ background: 'rgba(212,160,80,0.15)', color: '#d4a050', border: '1px solid rgba(212,160,80,0.3)' }}>
                        ✓ Confirmar lectura
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Checklist diario */}
        {total === 0 ? (
          <div className="text-center py-16" style={{ color: S.silverDim }}>
            <CheckCircle2 size={48} className="mx-auto mb-3" style={{ opacity: 0.15 }} />
            <p className="text-base">No tienes tareas asignadas</p>
          </div>
        ) : (
          <>
            {pendingIdx.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Circle size={13} style={{ color: S.silverDim }} />
                  <span className="text-xs font-bold tracking-wider uppercase" style={{ color: S.silverDim }}>
                    Pendientes ({pendingIdx.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {pendingIdx.map(i => (
                    <button key={i} onClick={() => toggle(i)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all"
                      style={{ background: S.card, border: `1px solid ${S.borderActive}` }}>
                      <Circle size={20} style={{ color: S.silverDim, flexShrink: 0 }} />
                      <span className="flex-1 text-sm" style={{ color: S.silverBright }}>{member.tasks[i]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {doneIdx.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={13} style={{ color: '#70c080' }} />
                  <span className="text-xs font-bold tracking-wider uppercase" style={{ color: S.silverDim }}>
                    Completadas ({doneIdx.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {doneIdx.map(i => (
                    <button key={i} onClick={() => toggle(i)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all"
                      style={{ background: S.card, border: `1px solid ${S.border}`, opacity: 0.5 }}>
                      <CheckCircle2 size={20} style={{ color: '#70c080', flexShrink: 0 }} />
                      <span className="flex-1 text-sm" style={{ color: S.silverDim, textDecoration: 'line-through' }}>{member.tasks[i]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <p className="text-center text-[10px] mt-4" style={{ color: '#2a2e3a' }}>
          Solo tú puedes ver esta lista — son tus tareas asignadas
        </p>
      </div>
    </div>
  )
}
