'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Plus, X, Check, ChevronLeft, Trash2, AlertTriangle,
  Clock, MapPin, Bell, CheckCircle2, Calendar, FileText,
} from 'lucide-react'
import { useAuth } from '@/components/LoginGate'
import {
  getGiraEventos, saveGiraEvento, deleteGiraEvento,
  getGiraRegistros, saveGiraRegistro,
  getGiraAlerta, setGiraAlerta, clearGiraAlerta,
  emptyRegistro,
  GiraEvento, GiraRegistro, GiraCatData, RecepcionDocumentos,
  getMembers, TeamMember,
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

const CAT_COLORS = {
  completos:  { bg: 'rgba(92,184,122,0.1)',  border: 'rgba(92,184,122,0.35)',  text: '#5cb87a' },
  apartados:  { bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.35)',  text: '#fbbf24' },
  interesados:{ bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.35)',  text: '#60a5fa' },
}

// ── Componente de una categoría por miembro ──────────────────────────────────

function CatRow({ label, color, data, onChange }: {
  label: string
  color: typeof CAT_COLORS.completos
  data: GiraCatData
  onChange: (d: GiraCatData) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 py-1.5">
      {/* Checkbox */}
      <button onClick={() => onChange({ ...data, activo: !data.activo })}
        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
        style={data.activo
          ? { background: color.bg, border: `1.5px solid ${color.border}` }
          : { background: 'rgba(180,185,210,0.04)', border: `1.5px solid ${S.border}` }
        }>
        {data.activo && <Check size={11} style={{ color: color.text }} />}
      </button>

      {/* Label */}
      <span className="text-xs font-semibold w-20 flex-shrink-0"
        style={{ color: data.activo ? color.text : S.silverDim }}>
        {label}
      </span>

      {/* Arriba / Abajo */}
      <div className="flex rounded-lg overflow-hidden flex-shrink-0"
        style={{ border: `1px solid ${S.border}`, opacity: data.activo ? 1 : 0.35 }}>
        {(['arriba', 'abajo'] as const).map(pos => (
          <button key={pos} onClick={() => data.activo && onChange({ ...data, posicion: data.posicion === pos ? '' : pos })}
            className="px-2 py-1 text-[9px] font-bold capitalize transition-all"
            style={data.posicion === pos
              ? { background: color.bg, color: color.text }
              : { background: 'transparent', color: S.silverDim }
            }>
            {pos}
          </button>
        ))}
      </div>

      {/* Rango */}
      <div className="flex items-center gap-1 flex-shrink-0" style={{ opacity: data.activo ? 1 : 0.35 }}>
        <input value={data.desde} onChange={e => data.activo && onChange({ ...data, desde: e.target.value })}
          placeholder="Del" type="number" min="0"
          className="w-14 px-2 py-1 rounded-lg outline-none text-[10px] text-center"
          style={{ background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }} />
        <span className="text-[10px]" style={{ color: S.silverDim }}>–</span>
        <input value={data.hasta} onChange={e => data.activo && onChange({ ...data, hasta: e.target.value })}
          placeholder="Al" type="number" min="0"
          className="w-14 px-2 py-1 rounded-lg outline-none text-[10px] text-center"
          style={{ background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }} />
      </div>
    </div>
  )
}

// ── Recepción de Documentos (hojas recibidas por horario) ────────────────────
const RECEPCION_VACIA: RecepcionDocumentos = { apartados: 0, interesados: 0, completos: 0 }

function RecepcionDocumentosPanel({ titulo, data, onChange }: {
  titulo: string
  data: RecepcionDocumentos
  onChange: (d: RecepcionDocumentos) => void
}) {
  return (
    <div className="rounded-2xl overflow-hidden mb-3" style={{ background: S.card, border: '1px solid rgba(96,165,250,0.25)' }}>
      <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${S.border}`, background: 'rgba(96,165,250,0.04)' }}>
        <p className="text-xs font-bold flex items-center gap-1.5" style={{ color: '#60a5fa' }}>
          <FileText size={13} /> Recepción de Documentos — {titulo}
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: S.silverDim }}>Número de hojas recibidas</p>
      </div>
      <div className="px-4 py-3 grid grid-cols-3 gap-2">
        {([
          { key: 'apartados' as const,   label: 'Apartados' },
          { key: 'interesados' as const, label: 'Interesados' },
          { key: 'completos' as const,   label: 'Completos' },
        ]).map(({ key, label }) => (
          <div key={key}>
            <p className="text-[9px] tracking-widest uppercase mb-1 text-center"
              style={{ color: CAT_COLORS[key].text }}>{label}</p>
            <input type="number" min="0" value={data[key] || ''}
              onChange={e => onChange({ ...data, [key]: parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="w-full px-2 py-2 rounded-lg outline-none text-sm text-center font-bold"
              style={{ background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Vista de detalle del evento ──────────────────────────────────────────────

function EventoDetalle({ evento, members, canManage, onBack, session, onEventoUpdate }: {
  evento: GiraEvento
  members: TeamMember[]
  canManage: boolean
  onBack: () => void
  session: { memberId: string; memberName: string; isAdmin: boolean } | null
  onEventoUpdate: (ev: GiraEvento) => void
}) {
  const [registros, setRegistros] = useState<GiraRegistro[]>([])
  const [alerta, setAlerta] = useState<ReturnType<typeof getGiraAlerta>>(null)
  const [showDisclaimer, setShowDisclaimer] = useState(true)
  const [alertaAck, setAlertaAck] = useState(false)
  const [showEditHorarios, setShowEditHorarios] = useState(false)
  const [editH1, setEditH1] = useState(evento.horario1)
  const [editH2, setEditH2] = useState(evento.horario2 ?? '')

  function saveHorarios() {
    const updated = { ...evento, horario1: editH1, horario2: editH2.trim() || undefined }
    saveGiraEvento(updated)
    onEventoUpdate(updated)   // actualiza estado en el padre → re-render con nuevos datos
    setShowEditHorarios(false)
  }

  const nonAdminMembers = useMemo(() => members.filter(m => !m.isAdmin), [members])

  const loadData = useCallback(async () => {
    const regs = getGiraRegistros(evento.id)
    const membersCopy = (await getMembers()).filter(m => !m.isAdmin)
    const full = membersCopy.map(m =>
      regs.find(r => r.memberId === m.id) ?? emptyRegistro(evento.id, m)
    )
    setRegistros(full)
    setAlerta(getGiraAlerta(evento.id))
  }, [evento.id]) // sin nonAdminMembers en deps para evitar bucle

  useEffect(() => {
    loadData()
    const id = setInterval(loadData, 5000) // poll for alarm
    return () => clearInterval(id)
  }, [loadData])

  function updateRegistro(reg: GiraRegistro) {
    const updated = { ...reg, updatedAt: new Date().toISOString() }
    saveGiraRegistro(updated)
    setRegistros(prev => prev.map(r => r.id === updated.id ? updated : r))
  }

  function marcarCompleto(reg: GiraRegistro) {
    const updated = {
      ...reg,
      actividadCompletada: !reg.actividadCompletada,
      actividadCompletadaAt: !reg.actividadCompletada ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    }
    saveGiraRegistro(updated)
    setRegistros(prev => prev.map(r => r.id === updated.id ? updated : r))
  }

  function updateRecepcion(horario: 1 | 2, d: RecepcionDocumentos) {
    const updated = horario === 1 ? { ...evento, recepcion1: d } : { ...evento, recepcion2: d }
    saveGiraEvento(updated)
    onEventoUpdate(updated)
  }

  function triggerHojasListas() {
    const a = { eventoId: evento.id, triggeredBy: session?.memberName ?? 'Admin', triggeredAt: new Date().toISOString() }
    setGiraAlerta(a)
    setAlerta(a)
  }

  function ackAlerta() {
    setAlertaAck(true)
  }

  const isAdminLive = !!members.find(m => m.id === session?.memberId)?.isAdmin
  const showAlarmBanner = alerta && !alertaAck && !isAdminLive

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>

      {/* Alarma HOJAS LISTAS */}
      {showAlarmBanner && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center"
          style={{ background: 'rgba(220,30,30,0.92)' }}>
          <div className="text-center px-8 py-10 max-w-sm">
            <div className="text-6xl mb-4 animate-bounce">🚨</div>
            <p className="text-2xl font-black text-white mb-2 tracking-wide">¡HOJAS LISTAS!</p>
            <p className="text-white text-sm mb-6 opacity-90">
              {alerta.triggeredBy} marcó las hojas como listas.<br />
              Es momento de comenzar.
            </p>
            <button onClick={ackAlerta}
              className="px-8 py-3 rounded-2xl font-bold text-red-700 bg-white text-sm">
              Entendido — comenzar
            </button>
          </div>
        </div>
      )}

      {/* Disclaimer modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)' }}>
          <div className="w-full max-w-sm mx-4 rounded-3xl overflow-hidden text-center"
            style={{ background: '#0a0a10', border: '1px solid rgba(251,191,36,0.4)', boxShadow: '0 0 60px rgba(251,191,36,0.2)' }}>
            <div className="px-6 pt-8 pb-6">
              <div className="text-5xl mb-4">⚠️</div>
              <p className="text-xl font-black mb-2"
                style={{ color: '#fbbf24', textShadow: '0 0 20px rgba(251,191,36,0.5)' }}>
                RECUERDA HACER<br />DOUBLE CHECK
              </p>
              <p className="text-lg font-bold mb-4" style={{ color: '#f87171' }}>
                NO TE CONFÍES
              </p>
              <p className="text-xs leading-relaxed mb-6" style={{ color: S.silverDim }}>
                Verifica cada dato antes de registrarlo. Un error puede afectar al equipo y al evento.
              </p>
              <button onClick={() => setShowDisclaimer(false)}
                className="w-full py-3 rounded-2xl font-bold text-sm transition-all"
                style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.4)' }}>
                Entendido — continuar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs mb-5"
          style={{ color: S.silverDim }}>
          <ChevronLeft size={14} /> Volver a Giras
        </button>

        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold" style={{ color: S.silverBright }}>{evento.nombre}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs" style={{ color: S.silverDim }}>
                <Calendar size={12} /> {new Date(evento.fecha + 'T12:00:00').toLocaleDateString('es-MX', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>
                <Clock size={11} /> {evento.horario1}
              </span>
              {evento.horario2 && (
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>
                  <Clock size={11} /> {evento.horario2}
                </span>
              )}
              {canManage && !evento.horario2 && (
                <button onClick={() => { setEditH1(evento.horario1); setEditH2(''); setShowEditHorarios(true) }}
                  className="text-[9px] px-2 py-0.5 rounded-full transition-colors"
                  style={{ color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)', background: 'rgba(96,165,250,0.06)' }}>
                  + Agregar 2do horario
                </button>
              )}
              {canManage && evento.horario2 && (
                <button onClick={() => { setEditH1(evento.horario1); setEditH2(evento.horario2 ?? ''); setShowEditHorarios(true) }}
                  className="text-[9px] px-2 py-0.5 rounded-full transition-colors"
                  style={{ color: '#f87171', border: '1px solid rgba(220,70,70,0.3)', background: 'rgba(220,70,70,0.06)' }}>
                  ✕ Quitar 2do horario
                </button>
              )}
            </div>
          </div>

          {/* Hojas Listas button */}
          {canManage && (
            <button onClick={triggerHojasListas}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all"
              style={{ background: alerta ? 'rgba(220,70,70,0.2)' : 'rgba(251,191,36,0.12)', color: alerta ? '#f87171' : '#fbbf24', border: `1px solid ${alerta ? 'rgba(220,70,70,0.4)' : 'rgba(251,191,36,0.35)'}` }}>
              <Bell size={13} /> {alerta ? '🚨 Alerta activa' : 'Hojas Listas'}
            </button>
          )}
        </div>

        {/* Disclaimer permanente */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-5 text-xs"
          style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
          ⚠️ RECUERDA HACER DOUBLE CHECK — NO TE CONFÍES
        </div>

        {/* Recepción de Documentos — una vez por horario */}
        <RecepcionDocumentosPanel
          titulo={evento.horario1}
          data={evento.recepcion1 ?? RECEPCION_VACIA}
          onChange={d => updateRecepcion(1, d)}
        />
        {evento.horario2 && (
          <RecepcionDocumentosPanel
            titulo={evento.horario2}
            data={evento.recepcion2 ?? RECEPCION_VACIA}
            onChange={d => updateRecepcion(2, d)}
          />
        )}

        {/* Registros por miembro */}
        <div className="space-y-3">
          {registros.map(reg => {
            const m = members.find(x => x.id === reg.memberId)
            if (!m) return null
            const firstName = m.name.split(' · ').pop() || m.name
            const hasH2 = !!evento.horario2
            const EMPTY: GiraCatData = { activo: false, posicion: '', desde: '', hasta: '' }

            const allDone = reg.actividadCompletada && (!hasH2 || reg.h2actividadCompletada)

            return (
              <div key={reg.id} className="rounded-2xl overflow-hidden"
                style={{ background: S.card, border: `1px solid ${allDone ? 'rgba(92,184,122,0.3)' : S.border}` }}>

                {/* Member header */}
                <div className="flex items-center gap-3 px-4 py-3"
                  style={{ borderBottom: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.02)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright }}>
                    {m.initial}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: S.silverBright }}>{firstName}</p>
                    <p className="text-[10px]" style={{ color: S.silverDim }}>{m.role}</p>
                  </div>
                </div>

                {/* ── HORARIO 1 ─────────────────────────────── */}
                <div className="px-4 pt-2 pb-1">
                  <p className="text-[9px] tracking-widest uppercase mb-1 flex items-center gap-1"
                    style={{ color: '#60a5fa' }}>
                    <Clock size={9} /> {evento.horario1}
                  </p>
                  <div className="divide-y" style={{ borderColor: S.border }}>
                    {([
                      { key: 'completos' as const,   label: 'Completos'   },
                      { key: 'apartados' as const,   label: 'Apartados'   },
                      { key: 'interesados' as const, label: 'Interesados' },
                    ] as const).map(({ key, label }) => (
                      <CatRow key={key} label={label}
                        color={CAT_COLORS[key]}
                        data={reg[key]}
                        onChange={d => updateRegistro({ ...reg, [key]: d })} />
                    ))}
                  </div>
                  <div className="pt-2 pb-2">
                    <button onClick={() => marcarCompleto(reg)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all"
                      style={reg.actividadCompletada
                        ? { background: 'rgba(92,184,122,0.12)', color: '#5cb87a', border: '1px solid rgba(92,184,122,0.3)' }
                        : { background: 'rgba(180,185,210,0.05)', color: S.silverDim, border: `1px solid ${S.border}` }
                      }>
                      {reg.actividadCompletada
                        ? <><CheckCircle2 size={12} /> Completado — {new Date(reg.actividadCompletadaAt!).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</>
                        : <><Check size={12} /> Marcar horario 1 como completado</>
                      }
                    </button>
                  </div>
                </div>

                {/* ── HORARIO 2 (solo si existe) ─────────────── */}
                {hasH2 && (
                  <div className="px-4 pt-2 pb-3"
                    style={{ borderTop: `2px solid rgba(96,165,250,0.2)`, background: 'rgba(96,165,250,0.025)' }}>
                    <p className="text-[9px] tracking-widest uppercase mb-1 flex items-center gap-1"
                      style={{ color: '#60a5fa' }}>
                      <Clock size={9} /> {evento.horario2}
                    </p>
                    <div className="divide-y" style={{ borderColor: S.border }}>
                      {([
                        { key: 'h2completos' as const,   label: 'Completos'   },
                        { key: 'h2apartados' as const,   label: 'Apartados'   },
                        { key: 'h2interesados' as const, label: 'Interesados' },
                      ] as const).map(({ key, label }) => (
                        <CatRow key={key} label={label}
                          color={CAT_COLORS[label.toLowerCase() as 'completos' | 'apartados' | 'interesados']}
                          data={reg[key] ?? EMPTY}
                          onChange={d => updateRegistro({ ...reg, [key]: d })} />
                      ))}
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          const updated = {
                            ...reg,
                            h2actividadCompletada: !reg.h2actividadCompletada,
                            h2actividadCompletadaAt: !reg.h2actividadCompletada ? new Date().toISOString() : undefined,
                            updatedAt: new Date().toISOString(),
                          }
                          saveGiraRegistro(updated)
                          setRegistros(prev => prev.map(r => r.id === updated.id ? updated : r))
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all"
                        style={reg.h2actividadCompletada
                          ? { background: 'rgba(92,184,122,0.12)', color: '#5cb87a', border: '1px solid rgba(92,184,122,0.3)' }
                          : { background: 'rgba(180,185,210,0.05)', color: S.silverDim, border: `1px solid ${S.border}` }
                        }>
                        {reg.h2actividadCompletada
                          ? <><CheckCircle2 size={12} /> Completado — {new Date(reg.h2actividadCompletadaAt!).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</>
                          : <><Check size={12} /> Marcar horario 2 como completado</>
                        }
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {canManage && alerta && (
          <button onClick={() => { clearGiraAlerta(evento.id); setAlerta(null) }}
            className="w-full mt-4 py-2 rounded-xl text-xs text-center"
            style={{ color: S.silverDim, border: `1px solid ${S.border}` }}>
            Desactivar alarma
          </button>
        )}
      </div>

      {/* Modal editar horarios */}
      {showEditHorarios && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.88)' }}>
          <div className="w-full max-w-xs mx-4 rounded-2xl overflow-hidden"
            style={{ background: 'var(--th-inner)', border: '1px solid rgba(96,165,250,0.3)', boxShadow: '0 0 60px rgba(0,0,0,0.95)' }}>

            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
              <Clock size={15} style={{ color: '#60a5fa' }} />
              <p className="flex-1 text-sm font-bold" style={{ color: S.silverBright }}>Horarios del evento</p>
              <button onClick={() => setShowEditHorarios(false)} style={{ color: S.silverDim }}><X size={16} /></button>
            </div>

            <div className="px-5 py-5 space-y-4">

              {/* Horario 1 — siempre visible */}
              <div>
                <p className="text-[9px] tracking-widets uppercase mb-1.5 flex items-center gap-1"
                  style={{ color: '#60a5fa' }}>
                  <Clock size={9} /> Horario 1 *
                </p>
                <input type="time" value={editH1} onChange={e => setEditH1(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                  style={{ background: 'var(--th-input)', border: `1px solid rgba(96,165,250,0.35)`, color: S.silverBright }} />
              </div>

              {/* Horario 2 — toggle explícito */}
              {!editH2 ? (
                /* Sin segundo horario: botón para agregar */
                <button onClick={() => setEditH2('12:00')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
                  style={{ background: 'rgba(96,165,250,0.08)', color: '#60a5fa',
                    border: '1px dashed rgba(96,165,250,0.4)' }}>
                  <Plus size={13} /> Agregar segundo horario
                </button>
              ) : (
                /* Con segundo horario: input + botón eliminar */
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[9px] tracking-widets uppercase flex items-center gap-1"
                      style={{ color: '#60a5fa' }}>
                      <Clock size={9} /> Horario 2
                    </p>
                    <button onClick={() => setEditH2('')}
                      className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-lg font-bold"
                      style={{ color: '#f87171', border: '1px solid rgba(220,70,70,0.35)',
                        background: 'rgba(220,70,70,0.08)' }}>
                      <X size={9} /> Eliminar 2do horario
                    </button>
                  </div>
                  <input type="time" value={editH2} onChange={e => setEditH2(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                    style={{ background: 'var(--th-input)', border: `1px solid rgba(96,165,250,0.35)`, color: S.silverBright }} />
                  <p className="text-[9px] mt-1.5" style={{ color: S.silverDim }}>
                    Al guardar con 2do horario, aparecerá una segunda sección para cada miembro del equipo.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowEditHorarios(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm"
                  style={{ color: S.silverDim, border: `1px solid ${S.border}` }}>
                  Cancelar
                </button>
                <button onClick={saveHorarios} disabled={!editH1}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: editH1 ? 'rgba(96,165,250,0.15)' : 'rgba(180,185,210,0.04)',
                    color: editH1 ? '#60a5fa' : S.silverDim,
                    border: `1px solid ${editH1 ? 'rgba(96,165,250,0.4)' : S.border}`,
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

// ── Página principal de Giras ────────────────────────────────────────────────

const BLANK_EV = { nombre: '', fecha: '', horario1: '', horario2: '' }

export default function GirasPage() {
  const { session } = useAuth()
  const [eventos, setEventos] = useState<GiraEvento[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [selected, setSelected] = useState<GiraEvento | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...BLANK_EV })
  const [confirmDel, setConfirmDel] = useState<string | null>(null)

  const myGirasProfile = members.find(m => m.id === session?.memberId)
  const canManage = !!myGirasProfile?.isAdmin || !!myGirasProfile?.permissions.includes('giras')

  useEffect(() => {
    setEventos(getGiraEventos().sort((a, b) => a.fecha.localeCompare(b.fecha)))
    getMembers().then(setMembers)
  }, [])

  function reload() {
    setEventos(getGiraEventos().sort((a, b) => a.fecha.localeCompare(b.fecha)))
  }

  function saveEv() {
    if (!form.nombre.trim() || !form.fecha || !form.horario1) return
    saveGiraEvento({
      id: `gev_${Date.now()}`,
      nombre: form.nombre.trim(),
      fecha: form.fecha,
      horario1: form.horario1,
      horario2: form.horario2 || undefined,
      createdBy: session?.memberId ?? '',
      createdAt: new Date().toISOString(),
    })
    reload()
    setShowForm(false)
    setForm({ ...BLANK_EV })
  }

  if (selected) {
    return (
      <EventoDetalle
        evento={selected}
        members={members}
        canManage={!!canManage}
        onBack={() => setSelected(null)}
        session={session}
        onEventoUpdate={(ev) => {
          setSelected(ev)
          setEventos(prev => prev.map(e => e.id === ev.id ? ev : e))
        }}
      />
    )
  }

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)' }}>
              <MapPin size={18} style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-[0.2em] uppercase" style={{ color: S.silverBright }}>Giras</h1>
              <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>
                {eventos.length} evento{eventos.length !== 1 ? 's' : ''} registrado{eventos.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {canManage && (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>
              <Plus size={14} /> Nuevo evento
            </button>
          )}
        </div>

        {/* List */}
        {eventos.length === 0 ? (
          <div className="text-center py-16" style={{ color: S.silverDim }}>
            <MapPin size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No hay eventos de gira registrados</p>
            {canManage && <p className="text-xs mt-1">Crea el primero con el botón de arriba</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {eventos.map(ev => {
              const alerta = getGiraAlerta(ev.id)
              const fecha = new Date(ev.fecha + 'T12:00:00')
              const isPast = fecha < new Date()
              return (
                <div key={ev.id} className="rounded-2xl overflow-hidden transition-all"
                  style={{ background: S.card, border: `1px solid ${alerta ? 'rgba(251,191,36,0.4)' : S.border}`,
                    opacity: isPast ? 0.65 : 1 }}>
                  <button onClick={() => setSelected(ev)} className="w-full text-left px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {alerta && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold animate-pulse"
                            style={{ background: 'rgba(220,70,70,0.15)', color: '#f87171', border: '1px solid rgba(220,70,70,0.3)' }}>🚨 Alerta</span>}
                          {isPast && <span className="text-[9px] px-1.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(180,185,210,0.08)', color: S.silverDim }}>Pasado</span>}
                        </div>
                        <p className="font-bold text-sm" style={{ color: S.silverBright }}>{ev.nombre}</p>
                        <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>
                          {fecha.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] flex items-center gap-1"
                            style={{ color: '#60a5fa' }}>
                            <Clock size={10} /> {ev.horario1}
                          </span>
                          {ev.horario2 && (
                            <span className="text-[10px] flex items-center gap-1" style={{ color: '#60a5fa' }}>
                              <Clock size={10} /> {ev.horario2}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {canManage && (
                          <button onClick={e => { e.stopPropagation(); setConfirmDel(ev.id) }}
                            className="p-2 rounded-xl"
                            style={{ color: S.silverDim, border: `1px solid ${S.border}` }}>
                            <Trash2 size={13} />
                          </button>
                        )}
                        <div className="p-2 rounded-xl" style={{ color: '#60a5fa' }}>→</div>
                      </div>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Confirm delete modal */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.88)' }}>
          <div className="w-80 mx-4 rounded-2xl overflow-hidden"
            style={{ background: 'var(--th-inner)', border: '1px solid rgba(220,70,70,0.25)' }}>
            <div className="px-5 py-4">
              <p className="text-sm font-bold mb-1" style={{ color: S.silverBright }}>¿Eliminar este evento?</p>
              <p className="text-xs" style={{ color: S.silverDim }}>Se borrarán también todos los registros del equipo para este evento.</p>
            </div>
            <div className="flex gap-2 px-5 pb-4">
              <button onClick={() => setConfirmDel(null)} className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ color: S.silverDim, border: `1px solid ${S.border}` }}>Cancelar</button>
              <button onClick={() => { deleteGiraEvento(confirmDel); reload(); setConfirmDel(null) }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: 'rgba(220,70,70,0.12)', color: '#dc4646', border: '1px solid rgba(220,70,70,0.3)' }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New event form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ background: 'rgba(0,0,0,0.88)' }}>
          <div className="w-full max-w-sm mx-4 rounded-t-3xl md:rounded-2xl overflow-hidden"
            style={{ background: 'var(--th-inner)', border: '1px solid rgba(96,165,250,0.25)', boxShadow: '0 0 60px rgba(0,0,0,0.95)' }}>

            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
              <MapPin size={15} style={{ color: '#60a5fa' }} />
              <p className="flex-1 text-sm font-bold" style={{ color: S.silverBright }}>Nuevo evento de Gira</p>
              <button onClick={() => setShowForm(false)} style={{ color: S.silverDim }}><X size={16} /></button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div>
                <p className="text-[9px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Nombre del evento *</p>
                <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej: Gira Ciudad de México, Show Guadalajara..."
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                  style={{ background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }} />
              </div>
              <div>
                <p className="text-[9px] tracking-widets uppercase mb-1.5" style={{ color: S.silverDim }}>Fecha *</p>
                <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                  style={{ background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[9px] tracking-widets uppercase mb-1.5" style={{ color: S.silverDim }}>Horario 1 *</p>
                  <input type="time" value={form.horario1} onChange={e => setForm(f => ({ ...f, horario1: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                    style={{ background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }} />
                </div>
                <div>
                  <p className="text-[9px] tracking-widets uppercase mb-1.5" style={{ color: S.silverDim }}>Horario 2 (opcional)</p>
                  <input type="time" value={form.horario2} onChange={e => setForm(f => ({ ...f, horario2: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                    style={{ background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }} />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm"
                  style={{ color: S.silverDim, border: `1px solid ${S.border}` }}>Cancelar</button>
                <button onClick={saveEv}
                  disabled={!form.nombre.trim() || !form.fecha || !form.horario1}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: form.nombre && form.fecha && form.horario1 ? 'rgba(96,165,250,0.12)' : 'rgba(180,185,210,0.04)',
                    color: form.nombre && form.fecha && form.horario1 ? '#60a5fa' : S.silverDim,
                    border: `1px solid ${form.nombre && form.fecha && form.horario1 ? 'rgba(96,165,250,0.3)' : S.border}`,
                  }}>
                  <Check size={14} /> Crear evento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
