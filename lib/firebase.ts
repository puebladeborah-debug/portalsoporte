import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAuT4T1o30m5qLuVW6bK4odoeyeq9dinJU",
  authDomain: "portal-soporte-847c9.firebaseapp.com",
  projectId: "portal-soporte-847c9",
  storageBucket: "portal-soporte-847c9.firebasestorage.app",
  messagingSenderId: "742422286373",
  appId: "1:742422286373:web:aa23224fab6760b0042fcc",
}

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)
