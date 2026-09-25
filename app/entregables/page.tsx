'use client'

import { useState } from 'react'
import { FileText, Plus, X, Download, Trash2, Upload } from 'lucide-react'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { useFirestoreCollection } from '@/lib/firestoreCollection'
import { useAuth } from '@/components/LoginGate'

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

const MAX_MB = 25

type Entregable = {
  id: string
  nombre: string
  url: string
  storagePath: string
  tamano: number
  createdBy: string
  createdAt: string
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

function NuevoEntregableModal({ onClose, onSave }: {
  onClose: () => void
  onSave: (nombre: string, file: File, onProgress: (pct: number) => void) => Promise<void>
}) {
  const [nombre, setNombre] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [progreso, setProgreso] = useState(0)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')

  const inputStyle = { background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }

  function elegirArchivo(f: File | null) {
    setError('')
    if (!f) { setFile(null); return }
    const esPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    if (!esPdf) { setError('Solo se permiten archivos PDF'); setFile(null); return }
    if (f.size > MAX_MB * 1024 * 1024) { setError(`El archivo pesa más de ${MAX_MB} MB`); setFile(null); return }
    setFile(f)
    if (!nombre.trim()) setNombre(f.name.replace(/\.pdf$/i, ''))
  }

  async function subir() {
    if (!file || !nombre.trim() || subiendo) return
    setSubiendo(true)
    setError('')
    setProgreso(0)
    try {
      await onSave(nombre.trim(), file, setProgreso)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir el archivo. Intenta de nuevo.')
      setSubiendo(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,var(--th-overlay-alpha))', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (!subiendo && e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'var(--th-inner)', border: '1px solid rgba(180,185,210,0.2)', boxShadow: '0 0 80px rgba(0,0,0,0.9)' }}>

        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
          <p className="flex-1 text-sm font-bold" style={{ color: S.silverBright }}>Nuevo entregable</p>
          {!subiendo && <button onClick={onClose} style={{ color: S.silverDim }}><X size={16} /></button>}
        </div>

        <div className="px-5 py-5 space-y-4">
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Nombre</p>
            <input value={nombre} onChange={e => setNombre(e.target.value)} disabled={subiendo}
              placeholder="ej. Manual de bienvenida"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Archivo PDF</p>
            <label className="flex flex-col items-center justify-center gap-2 py-6 rounded-xl cursor-pointer text-center"
              style={{ background: 'var(--th-input)', border: `1px dashed ${S.border}` }}>
              <Upload size={20} style={{ color: S.silverDim }} />
              <span className="text-xs" style={{ color: file ? S.silverBright : S.silverDim }}>
                {file ? file.name : `Toca para elegir un PDF (máx. ${MAX_MB}MB)`}
              </span>
              <input type="file" accept="application/pdf,.pdf" disabled={subiendo}
                onChange={e => elegirArchivo(e.target.files?.[0] ?? null)}
                className="hidden" />
            </label>
          </div>

          {subiendo && (
            <div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(180,185,210,0.1)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${progreso}%`, background: '#70c080' }} />
              </div>
              <p className="text-[10px] mt-1 text-center" style={{ color: S.silverDim }}>Subiendo… {progreso}%</p>
            </div>
          )}

          {error && <p className="text-[11px] font-semibold text-center" style={{ color: '#e07070' }}>{error}</p>}
        </div>

        <div className="px-5 py-4" style={{ borderTop: `1px solid ${S.border}` }}>
          <button onClick={subir} disabled={!file || !nombre.trim() || subiendo}
            className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)', opacity: !file || !nombre.trim() || subiendo ? 0.5 : 1 }}>
            {subiendo ? 'Subiendo…' : 'Subir entregable'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EntregablesPage() {
  const { member } = useAuth()
  const { data, loading, add, remove } = useFirestoreCollection<Entregable>('entregables')
  const [modal, setModal] = useState(false)
  const [confirmarBorrar, setConfirmarBorrar] = useState<string | null>(null)
  const [borrando, setBorrando] = useState<string | null>(null)
  const [error, setError] = useState('')

  const items = [...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  async function guardar(nombre: string, file: File, onProgress: (pct: number) => void) {
    const path = `entregables/${Date.now()}_${file.name}`
    const storageRef = ref(storage, path)
    const task = uploadBytesResumable(storageRef, file)
    await new Promise<void>((resolve, reject) => {
      task.on('state_changed',
        snap => onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        err => reject(err),
        () => resolve()
      )
    })
    const url = await getDownloadURL(task.snapshot.ref)
    await add({
      nombre, url, storagePath: path, tamano: file.size,
      createdBy: member?.name || 'Equipo', createdAt: new Date().toISOString(),
    })
    setModal(false)
  }

  async function eliminar(item: Entregable) {
    setBorrando(item.id)
    setError('')
    try {
      try { await deleteObject(ref(storage, item.storagePath)) } catch { /* si ya no existe, seguimos */ }
      await remove(item.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar')
    } finally {
      setBorrando(null)
      setConfirmarBorrar(null)
    }
  }

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: S.silverBright }}>Entregables</h1>
          <p className="text-sm mt-1" style={{ color: S.silverDim }}>
            Archivos PDF del equipo — súbelos y descárgalos cuando los necesites
          </p>
        </div>

        <button onClick={() => setModal(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-5 text-sm font-bold transition-all"
          style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: '1px solid rgba(180,185,210,0.22)' }}>
          <Plus size={16} /> Nuevo
        </button>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-xl text-[11px] leading-relaxed"
            style={{ background: 'rgba(220,80,80,0.08)', border: '1px solid rgba(220,80,80,0.25)', color: '#e07070' }}>
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-sm py-10" style={{ color: S.silverDim }}>Cargando…</p>
        ) : items.length === 0 ? (
          <div className="text-center py-12" style={{ color: S.silverDim }}>
            <FileText size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Sin entregables guardados todavía</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map(item => (
              <div key={item.id} className="rounded-xl overflow-hidden" style={{ background: S.card, border: `1px solid ${S.border}` }}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(220,70,70,0.1)', border: '1px solid rgba(220,70,70,0.25)' }}>
                    <FileText size={16} style={{ color: '#e07070' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" style={{ color: S.silverBright }}>{item.nombre}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: S.silverDim }}>
                      {formatSize(item.tamano)} · {formatFecha(item.createdAt)} · {item.createdBy}
                    </p>
                  </div>

                  {confirmarBorrar === item.id ? (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => setConfirmarBorrar(null)} disabled={borrando === item.id}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold"
                        style={{ color: S.silverDim, border: `1px solid ${S.border}` }}>
                        Cancelar
                      </button>
                      <button onClick={() => eliminar(item)} disabled={borrando === item.id}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold"
                        style={{ background: 'rgba(220,80,80,0.15)', color: '#e07070', border: '1px solid rgba(220,80,80,0.35)' }}>
                        {borrando === item.id ? '…' : 'Confirmar'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" download={`${item.nombre}.pdf`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{ background: 'rgba(180,185,210,0.06)', border: `1px solid ${S.border}`, color: S.silverDim }}
                        title="Descargar">
                        <Download size={14} />
                      </a>
                      <button onClick={() => setConfirmarBorrar(item.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{ background: 'rgba(180,185,210,0.06)', border: `1px solid ${S.border}`, color: S.silverDim }}
                        title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <NuevoEntregableModal onClose={() => setModal(false)} onSave={guardar} />
      )}
    </div>
  )
}
