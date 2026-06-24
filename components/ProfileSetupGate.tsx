'use client'

import { useState } from 'react'
import Image from 'next/image'
import { User, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react'
import { getMembers, saveMembers } from '@/lib/teamStore'

const S = {
  bg: '#040406', card: '#080810', border: '#1a1a24',
  borderActive: 'rgba(180,185,210,0.22)',
  silver: '#b8bcc8', silverBright: '#d4d8e8', silverDim: '#3a3e4a',
}

const TIPOS_SANGRE = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'No sé']

type Props = { memberId: string; memberName: string; onDone: () => void }

export default function ProfileSetupGate({ memberId, memberName, onDone }: Props) {
  const displayName = memberName.split(' · ').pop() || memberName
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)

  const [form, setForm] = useState({
    telefonoPersonal: '',
    telefonoTrabajo: '',
    direccion: '',
    contactoEmergenciaNombre: '',
    contactoEmergenciaTelefono: '',
    alergias: '',
    tipoSangre: '',
  })

  function f(key: keyof typeof form, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function save() {
    const members = await getMembers()
    const updated = members.map(m => {
      if (m.id !== memberId) return m
      return { ...m, ...form, perfilCompleto: true }
    })
    await saveMembers(updated)
    setDone(true)
    setTimeout(onDone, 1800)
  }

  const step1Valid = form.telefonoPersonal.trim().length >= 7
  const step2Valid = form.contactoEmergenciaNombre.trim().length >= 2 && form.contactoEmergenciaTelefono.trim().length >= 7
  const step3Valid = form.tipoSangre !== ''

  if (done) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center" style={{ background: S.bg }}>
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <CheckCircle2 size={52} style={{ color: '#70c080' }} />
          <p className="text-lg font-bold" style={{ color: S.silverBright }}>¡Perfil completado!</p>
          <p className="text-sm" style={{ color: S.silverDim }}>Entrando al portal, {displayName}…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-hidden"
      style={{ background: 'rgba(4,4,6,0.98)' }}>

      <div className="w-full max-w-sm mx-4 rounded-3xl overflow-hidden flex flex-col"
        style={{
          background: S.card,
          border: '1px solid rgba(180,185,210,0.15)',
          boxShadow: '0 0 80px rgba(0,0,0,0.95)',
          maxHeight: '92vh',
        }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.02)' }}>
          <Image src="/logo.jpg" alt="Club Sinergetico" width={34} height={34} className="rounded-xl" />
          <div className="flex-1">
            <p className="text-xs font-bold tracking-[0.2em] uppercase"
              style={{ background: 'linear-gradient(135deg,#d4d8e8,#8890a8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Completa tu perfil
            </p>
            <p className="text-[9px] tracking-widest mt-0.5" style={{ color: S.silverDim }}>
              Paso {step} de 3 · {displayName}
            </p>
          </div>
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ background: i <= step ? S.silverBright : S.silverDim }} />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

          {/* ── PASO 1: Teléfonos + Dirección ── */}
          {step === 1 && (
            <>
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: S.silver }}>
                  <User size={12} className="inline mr-1" />Datos de contacto
                </p>
                <p className="text-[10px] leading-relaxed" style={{ color: S.silverDim }}>
                  Esta información es para uso interno del equipo.
                </p>
              </div>

              {[
                { label: 'Teléfono personal *', key: 'telefonoPersonal' as const, placeholder: 'Ej: 3310000000', type: 'tel' },
                { label: 'Teléfono de trabajo', key: 'telefonoTrabajo' as const, placeholder: 'Ej: extensión o directo', type: 'tel' },
                { label: 'Dirección de residencia', key: 'direccion' as const, placeholder: 'Calle, número, colonia, ciudad', type: 'text' },
              ].map(field => (
                <div key={field.key}>
                  <p className="text-[9px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>{field.label}</p>
                  <input
                    type={field.type}
                    value={form[field.key]}
                    onChange={e => f(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                    style={{
                      background: '#05050a',
                      border: `1px solid ${form[field.key] ? 'rgba(180,185,210,0.25)' : S.border}`,
                      color: S.silverBright,
                    }}
                  />
                </div>
              ))}
            </>
          )}

          {/* ── PASO 2: Contacto de emergencia ── */}
          {step === 2 && (
            <>
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: S.silver }}>Contacto de emergencia</p>
                <p className="text-[10px] leading-relaxed" style={{ color: S.silverDim }}>
                  Persona a quien contactar en caso de emergencia durante el horario laboral.
                </p>
              </div>
              {[
                { label: 'Nombre completo *', key: 'contactoEmergenciaNombre' as const, placeholder: 'Nombre del contacto', type: 'text' },
                { label: 'Teléfono *', key: 'contactoEmergenciaTelefono' as const, placeholder: 'Número de contacto', type: 'tel' },
              ].map(field => (
                <div key={field.key}>
                  <p className="text-[9px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>{field.label}</p>
                  <input
                    type={field.type}
                    value={form[field.key]}
                    onChange={e => f(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                    style={{
                      background: '#05050a',
                      border: `1px solid ${form[field.key] ? 'rgba(180,185,210,0.25)' : S.border}`,
                      color: S.silverBright,
                    }}
                  />
                </div>
              ))}
            </>
          )}

          {/* ── PASO 3: Salud ── */}
          {step === 3 && (
            <>
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: S.silver }}>Información de salud</p>
                <p className="text-[10px] leading-relaxed" style={{ color: S.silverDim }}>
                  Solo visible para el administrador en caso de emergencia médica.
                </p>
              </div>

              <div>
                <p className="text-[9px] tracking-widest uppercase mb-2" style={{ color: S.silverDim }}>Tipo de sangre *</p>
                <div className="grid grid-cols-3 gap-2">
                  {TIPOS_SANGRE.map(tipo => (
                    <button key={tipo} onClick={() => f('tipoSangre', tipo)}
                      className="py-2 rounded-xl text-xs font-bold transition-all"
                      style={form.tipoSangre === tipo
                        ? { background: 'rgba(180,185,210,0.15)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.35)' }
                        : { background: 'rgba(180,185,210,0.03)', color: S.silverDim, border: `1px solid ${S.border}` }
                      }>
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[9px] tracking-widets uppercase mb-1.5" style={{ color: S.silverDim }}>Alergias (medicamentos, alimentos, etc.)</p>
                <textarea
                  value={form.alergias}
                  onChange={e => f('alergias', e.target.value)}
                  placeholder="Escribe tus alergias conocidas, o escribe 'Ninguna'"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm resize-none"
                  style={{ background: '#05050a', border: `1px solid ${S.border}`, color: S.silverBright }}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex-shrink-0 space-y-2"
          style={{ borderTop: `1px solid ${S.border}` }}>
          <div className="flex gap-3">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm transition-all"
                style={{ color: S.silverDim, border: `1px solid ${S.border}` }}>
                <ChevronLeft size={14} /> Atrás
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={step === 1 ? !step1Valid : !step2Valid}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: (step === 1 ? step1Valid : step2Valid) ? 'rgba(180,185,210,0.12)' : 'rgba(180,185,210,0.04)',
                  color: (step === 1 ? step1Valid : step2Valid) ? S.silverBright : S.silverDim,
                  border: `1px solid ${(step === 1 ? step1Valid : step2Valid) ? 'rgba(180,185,210,0.3)' : S.border}`,
                }}>
                Siguiente <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={save}
                disabled={!step3Valid}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: step3Valid ? 'rgba(100,200,120,0.15)' : 'rgba(180,185,210,0.04)',
                  color: step3Valid ? '#70c080' : S.silverDim,
                  border: step3Valid ? '1px solid rgba(100,200,120,0.35)' : `1px solid ${S.border}`,
                }}>
                Guardar y entrar al portal
              </button>
            )}
          </div>

          <p className="text-center text-[9px]" style={{ color: S.silverDim }}>
            Puedes actualizar esta información en cualquier momento desde tu perfil
          </p>
        </div>
      </div>
    </div>
  )
}
