'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, X, Trash2, ClipboardList, ChevronLeft, ChevronRight, Clock, UserRound, CalendarDays } from 'lucide-react'
import { useAuth } from '@/components/LoginGate'
import { useFirestoreCollection } from '@/lib/firestoreCollection'
import { getMembers, TeamMember } from '@/lib/teamStore'

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

type TareaDia = {
  id: string
  fecha: string // YYYY-MM-DD
  personaId: string
  personaNombre: string
  tarea: string
  horarioLimite: string // HH:MM
  createdBy: string
  createdAt: string
}

function nombreCorto(nombre: string) {
  return nombre.includes(' · ') ? nombre.split(' · ').pop()! : nombre
}

function hoyISO() {
  return new Date().toISOString().split('T')[0]
}

function fmtFecha(fecha: string) {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

/* ─── Modal: nueva tarea ─────────────────────────────────────────────────── */
function NuevaTareaModal({ fechaInicial, members, onClose, onSaved, addTarea }: {
  fechaInicial: string
  members: TeamMember[]
  onClose: () => void
  onSaved: () => void
  addTarea: (item: Omit<TareaDia, 'id'>) => Promise<string>
}) {
  const { session } = useAuth()
  const [fecha, setFecha] = useState(fechaInicial)
  const [personaId, setPersonaId] = useState(members[0]?.id || '')
  const [tarea, setTarea] = useState('')
  const [horarioLimite, setHorarioLimite] = useState('')
  const [saving, setSaving] = useState(false)

  const inputStyle = { background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }

  async function save() {
    if (!tarea.trim() || !personaId) return
    setSaving(true)
    const persona = members.find(m => m.id === personaId)
    await addTarea({
      fecha,
      personaId,
      personaNombre: persona ? nombreCorto(persona.name) : '—',
      tarea: tarea.trim(),
      horarioLimite,
      createdBy: session?.memberName || '',
      createdAt: new Date().toISOString(),
    })
    setSaving(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,var(--th-overlay-alpha))', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'var(--th-inner)', border: '1px solid rgba(180,185,210,0.2)', boxShadow: '0 0 80px rgba(0,0,0,0.9)', maxHeight: '90vh' }}>

        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
          <p className="flex-1 text-sm font-bold" style={{ color: S.silverBright }}>Nueva tarea del día</p>
          <button onClick={onClose} style={{ color: S.silverDim }}><X size={16} /></button>
        </div>

        <div className="px-5 py-5 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 130px)' }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Fecha</p>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Horario límite</p>
              <input type="time" value={horarioLimite} onChange={e => setHorarioLimite(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
            </div>
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Persona</p>
            <select value={personaId} onChange={e => setPersonaId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle}>
              {members.map(m => <option key={m.id} value={m.id}>{nombreCorto(m.name)}</option>)}
            </select>
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Tarea</p>
            <textarea value={tarea} onChange={e => setTarea(e.target.value)} rows={4}
              placeholder="Describe la tarea específica…"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm resize-none" style={inputStyle} />
          </div>
        </div>

        <div className="flex items-center gap-2 px-5 py-4" style={{ borderTop: `1px solid ${S.border}` }}>
          <button onClick={save} disabled={!tarea.trim() || !personaId || saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)', opacity: !tarea.trim() || !personaId || saving ? 0.5 : 1 }}>
            {saving ? 'Guardando…' : 'Crear tarea'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Página principal ───────────────────────────────────────────────────── */
export default function TareasDiaPage() {
  const { member } = useAuth()
  const esAdmin = !!member?.isAdmin

  const [members, setMembers] = useState<TeamMember[]>([])
  useEffect(() => { getMembers().then(setMembers) }, [])

  const [fecha, setFecha] = useState(hoyISO())
  const [modalAbierto, setModalAbierto] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const { data: todas, loading, add: addTarea, remove: removeTarea } =
    useFirestoreCollection<TareaDia>('tareas_dia')

  const delDia = useMemo(() =>
    todas.filter(t => t.fecha === fecha).sort((a, b) => (a.horarioLimite || '').localeCompare(b.horarioLimite || '')),
  [todas, fecha])

  const porPersona = useMemo(() => {
    const map = new Map<string, TareaDia[]>()
    for (const t of delDia) {
      const arr = map.get(t.personaId) || []
      arr.push(t)
      map.set(t.personaId, arr)
    }
    return [...map.entries()].sort((a, b) => a[1][0].personaNombre.localeCompare(b[1][0].personaNombre))
  }, [delDia])

  function cambiarDia(dir: 1 | -1) {
    const d = new Date(fecha + 'T12:00:00')
    d.setDate(d.getDate() + dir)
    setFecha(d.toISOString().split('T')[0])
  }

  async function eliminar(id: string) {
    await removeTarea(id)
    setConfirmDelete(null)
  }

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: S.silverBright }}>Tareas del Día</h1>
          <p className="text-sm mt-1" style={{ color: S.silverDim }}>Tareas específicas asignadas por persona y fecha</p>
        </div>

        <button onClick={() => setModalAbierto(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-5 text-sm font-bold transition-all"
          style={{ background: 'rgba(220,80,80,0.1)', color: '#e07070', border: '1px solid rgba(220,80,80,0.3)' }}>
          <Plus size={16} /> Nueva tarea
        </button>

        {/* Selector de día */}
        <div className="flex items-center justify-center gap-4 mb-5">
          <button onClick={() => cambiarDia(-1)} style={{ color: S.silver }}><ChevronLeft size={20} /></button>
          <div className="text-center">
            <p className="text-sm font-black capitalize" style={{ color: S.silverBright }}>{fmtFecha(fecha)}</p>
            {fecha !== hoyISO() && (
              <button onClick={() => setFecha(hoyISO())} className="text-[11px] font-semibold mt-0.5" style={{ color: '#e07070' }}>
                Volver a hoy
              </button>
            )}
          </div>
          <button onClick={() => cambiarDia(1)} style={{ color: S.silver }}><ChevronRight size={20} /></button>
        </div>

        <div className="flex items-center gap-2 mb-5">
          <CalendarDays size={14} style={{ color: S.silverDim }} />
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
            style={{ background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }} />
        </div>

        {loading ? (
          <p className="text-center text-sm py-10" style={{ color: S.silverDim }}>Cargando…</p>
        ) : porPersona.length === 0 ? (
          <div className="text-center py-12" style={{ color: S.silverDim }}>
            <ClipboardList size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Sin tareas asignadas para este día</p>
          </div>
        ) : (
          <div className="space-y-5">
            {porPersona.map(([personaId, tareas]) => (
              <div key={personaId}>
                <div className="flex items-center gap-2 mb-3 px-4 py-3 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(180,185,210,0.16), rgba(180,185,210,0.04))',
                    border: '1px solid rgba(180,185,210,0.35)',
                    boxShadow: '0 0 24px rgba(180,185,210,0.12)',
                  }}>
                  <UserRound size={15} style={{ color: S.silverBright }} />
                  <p className="text-base font-black tracking-wide flex-1" style={{ color: S.silverBright }}>{tareas[0].personaNombre}</p>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: 'rgba(180,185,210,0.16)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.35)' }}>
                    {tareas.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {tareas.map(t => (
                    <div key={t.id} className="rounded-xl px-4 py-3" style={{ background: S.card, border: `1px solid ${S.border}` }}>
                      <p className="text-sm leading-relaxed mb-2" style={{ color: S.silverBright }}>{t.tarea}</p>
                      {t.horarioLimite && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full w-fit"
                          style={{ background: 'rgba(220,160,60,0.1)', color: '#dcaa50', border: '1px solid rgba(220,160,60,0.25)' }}>
                          <Clock size={11} /> Hasta las {t.horarioLimite}
                        </span>
                      )}

                      {esAdmin && (
                        confirmDelete === t.id ? (
                          <div className="flex items-center gap-2 mt-2">
                            <p className="text-[11px] flex-1" style={{ color: S.silverDim }}>¿Eliminar esta tarea?</p>
                            <button onClick={() => setConfirmDelete(null)}
                              className="text-[11px] px-2.5 py-1 rounded-lg" style={{ color: S.silverDim, border: `1px solid ${S.border}` }}>
                              Cancelar
                            </button>
                            <button onClick={() => eliminar(t.id)}
                              className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg"
                              style={{ color: '#e07070', border: '1px solid rgba(220,80,80,0.3)', background: 'rgba(220,80,80,0.08)' }}>
                              <Trash2 size={11} /> Eliminar
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(t.id)}
                            className="flex items-center gap-1 text-[10px] mt-2" style={{ color: S.silverDim }}>
                            <Trash2 size={10} /> Eliminar
                          </button>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalAbierto && (
        <NuevaTareaModal
          fechaInicial={fecha}
          members={members}
          onClose={() => setModalAbierto(false)}
          onSaved={() => setModalAbierto(false)}
          addTarea={addTarea}
        />
      )}
    </div>
  )
}
