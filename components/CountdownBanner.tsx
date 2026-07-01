'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Trash2, Timer, Check, Pencil } from 'lucide-react'
import { useAuth } from './LoginGate'
import {
  getCountdownEvents, saveCountdownEvent, deleteCountdownEvent,
  CountdownEvent,
} from '@/lib/teamStore'

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

const COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  blue:   { bg: 'rgba(37,99,235,0.1)',   border: 'rgba(37,99,235,0.4)',   text: '#60a5fa', glow: '0 0 12px rgba(37,99,235,0.35)' },
  purple: { bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.4)',  text: '#a78bfa', glow: '0 0 12px rgba(139,92,246,0.35)' },
  amber:  { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.4)',  text: '#fbbf24', glow: '0 0 12px rgba(245,158,11,0.35)' },
  green:  { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.4)',  text: '#34d399', glow: '0 0 12px rgba(16,185,129,0.35)' },
  red:    { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.4)',   text: '#f87171', glow: '0 0 12px rgba(239,68,68,0.35)' },
}

function pad(n: number) { return String(Math.floor(n)).padStart(2, '0') }

function getCountdown(fechaFin: string) {
  const diff = new Date(fechaFin).getTime() - Date.now()
  if (diff <= 0) return null
  const totalSec = diff / 1000
  const dias  = Math.floor(totalSec / 86400)
  const horas = Math.floor((totalSec % 86400) / 3600)
  const mins  = Math.floor((totalSec % 3600) / 60)
  const segs  = Math.floor(totalSec % 60)
  return { dias, horas, mins, segs }
}

function getStatus(ev: CountdownEvent) {
  const now = Date.now()
  const inicio = new Date(ev.fechaInicio).getTime()
  const fin    = new Date(ev.fechaFin).getTime()
  if (now < inicio) return 'upcoming'   // aún no inicia
  if (now < fin)    return 'active'     // en curso
  return 'finished'
}

// ── Tarjeta de un evento ─────────────────────────────────────────────────────

function EventCard({ ev, canEdit, onEdit, onDelete }: {
  ev: CountdownEvent
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const c = COLORS[ev.color] ?? COLORS.blue
  const status = getStatus(ev)
  const targetDate = status === 'upcoming' ? ev.fechaInicio : ev.fechaFin
  const cd = getCountdown(targetDate)
  if (!cd && status === 'finished') return null

  return (
    <div className="relative rounded-2xl px-4 py-3 flex-shrink-0"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        boxShadow: c.glow,
        minWidth: '220px',
      }}>

      {/* Admin actions */}
      {canEdit && (
        <div className="absolute top-2 right-2 flex gap-1">
          <button onClick={onEdit} className="p-1 rounded-lg"
            style={{ color: S.silverDim, background: 'rgba(0,0,0,0.3)' }}>
            <Pencil size={10} />
          </button>
          <button onClick={onDelete} className="p-1 rounded-lg"
            style={{ color: '#f87171', background: 'rgba(0,0,0,0.3)' }}>
            <Trash2 size={10} />
          </button>
        </div>
      )}

      {/* Estado */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: c.text }} />
        <p className="text-[9px] tracking-widest uppercase font-bold" style={{ color: c.text }}>
          {status === 'upcoming' ? 'Próximo evento' : 'En curso — tiempo restante'}
        </p>
      </div>

      {/* Título */}
      <p className="text-sm font-bold mb-3 pr-8" style={{ color: S.silverBright }}>
        {ev.titulo}
      </p>

      {/* Contador */}
      {cd ? (
        <div className="flex items-end gap-2">
          {cd.dias > 0 && (
            <div className="text-center">
              <p className="text-3xl font-bold tabular-nums leading-none"
                style={{ color: c.text, fontFamily: 'Impact, "Arial Narrow Bold", sans-serif',
                  textShadow: `0 0 8px ${c.text}` }}>
                {pad(cd.dias)}
              </p>
              <p className="text-[8px] tracking-widest uppercase mt-0.5" style={{ color: c.text, opacity: 0.7 }}>
                {cd.dias === 1 ? 'día' : 'días'}
              </p>
            </div>
          )}
          {cd.dias > 0 && <p className="text-xl font-bold pb-3" style={{ color: c.text, opacity: 0.4 }}>:</p>}
          <div className="text-center">
            <p className="text-3xl font-bold tabular-nums leading-none"
              style={{ color: c.text, fontFamily: 'Impact, "Arial Narrow Bold", sans-serif',
                textShadow: `0 0 8px ${c.text}` }}>
              {pad(cd.horas)}
            </p>
            <p className="text-[8px] tracking-widest uppercase mt-0.5" style={{ color: c.text, opacity: 0.7 }}>hrs</p>
          </div>
          <p className="text-xl font-bold pb-3" style={{ color: c.text, opacity: 0.4 }}>:</p>
          <div className="text-center">
            <p className="text-3xl font-bold tabular-nums leading-none"
              style={{ color: c.text, fontFamily: 'Impact, "Arial Narrow Bold", sans-serif',
                textShadow: `0 0 8px ${c.text}` }}>
              {pad(cd.mins)}
            </p>
            <p className="text-[8px] tracking-widest uppercase mt-0.5" style={{ color: c.text, opacity: 0.7 }}>min</p>
          </div>
          <p className="text-xl font-bold pb-3" style={{ color: c.text, opacity: 0.4 }}>:</p>
          <div className="text-center">
            <p className="text-3xl font-bold tabular-nums leading-none"
              style={{ color: c.text, fontFamily: 'Impact, "Arial Narrow Bold", sans-serif',
                textShadow: `0 0 8px ${c.text}`, opacity: 0.65 }}>
              {pad(cd.segs)}
            </p>
            <p className="text-[8px] tracking-widest uppercase mt-0.5" style={{ color: c.text, opacity: 0.5 }}>seg</p>
          </div>
        </div>
      ) : (
        <p className="text-xs" style={{ color: c.text }}>¡Hoy es el día!</p>
      )}

      {/* Fechas */}
      <p className="text-[8px] mt-2 opacity-50" style={{ color: c.text }}>
        {new Date(ev.fechaInicio).toLocaleDateString('es-MX', { day:'numeric', month:'short', year:'numeric' })}
        {' – '}
        {new Date(ev.fechaFin).toLocaleDateString('es-MX', { day:'numeric', month:'short', year:'numeric' })}
      </p>
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────

const BLANK: Omit<CountdownEvent, 'id'> = {
  titulo: '', fechaInicio: '', fechaFin: '', color: 'blue',
}

export default function CountdownBanner() {
  const { member } = useAuth()
  const [events, setEvents] = useState<CountdownEvent[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...BLANK })
  const [editId, setEditId] = useState<string | null>(null)

  const canEdit = !!member?.isAdmin

  useEffect(() => { setEvents(getCountdownEvents()) }, [])

  function reload() { setEvents(getCountdownEvents()) }

  function openNew() {
    setForm({ ...BLANK })
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(ev: CountdownEvent) {
    setForm({ titulo: ev.titulo, fechaInicio: ev.fechaInicio, fechaFin: ev.fechaFin, color: ev.color })
    setEditId(ev.id)
    setShowForm(true)
  }

  function save() {
    if (!form.titulo.trim() || !form.fechaFin) return
    saveCountdownEvent({
      id: editId ?? `cd_${Date.now()}`,
      titulo: form.titulo.trim(),
      fechaInicio: form.fechaInicio || new Date().toISOString().slice(0, 16),
      fechaFin: form.fechaFin,
      color: form.color,
    })
    reload()
    setShowForm(false)
  }

  function remove(id: string) {
    deleteCountdownEvent(id)
    reload()
  }

  // Only show active / upcoming events
  const visible = events.filter(ev => getStatus(ev) !== 'finished')
  if (visible.length === 0 && !canEdit) return null

  return (
    <div className="mt-4 mb-2">
      {/* Section header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Timer size={11} style={{ color: S.silver }} />
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: S.silverDim }}>
            Fechas Importantes
          </p>
        </div>
        {canEdit && (
          <button onClick={openNew}
            className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg transition-colors"
            style={{ color: S.silver, border: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.05)' }}>
            <Plus size={11} /> Agregar
          </button>
        )}
      </div>

      {/* Cards carousel */}
      {visible.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none' }}>
          {visible.map(ev => (
            <EventCard key={ev.id} ev={ev} canEdit={canEdit}
              onEdit={() => openEdit(ev)}
              onDelete={() => remove(ev.id)} />
          ))}
        </div>
      ) : (
        <p className="text-[10px] py-3 text-center" style={{ color: S.silverDim }}>
          No hay fechas registradas aún
        </p>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.88)' }}>
          <div className="w-full max-w-sm mx-4 rounded-2xl overflow-hidden"
            style={{ background: S.bg, border: '1px solid rgba(180,185,210,0.2)', boxShadow: '0 0 60px rgba(0,0,0,0.95)' }}>

            <div className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: `1px solid ${S.border}` }}>
              <Timer size={15} style={{ color: S.silver }} />
              <p className="flex-1 text-sm font-bold" style={{ color: S.silverBright }}>
                {editId ? 'Editar evento' : 'Nueva fecha importante'}
              </p>
              <button onClick={() => setShowForm(false)} style={{ color: S.silverDim }}><X size={16} /></button>
            </div>

            <div className="px-5 py-4 space-y-4">

              {/* Título */}
              <div>
                <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Título del evento</p>
                <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ej: Lanzamiento de campaña, Junta anual..."
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                  style={{ background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }} />
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Fecha inicio</p>
                  <input type="datetime-local" value={form.fechaInicio}
                    onChange={e => setForm(f => ({ ...f, fechaInicio: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none text-xs"
                    style={{ background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }} />
                </div>
                <div>
                  <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Fecha fin *</p>
                  <input type="datetime-local" value={form.fechaFin}
                    onChange={e => setForm(f => ({ ...f, fechaFin: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none text-xs"
                    style={{ background: 'var(--th-input)', border: `1px solid !form.fechaFin ? 'rgba(220,70,70,0.4)' : ${S.border}`, color: S.silverBright }} />
                </div>
              </div>

              {/* Color */}
              <div>
                <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: S.silverDim }}>Color</p>
                <div className="flex gap-2">
                  {Object.entries(COLORS).map(([key, c]) => (
                    <button key={key} onClick={() => setForm(f => ({ ...f, color: key }))}
                      className="w-8 h-8 rounded-full transition-all"
                      style={{
                        background: c.bg,
                        border: form.color === key ? `2px solid ${c.text}` : `1px solid ${c.border}`,
                        boxShadow: form.color === key ? c.glow : 'none',
                      }}>
                      {form.color === key && (
                        <Check size={12} style={{ color: c.text, margin: '0 auto' }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm"
                  style={{ color: S.silverDim, border: `1px solid ${S.border}` }}>
                  Cancelar
                </button>
                <button onClick={save} disabled={!form.titulo.trim() || !form.fechaFin}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: form.titulo && form.fechaFin ? 'rgba(180,185,210,0.1)' : 'rgba(180,185,210,0.03)',
                    color: form.titulo && form.fechaFin ? S.silverBright : S.silverDim,
                    border: `1px solid ${form.titulo && form.fechaFin ? 'rgba(180,185,210,0.25)' : S.border}`,
                  }}>
                  <Check size={14} /> Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
