'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Tag, ChevronLeft, Volume2, VolumeX, Copy, Check } from 'lucide-react'
import { articles, categories } from '@/lib/data'
import { notFound } from 'next/navigation'

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

// ── Radar SVG background ──────────────────────────────────────
function RadarBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.07 }}>
        <defs>
          {/* Radar sweep gradient */}
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#b8bcc8" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#b8bcc8" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#d4d8e8" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#d4d8e8" stopOpacity="0"/>
          </linearGradient>
        </defs>

        {/* Concentric circles */}
        <circle cx="50%" cy="50%" r="8%" fill="none" stroke="#b8bcc8" strokeWidth="0.5"/>
        <circle cx="50%" cy="50%" r="16%" fill="none" stroke="#b8bcc8" strokeWidth="0.4"/>
        <circle cx="50%" cy="50%" r="24%" fill="none" stroke="#b8bcc8" strokeWidth="0.4"/>
        <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#b8bcc8" strokeWidth="0.3"/>
        <circle cx="50%" cy="50%" r="48%" fill="none" stroke="#b8bcc8" strokeWidth="0.3"/>
        <circle cx="50%" cy="50%" r="62%" fill="none" stroke="#b8bcc8" strokeWidth="0.2"/>
        <circle cx="50%" cy="50%" r="80%" fill="none" stroke="#b8bcc8" strokeWidth="0.2"/>

        {/* Cross lines */}
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#b8bcc8" strokeWidth="0.3"/>
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#b8bcc8" strokeWidth="0.3"/>
        <line x1="15%" y1="0" x2="85%" y2="100%" stroke="#b8bcc8" strokeWidth="0.15"/>
        <line x1="85%" y1="0" x2="15%" y2="100%" stroke="#b8bcc8" strokeWidth="0.15"/>

        {/* Corner brackets */}
        <path d="M 20 20 L 20 50 M 20 20 L 50 20" stroke="#d4d8e8" strokeWidth="1" fill="none"/>
        <path d="M calc(100% - 20px) 20 L calc(100% - 20px) 50 M calc(100% - 20px) 20 L calc(100% - 50px) 20" stroke="#d4d8e8" strokeWidth="1" fill="none"/>
        <path d="M 20 calc(100% - 20px) L 20 calc(100% - 50px) M 20 calc(100% - 20px) L 50 calc(100% - 20px)" stroke="#d4d8e8" strokeWidth="1" fill="none"/>
        <path d="M calc(100% - 20px) calc(100% - 20px) L calc(100% - 20px) calc(100% - 50px) M calc(100% - 20px) calc(100% - 20px) L calc(100% - 50px) calc(100% - 20px)" stroke="#d4d8e8" strokeWidth="1" fill="none"/>
      </svg>

      {/* Radar sweep animation */}
      <div className="absolute" style={{
        top: '50%', left: '50%',
        width: '100%', height: '100%',
        transform: 'translate(-50%, -50%)',
      }}>
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: '100%',
          height: '100%',
          transformOrigin: '0 0',
          animation: 'radarSweep 4s linear infinite',
          background: 'conic-gradient(from 0deg, transparent 0deg, rgba(180,185,210,0.08) 30deg, transparent 60deg)',
        }} />
      </div>

      {/* Scan line */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(180,185,210,0.3), transparent)',
        animation: 'scanLine 3s ease-in-out infinite',
      }} />

      <style>{`
        @keyframes radarSweep {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes scanLine {
          0%   { top: 0; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// ── Markdown renderer ─────────────────────────────────────────
function renderLine(line: string, i: number) {
  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    return parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**'))
        return <strong key={j} style={{ color: S.silverBright, fontWeight: 700 }}>{part.slice(2, -2)}</strong>
      if (part.startsWith('*') && part.endsWith('*'))
        return <em key={j} style={{ color: S.silver }}>{part.slice(1, -1)}</em>
      return <span key={j}>{part}</span>
    })
  }

  const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
  if (imgMatch) return (
    <div key={i} className="my-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imgMatch[2]} alt={imgMatch[1] || 'imagen'}
        className="rounded-xl max-w-full"
        style={{ border: `1px solid ${S.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} />
    </div>
  )
  if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mb-4" style={{ color: S.silverBright }}>{renderInline(line.slice(2))}</h1>
  if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold mb-3 pb-2" style={{ color: S.silverBright, borderBottom: `1px solid ${S.border}` }}>{renderInline(line.slice(3))}</h2>
  if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold mb-2 mt-4" style={{ color: S.silver }}>{renderInline(line.slice(4))}</h3>
  if (line.startsWith('> ')) return (
    <blockquote key={i} className="pl-4 py-2 my-3 text-sm italic rounded-r-lg"
      style={{ borderLeft: `3px solid ${S.borderActive}`, background: 'rgba(180,185,210,0.04)', color: '#9098b8' }}>
      {renderInline(line.slice(2))}
    </blockquote>
  )
  if (line.startsWith('- ') || line.startsWith('* ')) return (
    <div key={i} className="flex gap-3 text-sm leading-relaxed mb-1" style={{ color: '#9098a8' }}>
      <span style={{ color: S.silverDim, flexShrink: 0, marginTop: '2px' }}>›</span>
      <span>{renderInline(line.slice(2))}</span>
    </div>
  )
  if (line.match(/^\d+[\.:]\s/)) return (
    <div key={i} className="flex gap-3 text-sm leading-relaxed mb-1 ml-1" style={{ color: '#9098a8' }}>
      <span style={{ color: S.silverDim, flexShrink: 0, minWidth: '18px' }}>{line.match(/^\d+/)?.[0]}.</span>
      <span>{renderInline(line.replace(/^\d+[\.:]\s/, ''))}</span>
    </div>
  )
  if (line.startsWith('---')) return <hr key={i} className="my-4" style={{ border: 'none', borderTop: `1px solid ${S.border}` }} />
  if (line.startsWith('|')) return (
    <div key={i} className="overflow-x-auto my-1">
      <p className="text-xs font-mono py-0.5 whitespace-nowrap" style={{ color: '#6a7080' }}>{line}</p>
    </div>
  )
  if (line.trim() === '') return <div key={i} className="h-3" />
  return <p key={i} className="text-sm leading-relaxed mb-1" style={{ color: '#9098a8' }}>{renderInline(line)}</p>
}

// ── Chapter splitter ──────────────────────────────────────────
function splitIntoChapters(content: string): { title: string; lines: string[] }[] {
  const lines = content.split('\n')
  const chapters: { title: string; lines: string[] }[] = []
  let current: { title: string; lines: string[] } | null = null

  for (const line of lines) {
    const isHeading = line.match(/^#{1,3} /)
    if (isHeading) {
      const title = line.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim()
      const level = line.match(/^(#+)/)?.[1].length ?? 1
      const isNumberedH3 = level === 3 && title.match(/^\d+[\.\s]/)
      const startsNewPage = level <= 2 || isNumberedH3
      if (!current) {
        current = { title, lines: [line] }
      } else if (startsNewPage) {
        if (current.lines.some(l => l.trim())) chapters.push(current)
        current = { title, lines: [line] }
      } else {
        current.lines.push(line)
      }
    } else {
      if (!current) current = { title: 'Introducción', lines: [] }
      current.lines.push(line)
    }
  }
  if (current && current.lines.some(l => l.trim())) chapters.push(current)
  return chapters.filter(c => c.lines.some(l => l.trim()))
}

function getChapterText(lines: string[]): string {
  return lines
    .filter(l => !l.startsWith('![') && !l.startsWith('---'))
    .map(l => l.replace(/^#+\s*/, '').replace(/\*\*/g, '').replace(/\*/g, '').replace(/^[-›>]\s*/, '').replace(/^\d+[\.:]\s*/, ''))
    .filter(l => l.trim())
    .join('. ')
}

// ── Main component ────────────────────────────────────────────
export default function ArticlePage() {
  const params = useParams()
  const id = params?.id as string
  const article = articles.find((a) => a.id === id)
  if (!article) return notFound()

  const category = categories.find((c) => c.id === article.category_id)
  const chapters = splitIntoChapters(article.content)
  const [current, setCurrent] = useState(0)
  const [speaking, setSpeaking] = useState(false)
  const [copied, setCopied] = useState(false)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)

  const chapter = chapters[current]

  // Stop speech when changing chapter
  useEffect(() => {
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    setSpeaking(false)
  }, [current])

  useEffect(() => {
    return () => { if (typeof window !== 'undefined') window.speechSynthesis?.cancel() }
  }, [])

  const toggleSpeak = useCallback(() => {
    if (typeof window === 'undefined') return
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const text = getChapterText(chapter.lines)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'es-MX'
    utterance.rate = 0.95
    utterance.pitch = 1
    const voices = window.speechSynthesis.getVoices()
    const spanish = voices.find(v => v.lang.startsWith('es'))
    if (spanish) utterance.voice = spanish
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    synthRef.current = utterance
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }, [speaking, chapter])

  const copyText = useCallback(() => {
    const text = getChapterText(chapter.lines)
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [chapter])

  const goNext = () => { setCurrent(p => Math.min(chapters.length - 1, p + 1)) }
  const goPrev = () => { setCurrent(p => Math.max(0, p - 1)) }

  return (
    <div style={{ background: S.bg, height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Radar background */}
      <RadarBackground />

      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 flex-shrink-0 relative z-10"
        style={{ borderBottom: `1px solid ${S.border}`, background: 'rgba(6,6,8,0.85)', backdropFilter: 'blur(12px)' }}>
        <Link href={`/manual?categoria=${category?.slug}`}
          className="p-2 rounded-xl transition-all flex-shrink-0"
          style={{ color: S.silver, background: 'rgba(180,185,210,0.06)', border: `1px solid ${S.border}` }}>
          <ChevronLeft size={16} />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-xs truncate" style={{ color: S.silverDim }}>{category?.icon} {category?.name}</p>
          <p className="text-sm font-semibold truncate" style={{ color: S.silverBright }}>{article.title}</p>
        </div>

        {/* Escuchar y Copiar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={copyText}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all"
            style={{ color: copied ? '#70c080' : S.silver, border: `1px solid ${copied ? 'rgba(100,200,120,0.3)' : S.border}`, background: 'rgba(180,185,210,0.05)' }}
            title="Copiar texto">
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
          <button onClick={toggleSpeak}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all"
            style={{
              color: speaking ? S.silverBright : S.silver,
              border: `1px solid ${speaking ? S.borderActive : S.border}`,
              background: speaking ? 'rgba(180,185,210,0.12)' : 'rgba(180,185,210,0.05)',
              boxShadow: speaking ? '0 0 12px rgba(180,185,210,0.15)' : 'none',
            }}
            title="Escuchar texto">
            {speaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
            <span className="hidden sm:inline">{speaking ? 'Detener' : 'Escuchar'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
          <span className="text-xs" style={{ color: S.silverDim }}>{current + 1}/{chapters.length}</span>
        </div>
      </div>

      {/* Barra de progreso */}
      <div style={{ height: '2px', background: S.border, flexShrink: 0, position: 'relative', zIndex: 10 }}>
        <div style={{
          height: '100%',
          width: `${((current + 1) / chapters.length) * 100}%`,
          background: 'linear-gradient(90deg, #3a3e4a, #d4d8e8)',
          transition: 'width 0.3s ease',
          boxShadow: '0 0 8px rgba(212,216,232,0.4)',
        }} />
      </div>

      {/* Índice de capítulos */}
      {chapters.length > 1 && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto flex-shrink-0 relative z-10"
          style={{ borderBottom: `1px solid ${S.border}`, background: 'rgba(6,6,8,0.7)', backdropFilter: 'blur(8px)' }}>
          {chapters.map((ch, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all"
              style={i === current
                ? { background: 'rgba(180,185,210,0.15)', color: S.silverBright, border: `1px solid ${S.borderActive}`, boxShadow: '0 0 8px rgba(180,185,210,0.1)' }
                : { background: 'transparent', color: S.silverDim, border: `1px solid ${S.border}` }
              }>
              {i + 1}. {ch.title.length > 28 ? ch.title.slice(0, 28) + '…' : ch.title}
            </button>
          ))}
        </div>
      )}

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto relative z-10" style={{ scrollbarWidth: 'thin', scrollbarColor: `${S.border} transparent` }}>
        <div className="px-4 py-6 max-w-2xl mx-auto w-full">
          {chapter.lines.map((line, i) => renderLine(line, i))}
          {current === 0 && article.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-6 pt-4" style={{ borderTop: `1px solid ${S.border}` }}>
              {article.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                  style={{ background: 'rgba(180,185,210,0.06)', color: S.silverDim, border: `1px solid ${S.border}` }}>
                  <Tag size={9} />{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botones de navegación — siempre visibles */}
      {chapters.length > 1 && (
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 relative z-10"
          style={{
            borderTop: `1px solid ${S.border}`,
            background: 'rgba(6,6,8,0.92)',
            backdropFilter: 'blur(16px)',
          }}>
          <button onClick={goPrev} disabled={current === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={current === 0
              ? { color: S.silverDim, border: `1px solid ${S.border}`, opacity: 0.35, cursor: 'not-allowed' }
              : { color: S.silver, border: `1px solid ${S.borderActive}`, background: 'rgba(180,185,210,0.06)' }
            }>
            <ArrowLeft size={15} /> Anterior
          </button>

          <div className="text-center">
            <p className="text-xs" style={{ color: S.silverDim }}>
              {current + 1} <span style={{ color: S.silverDim }}>de</span> {chapters.length}
            </p>
            <p className="text-xs truncate max-w-[160px]" style={{ color: S.silverDim }}>
              {chapter.title.length > 25 ? chapter.title.slice(0, 25) + '…' : chapter.title}
            </p>
          </div>

          <button onClick={goNext} disabled={current === chapters.length - 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={current === chapters.length - 1
              ? { color: S.silverDim, border: `1px solid ${S.border}`, opacity: 0.35, cursor: 'not-allowed' }
              : {
                  color: S.silverBright,
                  border: `1px solid ${S.borderActive}`,
                  background: 'rgba(180,185,210,0.1)',
                  boxShadow: '0 0 16px rgba(180,185,210,0.08)',
                }
            }>
            Siguiente <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
