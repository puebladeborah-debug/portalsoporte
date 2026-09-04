'use client'

import { useState } from 'react'
import { User, Check, HeartPulse } from 'lucide-react'
import { updateMember, getMemberFromServer, TeamMember } from '@/lib/teamStore'

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

const TIPOS_SANGRE = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'No sé']

type Props = {
  member: TeamMember
  soloLectura: boolean
  onSaved?: (fields: Partial<TeamMember>) => void
}

function Campo({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[9px] tracking-widest uppercase mb-1" style={{ color: S.silverDim }}>{label}</p>
      <p className="text-sm" style={{ color: value ? S.silverBright : S.silverDim }}>{value || '— Sin capturar —'}</p>
    </div>
  )
}

export default function DatosPersonalesSeccion({ member, soloLectura, onSaved }: Props) {
  const [editando, setEditando] = useState(false)

  const inicial = {
    telefonoPersonal: member.telefonoPersonal || '',
    telefonoTrabajo: member.telefonoTrabajo || '',
    direccion: member.direccion || '',
    contactoEmergenciaNombre: member.contactoEmergenciaNombre || '',
    contactoEmergenciaTelefono: member.contactoEmergenciaTelefono || '',
    alergias: member.alergias || '',
    tipoSangre: member.tipoSangre || '',
  }

  const [form, setForm] = useState(inicial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [guardado, setGuardado] = useState(false)

  function f(key: keyof typeof form, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function guardar() {
    setSaving(true)
    setError('')
    try {
      await updateMember(member.id, form)
      const confirmado = await getMemberFromServer(member.id)
      if (!confirmado || confirmado.telefonoPersonal !== form.telefonoPersonal) {
        throw new Error('No se pudo confirmar el guardado en el servidor. Revisa tu conexión e intenta de nuevo.')
      }
      onSaved?.(form)
      setEditando(false)
      setGuardado(true)
      setTimeout(() => setGuardado(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = { background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: S.card, border: `1px solid ${S.borderLight}` }}>
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
        <User size={16} style={{ color: S.silver }} />
        <div className="flex-1">
          <p className="text-sm font-bold" style={{ color: S.silverBright }}>Datos personales y de emergencia</p>
          <p className="text-[10px] mt-0.5" style={{ color: S.silverDim }}>Solo visible para ti y para el administrador</p>
        </div>
        {!soloLectura && !editando && (
          <button onClick={() => { setForm(inicial); setEditando(true) }}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: 'rgba(180,185,210,0.08)', color: S.silver, border: `1px solid ${S.border}` }}>
            Editar
          </button>
        )}
      </div>

      <div className="px-5 py-5">
        {!editando ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Teléfono personal" value={member.telefonoPersonal} />
              <Campo label="Teléfono de trabajo" value={member.telefonoTrabajo} />
            </div>
            <Campo label="Dirección de residencia" value={member.direccion} />
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Contacto de emergencia" value={member.contactoEmergenciaNombre} />
              <Campo label="Teléfono de emergencia" value={member.contactoEmergenciaTelefono} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Tipo de sangre" value={member.tipoSangre} />
              <Campo label="Alergias" value={member.alergias} />
            </div>
            {guardado && (
              <p className="text-[11px] font-semibold flex items-center gap-1.5" style={{ color: '#70c080' }}>
                <Check size={12} /> Guardado
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold mb-1 flex items-center gap-1.5" style={{ color: S.silver }}>
                <User size={12} /> Datos de contacto
              </p>
              <p className="text-[10px] leading-relaxed" style={{ color: S.silverDim }}>Esta información es para uso interno del equipo.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Teléfono personal</p>
                <input value={form.telefonoPersonal} onChange={e => f('telefonoPersonal', e.target.value)} placeholder="Ej: 3310000000"
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
              </div>
              <div>
                <p className="text-[9px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Teléfono de trabajo</p>
                <input value={form.telefonoTrabajo} onChange={e => f('telefonoTrabajo', e.target.value)} placeholder="Ej: extensión o directo"
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
              </div>
            </div>

            <div>
              <p className="text-[9px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Dirección de residencia</p>
              <input value={form.direccion} onChange={e => f('direccion', e.target.value)} placeholder="Calle, número, colonia, ciudad"
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
            </div>

            <div>
              <p className="text-xs font-bold mb-1" style={{ color: S.silver }}>Contacto de emergencia</p>
              <p className="text-[10px] leading-relaxed" style={{ color: S.silverDim }}>Persona a quien contactar en caso de emergencia durante el horario laboral.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Nombre completo</p>
                <input value={form.contactoEmergenciaNombre} onChange={e => f('contactoEmergenciaNombre', e.target.value)} placeholder="Nombre del contacto"
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
              </div>
              <div>
                <p className="text-[9px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Teléfono</p>
                <input value={form.contactoEmergenciaTelefono} onChange={e => f('contactoEmergenciaTelefono', e.target.value)} placeholder="Número de contacto"
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
              </div>
            </div>

            <div>
              <p className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: S.silver }}>
                <HeartPulse size={12} /> Información de salud
              </p>
              <p className="text-[9px] tracking-widest uppercase mb-2" style={{ color: S.silverDim }}>Tipo de sangre</p>
              <div className="grid grid-cols-5 gap-1.5 mb-4">
                {TIPOS_SANGRE.map(tipo => (
                  <button key={tipo} onClick={() => f('tipoSangre', tipo)}
                    className="py-2 rounded-xl text-xs font-bold transition-all"
                    style={form.tipoSangre === tipo
                      ? { background: 'rgba(180,185,210,0.15)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.35)' }
                      : { background: 'rgba(180,185,210,0.03)', color: S.silverDim, border: `1px solid ${S.border}` }}>
                    {tipo}
                  </button>
                ))}
              </div>
              <p className="text-[9px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Alergias (medicamentos, alimentos, etc.)</p>
              <textarea value={form.alergias} onChange={e => f('alergias', e.target.value)}
                placeholder="Escribe tus alergias conocidas, o escribe 'Ninguna'" rows={3}
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm resize-none" style={inputStyle} />
            </div>

            {error && <p className="text-[11px] font-semibold text-center" style={{ color: '#e07070' }}>{error}</p>}

            <div className="flex gap-2">
              <button onClick={() => setEditando(false)} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm" style={{ color: S.silverDim, border: `1px solid ${S.border}` }}>
                Cancelar
              </button>
              <button onClick={guardar} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{ background: 'rgba(100,200,120,0.15)', color: '#70c080', border: '1px solid rgba(100,200,120,0.35)', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
