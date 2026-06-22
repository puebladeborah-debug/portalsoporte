export type Permission = 'checklist' | 'manuales' | 'buscar' | 'tareas' | 'avisos' | 'guardias' | 'giras'

export type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo'

export type HorarioDia = {
  activo: boolean
  entrada: string
  salida: string
}

export type HorarioSemanal = Partial<Record<DiaSemana, HorarioDia>>

export type Guardia = {
  id: string
  fecha: string
  memberIds: string[]
  nota: string
  entrada?: string
  salida?: string
}

export type GuardiaPatron = Partial<Record<DiaSemana, string[]>>

export type TipoIncidencia = 'Leve' | 'Media' | 'Grave'

export type Incidencia = {
  id: string
  fecha: string
  colaboradorId: string
  colaboradorName: string
  area: string
  tipoIncidencia: TipoIncidencia
  descripcion: string
  acuerdoPrevio: string
  accionCorrectiva: string
  fechaLimite: string
  observaciones: string
  createdAt: string
  createdBy: string
}

export type ReglamentoSignature = {
  memberId: string
  memberName: string
  signedAt: string
  method: 'firma' | 'mensaje'
  data: string
}

export type TeamMember = {
  id: string
  name: string
  role: string
  initial: string
  isAdmin: boolean
  permissions: Permission[]
  tasks: string[]
  username: string
  password: string
  email: string // correo real registrado en Firebase Authentication
  horario?: HorarioSemanal
  // Perfil personal
  perfilCompleto?: boolean
  telefonoPersonal?: string
  telefonoTrabajo?: string
  direccion?: string
  contactoEmergenciaNombre?: string
  contactoEmergenciaTelefono?: string
  alergias?: string
  tipoSangre?: string
}

export type AttendanceRecord = {
  id: string
  memberId: string
  memberName: string
  memberRole: string
  date: string
  completedAt: string
  status: 'pending' | 'completo' | 'incompleto'
  scannedAt?: string
  tasksTotal: number
  tasksDone: number
}

export type Session = {
  memberId: string
  memberName: string
  isAdmin: boolean
  loginTime: string
}

const STORE_KEY = 'team_members_v4'
const ATTEND_KEY = 'attendance_v1'
const SESSION_KEY = 'session_v1'

export const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: 'dlp',
    name: 'DLP · Deborah Puebla',
    role: 'Directora de Soporte',
    initial: 'D',
    isAdmin: true,
    username: 'dlp',
    email: 'dpuebla@zigma3.com',
    password: 'Soporte2026',
    permissions: ['checklist','manuales','buscar','tareas','avisos'],
    tasks: [
      'Registro reembolsos',
      'Revisar que SO hayan dado accesos',
      'Mediar Telegram',
      'WhatsApp Cel Azul ATC',
      'Llamada Disputa',
      'Seguimiento disputas / Reembolsos (si hay)',
      'Comunidades WhatsApp (accesos)',
      'ZENDESK',
      'Control y registro de disputas',
      'Revisar Excel',
      'Revisión 30 días USA',
      'Revisar se completen rutas críticas del equipo',
    ],
  },
  {
    id: 'mlf',
    name: 'Marlen Fajardo',
    role: 'Soporte Primer Nivel',
    initial: 'M',
    isAdmin: false,
    username: 'marlen',
    email: 'mfajardo@zigma3.com',
    password: 'Marlen2026',
    permissions: ['checklist','manuales','buscar'],
    tasks: [
      'Comunidades WhatsApp (revisar/solicitudes)',
      'Mensajes de bienvenida (si no se han dado SAM)',
      'Llamadas de bienvenida',
      'Mensajes de sesión de arranque',
      'ZENDESK',
      'WhatsApp Skool',
      'Apartados (Giras)',
      'Monitoreo Mentorías',
    ],
  },
  {
    id: 'so',
    name: 'Samuel Otniel',
    role: 'Administrador de Infraestructura',
    initial: 'S',
    isAdmin: false,
    username: 'samuel',
    email: 'sdiaz@zigma3.com',
    password: 'Samuel2026',
    permissions: ['checklist','manuales','buscar'],
    tasks: [
      // Tareas propias de Samuel
      'Accesos Black, Seguimientos, Webinar',
      'Base de datos Excel vencimiento de Club',
      'Agregar vencidos a Excel de renovaciones',
      'Accesos fines de semana',
      'Mensaje de bienvenida (si Marlen no los da)',
      'Mensajes de Renovación (si Gali no revisó)',
      'Excel Devoluciones (Deb)',
      'Seguimiento disputas',
      'Excel Atención y Seguimiento',
      // Tareas de Jacob (asignadas a Samuel)
      'Mediar Telegram (Chat Club Sinergético y directos)',
      'Dar accesos de gente que compró el fin de semana y contactarlos',
      'Mensajes de bienvenida',
      'Edición de certificados',
      'Edición de banners de las clases',
      'Link Streamyard',
      'Subir clases Lunes a Kajabi',
      'Comunicados Telegram',
      'Correos masivos Kajabi',
      'Disputas plataformas',
      'Seguimiento de plan de pagos',
      'Accesos BGI',
      'Sesión de bienvenida (Martes y Viernes)',
      'Registro de sesión de arranque Excel',
      'Revisión de usuarios disponibles Kajabi',
      'WhatsApp GHL Nativo',
    ],
  },
  {
    id: 'ge',
    name: 'Galilea Enciso',
    role: 'Soporte Help Desk',
    initial: 'G',
    isAdmin: false,
    username: 'galilea',
    email: 'benciso@zigma3.com',
    password: 'Galilea2026',
    permissions: ['checklist','manuales','buscar'],
    tasks: [
      'Comentarios Kajabi (Synergy MBA)',
      'Disputa llamada (si no puede: Marisol o DLP)',
      'Zendesk (apoyo Marlen)',
      'Seguimiento materiales faltantes Kajabi con MDD',
      'Checar correo @Hola y @JML zigma',
      'Comunidades WhatsApp (apoyo Marlen)',
      'Seguimiento disputas',
      'WhatsApp General y WhatsApp 6675',
      'Completos (Giras)',
    ],
  },
  {
    id: 'msr',
    name: 'Marisol',
    role: 'Soporte Llamadas y Renovaciones',
    initial: 'M',
    isAdmin: false,
    username: 'marisol',
    email: 'mzepeda@zigma3.com',
    password: 'Marisol2026',
    permissions: ['checklist','manuales','buscar'],
    tasks: [
      'Revisar agenda de llamadas',
      'Llamadas Disputas (con Gali)',
      'WhatsApp ATC (con Gali y Sam)',
      'Llamadas de renovación',
      'Excel de vencidos',
      'WhatsApp 8292',
      'Acceso Webinar',
      'Orden de base de datos',
      'Plataforma Skool',
      'Mensajes de Bienvenida',
      'Completos (Giras)',
    ],
  },
  {
    id: 'ysr',
    name: 'Yeshua',
    role: 'Soporte Redes Sociales',
    initial: 'Y',
    isAdmin: false,
    username: 'yeshua',
    email: 'yeshuaemmanuelalcantarquezada@gmail.com',
    password: 'Yeshua2026',
    permissions: ['checklist','manuales','buscar'],
    tasks: [
      'Contestar INBOX (Instagram, Facebook, TikTok)',
      'Revisar comentarios (admin meta)',
      'Base de datos para segmentar público de redes a YouTube',
      'Excel Regulación de comentarios',
      'Revisar comentarios departamento Marketing',
      'Base de datos de boletos faltantes',
      'Apartados (Giras)',
    ],
  },
  {
    id: 'dgr',
    name: 'Diego',
    role: 'Soporte Cultura y Bienvenida',
    initial: 'D',
    isAdmin: false,
    username: 'diego',
    email: 'dieguin5723@gmail.com',
    password: 'Diego2026',
    permissions: ['checklist','manuales','buscar'],
    tasks: [
      'Llamadas de Bienvenida',
      'Llamadas de Skool',
      'Líder de Cultura',
      'Archivo',
      'Interesados (Giras)',
    ],
  },
  {
    id: 'jsr',
    name: 'Jorge Serratos',
    role: 'CEO',
    initial: 'J',
    isAdmin: false,
    username: 'jorge',
    email: 'jserratos@zigma3.com',
    password: '',
    permissions: ['manuales', 'buscar'],
    tasks: [],
  },
  {
    id: 'mdl',
    name: 'Manuel de León',
    role: 'CEO',
    initial: 'M',
    isAdmin: false,
    username: 'manuel',
    email: 'jmdeleon@zigma3.com',
    password: '',
    permissions: ['manuales', 'buscar'],
    tasks: [],
  },
]

export function getMembers(): TeamMember[] {
  if (typeof window === 'undefined') return DEFAULT_MEMBERS
  const saved = localStorage.getItem(STORE_KEY)
  if (!saved) {
    localStorage.setItem(STORE_KEY, JSON.stringify(DEFAULT_MEMBERS))
    return DEFAULT_MEMBERS
  }
  const stored: TeamMember[] = JSON.parse(saved)

  // Combina lo guardado con los valores por defecto: conserva cualquier
  // personalización ya hecha (horario, tareas, permisos...) pero agrega
  // campos nuevos (como "email") y miembros nuevos que aún no existían.
  const merged = DEFAULT_MEMBERS.map(def => {
    const existing = stored.find(m => m.id === def.id)
    return existing ? { ...def, ...existing, email: existing.email || def.email } : def
  })
  const extras = stored.filter(m => !DEFAULT_MEMBERS.some(def => def.id === m.id))
  const result = [...merged, ...extras]

  const resultStr = JSON.stringify(result)
  if (resultStr !== saved) localStorage.setItem(STORE_KEY, resultStr)
  return result
}

export function saveMembers(members: TeamMember[]) {
  localStorage.setItem(STORE_KEY, JSON.stringify(members))
}

// Login local (legado) — válido solo contra lo guardado en este navegador.
export function loginLocal(username: string, password: string): TeamMember | null {
  const members = getMembers()
  return members.find(
    m => m.username.toLowerCase() === username.toLowerCase().trim() && m.password === password
  ) ?? null
}

// Login real con Firebase Authentication. Verifica la identidad contra Firebase
// (no contra lo guardado en este navegador) usando el correo real del perfil.
export async function login(username: string, password: string): Promise<TeamMember | null> {
  const member = getMembers().find(m => m.username.toLowerCase() === username.toLowerCase().trim())
  if (!member?.email) return null

  const { signInWithEmailAndPassword } = await import('firebase/auth')
  const { auth } = await import('./firebase')
  try {
    await signInWithEmailAndPassword(auth, member.email, password)
  } catch {
    return null
  }
  return member
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  const s = sessionStorage.getItem(SESSION_KEY)
  return s ? JSON.parse(s) : null
}

export function setSession(member: TeamMember) {
  const session: Session = {
    memberId: member.id,
    memberName: member.name,
    isAdmin: member.isAdmin,
    loginTime: new Date().toISOString(),
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
  import('firebase/auth').then(({ signOut }) => import('./firebase').then(({ auth }) => signOut(auth).catch(() => {})))
}

export function getAttendance(): AttendanceRecord[] {
  if (typeof window === 'undefined') return []
  const saved = localStorage.getItem(ATTEND_KEY)
  return saved ? JSON.parse(saved) : []
}

export function saveAttendance(records: AttendanceRecord[]) {
  localStorage.setItem(ATTEND_KEY, JSON.stringify(records))
}

export function recordAttendance(member: TeamMember, tasksDone: number, tasksTotal: number): AttendanceRecord {
  const today = new Date().toISOString().split('T')[0]
  const records = getAttendance()
  const existing = records.find(r => r.memberId === member.id && r.date === today)
  if (existing) return existing
  const record: AttendanceRecord = {
    id: `${member.id}_${today}`,
    memberId: member.id,
    memberName: member.name,
    memberRole: member.role,
    date: today,
    completedAt: new Date().toISOString(),
    status: 'pending',
    tasksTotal,
    tasksDone,
  }
  saveAttendance([...records, record])
  return record
}

export function confirmAttendance(recordId: string, status: 'completo' | 'incompleto') {
  const records = getAttendance()
  const updated = records.map(r =>
    r.id === recordId
      ? { ...r, status, scannedAt: new Date().toISOString() }
      : r
  )
  saveAttendance(updated)
}

export function getMonthAttendance(year: number, month: number): AttendanceRecord[] {
  const prefix = `${year}-${String(month).padStart(2,'0')}`
  return getAttendance().filter(r => r.date.startsWith(prefix))
}

// ─── Firmas de Reglamento ─────────────────────────────────────────────────────

const SIGNATURES_KEY = 'reglamento_signatures_v1'

export function getSignatures(): ReglamentoSignature[] {
  if (typeof window === 'undefined') return []
  const s = localStorage.getItem(SIGNATURES_KEY)
  return s ? JSON.parse(s) : []
}

export function hasSignedReglamento(memberId: string): boolean {
  return getSignatures().some(s => s.memberId === memberId)
}

export function saveSignature(sig: ReglamentoSignature) {
  const sigs = getSignatures().filter(s => s.memberId !== sig.memberId)
  localStorage.setItem(SIGNATURES_KEY, JSON.stringify([...sigs, sig]))
}

// ─── Incidencias ──────────────────────────────────────────────────────────────

const INCIDENCIAS_KEY = 'incidencias_v1'

export function getIncidencias(): Incidencia[] {
  if (typeof window === 'undefined') return []
  const s = localStorage.getItem(INCIDENCIAS_KEY)
  return s ? JSON.parse(s) : []
}

export function getIncidenciasByMember(memberId: string): Incidencia[] {
  return getIncidencias().filter(i => i.colaboradorId === memberId)
}

export function saveIncidencia(inc: Incidencia) {
  const all = getIncidencias()
  localStorage.setItem(INCIDENCIAS_KEY, JSON.stringify([inc, ...all]))
}

export function deleteIncidencia(id: string) {
  const all = getIncidencias().filter(i => i.id !== id)
  localStorage.setItem(INCIDENCIAS_KEY, JSON.stringify(all))
}

// ─── Guardias (ahora viven en Firestore — ver lib/firestoreCollection.ts) ──────

export const DEFAULT_GUARDIA_PATRON: GuardiaPatron = {
  lunes: ['so'],       // Samuel
  martes: ['dgr'],     // Diego
  miercoles: ['ge'],   // Galilea
  jueves: ['dlp'],     // Deborah
  viernes: ['msr'],    // Marisol
}

// ─── Giras ────────────────────────────────────────────────────────────────────

export type GiraEvento = {
  id: string
  nombre: string
  fecha: string
  horario1: string
  horario2?: string
  createdBy: string
  createdAt: string
}

export type GiraCatData = {
  activo: boolean
  posicion: 'arriba' | 'abajo' | ''
  desde: string
  hasta: string
}

export type GiraRegistro = {
  id: string
  eventoId: string
  memberId: string
  memberName: string
  // Horario 1
  completos: GiraCatData
  apartados: GiraCatData
  interesados: GiraCatData
  actividadCompletada: boolean
  actividadCompletadaAt?: string
  // Horario 2 (solo si el evento tiene segundo horario)
  h2completos?: GiraCatData
  h2apartados?: GiraCatData
  h2interesados?: GiraCatData
  h2actividadCompletada?: boolean
  h2actividadCompletadaAt?: string
  updatedAt: string
}

export type GiraAlerta = {
  eventoId: string
  triggeredBy: string
  triggeredAt: string
}

const GIRAS_EV_KEY  = 'giras_eventos_v1'
const GIRAS_REG_KEY = 'giras_registros_v1'
const GIRAS_ALT_KEY = 'giras_alertas_v1'

export function getGiraEventos(): GiraEvento[] {
  if (typeof window === 'undefined') return []
  const s = localStorage.getItem(GIRAS_EV_KEY)
  return s ? JSON.parse(s) : []
}
export function saveGiraEvento(ev: GiraEvento) {
  const all = getGiraEventos().filter(x => x.id !== ev.id)
  localStorage.setItem(GIRAS_EV_KEY, JSON.stringify([...all, ev]))
}
export function deleteGiraEvento(id: string) {
  localStorage.setItem(GIRAS_EV_KEY, JSON.stringify(getGiraEventos().filter(x => x.id !== id)))
}

export function getGiraRegistros(eventoId: string): GiraRegistro[] {
  if (typeof window === 'undefined') return []
  const s = localStorage.getItem(GIRAS_REG_KEY)
  const all: GiraRegistro[] = s ? JSON.parse(s) : []
  return all.filter(r => r.eventoId === eventoId)
}
export function saveGiraRegistro(r: GiraRegistro) {
  const s = localStorage.getItem(GIRAS_REG_KEY)
  const all: GiraRegistro[] = s ? JSON.parse(s) : []
  const filtered = all.filter(x => x.id !== r.id)
  localStorage.setItem(GIRAS_REG_KEY, JSON.stringify([...filtered, r]))
}

export function getGiraAlerta(eventoId: string): GiraAlerta | null {
  if (typeof window === 'undefined') return null
  const s = localStorage.getItem(`${GIRAS_ALT_KEY}_${eventoId}`)
  return s ? JSON.parse(s) : null
}
export function setGiraAlerta(alerta: GiraAlerta) {
  localStorage.setItem(`${GIRAS_ALT_KEY}_${alerta.eventoId}`, JSON.stringify(alerta))
}
export function clearGiraAlerta(eventoId: string) {
  localStorage.removeItem(`${GIRAS_ALT_KEY}_${eventoId}`)
}

const EMPTY_CAT: GiraCatData = { activo: false, posicion: '', desde: '', hasta: '' }
export function emptyRegistro(eventoId: string, member: TeamMember): GiraRegistro {
  return {
    id: `gr_${eventoId}_${member.id}`,
    eventoId, memberId: member.id, memberName: member.name,
    completos: { ...EMPTY_CAT }, apartados: { ...EMPTY_CAT }, interesados: { ...EMPTY_CAT },
    actividadCompletada: false, updatedAt: new Date().toISOString(),
  }
}

// ─── Eventos de cuenta regresiva ─────────────────────────────────────────────

export type CountdownEvent = {
  id: string
  titulo: string
  fechaInicio: string  // ISO datetime "2026-05-15T09:00"
  fechaFin: string     // ISO datetime "2026-05-20T18:00"
  color: string        // accent color key: 'blue' | 'purple' | 'amber' | 'green' | 'red'
}

const COUNTDOWN_KEY = 'countdown_events_v1'

export function getCountdownEvents(): CountdownEvent[] {
  if (typeof window === 'undefined') return []
  const s = localStorage.getItem(COUNTDOWN_KEY)
  return s ? JSON.parse(s) : []
}

export function saveCountdownEvent(ev: CountdownEvent) {
  const all = getCountdownEvents().filter(x => x.id !== ev.id)
  localStorage.setItem(COUNTDOWN_KEY, JSON.stringify([...all, ev]))
}

export function deleteCountdownEvent(id: string) {
  const all = getCountdownEvents().filter(x => x.id !== id)
  localStorage.setItem(COUNTDOWN_KEY, JSON.stringify(all))
}

// ─── Reportes pre-QR ─────────────────────────────────────────────────────────

export type ReporteQR = {
  id: string
  memberId: string
  memberName: string
  fecha: string
  hora: string
  whatsapp: number
  zendesk: number
  correo: number
  llamadas: number
  telegram: number
  instagram: number
  facebook: number
  whatsappViejito: number
  whatsappSoporte: number
  whatsappSkool: number
  ghl: number
  tareasExtra: string[]
  status: 'completo' | 'incompleto'
  createdAt: string
}

const REPORTES_KEY = 'reportes_qr_v1'

export function getReportesQR(): ReporteQR[] {
  if (typeof window === 'undefined') return []
  const s = localStorage.getItem(REPORTES_KEY)
  return s ? JSON.parse(s) : []
}

export function saveReporteQR(r: ReporteQR) {
  const all = getReportesQR()
  localStorage.setItem(REPORTES_KEY, JSON.stringify([r, ...all]))
}

export function getReportesQRByMember(memberId: string): ReporteQR[] {
  return getReportesQR().filter(r => r.memberId === memberId)
}

// ─── Helpers de horario ───────────────────────────────────────────────────────

export const DIA_KEYS: DiaSemana[] = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']

export function getHorarioHoy(member: TeamMember): HorarioDia | null {
  if (!member.horario) return null
  const key = DIA_KEYS[new Date().getDay()]
  return member.horario[key] ?? null
}
