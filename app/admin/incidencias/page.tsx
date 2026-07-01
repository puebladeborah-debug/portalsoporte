'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/LoginGate'
import {
  getIncidencias, saveIncidencia, deleteIncidencia, getMembers,
  Incidencia, TipoIncidencia, TeamMember,
} from '@/lib/teamStore'
import {
  AlertTriangle, Plus, X, ChevronLeft, Trash2, Search, Filter,
  AlertCircle, Info, Shield,
} from 'lucide-react'

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

const TIPO_COLORS: Record<TipoIncidencia, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  Leve: { bg: 'rgba(220,190,60,0.08)', border: 'rgba(220,190,60,0.3)', text: '#dcbe3c', icon: <Info size={13} /> },
  Media: { bg: 'rgba(220,130,60,0.08)', border: 'rgba(220,130,60,0.3)', text: '#dc823c', icon: <AlertCircle size={13} /> },
  Grave: { bg: 'rgba(220,70,70,0.08)', border: 'rgba(220,70,70,0.3)', text: '#dc4646', icon: <Shield size={13} /> },
}

const EJEMPLOS_TIPO: Record<TipoIncidencia, string[]> = {
  Leve: [
    'Retraso ocasional en contestar mensajes internos (más de 2 hrs)',
    'Olvidar registrar una acción en el canal oficial',
    'Llegar tarde a una junta de forma aislada',
    'Error menor en uso de protocolos (sin impacto negativo)',
  ],
  Media: [
    'Reincidencia en retrasos o falta de comunicación',
    'Tomar decisiones que afectan a otro miembro sin informarlo',
    'No respetar un acuerdo de junta previamente establecido',
    'Cerrar un caso de cliente sin documentar la solución',
    'Ausencia injustificada en una junta importante',
    'Irse del lugar de trabajo sin avisar dentro de horario laboral',
    'Platicar en otras áreas fuera de trabajo en horario laboral',
    'Ayudar a otras áreas sin comunicar al líder',
  ],
  Grave: [
    'Reincidencia en la misma falta después de advertencia',
    'Aplicar un cambio de política sin autorización',
    'Dar respuesta al cliente contraria a protocolos',
    'Comunicar información sensible sin validación',
    'Filtrar información del equipo a otras áreas',
    'Faltas reiteradas de puntualidad que afectan al equipo',
    'Actitudes irrespetuosas hacia compañeros o clientes',
  ],
}

const BLANK: Omit<Incidencia, 'id' | 'createdAt' | 'createdBy'> = {
  fecha: new Date().toISOString().split('T')[0],
  colaboradorId: '',
  colaboradorName: '',
  area: '',
  tipoIncidencia: 'Leve',
  descripcion: '',
  acuerdoPrevio: '',
  accionCorrectiva: '',
  fechaLimite: '',
  observaciones: '',
}

export default function IncidenciasAdminPage() {
  const { session, member } = useAuth()
  const router = useRouter()

  const [incidencias, setIncidencias] = useState<Incidencia[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...BLANK })
  const [filterUser, setFilterUser] = useState('')
  const [filterTipo, setFilterTipo] = useState<TipoIncidencia | ''>('')
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (session && !member?.isAdmin) router.replace('/')
    setIncidencias(getIncidencias())
    getMembers().then(all => setMembers(all.filter(m => !m.isAdmin)))
  }, [session, member, router])

  function reload() { setIncidencias(getIncidencias()) }

  function handleMemberChange(id: string) {
    const m = members.find(x => x.id === id)
    setForm(f => ({ ...f, colaboradorId: id, colaboradorName: m?.name ?? '', area: m?.role ?? '' }))
  }

  function handleSubmit() {
    if (!form.colaboradorId || !form.descripcion) return
    const inc: Incidencia = {
      ...form,
      id: `inc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      createdBy: session?.memberId ?? 'admin',
    }
    saveIncidencia(inc)
    reload()
    setForm({ ...BLANK })
    setShowForm(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function handleDelete(id: string) {
    deleteIncidencia(id)
    reload()
    setConfirmDelete(null)
  }

  const filtered = incidencias
    .filter(i => !filterUser || i.colaboradorId === filterUser)
    .filter(i => !filterTipo || i.tipoIncidencia === filterTipo)
    .filter(i => !search || i.colaboradorName.toLowerCase().includes(search.toLowerCase()) || i.descripcion.toLowerCase().includes(search.toLowerCase()))

  if (!member?.isAdmin) return null

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <button onClick={() => router.push('/admin')}
          className="flex items-center gap-1.5 text-xs mb-6 transition-colors"
          style={{ color: S.silverDim }}>
          <ChevronLeft size={14} /> Panel de Administración
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(220,70,70,0.08)', border: '1px solid rgba(220,70,70,0.2)' }}>
              <AlertTriangle size={18} style={{ color: '#dc4646' }} />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-[0.2em] uppercase" style={{ color: S.silverBright }}>
                Incidencias del Equipo
              </h1>
              <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>
                {incidencias.length} registros totales
              </p>
            </div>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: 'rgba(220,70,70,0.1)', color: '#dc4646', border: '1px solid rgba(220,70,70,0.3)' }}>
            <Plus size={14} /> Nueva incidencia
          </button>
        </div>

        {saved && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-4 text-xs"
            style={{ background: 'rgba(100,200,120,0.08)', border: '1px solid rgba(100,200,120,0.25)', color: '#70c080' }}>
            ✓ Incidencia registrada correctamente
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="relative flex-1 min-w-36">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: S.silverDim }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: S.card, border: `1px solid ${S.border}`, color: S.silverBright }} />
          </div>
          <select value={filterUser} onChange={e => setFilterUser(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs outline-none"
            style={{ background: '#1a1a26', border: '1px solid rgba(180,185,210,0.25)', color: S.silverBright }}>
            <option value="">Todos los colaboradores</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select value={filterTipo} onChange={e => setFilterTipo(e.target.value as TipoIncidencia | '')}
            className="px-3 py-2 rounded-xl text-xs outline-none"
            style={{ background: '#1a1a26', border: '1px solid rgba(180,185,210,0.25)', color: S.silverBright }}>
            <option value="">Todos los tipos</option>
            <option value="Leve">Leve</option>
            <option value="Media">Media</option>
            <option value="Grave">Grave</option>
          </select>
          {(filterUser || filterTipo || search) && (
            <button onClick={() => { setFilterUser(''); setFilterTipo(''); setSearch('') }}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs"
              style={{ color: S.silverDim, border: `1px solid ${S.border}` }}>
              <Filter size={11} /> Limpiar
            </button>
          )}
        </div>

        {/* Stats por tipo */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {(['Leve', 'Media', 'Grave'] as TipoIncidencia[]).map(tipo => {
            const count = incidencias.filter(i => i.tipoIncidencia === tipo).length
            const c = TIPO_COLORS[tipo]
            return (
              <button key={tipo} onClick={() => setFilterTipo(filterTipo === tipo ? '' : tipo)}
                className="p-3 rounded-2xl text-left transition-all"
                style={{ background: filterTipo === tipo ? c.bg : S.card, border: `1px solid ${filterTipo === tipo ? c.border : S.border}` }}>
                <div className="flex items-center gap-1.5 mb-1" style={{ color: c.text }}>
                  {c.icon}
                  <span className="text-[10px] font-bold tracking-widest uppercase">{tipo}</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: c.text }}>{count}</p>
              </button>
            )
          })}
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12" style={{ color: S.silverDim }}>
              <AlertTriangle size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay incidencias registradas</p>
            </div>
          )}
          {filtered.map(inc => {
            const c = TIPO_COLORS[inc.tipoIncidencia]
            return (
              <div key={inc.id} className="p-4 rounded-2xl"
                style={{ background: S.card, border: `1px solid ${S.border}` }}>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
                        {c.icon} {inc.tipoIncidencia}
                      </span>
                      <span className="text-xs font-semibold" style={{ color: S.silverBright }}>
                        {inc.colaboradorName}
                      </span>
                      <span className="text-[10px]" style={{ color: S.silverDim }}>{inc.area}</span>
                      <span className="text-[10px] ml-auto" style={{ color: S.silverDim }}>
                        {new Date(inc.fecha + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed mb-2" style={{ color: '#9094a4' }}>
                      {inc.descripcion}
                    </p>
                    {inc.accionCorrectiva && (
                      <p className="text-[10px] leading-relaxed" style={{ color: S.silverDim }}>
                        <span style={{ color: S.silver }}>Acción correctiva:</span> {inc.accionCorrectiva}
                      </p>
                    )}
                    {inc.fechaLimite && (
                      <p className="text-[10px] mt-1" style={{ color: S.silverDim }}>
                        <span style={{ color: S.silver }}>Fecha límite:</span>{' '}
                        {new Date(inc.fechaLimite + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                    {inc.observaciones && (
                      <p className="text-[10px] mt-1 italic" style={{ color: S.silverDim }}>
                        Obs: {inc.observaciones}
                      </p>
                    )}
                  </div>
                  <button onClick={() => setConfirmDelete(inc.id)}
                    className="flex-shrink-0 p-2 rounded-xl transition-colors"
                    style={{ color: S.silverDim, border: `1px solid ${S.border}` }}
                    title="Eliminar">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Modal: Confirm delete ────────────────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="w-80 rounded-2xl overflow-hidden mx-4"
            style={{ background: '#080810', border: '1px solid rgba(220,70,70,0.25)' }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
              <p className="text-sm font-bold" style={{ color: S.silverBright }}>¿Eliminar esta incidencia?</p>
              <p className="text-xs mt-1" style={{ color: S.silverDim }}>Esta acción no se puede deshacer.</p>
            </div>
            <div className="flex gap-2 p-4">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(180,185,210,0.06)', color: S.silver, border: `1px solid ${S.border}` }}>
                Cancelar
              </button>
              <button onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(220,70,70,0.12)', color: '#dc4646', border: '1px solid rgba(220,70,70,0.3)' }}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Nueva incidencia ──────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center overflow-hidden"
          style={{ background: 'rgba(0,0,0,0.88)' }}>
          <div className="w-full max-w-lg rounded-t-3xl md:rounded-3xl overflow-hidden"
            style={{
              background: '#080810',
              border: '1px solid rgba(180,185,210,0.15)',
              boxShadow: '0 0 80px rgba(0,0,0,0.95)',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}>

            {/* Modal header */}
            <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
              style={{ borderBottom: `1px solid ${S.border}` }}>
              <AlertTriangle size={15} style={{ color: '#dc4646' }} />
              <p className="flex-1 text-sm font-bold" style={{ color: S.silverBright }}>
                Nueva Incidencia / Falta al Acuerdo
              </p>
              <button onClick={() => setShowForm(false)} style={{ color: S.silverDim }}>
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

              {/* Fecha */}
              <div>
                <label className="text-[10px] tracking-widest uppercase block mb-1.5" style={{ color: S.silverDim }}>
                  Fecha
                </label>
                <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                  style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
              </div>

              {/* Colaborador */}
              <div>
                <label className="text-[10px] tracking-widest uppercase block mb-1.5" style={{ color: S.silverDim }}>
                  Nombre del Colaborador *
                </label>
                <select value={form.colaboradorId} onChange={e => handleMemberChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                  style={{ background: '#1a1a26', border: `1px solid ${!form.colaboradorId ? 'rgba(220,70,70,0.4)' : 'rgba(180,185,210,0.25)'}`, color: S.silverBright }}>
                  <option value="">Seleccionar colaborador...</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>

              {/* Área */}
              <div>
                <label className="text-[10px] tracking-widest uppercase block mb-1.5" style={{ color: S.silverDim }}>
                  Área / Puesto
                </label>
                <input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                  placeholder="Se llena automático al seleccionar colaborador"
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                  style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
              </div>

              {/* Tipo */}
              <div>
                <label className="text-[10px] tracking-widest uppercase block mb-1.5" style={{ color: S.silverDim }}>
                  Tipo de Incidencia
                </label>
                <div className="flex gap-2 mb-2">
                  {(['Leve', 'Media', 'Grave'] as TipoIncidencia[]).map(tipo => {
                    const c = TIPO_COLORS[tipo]
                    return (
                      <button key={tipo} onClick={() => setForm(f => ({ ...f, tipoIncidencia: tipo }))}
                        className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                        style={form.tipoIncidencia === tipo
                          ? { background: c.bg, color: c.text, border: `1px solid ${c.border}` }
                          : { background: 'transparent', color: S.silverDim, border: `1px solid ${S.border}` }
                        }>
                        {tipo}
                      </button>
                    )
                  })}
                </div>
                {/* Ejemplos del tipo seleccionado */}
                <div className="rounded-xl p-3 text-[10px] space-y-1"
                  style={{ background: TIPO_COLORS[form.tipoIncidencia].bg, border: `1px solid ${TIPO_COLORS[form.tipoIncidencia].border}` }}>
                  <p className="font-bold mb-1.5" style={{ color: TIPO_COLORS[form.tipoIncidencia].text }}>
                    Ejemplos de incidencias {form.tipoIncidencia.toLowerCase()}s:
                  </p>
                  {EJEMPLOS_TIPO[form.tipoIncidencia].map((ej, i) => (
                    <p key={i} style={{ color: S.silver }}>• {ej}</p>
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="text-[10px] tracking-widest uppercase block mb-1.5" style={{ color: S.silverDim }}>
                  Descripción de la Incidencia *
                </label>
                <textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Describe qué pasó, cuándo y cómo ocurrió..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm resize-none"
                  style={{ background: '#0a0a14', border: `1px solid ${!form.descripcion ? 'rgba(220,70,70,0.3)' : S.border}`, color: S.silverBright }} />
              </div>

              {/* Acuerdo previo */}
              <div>
                <label className="text-[10px] tracking-widest uppercase block mb-1.5" style={{ color: S.silverDim }}>
                  Acuerdo Establecido Previamente
                </label>
                <textarea value={form.acuerdoPrevio} onChange={e => setForm(f => ({ ...f, acuerdoPrevio: e.target.value }))}
                  placeholder="¿Qué regla o acuerdo del reglamento se incumplió?"
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm resize-none"
                  style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
              </div>

              {/* Acción correctiva */}
              <div>
                <label className="text-[10px] tracking-widest uppercase block mb-1.5" style={{ color: S.silverDim }}>
                  Acción Correctiva / Compromiso del Colaborador
                </label>
                <textarea value={form.accionCorrectiva} onChange={e => setForm(f => ({ ...f, accionCorrectiva: e.target.value }))}
                  placeholder="¿Qué acción toma el colaborador para corregir esto?"
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm resize-none"
                  style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
              </div>

              {/* Fecha límite */}
              <div>
                <label className="text-[10px] tracking-widest uppercase block mb-1.5" style={{ color: S.silverDim }}>
                  Fecha Límite de Cumplimiento
                </label>
                <input type="date" value={form.fechaLimite} onChange={e => setForm(f => ({ ...f, fechaLimite: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                  style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
              </div>

              {/* Observaciones */}
              <div>
                <label className="text-[10px] tracking-widest uppercase block mb-1.5" style={{ color: S.silverDim }}>
                  Observaciones del Líder
                </label>
                <textarea value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                  placeholder="Notas adicionales, contexto o seguimiento..."
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm resize-none"
                  style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex gap-3 px-5 py-4 flex-shrink-0"
              style={{ borderTop: `1px solid ${S.border}` }}>
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl text-sm font-bold"
                style={{ background: 'rgba(180,185,210,0.06)', color: S.silver, border: `1px solid ${S.border}` }}>
                Cancelar
              </button>
              <button onClick={handleSubmit}
                disabled={!form.colaboradorId || !form.descripcion}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: form.colaboradorId && form.descripcion ? 'rgba(220,70,70,0.12)' : 'rgba(180,185,210,0.04)',
                  color: form.colaboradorId && form.descripcion ? '#dc4646' : S.silverDim,
                  border: `1px solid ${form.colaboradorId && form.descripcion ? 'rgba(220,70,70,0.3)' : S.border}`,
                  cursor: form.colaboradorId && form.descripcion ? 'pointer' : 'not-allowed',
                }}>
                Registrar Incidencia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
