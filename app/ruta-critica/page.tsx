'use client'

import { useState, useEffect } from 'react'
import { Route, Plus, X, Pencil, Trash2, ListChecks, ShieldAlert } from 'lucide-react'
import { getMembers, updateMember, TeamMember, EXEC_IDS } from '@/lib/teamStore'
import { useAuth } from '@/components/LoginGate'

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

// Una "actividad" es simplemente una tarea dentro del arreglo tasks[] de una
// persona — memberId + index la ubican dentro de ese arreglo. Esta pestaña es
// solo OTRA VISTA/EDITOR sobre ese mismo campo (el que ya se ve en Equipo →
// editar perfil → tareas), así que asignar aquí SIEMPRE actualiza de verdad
// el perfil de esa persona, porque es literalmente el mismo dato.
type Actividad = { memberId: string; index: number; texto: string }

function nombreCorto(nombre: string) {
  return nombre.includes(' · ') ? nombre.split(' · ').pop()! : nombre
}

function ActividadModal({ item, miembros, onClose, onSave, onDelete }: {
  item: Actividad | null
  miembros: TeamMember[]
  onClose: () => void
  onSave: (texto: string, asignadoA: string) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const [texto, setTexto] = useState(item?.texto || '')
  const [asignadoA, setAsignadoA] = useState(item?.memberId || miembros[0]?.id || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmarBorrar, setConfirmarBorrar] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const inputStyle = { background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }
  const valido = texto.trim() && asignadoA

  async function guardar() {
    if (!valido) return
    setSaving(true)
    setError('')
    try {
      await onSave(texto.trim(), asignadoA)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
      setSaving(false)
    }
  }

  async function eliminar() {
    if (!onDelete) return
    setDeleting(true)
    setError('')
    try {
      await onDelete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar')
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,var(--th-overlay-alpha))', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--th-inner)', border: '1px solid rgba(180,185,210,0.2)', boxShadow: '0 0 80px rgba(0,0,0,0.9)', maxHeight: '88vh' }}>

        <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${S.border}` }}>
          <p className="flex-1 text-sm font-bold" style={{ color: S.silverBright }}>
            {item ? 'Editar actividad' : 'Nueva actividad'}
          </p>
          <button onClick={onClose} style={{ color: S.silverDim }}><X size={16} /></button>
        </div>

        <div className="px-5 py-5 space-y-4 overflow-y-auto">
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Actividad</p>
            <textarea value={texto} onChange={e => setTexto(e.target.value)} rows={2}
              placeholder="ej. Revisar Excel de renovaciones"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm resize-none" style={inputStyle} />
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Asignar a</p>
            <div className="space-y-1.5">
              {miembros.map(m => (
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

          {error && <p className="text-[11px] font-semibold text-center" style={{ color: '#e07070' }}>{error}</p>}
        </div>

        <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${S.border}` }}>
          {confirmarBorrar ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setConfirmarBorrar(false)} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold"
                style={{ color: S.silverDim, border: `1px solid ${S.border}` }}>
                Cancelar
              </button>
              <button onClick={eliminar} disabled={deleting}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(220,80,80,0.15)', color: '#e07070', border: '1px solid rgba(220,80,80,0.35)', opacity: deleting ? 0.6 : 1 }}>
                <Trash2 size={13} /> {deleting ? 'Eliminando…' : '¿Seguro? Eliminar'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {item && onDelete && (
                <button onClick={() => setConfirmarBorrar(true)}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
                  style={{ color: '#e07070', border: '1px solid rgba(220,80,80,0.25)', background: 'rgba(220,80,80,0.06)' }}>
                  <Trash2 size={13} /> Eliminar
                </button>
              )}
              <button onClick={guardar} disabled={!valido || saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)', opacity: !valido || saving ? 0.5 : 1 }}>
                {saving ? 'Guardando…' : item ? 'Guardar cambios' : 'Agregar actividad'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RutaCriticaPage() {
  const { member: yo } = useAuth()
  const [miembros, setMiembros] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'new' | Actividad | null>(null)
  const [error, setError] = useState('')

  async function cargar() {
    const m = await getMembers()
    setMiembros(m)
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const asignables = miembros.filter(m => !EXEC_IDS.includes(m.id))
  const totalActividades = asignables.reduce((acc, m) => acc + m.tasks.length, 0)

  // Vuelve a leer del servidor justo antes de escribir (evita pisar un
  // cambio que se haya hecho desde Equipo mientras esta pestaña seguía abierta).
  async function conFresh<T>(fn: (fresh: TeamMember[]) => Promise<T>): Promise<T> {
    const fresh = await getMembers()
    return fn(fresh)
  }

  function ubicar(fresh: TeamMember[], original: Actividad) {
    const m = fresh.find(x => x.id === original.memberId)
    if (!m) throw new Error('No se encontró a esa persona — puede que ya no esté en el equipo.')
    // Si el índice ya no coincide con el texto original (alguien más lo
    // editó mientras tanto), se busca por texto como respaldo.
    const idx = m.tasks[original.index] === original.texto ? original.index : m.tasks.indexOf(original.texto)
    if (idx === -1) throw new Error('Esta actividad ya no existe — puede que alguien más la haya editado o borrado.')
    return { m, idx }
  }

  async function guardarActividad(original: Actividad | null, texto: string, asignadoA: string) {
    await conFresh(async fresh => {
      if (!original) {
        const destino = fresh.find(x => x.id === asignadoA)
        if (!destino) throw new Error('No se encontró a esa persona')
        await updateMember(asignadoA, { tasks: [...destino.tasks, texto] })
        return
      }
      const { m: origen, idx } = ubicar(fresh, original)
      if (original.memberId === asignadoA) {
        const tasks = [...origen.tasks]
        tasks[idx] = texto
        await updateMember(asignadoA, { tasks })
      } else {
        const destino = fresh.find(x => x.id === asignadoA)
        if (!destino) throw new Error('No se encontró a esa persona')
        const tasksOrigen = origen.tasks.filter((_, i) => i !== idx)
        const tasksDestino = [...destino.tasks, texto]
        await updateMember(original.memberId, { tasks: tasksOrigen })
        await updateMember(asignadoA, { tasks: tasksDestino })
      }
    })
    await cargar()
    setModal(null)
  }

  async function eliminarActividad(item: Actividad) {
    await conFresh(async fresh => {
      const { m, idx } = ubicar(fresh, item)
      await updateMember(item.memberId, { tasks: m.tasks.filter((_, i) => i !== idx) })
    })
    await cargar()
    setModal(null)
  }

  if (yo && !yo.isAdmin) {
    return (
      <div style={{ background: S.bg, minHeight: '100vh' }} className="flex items-center justify-center px-6">
        <div className="text-center max-w-xs">
          <ShieldAlert size={32} className="mx-auto mb-3 opacity-30" style={{ color: S.silverDim }} />
          <p className="text-sm font-semibold" style={{ color: S.silverBright }}>Solo un administrador puede ver la Ruta Crítica</p>
          <p className="text-xs mt-1.5" style={{ color: S.silverDim }}>Aquí se asignan las tareas de todo el equipo.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6 flex items-center gap-2">
          <Route size={20} style={{ color: S.silver }} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: S.silverBright }}>Ruta Crítica</h1>
            <p className="text-sm mt-1" style={{ color: S.silverDim }}>
              {totalActividades} actividades · asignar aquí actualiza directo el perfil de cada quien
            </p>
          </div>
        </div>

        <button onClick={() => setModal('new')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-5 text-sm font-bold transition-all"
          style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)' }}>
          <Plus size={16} /> Nueva actividad
        </button>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-xl text-[11px] leading-relaxed"
            style={{ background: 'rgba(220,80,80,0.08)', border: '1px solid rgba(220,80,80,0.25)', color: '#e07070' }}>
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-sm py-10" style={{ color: S.silverDim }}>Cargando…</p>
        ) : (
          <div className="space-y-4">
            {asignables.map(m => (
              <div key={m.id} className="rounded-2xl overflow-hidden" style={{ background: S.card, border: `1px solid ${S.borderLight}` }}>
                <div className="flex items-center gap-2.5 px-5 py-3" style={{ borderBottom: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.02)' }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                    style={{ background: 'rgba(180,185,210,0.1)', color: S.silver }}>
                    {m.initial}
                  </div>
                  <p className="flex-1 text-sm font-bold" style={{ color: S.silverBright }}>{nombreCorto(m.name)}</p>
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: S.silverDim }}>
                    <ListChecks size={11} /> {m.tasks.length}
                  </span>
                </div>
                {m.tasks.length === 0 ? (
                  <p className="text-xs px-5 py-3" style={{ color: S.silverDim }}>Sin actividades asignadas</p>
                ) : (
                  <div className="p-2.5 space-y-1.5">
                    {m.tasks.map((texto, index) => (
                      <div key={index} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: 'var(--th-inner)', border: `1px solid ${S.border}` }}>
                        <p className="flex-1 text-xs" style={{ color: S.silver }}>{texto}</p>
                        <button onClick={() => setModal({ memberId: m.id, index, texto })}
                          className="w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center transition-all"
                          style={{ background: 'rgba(180,185,210,0.06)', border: `1px solid ${S.border}`, color: S.silverDim }}>
                          <Pencil size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <ActividadModal
          item={modal === 'new' ? null : modal}
          miembros={asignables}
          onClose={() => setModal(null)}
          onSave={async (texto, asignadoA) => {
            setError('')
            try {
              await guardarActividad(modal === 'new' ? null : modal, texto, asignadoA)
            } catch (err) {
              setError(err instanceof Error ? err.message : 'No se pudo guardar')
              throw err
            }
          }}
          onDelete={modal !== 'new' ? async () => {
            setError('')
            try {
              await eliminarActividad(modal as Actividad)
            } catch (err) {
              setError(err instanceof Error ? err.message : 'No se pudo eliminar')
              throw err
            }
          } : undefined}
        />
      )}
    </div>
  )
}
