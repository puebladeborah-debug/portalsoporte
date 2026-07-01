'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/LoginGate'
import { getMembers, TeamMember } from '@/lib/teamStore'
import {
  ChevronLeft, User, Phone, MapPin, AlertCircle,
  Heart, ChevronDown, ChevronUp, ShieldAlert,
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

function Field({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) {
  if (!value) return (
    <div className="flex items-center gap-2 py-2"
      style={{ borderBottom: `1px solid ${S.border}` }}>
      {icon && <span style={{ color: S.silverDim }}>{icon}</span>}
      <span className="text-[9px] tracking-widest uppercase w-32 flex-shrink-0" style={{ color: S.silverDim }}>{label}</span>
      <span className="text-xs italic" style={{ color: 'rgba(180,185,210,0.25)' }}>No registrado</span>
    </div>
  )
  return (
    <div className="flex items-start gap-2 py-2"
      style={{ borderBottom: `1px solid ${S.border}` }}>
      {icon && <span className="mt-0.5 flex-shrink-0" style={{ color: S.silver }}>{icon}</span>}
      <span className="text-[9px] tracking-widets uppercase w-32 flex-shrink-0 mt-0.5" style={{ color: S.silverDim }}>{label}</span>
      <span className="text-xs leading-relaxed" style={{ color: S.silverBright }}>{value}</span>
    </div>
  )
}

function MemberCard({ m }: { m: TeamMember }) {
  const [open, setOpen] = useState(false)
  const firstName = m.name.split(' · ').pop() || m.name
  const complete = !!m.perfilCompleto

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: S.card, border: `1px solid ${complete ? S.border : 'rgba(220,170,60,0.3)'}` }}>

      {/* Header row */}
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
        style={{ background: 'rgba(180,185,210,0.02)' }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: 'rgba(180,185,210,0.12)', color: S.silverBright }}>
          {m.initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: S.silverBright }}>{firstName}</p>
          <p className="text-[10px]" style={{ color: S.silverDim }}>{m.role}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {complete
            ? <span className="text-[9px] px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(92,184,122,0.1)', color: '#5cb87a', border: '1px solid rgba(92,184,122,0.25)' }}>
                ✓ Perfil completo
              </span>
            : <span className="text-[9px] px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(220,170,60,0.1)', color: '#dcaa3c', border: '1px solid rgba(220,170,60,0.3)' }}>
                Pendiente
              </span>
          }
          {open ? <ChevronUp size={14} style={{ color: S.silverDim }} /> : <ChevronDown size={14} style={{ color: S.silverDim }} />}
        </div>
      </button>

      {/* Expanded profile */}
      {open && (
        <div className="px-4 pb-4 pt-2">

          {/* Contacto */}
          <p className="text-[9px] tracking-widets uppercase mb-1 mt-2 flex items-center gap-1"
            style={{ color: S.silver }}>
            <Phone size={10} /> Contacto
          </p>
          <Field label="Tel. Personal"  value={m.telefonoPersonal}  icon={<Phone size={12} />} />
          <Field label="Tel. Trabajo"   value={m.telefonoTrabajo}   icon={<Phone size={12} />} />
          <Field label="Dirección"      value={m.direccion}         icon={<MapPin size={12} />} />

          {/* Emergencia */}
          <p className="text-[9px] tracking-widets uppercase mb-1 mt-4 flex items-center gap-1"
            style={{ color: '#f87171' }}>
            <ShieldAlert size={10} /> Emergencia
          </p>
          <Field label="Contacto"  value={m.contactoEmergenciaNombre}    icon={<User size={12} />} />
          <Field label="Teléfono"  value={m.contactoEmergenciaTelefono}  icon={<Phone size={12} />} />

          {/* Salud */}
          <p className="text-[9px] tracking-widets uppercase mb-1 mt-4 flex items-center gap-1"
            style={{ color: '#a78bfa' }}>
            <Heart size={10} /> Salud
          </p>
          <Field label="Tipo de sangre" value={m.tipoSangre} icon={<Heart size={12} />} />
          <Field label="Alergias"       value={m.alergias}   icon={<AlertCircle size={12} />} />
        </div>
      )}
    </div>
  )
}

export default function PerfilesPage() {
  const { session, member } = useAuth()
  const router = useRouter()
  const [members, setMembers] = useState<TeamMember[]>([])

  useEffect(() => {
    if (session && !member?.isAdmin) router.replace('/')
    getMembers().then(all => setMembers(all.filter(m => !m.isAdmin)))
  }, [session, member, router])

  if (!member?.isAdmin) return null

  const completos  = members.filter(m => m.perfilCompleto).length
  const pendientes = members.length - completos

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <button onClick={() => router.push('/admin')}
          className="flex items-center gap-1.5 text-xs mb-6 transition-colors"
          style={{ color: S.silverDim }}>
          <ChevronLeft size={14} /> Panel de Administración
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl"
            style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)' }}>
            <User size={18} style={{ color: '#a78bfa' }} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-[0.2em] uppercase" style={{ color: S.silverBright }}>
              Perfiles del Equipo
            </h1>
            <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>
              {completos} completo{completos !== 1 ? 's' : ''} · {pendientes} pendiente{pendientes !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-2xl"
            style={{ background: S.card, border: '1px solid rgba(92,184,122,0.2)' }}>
            <p className="text-2xl font-bold" style={{ color: '#5cb87a' }}>{completos}</p>
            <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>Perfiles completos</p>
          </div>
          <div className="p-4 rounded-2xl"
            style={{ background: S.card, border: '1px solid rgba(220,170,60,0.2)' }}>
            <p className="text-2xl font-bold" style={{ color: '#dcaa3c' }}>{pendientes}</p>
            <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>Pendientes de completar</p>
          </div>
        </div>

        {/* Note */}
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl mb-5 text-xs"
          style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa' }}>
          <ShieldAlert size={13} className="flex-shrink-0 mt-0.5" />
          <span>Esta información es confidencial. Solo visible para el administrador. Úsala únicamente en caso de emergencia.</span>
        </div>

        {/* Member list */}
        <div className="space-y-3">
          {members.map(m => <MemberCard key={m.id} m={m} />)}
        </div>
      </div>
    </div>
  )
}
