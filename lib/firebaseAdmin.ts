import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Acceso de SOLO servidor a Firestore, para la API interna. La cuenta de
// servicio vive únicamente en una variable de entorno de Vercel
// (FIREBASE_SERVICE_ACCOUNT): puede ser el JSON tal cual o en base64.
function credenciales() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim()
  if (!raw) return null
  const json = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8')
  const sa = JSON.parse(json)
  if (typeof sa.private_key === 'string') sa.private_key = sa.private_key.replace(/\\n/g, '\n')
  return sa
}

export function adminDb() {
  if (!getApps().length) {
    const sa = credenciales()
    if (!sa) throw new Error('FIREBASE_SERVICE_ACCOUNT no configurada')
    initializeApp({ credential: cert(sa) })
  }
  return getFirestore()
}

export function adminConfigurado() {
  return !!process.env.FIREBASE_SERVICE_ACCOUNT?.trim()
}
