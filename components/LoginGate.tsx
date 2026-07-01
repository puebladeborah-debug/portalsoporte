'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import Image from 'next/image'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { login, getSession, setSession, clearSession, TeamMember, Session, getMembers } from '@/lib/teamStore'
import ReglamentoGate from './ReglamentoGate'
import ProfileSetupGate from './ProfileSetupGate'

// Routes that don't need login
const PUBLIC_ROUTES = ['/asistencia', '/api/']
// Note: /asistencia-ready is also public (scanner page)

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

type AuthCtx = {
  session: Session | null
  member: TeamMember | null
  logout: () => void
  refresh: () => void
}

export const AuthContext = createContext<AuthCtx>({
  session: null, member: null, logout: () => {}, refresh: () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(null)
  const [member, setMember] = useState<TeamMember | null>(null)
  const [ready, setReady] = useState(false)
  const [needsSignature, setNeedsSignature] = useState(false)
  const [needsProfile, setNeedsProfile] = useState(false)
  const pathname = usePathname()

  const isPublic = PUBLIC_ROUTES.some(r => (pathname ?? '').startsWith(r)) ||
    (pathname ?? '').startsWith('/asistencia-ready')

  async function refresh() {
    try {
      const s = getSession()
      setSessionState(s)
      if (s) {
        const members = await getMembers()
        const m = members.find((x: TeamMember) => x.id === s.memberId) ?? null
        setMember(m)
        if (!m?.reglamentoFirmado) {
          setNeedsSignature(true)
        } else if (!m?.perfilCompleto && !m?.isAdmin) {
          setNeedsProfile(true)
        }
      } else {
        setMember(null)
        setNeedsSignature(false)
      }
    } catch {
      setSessionState(null)
      setMember(null)
      setNeedsSignature(false)
      setNeedsProfile(false)
    } finally {
      setReady(true)
    }
  }

  useEffect(() => { refresh() }, [])

  function logout() {
    clearSession()
    setSessionState(null)
    setMember(null)
    setNeedsSignature(false)
  }

  // Public routes: always render children immediately
  if (isPublic) {
    return (
      <AuthContext.Provider value={{ session, member, logout, refresh }}>
        {children}
      </AuthContext.Provider>
    )
  }

  // Still loading session from storage
  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: S.silverDim, fontSize: '12px', letterSpacing: '0.2em' }}>
          Cargando...
        </div>
      </div>
    )
  }

  // Not logged in → show login screen
  if (!session) {
    return (
      <AuthContext.Provider value={{ session, member, logout, refresh }}>
        <LoginScreen onSuccess={refresh} />
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={{ session, member, logout, refresh }}>
      {needsSignature && session && (
        <ReglamentoGate
          memberId={session.memberId}
          memberName={session.memberName}
          onDone={() => {
            setNeedsSignature(false)
            getMembers().then(members => {
              const m = members.find(x => x.id === session.memberId)
              if (!m?.perfilCompleto && !m?.isAdmin) setNeedsProfile(true)
            })
          }}
        />
      )}
      {!needsSignature && needsProfile && session && (
        <ProfileSetupGate
          memberId={session.memberId}
          memberName={session.memberName}
          onDone={() => setNeedsProfile(false)}
        />
      )}
      {children}
    </AuthContext.Provider>
  )
}

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!username || !password) { setError('Ingresa usuario y contraseña'); return }
    setLoading(true)
    const member = await login(username, password)
    if (member) {
      setSession(member)
      setError('')
      onSuccess()
    } else {
      setError('Usuario o contraseña incorrectos')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: S.bg }}>

      {/* Grid bg */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.04 }}>
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#b8bcc8" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Radar rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.04 }}>
        {[120, 240, 360, 480].map(r => (
          <div key={r} className="absolute rounded-full" style={{ width: r * 2, height: r * 2, border: '1px solid #b8bcc8' }} />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(8,8,14,0.97)',
            border: '1px solid rgba(180,185,210,0.15)',
            boxShadow: '0 0 80px rgba(0,0,0,0.9)',
          }}>

          {/* Logo header */}
          <div className="flex flex-col items-center pt-8 pb-6 px-6"
            style={{ borderBottom: '1px solid rgba(180,185,210,0.08)', background: 'rgba(180,185,210,0.02)' }}>
            <Image src="/logo.jpg" alt="Club Sinergetico" width={88} height={88}
              className="rounded-2xl mb-4"
              style={{ boxShadow: '0 0 30px rgba(180,185,210,0.15)' }} />
            <p className="text-xs font-bold tracking-[0.25em] uppercase"
              style={{ background: 'linear-gradient(135deg,#d4d8e8,#8890a8,#d4d8e8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Club Sinergetico
            </p>
            <p className="text-[11px] tracking-[0.3em] uppercase mt-0.5" style={{ color: S.silverDim }}>
              Portal de Soporte
            </p>
          </div>

          {/* Form */}
          <div className="px-6 py-6 space-y-4">
            <div>
              <label className="text-[10px] tracking-widest uppercase block mb-1.5" style={{ color: S.silverDim }}>
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="tu_usuario"
                className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                style={{ background: '#0a0a14', border: `1px solid ${error ? 'rgba(220,80,80,0.4)' : S.border}`, color: S.silverBright }}
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="text-[10px] tracking-widest uppercase block mb-1.5" style={{ color: S.silverDim }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl outline-none text-sm pr-12"
                  style={{ background: '#0a0a14', border: `1px solid ${error ? 'rgba(220,80,80,0.4)' : S.border}`, color: S.silverBright }}
                  autoComplete="current-password"
                />
                <button onClick={() => setShowPw(!showPw)} type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: S.silverDim }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-center" style={{ color: '#e07070' }}>{error}</p>}

            <button onClick={handleLogin} disabled={loading} type="button"
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: loading ? 'rgba(180,185,210,0.05)' : 'rgba(180,185,210,0.12)',
                color: loading ? S.silverDim : S.silverBright,
                border: `1px solid ${loading ? S.border : 'rgba(180,185,210,0.25)'}`,
              }}>
              {loading ? <span className="animate-pulse">Verificando...</span> : <><LogIn size={16} /> Ingresar</>}
            </button>
          </div>

          <div className="px-6 pb-6 text-center">
            <p className="text-[10px]" style={{ color: S.silverDim }}>
              Contacta a DLP si olvidaste tu contraseña
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
