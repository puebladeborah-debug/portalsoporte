'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ChevronDown, ChevronRight, CheckCircle2, Circle, Users, Plus, X,
  QrCode, Trash2, Pencil, Check, Zap, Bell, KeyRound,
} from 'lucide-react'
import QRCode from 'qrcode'
import { getMembers, saveMembers, recordAttendance, getAttendance, TeamMember, Permission, HorarioSemanal, DiaSemana, saveReporteQR } from '@/lib/teamStore'
import { useFirestoreCollection } from '@/lib/firestoreCollection'
import { useAuth } from './LoginGate'
import { auth } from '@/lib/firebase'
import { sendPasswordResetEmail } from 'firebase/auth'

const S = {
  bg: '#08080e', card: '#0e0e14', border: '#1a1a24',
  silver: '#b8bcc8', silverBright: '#d4d8e8', silverDim: '#3a3e4a',
  borderActive: 'rgba(180,185,210,0.18)',
}

const ALL_PERMISSIONS: { key: Permission; label: string }[] = [
  { key: 'checklist', label: 'Checklist diario' },
  { key: 'manuales', label: 'Ver manuales' },
  { key: 'buscar', label: 'Buscador' },
  { key: 'tareas', label: 'Mis Tareas' },
  { key: 'avisos', label: 'Avisos' },
  { key: 'guardias', label: 'Editar guardias' },
  { key: 'giras',    label: 'Gestionar giras' },
]

type ExtraTask = { id: string; text: string; date: string; targetMembers: string[]; createdBy: string }

const TODAY = new Date().toISOString().split('T')[0]

export default function TeamSidebar() {
  const { session } = useAuth()
  const adminMode = !!session?.isAdmin
  const [members, setMembers] = useState<TeamMember[]>([])
  const [open, setOpen] = useState<string | null>(null)
  const [checks, setChecks] = useState<Record<string, boolean[]>>({})
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [qrMember, setQrMember] = useState<TeamMember | null>(null)
  const [qrStatus, setQrStatus] = useState<'completo' | 'incompleto'>('completo')

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('adminModeChange', { detail: { active: adminMode } }))
  }, [adminMode])

  // Notifica al reloj cada vez que se abre o cierra cualquier tarjeta de usuario
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sidebarActiveChange', { detail: { active: open !== null } }))
  }, [open])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newTasks, setNewTasks] = useState('')
  const [newPerms, setNewPerms] = useState<Permission[]>(['checklist', 'manuales', 'buscar'])
  const [attendance, setAttendance] = useState<string[]>([])
  const [serverUrl, setServerUrl] = useState('')
  // Extra tasks
  const { data: extraTasks, add: addExtraTaskDoc, remove: removeExtraTaskDoc } =
    useFirestoreCollection<ExtraTask>('tareas_extra', { where: ['date', '==', TODAY] })
  const [confirmedExtras, setConfirmedExtras] = useState<string[]>([])
  const [showExtraForm, setShowExtraForm] = useState<string | null>(null)
  const [newExtraText, setNewExtraText] = useState('')
  // Full profile editing modal
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [editForm, setEditForm] = useState({ name: '', role: '', username: '', password: '', email: '', tasks: '' })
  const [editHorario, setEditHorario] = useState<HorarioSemanal>({})
  const [editIsAdmin, setEditIsAdmin] = useState(false)
  const editScrollRef = useRef<HTMLDivElement>(null)

  // Pre-QR report state
  const [preQRMember, setPreQRMember] = useState<TeamMember | null>(null)
  const [preQRStatus, setPreQRStatus] = useState<'completo' | 'incompleto'>('completo')
  const [preQRForm, setPreQRForm] = useState({ whatsapp: '', zendesk: '', correo: '', llamadas: '', telegram: '', instagram: '', facebook: '', whatsappViejito: '', whatsappSoporte: '', whatsappSkool: '', ghl: '', hora: '', tareasExtra: '' })

  function pqr(key: keyof typeof preQRForm, val: string) {
    setPreQRForm(prev => ({ ...prev, [key]: val }))
  }

  useEffect(() => {
    getMembers().then(saved => {
      setMembers(saved)
      const savedChecks = localStorage.getItem(`teamchecks_${TODAY}`)
      if (savedChecks) {
        setChecks(JSON.parse(savedChecks))
      } else {
        const init: Record<string, boolean[]> = {}
        saved.forEach(m => { init[m.id] = new Array(m.tasks.length).fill(false) })
        setChecks(init)
      }
    })
    setAttendance(getAttendance().filter(r => r.date === TODAY).map(r => r.memberId))
    const confirmed = localStorage.getItem(`extra_confirmed_${TODAY}`)
    if (confirmed) setConfirmedExtras(JSON.parse(confirmed))
    fetch('/api/server-url').then(r => r.json()).then(d => setServerUrl(d.url)).catch(() => setServerUrl(window.location.origin))
  }, [])

  function toggle(memberId: string, idx: number) {
    setChecks(prev => {
      const next = { ...prev, [memberId]: (prev[memberId] || []).map((v, i) => i === idx ? !v : v) }
      localStorage.setItem(`teamchecks_${TODAY}`, JSON.stringify(next))
      return next
    })
  }

  function doneCount(member: TeamMember) {
    return (checks[member.id] || []).filter(Boolean).length
  }

  const allDone = useCallback((member: TeamMember) => {
    const c = checks[member.id] || []
    return member.tasks.length > 0 && c.length === member.tasks.length && c.every(Boolean)
  }, [checks])

  async function generateQR(member: TeamMember, status: 'completo' | 'incompleto') {
    const done = doneCount(member)
    const total = member.tasks.length
    const record = recordAttendance(member, done, total)
    const payload = btoa(encodeURIComponent(JSON.stringify({
      mid: member.id, name: member.name, role: member.role,
      date: record.date, done, total, status, rid: record.id,
    })))
    const base = serverUrl || window.location.origin
    const url = await QRCode.toDataURL(`${base}/asistencia?d=${payload}`, {
      width: 260, margin: 2, color: { dark: '#d4d8e8', light: '#06060800' }, errorCorrectionLevel: 'M',
    })
    setQrUrl(url); setQrMember(member); setQrStatus(status)
    setAttendance(prev => [...new Set([...prev, member.id])])
  }

  async function addMember() {
    if (!newName.trim() || !newRole.trim() || !newEmail.trim()) return
    const m: TeamMember = {
      id: `m_${Date.now()}`, name: newName.trim(), role: newRole.trim(),
      initial: newName.trim()[0].toUpperCase(), isAdmin: false,
      username: newUsername.trim() || newName.trim().split(' ')[0].toLowerCase(),
      password: newPassword.trim() || `${newName.trim().split(' ')[0]}123`,
      email: newEmail.trim(),
      permissions: newPerms, tasks: newTasks.split('\n').map(t => t.trim()).filter(Boolean),
    }
    const updated = [...members, m]; setMembers(updated); await saveMembers(updated)
    setChecks(prev => ({ ...prev, [m.id]: new Array(m.tasks.length).fill(false) }))
    setNewEmail('')
    setNewName(''); setNewRole(''); setNewUsername(''); setNewPassword(''); setNewTasks(''); setShowAddForm(false)
  }

  async function deleteMember(id: string) {
    if (id === 'dlp') return
    const updated = members.filter(m => m.id !== id); setMembers(updated); await saveMembers(updated)
  }

  async function updatePermissions(memberId: string, perm: Permission, value: boolean) {
    const updated = members.map(m => {
      if (m.id !== memberId) return m
      return { ...m, permissions: value ? [...m.permissions, perm] : m.permissions.filter(p => p !== perm) }
    })
    setMembers(updated); await saveMembers(updated)
  }

  async function toggleAdmin(memberId: string, value: boolean) {
    if (memberId === 'dlp') return // Deborah siempre es administradora
    const updated = members.map(m => (m.id === memberId ? { ...m, isAdmin: value } : m))
    setMembers(updated); await saveMembers(updated)
  }

  const [resetStatus, setResetStatus] = useState<Record<string, 'sent' | 'error'>>({})

  async function resetPassword(m: TeamMember) {
    if (!m.email) return
    try {
      await sendPasswordResetEmail(auth, m.email)
      setResetStatus(prev => ({ ...prev, [m.id]: 'sent' }))
    } catch {
      setResetStatus(prev => ({ ...prev, [m.id]: 'error' }))
    }
    setTimeout(() => setResetStatus(prev => {
      const next = { ...prev }
      delete next[m.id]
      return next
    }), 5000)
  }

  function openEditMember(member: TeamMember) {
    setEditingMember(member)
    setEditForm({
      name: member.name.includes(' · ') ? member.name.split(' · ')[1] : member.name,
      role: member.role,
      username: member.username,
      password: member.password,
      email: member.email,
      tasks: member.tasks.join('\n'),
    })
    setEditHorario(member.horario ?? {})
    setEditIsAdmin(member.isAdmin)
    setTimeout(() => {
      if (editScrollRef.current) editScrollRef.current.scrollTop = 0
    }, 50)
  }

  async function saveEditMember() {
    if (!editingMember || !editForm.name.trim()) return
    const updated = members.map(m => {
      if (m.id !== editingMember.id) return m
      const newIsAdmin = m.id === 'dlp' ? true : editIsAdmin
      const newName = m.id === 'dlp' ? `DLP · ${editForm.name.trim()}` : editForm.name.trim()
      return {
        ...m,
        name: newName,
        isAdmin: newIsAdmin,
        initial: editForm.name.trim()[0].toUpperCase(),
        role: editForm.role.trim() || m.role,
        username: editForm.username.trim() || m.username,
        password: editForm.password.trim() || m.password,
        email: editForm.email.trim() || m.email,
        tasks: editForm.tasks.split('\n').map(t => t.trim()).filter(Boolean),
        horario: editHorario,
      }
    })
    setMembers(updated)
    await saveMembers(updated)
    // Reset checks if tasks changed
    const member = updated.find(m => m.id === editingMember.id)
    if (member) {
      const currentChecks = checks[editingMember.id] || []
      if (currentChecks.length !== member.tasks.length) {
        setChecks(prev => ({ ...prev, [editingMember.id]: new Array(member.tasks.length).fill(false) }))
      }
    }
    setEditingMember(null)
  }

  async function addExtraTask() {
    if (!newExtraText.trim() || !showExtraForm) return
    await addExtraTaskDoc({
      text: newExtraText.trim(),
      date: TODAY,
      targetMembers: showExtraForm === 'all' ? [] : [showExtraForm],
      createdBy: 'DLP',
    })
    setNewExtraText(''); setShowExtraForm(null)
  }

  async function deleteExtraTask(id: string) {
    await removeExtraTaskDoc(id)
  }

  function confirmExtraRead(taskId: string) {
    const updated = [...confirmedExtras, taskId]
    setConfirmedExtras(updated); localStorage.setItem(`extra_confirmed_${TODAY}`, JSON.stringify(updated))
  }

  function getMemberExtras(memberId: string) {
    return extraTasks.filter(t => t.targetMembers.length === 0 || t.targetMembers.includes(memberId))
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button onClick={() => setOpen(open ? null : 'mobile')}
        className="md:hidden fixed bottom-20 right-4 z-40 p-3 rounded-2xl shadow-lg"
        style={{ background: '#0e0e14', border: '1px solid rgba(180,185,210,0.2)', color: S.silverBright }}>
        <Users size={20} />
      </button>

      {/* QR Modal */}
      {qrUrl && qrMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.9)' }}>
          <div className="rounded-2xl p-6 flex flex-col items-center gap-4 max-w-xs w-full mx-4"
            style={{ background: '#08080e', border: `1px solid ${qrStatus === 'completo' ? 'rgba(100,200,120,0.3)' : 'rgba(220,150,50,0.3)'}`, boxShadow: '0 0 60px rgba(0,0,0,0.9)' }}>
            <div className="text-center">
              <span className="text-xs tracking-widest uppercase px-3 py-1 rounded-full"
                style={{ background: qrStatus === 'completo' ? 'rgba(100,200,120,0.1)' : 'rgba(220,150,50,0.1)', color: qrStatus === 'completo' ? '#70c080' : '#d4a050', border: `1px solid ${qrStatus === 'completo' ? 'rgba(100,200,120,0.2)' : 'rgba(220,150,50,0.2)'}` }}>
                {qrStatus === 'completo' ? '✓ Completo' : '⚠ Incompleto'}
              </span>
              <p className="text-lg font-bold mt-2" style={{ color: S.silverBright }}>{qrMember.name.split(' · ')[0]}</p>
              <p className="text-xs" style={{ color: S.silverDim }}>{qrMember.role} · {TODAY}</p>
            </div>
            <div className="p-3 rounded-2xl" style={{ background: '#0e0e18', border: `1px solid ${qrStatus === 'completo' ? 'rgba(100,200,120,0.15)' : 'rgba(220,150,50,0.15)'}` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="QR asistencia" width={210} height={210} />
            </div>
            <p className="text-xs text-center leading-relaxed" style={{ color: S.silverDim }}>
              Escanea con tu iPhone para confirmar.<br />Abre la cámara y apunta al QR.
            </p>
            <p className="text-[10px] text-center px-2 py-1 rounded-lg" style={{ background: 'rgba(180,185,210,0.05)', color: S.silverDim, border: `1px solid ${S.border}` }}>
              🌐 {serverUrl || 'Detectando URL...'}
            </p>
            <button onClick={() => { setQrUrl(null); setQrMember(null) }}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm"
              style={{ background: 'rgba(180,185,210,0.07)', color: S.silver, border: `1px solid ${S.borderActive}` }}>
              <X size={14} /> Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ── Modal pre-QR: reporte de canales ──────────────────────────────── */}
      {preQRMember && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ background: 'rgba(0,0,0,0.88)' }}>
          <div className="w-full max-w-sm mx-4 rounded-t-3xl md:rounded-2xl flex flex-col"
            style={{ background: '#080810', border: '1px solid rgba(180,185,210,0.2)', boxShadow: '0 0 60px rgba(0,0,0,0.95)', maxHeight: '90vh' }}>

            <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
              style={{ borderBottom: `1px solid ${S.border}` }}>
              <QrCode size={15} style={{ color: preQRStatus === 'completo' ? '#70c080' : '#d4a050' }} />
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: S.silverBright }}>Reporte antes del QR</p>
                <p className="text-[10px] mt-0.5" style={{ color: S.silverDim }}>
                  {preQRMember.name.split(' · ').pop()} · QR {preQRStatus}
                </p>
              </div>
              <button onClick={() => setPreQRMember(null)} style={{ color: S.silverDim }}><X size={16} /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <p className="text-[10px] leading-relaxed" style={{ color: S.silverDim }}>
                Antes de generar el QR, registra el estado de tus canales de atención al momento.
              </p>

              {/* Hora */}
              <div>
                <p className="text-[9px] tracking-widets uppercase mb-1.5" style={{ color: S.silverDim }}>Hora de registro *</p>
                <input type="time" value={preQRForm.hora} onChange={e => pqr('hora', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                  style={{ background: '#0a0a14', border: `1px solid ${preQRForm.hora ? 'rgba(180,185,210,0.25)' : S.border}`, color: S.silverBright }} />
              </div>

              {/* Contadores de canales */}
              <div>
                <p className="text-[9px] tracking-widets uppercase mb-2" style={{ color: S.silverDim }}>Mensajes / pendientes por canal</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'whatsapp'  as const, label: 'WhatsApp',  emoji: '💬' },
                    { key: 'zendesk'   as const, label: 'Zendesk',   emoji: '🎫' },
                    { key: 'correo'    as const, label: 'Correo',    emoji: '📧' },
                    { key: 'llamadas'  as const, label: 'Llamadas',  emoji: '📞' },
                    { key: 'telegram'  as const, label: 'Telegram',  emoji: '✈️' },
                    { key: 'instagram'       as const, label: 'Instagram',       emoji: '📸' },
                    { key: 'facebook'        as const, label: 'Facebook',        emoji: '👤' },
                    { key: 'whatsappViejito' as const, label: 'WhatsApp Viejito',emoji: '📲' },
                    { key: 'whatsappSoporte' as const, label: 'WhatsApp Soporte',emoji: '💬' },
                    { key: 'whatsappSkool'   as const, label: 'WhatsApp SKOOL',  emoji: '🎓' },
                    { key: 'ghl'             as const, label: 'GHL',             emoji: '⚙️' },
                  ].map(ch => (
                    <div key={ch.key}>
                      <p className="text-[9px] mb-1" style={{ color: S.silverDim }}>{ch.emoji} {ch.label}</p>
                      <input
                        type="number" min="0" value={preQRForm[ch.key]}
                        onChange={e => pqr(ch.key, e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-xl outline-none text-sm text-center"
                        style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tareas extra */}
              <div>
                <p className="text-[9px] tracking-widets uppercase mb-1.5" style={{ color: S.silverDim }}>Tareas adicionales del día (opcional)</p>
                <textarea
                  value={preQRForm.tareasExtra}
                  onChange={e => pqr('tareasExtra', e.target.value)}
                  placeholder={'Una tarea por línea\nEj: Respondí disputas atrasadas\nEj: Apoyé en onboarding'}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-xs resize-none"
                  style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }}
                />
              </div>
            </div>

            <div className="flex gap-3 px-5 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${S.border}` }}>
              <button onClick={() => setPreQRMember(null)}
                className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ color: S.silverDim, border: `1px solid ${S.border}` }}>
                Cancelar
              </button>
              <button
                disabled={!preQRForm.hora}
                onClick={async () => {
                  const m = preQRMember
                  const s = preQRStatus
                  // Save report
                  saveReporteQR({
                    id: `rqr_${Date.now()}`,
                    memberId: m.id,
                    memberName: m.name,
                    fecha: TODAY,
                    hora: preQRForm.hora,
                    whatsapp:  Number(preQRForm.whatsapp)  || 0,
                    zendesk:   Number(preQRForm.zendesk)   || 0,
                    correo:    Number(preQRForm.correo)    || 0,
                    llamadas:  Number(preQRForm.llamadas)  || 0,
                    telegram:  Number(preQRForm.telegram)  || 0,
                    instagram:       Number(preQRForm.instagram)       || 0,
                    facebook:        Number(preQRForm.facebook)        || 0,
                    whatsappViejito: Number(preQRForm.whatsappViejito) || 0,
                    whatsappSoporte: Number(preQRForm.whatsappSoporte) || 0,
                    whatsappSkool:   Number(preQRForm.whatsappSkool)   || 0,
                    ghl:             Number(preQRForm.ghl)             || 0,
                    tareasExtra: preQRForm.tareasExtra.split('\n').map(t => t.trim()).filter(Boolean),
                    status: s,
                    createdAt: new Date().toISOString(),
                  })
                  setPreQRMember(null)
                  await generateQR(m, s)
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                style={{
                  background: preQRForm.hora ? (preQRStatus === 'completo' ? 'rgba(100,200,120,0.15)' : 'rgba(212,160,80,0.15)') : 'rgba(180,185,210,0.04)',
                  color: preQRForm.hora ? (preQRStatus === 'completo' ? '#70c080' : '#d4a050') : S.silverDim,
                  border: `1px solid ${preQRForm.hora ? (preQRStatus === 'completo' ? 'rgba(100,200,120,0.35)' : 'rgba(212,160,80,0.35)') : S.border}`,
                }}>
                <QrCode size={14} /> Generar QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.88)' }}>
          <div className="w-full max-w-sm mx-4 rounded-2xl overflow-hidden flex flex-col"
            style={{ background: '#080810', border: '1px solid rgba(180,185,210,0.2)', boxShadow: '0 0 60px rgba(0,0,0,0.9)', maxHeight: '88vh' }}>

            {/* Header fijo */}
            <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.03)' }}>
              <Pencil size={15} style={{ color: S.silver }} />
              <p className="flex-1 text-sm font-bold" style={{ color: S.silverBright }}>Editar Perfil</p>
              <button onClick={() => setEditingMember(null)} style={{ color: S.silverDim }}><X size={18} /></button>
            </div>

            {/* Cuerpo scrolleable */}
            <div ref={editScrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
              style={{ scrollbarWidth: 'thin', scrollbarColor: `${S.silverDim} transparent` }}>
              {[
                { label: 'Nombre', key: 'name', placeholder: 'Nombre completo' },
                { label: 'Puesto / Rol', key: 'role', placeholder: 'Ej: Coordinador de Soporte' },
                { label: 'Usuario de acceso', key: 'username', placeholder: 'Ej: maria' },
                { label: 'Contraseña', key: 'password', placeholder: '••••••••', type: 'password' },
                { label: 'Correo registrado en Firebase', key: 'email', placeholder: 'correo@zigma3.com' },
              ].map(field => (
                <div key={field.key}>
                  <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: S.silverDim }}>{field.label}</p>
                  <input
                    type={field.type || 'text'}
                    value={editForm[field.key as keyof typeof editForm]}
                    onChange={e => setEditForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                    style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }}
                  />
                </div>
              ))}

              {/* Administrador */}
              <label className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
                style={{
                  background: editIsAdmin ? 'rgba(167,139,250,0.1)' : 'rgba(180,185,210,0.04)',
                  border: `1px solid ${editIsAdmin ? 'rgba(167,139,250,0.3)' : S.border}`,
                  color: editIsAdmin ? '#a78bfa' : S.silver,
                }}>
                <input type="checkbox" checked={editIsAdmin}
                  disabled={editingMember?.id === 'dlp'}
                  onChange={e => setEditIsAdmin(e.target.checked)} />
                Administrador (acceso total)
              </label>

              {/* Horario semanal — solo admin puede configurarlo */}
              <div>
                <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: S.silverDim }}>
                  Horario semanal
                </p>
                <div className="space-y-1.5">
                  {(['lunes','martes','miercoles','jueves','viernes','sabado','domingo'] as DiaSemana[]).map(dia => {
                    const h = editHorario[dia]
                    const LABELS: Record<DiaSemana,string> = { lunes:'Lun',martes:'Mar',miercoles:'Mié',jueves:'Jue',viernes:'Vie',sabado:'Sáb',domingo:'Dom' }
                    return (
                      <div key={dia} className="flex items-center gap-2">
                        <button
                          onClick={() => setEditHorario(prev => ({ ...prev, [dia]: { activo: !h?.activo, entrada: h?.entrada || '09:00', salida: h?.salida || '18:00' } }))}
                          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-[9px] font-bold transition-all"
                          style={h?.activo
                            ? { background: 'rgba(92,184,122,0.2)', border: '1px solid rgba(92,184,122,0.4)', color: '#5cb87a' }
                            : { background: 'rgba(180,185,210,0.04)', border: `1px solid ${S.border}`, color: S.silverDim }
                          }>
                          {h?.activo ? '✓' : ''}
                        </button>
                        <span className="text-[10px] w-7 flex-shrink-0" style={{ color: h?.activo ? S.silver : S.silverDim }}>
                          {LABELS[dia]}
                        </span>
                        <input type="time" value={h?.entrada || ''} disabled={!h?.activo}
                          onChange={e => setEditHorario(prev => ({ ...prev, [dia]: { ...prev[dia]!, entrada: e.target.value } }))}
                          className="flex-1 px-2 py-1 rounded-lg outline-none text-xs"
                          style={{ background: h?.activo ? '#0a0a14' : 'rgba(180,185,210,0.02)', border: `1px solid ${S.border}`, color: h?.activo ? S.silverBright : S.silverDim, opacity: h?.activo ? 1 : 0.4 }} />
                        <span style={{ color: S.silverDim, fontSize: '10px' }}>–</span>
                        <input type="time" value={h?.salida || ''} disabled={!h?.activo}
                          onChange={e => setEditHorario(prev => ({ ...prev, [dia]: { ...prev[dia]!, salida: e.target.value } }))}
                          className="flex-1 px-2 py-1 rounded-lg outline-none text-xs"
                          style={{ background: h?.activo ? '#0a0a14' : 'rgba(180,185,210,0.02)', border: `1px solid ${S.border}`, color: h?.activo ? S.silverBright : S.silverDim, opacity: h?.activo ? 1 : 0.4 }} />
                      </div>
                    )
                  })}
                </div>
                <p className="text-[9px] mt-1.5" style={{ color: S.silverDim }}>
                  Activa el día y define la hora de entrada y salida
                </p>
              </div>

              <div>
                <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: S.silverDim }}>
                  Tareas (una por línea)
                </p>
                <textarea
                  value={editForm.tasks}
                  onChange={e => setEditForm(prev => ({ ...prev, tasks: e.target.value }))}
                  rows={5}
                  placeholder={'Tarea 1\nTarea 2\nTarea 3'}
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm resize-none"
                  style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }}
                />
                <p className="text-[9px] mt-1" style={{ color: S.silverDim }}>
                  Cada tarea en una línea separada
                </p>
              </div>
            </div>

            {/* Botones fijos al fondo */}
            <div className="flex gap-2 px-5 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${S.border}` }}>
              <button onClick={() => setEditingMember(null)}
                className="flex-1 py-2.5 rounded-xl text-sm" style={{ color: S.silverDim, border: `1px solid ${S.border}` }}>
                Cancelar
              </button>
              <button onClick={saveEditMember}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: `1px solid ${S.borderActive}` }}>
                <Check size={14} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col flex-shrink-0 overflow-y-auto"
        style={{ width: '220px', background: 'rgba(6,6,10,0.95)', borderLeft: '1px solid rgba(180,185,210,0.07)', backdropFilter: 'blur(16px)', height: 'calc(100vh - 64px)', position: 'sticky', top: '64px' }}>
        <div className="px-3 py-4 flex-1">

          {/* Header */}
          <div className="flex items-center gap-2 mb-4 px-1">
            <Users size={13} style={{ color: S.silver }} />
            <p className="text-xs font-bold tracking-[0.15em] uppercase flex-1" style={{ color: S.silverDim }}>Equipo</p>
            {adminMode && (
              <button onClick={() => setShowAddForm(!showAddForm)} className="p-1 rounded-lg"
                style={{ color: S.silver, border: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.05)' }}>
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Add member form */}
          {adminMode && showAddForm && (
            <div className="mb-3 p-3 rounded-xl" style={{ background: 'rgba(180,185,210,0.04)', border: `1px solid ${S.borderActive}` }}>
              <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: S.silverDim }}>Nuevo integrante</p>
              {[
                { v: newName, s: setNewName, ph: 'Nombre completo' },
                { v: newRole, s: setNewRole, ph: 'Puesto / Rol' },
                { v: newUsername, s: setNewUsername, ph: 'Usuario (ej: maria)' },
                { v: newPassword, s: setNewPassword, ph: 'Contraseña', t: 'password' },
                { v: newEmail, s: setNewEmail, ph: 'Correo registrado en Firebase' },
              ].map((f, i) => (
                <input key={i} value={f.v} onChange={e => f.s(e.target.value)} placeholder={f.ph}
                  type={(f as { t?: string }).t || 'text'}
                  className="w-full text-xs p-2 rounded-lg outline-none mb-1.5"
                  style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
              ))}
              <textarea value={newTasks} onChange={e => setNewTasks(e.target.value)}
                placeholder={'Tarea 1\nTarea 2'} rows={3}
                className="w-full text-xs p-2 rounded-lg outline-none resize-none mb-1.5"
                style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
              <div className="flex gap-1.5">
                <button onClick={() => setShowAddForm(false)} className="flex-1 py-1.5 rounded-lg text-[10px]"
                  style={{ color: S.silverDim, border: `1px solid ${S.border}` }}>Cancelar</button>
                <button onClick={addMember} className="flex-1 py-1.5 rounded-lg text-[10px] font-bold"
                  style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: `1px solid ${S.borderActive}` }}>Agregar</button>
              </div>
            </div>
          )}

          {/* Member list */}
          <div className="space-y-2">
            {members.map(member => {
              const done = doneCount(member)
              const total = member.tasks.length
              const isOpen = open === member.id
              const pct = total > 0 ? (done / total) * 100 : 0
              const completed = allDone(member)
              const hasAttendance = attendance.includes(member.id)
              const extras = getMemberExtras(member.id)
              const unconfirmedExtras = extras.filter(e => !confirmedExtras.includes(e.id)).length

              return (
                <div key={member.id} className="rounded-xl overflow-hidden"
                  style={{ border: `1px solid ${isOpen ? S.borderActive : S.border}` }}>

                  {/* Member header — div instead of button to allow nested buttons */}
                  <div onClick={() => setOpen(isOpen ? null : member.id)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 transition-all"
                    style={{ background: isOpen ? 'rgba(180,185,210,0.05)' : 'transparent', cursor: 'pointer' }}>
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: completed ? 'rgba(100,200,120,0.15)' : 'rgba(180,185,210,0.08)', color: completed ? '#70c080' : S.silver }}>
                        {member.initial}
                      </div>
                      {hasAttendance && (
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                          style={{ background: '#70c080', border: '1px solid #0a0a12' }} />
                      )}
                      {unconfirmedExtras > 0 && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold"
                          style={{ background: '#d4a050', color: '#000', border: '1px solid #0a0a12' }}>
                          {unconfirmedExtras}
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-semibold truncate" style={{ color: S.silverBright }}>
                          {member.name.split(' · ').pop()}
                        </p>
                      </div>
                      <p className="text-[10px] truncate" style={{ color: S.silverDim }}>
                        {done}/{total} {completed ? '✓ Listo' : 'tareas'}
                        {extras.length > 0 && <span style={{ color: '#d4a050' }}> +{extras.length} extra</span>}
                      </p>
                    </div>

                    {/* Edit button (admin) — proper button at this level */}
                    {adminMode && (
                      <button
                        onClick={e => { e.stopPropagation(); openEditMember(member) }}
                        className="flex-shrink-0 flex items-center gap-1 px-1.5 py-1 rounded-lg transition-all"
                        style={{ color: S.silver, background: 'rgba(180,185,210,0.1)', border: `1px solid ${S.border}` }}
                        title="Editar perfil">
                        <Pencil size={11} />
                      </button>
                    )}

                    {!adminMode && (isOpen
                      ? <ChevronDown size={11} style={{ color: S.silverDim, flexShrink: 0 }} />
                      : <ChevronRight size={11} style={{ color: S.silverDim, flexShrink: 0 }} />
                    )}
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: '2px', background: S.border }}>
                    <div style={{ height: '100%', width: `${pct}%`, transition: 'width 0.3s', background: pct === 100 ? '#70c080' : 'linear-gradient(90deg,#2a2e3a,#b8bcc8)' }} />
                  </div>

                  {/* Expanded content */}
                  {isOpen && (
                    <div className="px-3 py-2" style={{ background: 'rgba(0,0,0,0.25)' }}>
                      <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: S.silverDim }}>{member.role}</p>

                      {/* Base tasks */}
                      <div className="space-y-1.5 mb-3">
                        {member.tasks.map((task, idx) => {
                          const checked = checks[member.id]?.[idx] ?? false
                          return (
                            <button key={idx} onClick={() => toggle(member.id, idx)} className="w-full flex items-start gap-2 text-left">
                              {checked
                                ? <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" style={{ color: '#70c080' }} />
                                : <Circle size={13} className="flex-shrink-0 mt-0.5" style={{ color: S.silverDim }} />}
                              <span className="text-[11px] leading-relaxed"
                                style={{ color: checked ? S.silverDim : '#9098a8', textDecoration: checked ? 'line-through' : 'none' }}>
                                {task}
                              </span>
                            </button>
                          )
                        })}
                      </div>

                      {/* Extra tasks */}
                      {extras.length > 0 && (
                        <div className="pt-2 mb-3" style={{ borderTop: '1px dashed rgba(212,160,80,0.3)' }}>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Bell size={10} style={{ color: '#d4a050' }} />
                            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#d4a050' }}>Extra Hoy</p>
                          </div>
                          {extras.map(et => {
                            const isConfirmed = confirmedExtras.includes(et.id)
                            return (
                              <div key={et.id} className="mb-2 p-2 rounded-lg"
                                style={{ background: 'rgba(212,160,80,0.06)', border: `1px solid ${isConfirmed ? 'rgba(100,200,120,0.2)' : 'rgba(212,160,80,0.2)'}` }}>
                                <p className="text-[11px] leading-relaxed mb-1.5" style={{ color: isConfirmed ? S.silverDim : '#e0c080' }}>{et.text}</p>
                                {isConfirmed ? (
                                  <p className="text-[9px] flex items-center gap-1" style={{ color: '#70c080' }}>
                                    <Check size={9} /> Lectura confirmada
                                  </p>
                                ) : (
                                  <button onClick={() => confirmExtraRead(et.id)}
                                    className="text-[10px] px-2 py-1 rounded-lg w-full font-bold"
                                    style={{ background: 'rgba(212,160,80,0.15)', color: '#d4a050', border: '1px solid rgba(212,160,80,0.3)' }}>
                                    ✓ Confirmar lectura
                                  </button>
                                )}
                                {adminMode && (
                                  <button onClick={() => deleteExtraTask(et.id)} className="mt-1 text-[9px] flex items-center gap-1" style={{ color: S.silverDim }}>
                                    <Trash2 size={8} /> Eliminar
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Admin: add extra task */}
                      {adminMode && (
                        <div className="mb-3">
                          {showExtraForm === member.id ? (
                            <div className="p-2 rounded-lg" style={{ background: 'rgba(212,160,80,0.06)', border: '1px solid rgba(212,160,80,0.2)' }}>
                              <textarea value={newExtraText} onChange={e => setNewExtraText(e.target.value)}
                                placeholder="Tarea extra de hoy..." rows={2}
                                className="w-full text-xs p-1.5 rounded outline-none resize-none mb-1.5"
                                style={{ background: '#0a0a14', border: `1px solid ${S.border}`, color: S.silverBright }} />
                              <div className="flex gap-1.5">
                                <button onClick={() => setShowExtraForm(null)} className="flex-1 py-1 rounded text-[10px]"
                                  style={{ color: S.silverDim, border: `1px solid ${S.border}` }}>Cancelar</button>
                                <button onClick={addExtraTask} className="flex-1 py-1 rounded text-[10px] font-bold"
                                  style={{ background: 'rgba(212,160,80,0.15)', color: '#d4a050', border: '1px solid rgba(212,160,80,0.3)' }}>
                                  Agregar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => { setShowExtraForm(member.id); setNewExtraText('') }}
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px]"
                              style={{ color: '#d4a050', border: '1px dashed rgba(212,160,80,0.3)', background: 'rgba(212,160,80,0.04)' }}>
                              <Zap size={10} /> Agregar tarea extra para hoy
                            </button>
                          )}
                        </div>
                      )}

                      {/* QR buttons */}
                      <div className="space-y-1.5 mb-3">
                        {completed ? (
                          <button onClick={() => { setPreQRMember(member); setPreQRStatus('completo'); setPreQRForm({ whatsapp:'', zendesk:'', correo:'', llamadas:'', telegram:'', instagram:'', facebook:'', whatsappViejito:'', whatsappSoporte:'', whatsappSkool:'', ghl:'', hora: new Date().toTimeString().slice(0,5), tareasExtra:'' }) }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold"
                            style={{ background: 'rgba(100,200,120,0.12)', color: '#70c080', border: '1px solid rgba(100,200,120,0.3)' }}>
                            <QrCode size={13} /> {hasAttendance ? '✓ Ver QR Completo' : 'QR — Completo'}
                          </button>
                        ) : (
                          <button onClick={() => { setPreQRMember(member); setPreQRStatus('incompleto'); setPreQRForm({ whatsapp:'', zendesk:'', correo:'', llamadas:'', telegram:'', instagram:'', facebook:'', whatsappViejito:'', whatsappSoporte:'', whatsappSkool:'', ghl:'', hora: new Date().toTimeString().slice(0,5), tareasExtra:'' }) }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold"
                            style={{ background: 'rgba(220,150,50,0.08)', color: '#d4a050', border: '1px solid rgba(220,150,50,0.25)' }}>
                            <QrCode size={13} /> QR — Incompleto ({done}/{total})
                          </button>
                        )}
                      </div>

                      {/* Admin: permissions & delete */}
                      {adminMode && (
                        <div className="pt-2" style={{ borderTop: `1px solid ${S.border}` }}>
                          <label className="flex items-center gap-2 text-[10px] font-semibold mb-2"
                            style={{ color: member.isAdmin ? '#a78bfa' : S.silver }}>
                            <input type="checkbox" checked={member.isAdmin}
                              disabled={member.id === 'dlp'}
                              onChange={e => toggleAdmin(member.id, e.target.checked)} />
                            Administrador (acceso total)
                          </label>

                          <button onClick={() => resetPassword(member)} disabled={!member.email}
                            className="w-full flex items-center justify-center gap-1.5 text-[10px] font-semibold px-2 py-1.5 rounded-lg mb-2"
                            style={{ color: '#6aaddc', border: '1px solid rgba(106,173,220,0.25)', background: 'rgba(106,173,220,0.06)' }}>
                            <KeyRound size={10} />
                            {resetStatus[member.id] === 'sent' ? '✓ Correo enviado' : resetStatus[member.id] === 'error' ? 'Error al enviar' : 'Restablecer contraseña'}
                          </button>

                          <p className="text-[9px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Permisos</p>
                          <div className="space-y-1 mb-2">
                            {ALL_PERMISSIONS.map(p => (
                              <label key={p.key} className="flex items-center gap-2 text-[10px]" style={{ color: S.silver }}>
                                <input type="checkbox" checked={member.permissions.includes(p.key)}
                                  onChange={e => updatePermissions(member.id, p.key, e.target.checked)}
                                  disabled={member.isAdmin} />
                                {p.label}
                              </label>
                            ))}
                          </div>
                          {!member.isAdmin && (
                            <button onClick={() => deleteMember(member.id)}
                              className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg"
                              style={{ color: '#e07070', border: '1px solid rgba(220,80,80,0.2)', background: 'rgba(220,80,80,0.05)' }}>
                              <Trash2 size={10} /> Eliminar perfil
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Attendance summary (admin only) */}
          {adminMode && (
            <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(180,185,210,0.03)', border: `1px solid ${S.border}` }}>
              <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: S.silverDim }}>
                Asistencia hoy ({attendance.length}/{members.length})
              </p>
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: attendance.includes(m.id) ? '#70c080' : S.border }} />
                  <span className="text-[10px]" style={{ color: attendance.includes(m.id) ? S.silver : S.silverDim }}>
                    {m.name.split(' · ').pop()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
