'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { BookOpen, CheckSquare, Search, Home, Settings, LogOut, User, Eye, EyeOff, Pencil, X, AlertTriangle, Info, AlertCircle, Shield, CalendarDays, MapPin, ScrollText, MessageCircle, CreditCard, FileWarning, Banknote } from 'lucide-react'
import NoticesPanel from './NoticesPanel'
import { useAuth } from './LoginGate'
import { getMembers, saveMembers, getIncidenciasByMember, Incidencia, TipoIncidencia } from '@/lib/teamStore'

const S = { silver: '#b8bcc8', silverBright: '#d4d8e8', silverDim: '#3a3e4a', border: '#1a1a24' }

const navItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/manual', label: 'Manuales', icon: BookOpen },
  { href: '/acuerdos', label: 'Acuerdos', icon: ScrollText },
  { href: '/pagos', label: 'Pagos', icon: CreditCard },
  { href: '/incidencias', label: 'Incidencias', icon: FileWarning },
  { href: '/reembolsos', label: 'Reembolsos', icon: Banknote },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/buscar', label: 'Buscar', icon: Search },
  { href: '/tareas', label: 'Mis Tareas', icon: CheckSquare },
  { href: '/guardias', label: 'Guardias', icon: CalendarDays },
  { href: '/giras',    label: 'Giras',    icon: MapPin },
]

const TIPO_COLOR: Record<TipoIncidencia, { text: string; icon: React.ReactNode }> = {
  Leve: { text: '#dcbe3c', icon: <Info size={11} /> },
  Media: { text: '#dc823c', icon: <AlertCircle size={11} /> },
  Grave: { text: '#dc4646', icon: <Shield size={11} /> },
}

function ProfileModal({ onClose }: { onClose: () => void }) {
  const { session, member, refresh } = useAuth()
  const [tab, setTab] = useState<'perfil' | 'incidencias'>('perfil')
  const [editName, setEditName] = useState(member?.name.split(' · ').pop() || '')
  const [editPw, setEditPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [msg, setMsg] = useState('')
  const [misIncidencias, setMisIncidencias] = useState<Incidencia[]>([])

  useEffect(() => {
    if (session) setMisIncidencias(getIncidenciasByMember(session.memberId))
  }, [session])

  function save() {
    if (!session) return
    const members = getMembers()
    const updated = members.map(m => {
      if (m.id !== session.memberId) return m
      const newName = m.isAdmin ? `DLP · ${editName}` : editName
      const newPw = editPw && editPw === confirmPw ? editPw : m.password
      return { ...m, name: newName, password: newPw }
    })
    saveMembers(updated)
    refresh()
    setMsg('¡Cambios guardados!')
    setTimeout(() => setMsg(''), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="w-80 rounded-2xl overflow-hidden mx-4"
        style={{ background: '#080810', border: '1px solid rgba(180,185,210,0.2)', boxShadow: '0 0 60px rgba(0,0,0,0.8)' }}>

        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.03)' }}>
          <User size={15} style={{ color: S.silver }} />
          <p className="flex-1 text-sm font-bold" style={{ color: S.silverBright }}>Mi Cuenta</p>
          <button onClick={onClose} style={{ color: S.silverDim }}><X size={16} /></button>
        </div>

        {/* Tab selector */}
        <div className="flex gap-2 px-5 pt-4 pb-0">
          <button onClick={() => setTab('perfil')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
            style={tab === 'perfil'
              ? { background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: `1px solid rgba(180,185,210,0.2)` }
              : { background: 'transparent', color: S.silverDim, border: `1px solid ${S.border}` }
            }>
            <User size={12} /> Mi Perfil
          </button>
          <button onClick={() => setTab('incidencias')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
            style={tab === 'incidencias'
              ? { background: 'rgba(220,70,70,0.1)', color: '#dc4646', border: `1px solid rgba(220,70,70,0.25)` }
              : { background: 'transparent', color: S.silverDim, border: `1px solid ${S.border}` }
            }>
            <AlertTriangle size={12} />
            Mis Incidencias
            {misIncidencias.length > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: 'rgba(220,70,70,0.15)', color: '#dc4646' }}>
                {misIncidencias.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab: Perfil */}
        {tab === 'perfil' && <div className="px-5 py-5 space-y-4">
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Nombre</p>
            <input value={editName} onChange={e => setEditName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
              style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Nueva contraseña (opcional)</p>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={editPw} onChange={e => setEditPw(e.target.value)}
                placeholder="Deja en blanco para no cambiar"
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm pr-10"
                style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: S.silverDim }}>
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {editPw && (
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Confirmar contraseña</p>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                style={{ background: '#0a0a14', border: `1px solid ${editPw !== confirmPw && confirmPw ? 'rgba(220,80,80,0.4)' : S.border}`, color: S.silverBright }} />
              {editPw !== confirmPw && confirmPw && (
                <p className="text-[10px] mt-1" style={{ color: '#e07070' }}>Las contraseñas no coinciden</p>
              )}
            </div>
          )}

          <div className="pt-1 flex flex-col gap-2">
            {msg && <p className="text-xs text-center" style={{ color: '#70c080' }}>{msg}</p>}
            <button onClick={save} disabled={editPw !== '' && editPw !== confirmPw}
              className="w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
              style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)' }}>
              <Pencil size={14} /> Guardar cambios
            </button>
          </div>

          <div className="text-center pt-1">
            <p className="text-[10px]" style={{ color: S.silverDim }}>
              Usuario: <span style={{ color: S.silver }}>{member?.username}</span>
              {member?.isAdmin && <span className="ml-2 px-1.5 py-0.5 rounded-full text-[9px]" style={{ background: 'rgba(180,185,210,0.1)', color: S.silver }}>Admin</span>}
            </p>
          </div>
        </div>}

        {/* Tab: Incidencias */}
        {tab === 'incidencias' && (
          <div className="px-5 py-4">
            {misIncidencias.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle size={28} className="mx-auto mb-2 opacity-20" style={{ color: S.silver }} />
                <p className="text-xs" style={{ color: S.silverDim }}>Sin incidencias registradas</p>
                <p className="text-[10px] mt-1" style={{ color: S.silverDim }}>¡Sigue así! 🎉</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1"
                style={{ scrollbarWidth: 'thin', scrollbarColor: `${S.silverDim} transparent` }}>
                {misIncidencias.map(inc => {
                  const c = TIPO_COLOR[inc.tipoIncidencia]
                  return (
                    <div key={inc.id} className="p-3 rounded-xl"
                      style={{ background: '#05050a', border: `1px solid ${S.border}` }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(0,0,0,0.3)', color: c.text }}>
                          {c.icon} {inc.tipoIncidencia}
                        </span>
                        <span className="text-[10px] ml-auto" style={{ color: S.silverDim }}>
                          {new Date(inc.fecha + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed" style={{ color: '#9094a4' }}>
                        {inc.descripcion}
                      </p>
                      {inc.accionCorrectiva && (
                        <p className="text-[10px] mt-1.5" style={{ color: S.silverDim }}>
                          <span style={{ color: S.silver }}>Compromiso:</span> {inc.accionCorrectiva}
                        </p>
                      )}
                      {inc.fechaLimite && (
                        <p className="text-[10px] mt-1" style={{ color: S.silverDim }}>
                          <span style={{ color: S.silver }}>Fecha límite:</span>{' '}
                          {new Date(inc.fechaLimite + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            <p className="text-center text-[9px] mt-3" style={{ color: S.silverDim }}>
              Solo tú puedes ver este historial
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Navigation() {
  const pathname = usePathname()
  const { session, logout } = useAuth()
  const [showProfile, setShowProfile] = useState(false)

  const firstName = session?.memberName.split(' · ').pop()?.split(' ')[0] || ''

  return (
    <>
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      <header className="hidden md:flex fixed top-0 left-0 right-0 h-24 items-center px-4 gap-1 z-50"
        style={{ background: 'rgba(6,6,8,0.92)', borderBottom: '1px solid rgba(180,185,210,0.12)', backdropFilter: 'blur(20px)', boxShadow: '0 1px 30px rgba(0,0,0,0.6)' }}>

        <Link href="/" className="flex items-center gap-3 mr-4 flex-shrink-0">
          <Image src="/logo.jpg" alt="Club Sinergetico" width={64} height={64} className="rounded-xl" />
          <div>
            <p className="text-lg font-black tracking-widest uppercase"
              style={{ background: 'linear-gradient(135deg,#d4d8e8,#8890a8,#d4d8e8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Club Sinergetico
            </p>
            <p className="text-sm tracking-[0.3em] uppercase" style={{ color: '#5a5e6a' }}>Soporte</p>
          </div>
        </Link>

        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} title={label}
            className="flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200 flex-shrink-0"
            style={pathname === href
              ? { color: '#d4d8e8', background: 'rgba(180,185,210,0.1)', border: '1px solid rgba(180,185,210,0.2)' }
              : { color: '#3a3e4a', border: '1px solid transparent' }
            }>
            <Icon size={32} />
            <span className="text-[10px] mt-1.5 leading-none font-medium">{label}</span>
          </Link>
        ))}

        <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
          <NoticesPanel />

          {session?.isAdmin && (
            <Link href="/admin"
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
              style={{ color: '#3a3e4a', border: `1px solid ${S.border}` }}>
              <Settings size={13} /> Admin
            </Link>
          )}

          {/* User profile button */}
          {session && (
            <button onClick={() => setShowProfile(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
              style={{ color: S.silver, border: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.04)' }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: 'rgba(180,185,210,0.15)', color: S.silverBright }}>
                {firstName[0]}
              </div>
              <span className="text-xs">{firstName}</span>
              <Pencil size={11} style={{ color: S.silverDim }} />
            </button>
          )}

          {/* Logout */}
          {session && (
            <button onClick={logout}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all"
              style={{ color: '#e07070', border: '1px solid rgba(220,80,80,0.15)', background: 'rgba(220,80,80,0.04)' }}
              title="Cerrar sesión">
              <LogOut size={13} />
            </button>
          )}
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex z-50"
        style={{ background: 'rgba(6,6,8,0.96)', borderTop: '1px solid rgba(180,185,210,0.1)', backdropFilter: 'blur(20px)' }}>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className="flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-all"
            style={pathname === href ? { color: '#d4d8e8' } : { color: '#3a3e4a' }}>
            <Icon size={20} />
            {label}
          </Link>
        ))}
        <button onClick={() => setShowProfile(true)}
          className="flex-1 flex flex-col items-center py-3 gap-1 text-xs"
          style={{ color: '#3a3e4a' }}>
          <User size={20} />
          Perfil
        </button>
      </nav>
    </>
  )
}
