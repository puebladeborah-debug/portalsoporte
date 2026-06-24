'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, BarChart2, CheckCircle2, XCircle, Clock, Trophy, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { getMembers, AttendanceRecord, TeamMember } from '@/lib/teamStore'

const S = {
  bg: '#060608', card: '#0e0e12', border: '#1a1a24',
  silver: '#b8bcc8', silverBright: '#d4d8e8', silverDim: '#3a3e4a',
  green: '#70c080', orange: '#d4a050', red: '#e07070',
}

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function AttendanceDashboard() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [view, setView] = useState<'calendar' | 'stats'>('calendar')
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  function loadData() {
    getMembers().then(setMembers)
    fetch('/api/attendance')
      .then(r => r.json())
      .then(data => setRecords(data))
      .catch(() => {})
  }

  useEffect(() => {
    loadData()
    // Auto-refresh every 15 seconds
    const interval = setInterval(loadData, 15000)
    return () => clearInterval(interval)
  }, [])

  // Filter records for current month
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
  const monthRecords = records.filter(r => r.date.startsWith(monthStr))

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const calendarCells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  function getDayRecords(day: number): AttendanceRecord[] {
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return monthRecords.filter(r => r.date === dateStr)
  }

  function getDayColor(recs: AttendanceRecord[]): string {
    if (recs.length === 0) return S.border
    const all = recs.every(r => r.status === 'completo')
    const some = recs.some(r => r.status === 'completo')
    if (all) return S.green
    if (some) return S.orange
    return S.red
  }

  // Stats per member
  type MemberStats = {
    member: TeamMember
    completos: number
    incompletos: number
    pendientes: number
    total: number
    score: number
    avgPct: number
  }

  const memberStats: MemberStats[] = members
    .filter(m => !m.isAdmin)
    .map(m => {
      const mRecords = monthRecords.filter(r => r.memberId === m.id)
      const completos = mRecords.filter(r => r.status === 'completo').length
      const incompletos = mRecords.filter(r => r.status === 'incompleto').length
      const pendientes = mRecords.filter(r => r.status === 'pending').length
      const total = mRecords.length
      const avgPct = total > 0
        ? Math.round(mRecords.reduce((sum, r) => sum + (r.tasksDone / r.tasksTotal) * 100, 0) / total)
        : 0
      const score = completos * 100 + incompletos * 60
      return { member: m, completos, incompletos, pendientes, total, score, avgPct }
    })
    .sort((a, b) => b.completos - a.completos || b.avgPct - a.avgPct)

  const maxCompletos = Math.max(1, ...memberStats.map(s => s.completos))

  const selectedDayRecords = selectedDay
    ? records.filter(r => r.date === selectedDay)
    : []

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="p-2 rounded-xl" style={{ color: S.silver, border: `1px solid ${S.border}` }}>
            <ArrowLeft size={16} />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold" style={{ color: S.silverBright }}>Registro de Asistencia</h1>
            <p className="text-xs" style={{ color: S.silverDim }}>Solo visible para administrador</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadData}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all"
              style={{ color: S.silverDim, border: `1px solid ${S.border}` }}
              title="Actualizar datos">
              <RefreshCw size={13} />
            </button>
            <button onClick={() => setView('calendar')}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all"
              style={view === 'calendar' ? { background: 'rgba(180,185,210,0.12)', color: S.silverBright, border: `1px solid rgba(180,185,210,0.22)` } : { color: S.silverDim, border: `1px solid ${S.border}` }}>
              <Calendar size={13} /> Calendario
            </button>
            <button onClick={() => setView('stats')}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all"
              style={view === 'stats' ? { background: 'rgba(180,185,210,0.12)', color: S.silverBright, border: `1px solid rgba(180,185,210,0.22)` } : { color: S.silverDim, border: `1px solid ${S.border}` }}>
              <BarChart2 size={13} /> Estadísticas
            </button>
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4 px-1">
          <button onClick={prevMonth} className="p-2 rounded-lg" style={{ color: S.silver, border: `1px solid ${S.border}` }}>
            <ChevronLeft size={16} />
          </button>
          <h2 className="text-base font-bold" style={{ color: S.silverBright }}>
            {MONTHS_ES[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-lg" style={{ color: S.silver, border: `1px solid ${S.border}` }}>
            <ChevronRight size={16} />
          </button>
        </div>

        {view === 'calendar' && (
          <>
            {/* Summary chips */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { label: 'Completos', count: monthRecords.filter(r=>r.status==='completo').length, color: S.green, icon: <CheckCircle2 size={14}/> },
                { label: 'Incompletos', count: monthRecords.filter(r=>r.status==='incompleto').length, color: S.orange, icon: <XCircle size={14}/> },
                { label: 'Pendientes', count: monthRecords.filter(r=>r.status==='pending').length, color: S.silverDim, icon: <Clock size={14}/> },
              ].map(chip => (
                <div key={chip.label} className="rounded-2xl p-3 text-center"
                  style={{ background: S.card, border: `1px solid ${S.border}` }}>
                  <div className="flex items-center justify-center gap-1 mb-1" style={{ color: chip.color }}>
                    {chip.icon}
                    <span className="text-xl font-bold">{chip.count}</span>
                  </div>
                  <p className="text-[10px]" style={{ color: S.silverDim }}>{chip.label}</p>
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="rounded-2xl overflow-hidden mb-4" style={{ background: S.card, border: `1px solid ${S.border}` }}>
              {/* Day headers */}
              <div className="grid grid-cols-7">
                {DAYS_ES.map(d => (
                  <div key={d} className="py-2 text-center text-[10px] font-bold tracking-wider"
                    style={{ color: S.silverDim, borderBottom: `1px solid ${S.border}` }}>
                    {d}
                  </div>
                ))}
              </div>
              {/* Day cells */}
              <div className="grid grid-cols-7">
                {calendarCells.map((day, i) => {
                  if (!day) return <div key={i} className="aspect-square" />
                  const recs = getDayRecords(day)
                  const color = getDayColor(recs)
                  const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
                  const isToday = dateStr === today.toISOString().split('T')[0]
                  const isSelected = selectedDay === dateStr
                  return (
                    <button key={i} onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                      className="aspect-square flex flex-col items-center justify-center gap-0.5 transition-all relative"
                      style={{
                        background: isSelected ? 'rgba(180,185,210,0.08)' : 'transparent',
                        borderBottom: `1px solid ${S.border}`,
                        borderRight: `1px solid ${S.border}`,
                      }}>
                      <span className={`text-xs font-medium ${isToday ? 'font-bold' : ''}`}
                        style={{ color: isToday ? S.silverBright : recs.length > 0 ? S.silver : S.silverDim }}>
                        {day}
                      </span>
                      {recs.length > 0 && (
                        <div className="flex gap-0.5">
                          {recs.slice(0,4).map((r, ri) => (
                            <div key={ri} className="w-1.5 h-1.5 rounded-full"
                              style={{ background: r.status === 'completo' ? S.green : r.status === 'incompleto' ? S.orange : S.silverDim }} />
                          ))}
                          {recs.length > 4 && <span className="text-[8px]" style={{ color: S.silverDim }}>+</span>}
                        </div>
                      )}
                      {isToday && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: S.silverBright }} />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 justify-center mb-4 text-[10px]" style={{ color: S.silverDim }}>
              {[{ c: S.green, l: 'Completo' }, { c: S.orange, l: 'Incompleto' }, { c: S.silverDim, l: 'Pendiente' }].map(x => (
                <div key={x.l} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: x.c }} />
                  {x.l}
                </div>
              ))}
            </div>

            {/* Day detail */}
            {selectedDay && selectedDayRecords.length > 0 && (
              <div className="rounded-2xl overflow-hidden" style={{ background: S.card, border: `1px solid rgba(180,185,210,0.15)` }}>
                <div className="px-4 py-3" style={{ borderBottom: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.03)' }}>
                  <p className="text-sm font-bold" style={{ color: S.silverBright }}>
                    {new Date(selectedDay + 'T12:00:00').toLocaleDateString('es-MX', { weekday:'long', day:'numeric', month:'long' })}
                  </p>
                </div>
                <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
                  {selectedDayRecords.map(rec => (
                    <div key={rec.id} className="flex items-center gap-3 px-4 py-3">
                      {rec.status === 'completo'
                        ? <CheckCircle2 size={16} style={{ color: S.green, flexShrink: 0 }} />
                        : rec.status === 'incompleto'
                        ? <XCircle size={16} style={{ color: S.orange, flexShrink: 0 }} />
                        : <Clock size={16} style={{ color: S.silverDim, flexShrink: 0 }} />
                      }
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: S.silverBright }}>{rec.memberName}</p>
                        <p className="text-xs" style={{ color: S.silverDim }}>{rec.memberRole}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold"
                          style={{ color: rec.status === 'completo' ? S.green : rec.status === 'incompleto' ? S.orange : S.silverDim }}>
                          {rec.tasksDone}/{rec.tasksTotal} tareas
                        </p>
                        <p className="text-[10px]" style={{ color: S.silverDim }}>
                          {Math.round((rec.tasksDone/rec.tasksTotal)*100)}% completado
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {view === 'stats' && (
          <>
            {/* Ranking */}
            <div className="rounded-2xl overflow-hidden mb-4" style={{ background: S.card, border: `1px solid ${S.border}` }}>
              <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.03)' }}>
                <Trophy size={15} style={{ color: '#d4a050' }} />
                <p className="text-sm font-bold" style={{ color: S.silverBright }}>Ranking del Mes</p>
                <span className="text-xs ml-auto" style={{ color: S.silverDim }}>{MONTHS_ES[month]}</span>
              </div>

              {memberStats.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs" style={{ color: S.silverDim }}>
                  Sin registros para este mes
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {memberStats.map((s, idx) => (
                    <div key={s.member.id}>
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="w-5 text-center text-xs font-bold"
                          style={{ color: idx === 0 ? '#d4a050' : idx === 1 ? S.silver : idx === 2 ? '#c87840' : S.silverDim }}>
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx+1}.`}
                        </span>
                        <div className="flex-1">
                          <p className="text-xs font-semibold" style={{ color: S.silverBright }}>{s.member.name}</p>
                          <p className="text-[10px]" style={{ color: S.silverDim }}>{s.member.role}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                              style={{ background: 'rgba(100,200,120,0.1)', color: S.green }}>
                              {s.completos} ✓
                            </span>
                            {s.incompletos > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                                style={{ background: 'rgba(220,150,50,0.1)', color: S.orange }}>
                                {s.incompletos} ✗
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] mt-0.5" style={{ color: S.silverDim }}>
                            {s.avgPct}% promedio
                          </p>
                        </div>
                      </div>
                      {/* Bar */}
                      <div className="ml-8">
                        <div style={{ height: '5px', background: S.border, borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${(s.completos / maxCompletos) * 100}%`,
                            background: idx === 0
                              ? 'linear-gradient(90deg,#70c080,#90e0a0)'
                              : 'linear-gradient(90deg,#3a3e4a,#b8bcc8)',
                            borderRadius: '3px',
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                        <p className="text-[9px] mt-1" style={{ color: S.silverDim }}>
                          {s.completos} días completos de {s.total} registros
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Detail table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: S.card, border: `1px solid ${S.border}` }}>
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.03)' }}>
                <p className="text-sm font-bold" style={{ color: S.silverBright }}>Detalle por Colaborador</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${S.border}` }}>
                      {['Colaborador', 'Completos', 'Incompletos', 'Prom. Tareas', 'Desempeño'].map(h => (
                        <th key={h} className="px-4 py-2 text-left font-medium" style={{ color: S.silverDim }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {memberStats.map((s, idx) => {
                      const perf = s.total === 0 ? 0 : Math.round((s.completos / s.total) * 100)
                      return (
                        <tr key={s.member.id} style={{ borderBottom: `1px solid ${S.border}` }}>
                          <td className="px-4 py-3">
                            <p style={{ color: S.silverBright }}>{s.member.name}</p>
                            <p style={{ color: S.silverDim, fontSize: '10px' }}>{s.member.role}</p>
                          </td>
                          <td className="px-4 py-3 font-bold" style={{ color: S.green }}>{s.completos}</td>
                          <td className="px-4 py-3 font-bold" style={{ color: s.incompletos > 0 ? S.orange : S.silverDim }}>{s.incompletos}</td>
                          <td className="px-4 py-3" style={{ color: S.silver }}>{s.avgPct}%</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div style={{ flex: 1, height: '4px', background: S.border, borderRadius: '2px' }}>
                                <div style={{ height: '100%', width: `${perf}%`, background: perf >= 80 ? S.green : perf >= 50 ? S.orange : S.red, borderRadius: '2px' }} />
                              </div>
                              <span style={{ color: perf >= 80 ? S.green : perf >= 50 ? S.orange : S.red, minWidth: '32px' }}>
                                {perf}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
