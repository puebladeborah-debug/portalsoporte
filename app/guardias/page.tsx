'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, Check, CalendarDays, Clock, Repeat } from 'lucide-react'
import { useAuth } from '@/components/LoginGate'
import {
  getMembers, DEFAULT_GUARDIA_PATRON,
  Guardia, TeamMember, GuardiaPatron, DiaSemana,
} from '@/lib/teamStore'
import { useFirestoreCollection, useFirestoreDoc } from '@/lib/firestoreCollection'

const S = {
  bg: '#060608', card: '#0e0e12', border: '#1e1e28',
  silver: '#b8bcc8', silverBright: '#d4d8e8', silverDim: '#3a3e4a',
}

const DIAS_COL = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio',
               'Agosto','Septiembre','Octubre','Noviembre','Diciembre']

// Índice de getDay() (0=domingo) -> clave DiaSemana
const DIA_SEMANA_POR_INDICE: DiaSemana[] = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
const DIAS_SEMANA_ORDEN: { key: DiaSemana; label: string }[] = [
  { key: 'lunes',     label: 'Lunes' },
  { key: 'martes',    label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves',    label: 'Jueves' },
  { key: 'viernes',   label: 'Viernes' },
  { key: 'sabado',    label: 'Sábado' },
  { key: 'domingo',   label: 'Domingo' },
]

function diaSemanaDeIso(iso: string): DiaSemana {
  return DIA_SEMANA_POR_INDICE[new Date(iso + 'T12:00:00').getDay()]
}

const MEMBER_COLORS = [
  { bg: 'rgba(136,144,210,0.15)', border: 'rgba(136,144,210,0.4)', text: '#8890d2' },
  { bg: 'rgba(92,184,122,0.12)',  border: 'rgba(92,184,122,0.35)',  text: '#5cb87a' },
  { bg: 'rgba(220,170,60,0.12)',  border: 'rgba(220,170,60,0.35)',  text: '#dcaa3c' },
  { bg: 'rgba(200,100,180,0.12)', border: 'rgba(200,100,180,0.35)', text: '#c864b4' },
  { bg: 'rgba(80,180,210,0.12)',  border: 'rgba(80,180,210,0.35)',  text: '#50b4d2' },
  { bg: 'rgba(220,130,80,0.12)',  border: 'rgba(220,130,80,0.35)',  text: '#dc8250' },
  { bg: 'rgba(150,190,80,0.12)',  border: 'rgba(150,190,80,0.35)',  text: '#96be50' },
]

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function calendarDays(year: number, month: number) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startPad = (first.getDay() + 6) % 7
  const days: Array<{ date: number | null; iso: string | null }> = []
  for (let i = 0; i < startPad; i++) days.push({ date: null, iso: null })
  for (let d = 1; d <= last.getDate(); d++) days.push({ date: d, iso: isoDate(year, month, d) })
  while (days.length % 7 !== 0) days.push({ date: null, iso: null })
  return days
}

function formatHora(h: string) {
  if (!h) return ''
  const [hh, mm] = h.split(':')
  return `${hh}:${mm}`
}

export default function GuardiasPage() {
  const { session } = useAuth()
  const today = new Date()

  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [members, setMembers] = useState<TeamMember[]>([])

  const { data: guardias, set: setGuardiaDia, remove: removeGuardiaDia } =
    useFirestoreCollection<Guardia>('guardias')
  const { data: patron, save: savePatronDoc } =
    useFirestoreDoc<GuardiaPatron>('guardia_patron', 'default', DEFAULT_GUARDIA_PATRON)

  // Edit modal state (día específico)
  const [selected, setSelected] = useState<string | null>(null)
  const [editIds, setEditIds] = useState<string[]>([])
  const [editEntrada, setEditEntrada] = useState('')
  const [editSalida, setEditSalida] = useState('')
  const [editNota, setEditNota] = useState('')

  // Modal de patrón semanal
  const [showPatron, setShowPatron] = useState(false)
  const [editPatron, setEditPatron] = useState<GuardiaPatron>({})

  const nonAdminMembers = members.filter(m => !m.isAdmin)
  const canEdit = session?.isAdmin ||
    (session && members.find(m => m.id === session.memberId)?.permissions.includes('guardias'))

  useEffect(() => {
    getMembers().then(setMembers)
  }, [])

  // Guardia efectiva para un día: override explícito si existe, si no, el patrón semanal
  function guardiaEfectiva(iso: string): { memberIds: string[]; entrada?: string; salida?: string; nota: string; esPatron: boolean } {
    const g = guardias.find(x => x.fecha === iso)
    if (g) return { memberIds: g.memberIds, entrada: g.entrada, salida: g.salida, nota: g.nota, esPatron: false }
    const dia = diaSemanaDeIso(iso)
    return { memberIds: patron[dia] ?? [], entrada: undefined, salida: undefined, nota: '', esPatron: true }
  }

  function openDay(iso: string) {
    if (!canEdit) return
    const ef = guardiaEfectiva(iso)
    setSelected(iso)
    setEditIds(ef.memberIds)
    setEditEntrada(ef.entrada ?? '')
    setEditSalida(ef.salida ?? '')
    setEditNota(ef.nota ?? '')
  }

  function openPatron() {
    if (!canEdit) return
    setEditPatron(patron)
    setShowPatron(true)
  }

  function togglePatronMember(dia: DiaSemana, memberId: string) {
    setEditPatron(prev => {
      const current = prev[dia] ?? []
      const next = current.includes(memberId) ? current.filter(x => x !== memberId) : [...current, memberId]
      return { ...prev, [dia]: next }
    })
  }

  async function savePatron() {
    await savePatronDoc(editPatron)
    setShowPatron(false)
  }

  function toggleMember(id: string) {
    setEditIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function saveDay() {
    if (!selected) return
    if (editIds.length === 0) {
      await removeGuardiaDia(selected)
    } else {
      await setGuardiaDia(selected, {
        fecha: selected,
        memberIds: editIds,
        entrada: editEntrada,
        salida: editSalida,
        nota: editNota.trim(),
      })
    }
    setSelected(null)
  }

  const days = calendarDays(year, month)
  const todayIso = isoDate(today.getFullYear(), today.getMonth(), today.getDate())
  const colorMap: Record<string, number> = {}
  members.forEach((m, i) => { colorMap[m.id] = i % MEMBER_COLORS.length })

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
  }

  const selectedDateLabel = selected
    ? new Date(selected + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl"
              style={{ background: 'rgba(136,144,210,0.1)', border: '1px solid rgba(136,144,210,0.2)' }}>
              <CalendarDays size={18} style={{ color: '#8890d2' }} />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-[0.2em] uppercase" style={{ color: S.silverBright }}>
                Guardias del Equipo
              </h1>
              <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>
                {canEdit ? 'Clic en un día para asignar personal y horario' : 'Vista de turnos del mes'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <button onClick={openPatron}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold mr-1"
                style={{ color: '#8890d2', border: '1px solid rgba(136,144,210,0.3)', background: 'rgba(136,144,210,0.08)' }}>
                <Repeat size={13} /> Patrón semanal
              </button>
            )}
            <button onClick={prevMonth} className="p-2 rounded-xl"
              style={{ color: S.silver, border: `1px solid ${S.border}` }}>
              <ChevronLeft size={15} />
            </button>
            <span className="text-sm font-bold min-w-36 text-center" style={{ color: S.silverBright }}>
              {MESES[month]} {year}
            </span>
            <button onClick={nextMonth} className="p-2 rounded-xl"
              style={{ color: S.silver, border: `1px solid ${S.border}` }}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-4">
          {nonAdminMembers.map(m => {
            const c = MEMBER_COLORS[colorMap[m.id]]
            return (
              <span key={m.id} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.text }} />
                {m.name.split(' · ').pop()?.split(' ')[0]}
              </span>
            )
          })}
        </div>

        {/* Calendar */}
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${S.border}` }}>
          <div className="grid grid-cols-7" style={{ borderBottom: `1px solid ${S.border}`, background: '#08080e' }}>
            {DIAS_COL.map(d => (
              <div key={d} className="py-2 text-center text-[10px] font-bold tracking-widest uppercase"
                style={{ color: S.silverDim }}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((cell, i) => {
              const guardia = cell.iso ? guardiaEfectiva(cell.iso) : null
              const isToday = cell.iso === todayIso
              const isWeekend = i % 7 >= 5
              return (
                <div key={i}
                  onClick={() => cell.iso && openDay(cell.iso)}
                  className="min-h-[88px] p-1.5 transition-colors"
                  style={{
                    borderRight: (i + 1) % 7 !== 0 ? `1px solid ${S.border}` : 'none',
                    borderBottom: i < days.length - 7 ? `1px solid ${S.border}` : 'none',
                    background: isToday ? 'rgba(136,144,210,0.07)' : isWeekend ? 'rgba(180,185,210,0.02)' : 'transparent',
                    cursor: cell.iso && canEdit ? 'pointer' : 'default',
                  }}>
                  {cell.date && (
                    <>
                      <p className="text-xs font-bold mb-1"
                        style={{
                          color: isToday ? '#8890d2' : isWeekend ? S.silver : S.silverDim,
                          textShadow: isToday ? '0 0 8px rgba(136,144,210,0.5)' : 'none',
                        }}>
                        {cell.date}{isToday && <span className="ml-1 text-[8px]">●</span>}
                      </p>

                      {guardia && guardia.memberIds.length > 0 && (
                        <div className="space-y-0.5">
                          {/* Horario de la guardia */}
                          {(guardia.entrada || guardia.salida) && (
                            <div className="flex items-center gap-0.5 mb-1">
                              <Clock size={8} style={{ color: '#8890d2', flexShrink: 0 }} />
                              <span className="text-[8px] font-mono" style={{ color: '#8890d2' }}>
                                {guardia.entrada && formatHora(guardia.entrada)}
                                {guardia.entrada && guardia.salida && '–'}
                                {guardia.salida && formatHora(guardia.salida)}
                              </span>
                            </div>
                          )}
                          {/* Miembros */}
                          {guardia.memberIds.slice(0, 3).map(id => {
                            const m = members.find(x => x.id === id)
                            if (!m) return null
                            const c = MEMBER_COLORS[colorMap[id]]
                            return (
                              <div key={id} className="text-[8px] px-1.5 py-0.5 rounded truncate flex items-center gap-0.5"
                                style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, opacity: guardia.esPatron ? 0.75 : 1 }}>
                                {m.name.split(' · ').pop()?.split(' ')[0]}
                              </div>
                            )
                          })}
                          {guardia.memberIds.length > 3 && (
                            <p className="text-[8px] pl-1" style={{ color: S.silverDim }}>
                              +{guardia.memberIds.length - 3} más
                            </p>
                          )}
                          {guardia.nota && (
                            <p className="text-[8px] italic truncate pl-0.5" style={{ color: S.silverDim }}>
                              {guardia.nota}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {!canEdit && (
          <p className="text-center text-xs mt-4" style={{ color: S.silverDim }}>
            Solo el administrador puede asignar guardias
          </p>
        )}
      </div>

      {/* ── Modal de edición ──────────────────────────────────────────────────── */}
      {selected && canEdit && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.88)' }}>
          <div className="w-full max-w-md mx-0 md:mx-4 rounded-t-3xl md:rounded-2xl overflow-hidden"
            style={{
              background: '#080810',
              border: '1px solid rgba(136,144,210,0.25)',
              boxShadow: '0 0 60px rgba(0,0,0,0.95)',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}>

            {/* Header modal */}
            <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
              style={{ borderBottom: `1px solid ${S.border}` }}>
              <CalendarDays size={15} style={{ color: '#8890d2' }} />
              <div className="flex-1">
                <p className="text-sm font-bold capitalize" style={{ color: S.silverBright }}>
                  {selectedDateLabel}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: S.silverDim }}>
                  Selecciona uno o más colaboradores
                </p>
              </div>
              <button onClick={() => setSelected(null)} style={{ color: S.silverDim }}>
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              {/* ── Horario de la guardia ─────────────────────────────── */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={12} style={{ color: '#8890d2' }} />
                  <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: S.silverDim }}>
                    Horario de la guardia
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[9px] mb-1.5 tracking-widest uppercase" style={{ color: S.silverDim }}>
                      Entrada
                    </p>
                    <input type="time" value={editEntrada}
                      onChange={e => setEditEntrada(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                      style={{ background: '#0a0a14', border: `1px solid ${editEntrada ? 'rgba(136,144,210,0.4)' : S.border}`, color: S.silverBright }} />
                  </div>
                  <div>
                    <p className="text-[9px] mb-1.5 tracking-widets uppercase" style={{ color: S.silverDim }}>
                      Salida
                    </p>
                    <input type="time" value={editSalida}
                      onChange={e => setEditSalida(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                      style={{ background: '#0a0a14', border: `1px solid ${editSalida ? 'rgba(136,144,210,0.4)' : S.border}`, color: S.silverBright }} />
                  </div>
                </div>
              </div>

              {/* ── Colaboradores ─────────────────────────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: S.silverDim }}>
                    Colaboradores en guardia
                  </p>
                  {editIds.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(136,144,210,0.15)', color: '#8890d2', border: '1px solid rgba(136,144,210,0.3)' }}>
                      {editIds.length} seleccionado{editIds.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {nonAdminMembers.map(m => {
                    const c = MEMBER_COLORS[colorMap[m.id]]
                    const on = editIds.includes(m.id)
                    // show member's schedule for this day if configured
                    const dayOfWeek = selected
                      ? ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'][
                          new Date(selected + 'T12:00:00').getDay()
                        ] as keyof NonNullable<typeof m.horario>
                      : null
                    const memberHorario = dayOfWeek && m.horario?.[dayOfWeek]

                    return (
                      <button key={m.id} onClick={() => toggleMember(m.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                        style={on
                          ? { background: c.bg, border: `1px solid ${c.border}` }
                          : { background: 'rgba(180,185,210,0.03)', border: `1px solid ${S.border}` }
                        }>
                        {/* Checkbox */}
                        <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                          style={on
                            ? { background: c.bg, border: `1.5px solid ${c.border}` }
                            : { background: 'rgba(180,185,210,0.05)', border: `1.5px solid ${S.border}` }
                          }>
                          {on && <Check size={11} style={{ color: c.text }} />}
                        </div>

                        {/* Info del miembro */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate"
                            style={{ color: on ? c.text : S.silver }}>
                            {m.name.split(' · ').pop()}
                          </p>
                          <p className="text-[9px] truncate" style={{ color: S.silverDim }}>
                            {m.role}
                          </p>
                        </div>

                        {/* Horario del miembro ese día */}
                        {memberHorario?.activo ? (
                          <div className="text-right flex-shrink-0">
                            <p className="text-[9px] font-mono" style={{ color: S.silverDim }}>
                              {memberHorario.entrada}
                            </p>
                            <p className="text-[9px] font-mono" style={{ color: S.silverDim }}>
                              {memberHorario.salida}
                            </p>
                          </div>
                        ) : (
                          <p className="text-[9px] flex-shrink-0" style={{ color: S.silverDim }}>
                            Sin turno
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── Nota ─────────────────────────────────────────────── */}
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>
                  Nota (opcional)
                </p>
                <input value={editNota} onChange={e => setEditNota(e.target.value)}
                  placeholder="Ej: Cobertura especial, junta, evento..."
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-xs"
                  style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-5 py-4 flex-shrink-0"
              style={{ borderTop: `1px solid ${S.border}` }}>
              <button onClick={() => setSelected(null)}
                className="flex-1 py-3 rounded-xl text-sm"
                style={{ color: S.silverDim, border: `1px solid ${S.border}` }}>
                Cancelar
              </button>
              <button onClick={saveDay}
                className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                style={{
                  background: editIds.length > 0 ? 'rgba(136,144,210,0.12)' : 'rgba(180,185,210,0.04)',
                  color: editIds.length > 0 ? '#8890d2' : S.silverDim,
                  border: `1px solid ${editIds.length > 0 ? 'rgba(136,144,210,0.3)' : S.border}`,
                }}>
                <Check size={14} />
                {editIds.length > 0 ? `Guardar guardia` : 'Sin personal (limpiar)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de patrón semanal ────────────────────────────────────────────── */}
      {showPatron && canEdit && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.88)' }}>
          <div className="w-full max-w-md mx-0 md:mx-4 rounded-t-3xl md:rounded-2xl overflow-hidden"
            style={{
              background: '#080810',
              border: '1px solid rgba(136,144,210,0.25)',
              boxShadow: '0 0 60px rgba(0,0,0,0.95)',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}>

            <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
              style={{ borderBottom: `1px solid ${S.border}` }}>
              <Repeat size={15} style={{ color: '#8890d2' }} />
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: S.silverBright }}>Patrón semanal de guardias</p>
                <p className="text-[10px] mt-0.5" style={{ color: S.silverDim }}>
                  Se repite cada semana salvo que cambies un día específico
                </p>
              </div>
              <button onClick={() => setShowPatron(false)} style={{ color: S.silverDim }}>
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {DIAS_SEMANA_ORDEN.map(({ key, label }) => (
                <div key={key}>
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: S.silverDim }}>
                    {label}
                  </p>
                  <div className="space-y-1.5">
                    {nonAdminMembers.map(m => {
                      const c = MEMBER_COLORS[colorMap[m.id]]
                      const on = (editPatron[key] ?? []).includes(m.id)
                      return (
                        <button key={m.id} onClick={() => togglePatronMember(key, m.id)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all"
                          style={on
                            ? { background: c.bg, border: `1px solid ${c.border}` }
                            : { background: 'rgba(180,185,210,0.03)', border: `1px solid ${S.border}` }
                          }>
                          <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                            style={on
                              ? { background: c.bg, border: `1.5px solid ${c.border}` }
                              : { background: 'rgba(180,185,210,0.05)', border: `1.5px solid ${S.border}` }
                            }>
                            {on && <Check size={9} style={{ color: c.text }} />}
                          </div>
                          <p className="text-xs font-medium truncate" style={{ color: on ? c.text : S.silver }}>
                            {m.name.split(' · ').pop()}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 px-5 py-4 flex-shrink-0"
              style={{ borderTop: `1px solid ${S.border}` }}>
              <button onClick={() => setShowPatron(false)}
                className="flex-1 py-3 rounded-xl text-sm"
                style={{ color: S.silverDim, border: `1px solid ${S.border}` }}>
                Cancelar
              </button>
              <button onClick={savePatron}
                className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                style={{ background: 'rgba(136,144,210,0.12)', color: '#8890d2', border: '1px solid rgba(136,144,210,0.3)' }}>
                <Check size={14} /> Guardar patrón
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
