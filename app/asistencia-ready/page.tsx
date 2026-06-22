'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const S = {
  bg: '#040406', silver: '#b8bcc8', silverBright: '#d4d8e8', silverDim: '#3a3e4a',
}

export default function ScannerPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'processing' | 'found' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setStatus('processing')
    setErrorMsg('')

    try {
      const bitmap = await createImageBitmap(file)
      const canvas = canvasRef.current!
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!
      ctx.drawImage(bitmap, 0, 0)
      const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height)

      // Decode QR with jsQR
      const { default: jsQR } = await import('jsqr')
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      })

      if (!code?.data) {
        setStatus('error')
        setErrorMsg('No se detectó un código QR. Intenta con mejor luz o más cerca.')
        return
      }

      if (!code.data.includes('/asistencia?d=')) {
        setStatus('error')
        setErrorMsg('El QR no es un código de asistencia válido.')
        return
      }

      setStatus('found')
      const url = new URL(code.data)
      setTimeout(() => router.push('/asistencia' + url.search), 500)

    } catch (err) {
      setStatus('error')
      setErrorMsg('Error procesando la imagen. Intenta de nuevo.')
    }

    // Reset input for next scan
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div style={{
      minHeight: '100dvh', background: S.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
    }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{ width: '100%', maxWidth: '300px', textAlign: 'center' }}>

        {/* Icon */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            width: 80, height: 80, margin: '0 auto 16px',
            position: 'relative',
          }}>
            {/* QR frame corners */}
            {[
              { top: 0, left: 0, borderTop: '3px solid #d4d8e8', borderLeft: '3px solid #d4d8e8', borderRadius: '6px 0 0 0' },
              { top: 0, right: 0, borderTop: '3px solid #d4d8e8', borderRight: '3px solid #d4d8e8', borderRadius: '0 6px 0 0' },
              { bottom: 0, left: 0, borderBottom: '3px solid #d4d8e8', borderLeft: '3px solid #d4d8e8', borderRadius: '0 0 0 6px' },
              { bottom: 0, right: 0, borderBottom: '3px solid #d4d8e8', borderRight: '3px solid #d4d8e8', borderRadius: '0 0 6px 0' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', width: 22, height: 22, ...s }} />
            ))}
            {/* Center dot */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 12, height: 12, borderRadius: '50%',
              background: status === 'found' ? '#70c080' : status === 'error' ? '#e07070' : status === 'processing' ? '#d4a050' : S.silver,
              boxShadow: `0 0 12px ${status === 'found' ? 'rgba(112,192,128,0.6)' : status === 'error' ? 'rgba(224,112,112,0.4)' : 'rgba(180,185,210,0.3)'}`,
              transition: 'all 0.3s',
            }} />
          </div>

          <p style={{ color: S.silverBright, fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
            {status === 'idle' && 'Escanear QR'}
            {status === 'processing' && 'Procesando...'}
            {status === 'found' && '¡QR detectado!'}
            {status === 'error' && 'No se pudo leer'}
          </p>
          <p style={{ color: S.silverDim, fontSize: '13px', lineHeight: 1.5 }}>
            {status === 'idle' && 'Presiona el botón para abrir la cámara y fotografiar el QR del colaborador'}
            {status === 'processing' && 'Leyendo el código QR...'}
            {status === 'found' && 'Cargando asistencia...'}
            {status === 'error' && errorMsg}
          </p>
        </div>

        {/* Camera button */}
        {(status === 'idle' || status === 'error') && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhoto}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => inputRef.current?.click()}
              style={{
                width: '100%',
                padding: '18px',
                borderRadius: '20px',
                background: 'rgba(180,185,210,0.12)',
                color: S.silverBright,
                border: '2px solid rgba(180,185,210,0.3)',
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                boxShadow: '0 0 24px rgba(180,185,210,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}>
              <span style={{ fontSize: '22px' }}>📷</span>
              {status === 'error' ? 'Intentar de nuevo' : 'Abrir cámara'}
            </button>

            {status === 'error' && (
              <p style={{ color: S.silverDim, fontSize: '11px', marginTop: '12px' }}>
                Asegúrate de fotografiar el QR completo con buena luz
              </p>
            )}
          </>
        )}

        {status === 'processing' && (
          <div style={{
            padding: '16px',
            borderRadius: '16px',
            background: 'rgba(212,160,80,0.08)',
            border: '1px solid rgba(212,160,80,0.2)',
            color: '#d4a050',
            fontSize: '14px',
          }}>
            Analizando imagen...
          </div>
        )}

        {status === 'found' && (
          <div style={{
            padding: '16px',
            borderRadius: '16px',
            background: 'rgba(112,192,128,0.1)',
            border: '1px solid rgba(112,192,128,0.3)',
            color: '#70c080',
            fontSize: '14px',
            fontWeight: 600,
          }}>
            ✓ Redirigiendo...
          </div>
        )}

        <div style={{ marginTop: '32px', padding: '10px 16px', borderRadius: '10px', background: 'rgba(180,185,210,0.04)', border: '1px solid rgba(180,185,210,0.08)' }}>
          <p style={{ color: S.silverDim, fontSize: '11px', letterSpacing: '0.1em' }}>
            CLUB SINERGETICO · SOPORTE
          </p>
        </div>
      </div>
    </div>
  )
}
