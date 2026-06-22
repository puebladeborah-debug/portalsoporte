'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, Clock, Plus, Trash2, AlertCircle, Zap } from 'lucide-react'
import { tasks as initialTasks } from '@/lib/data'
import { Task } from '@/lib/types'

const S = {
  bg: '#060608', card: '#0e0e12', border: '#1e1e28',
  borderActive: 'rgba(180,185,210,0.22)', silver: '#b8bcc8',
  silverBright: '#d4d8e8', silverDim: '#3a3e4a',
}

const statusLabel: Record<Task['status'], string> = {
  pendiente: 'Pendiente', en_progreso: 'En progreso', completada: 'Completada',
}

const priorityStyle: Record<Task['priority'], { color: string; bg: string; border: string }> = {
  alta: { color: '#f0a0a0', bg: 'rgba(240,80,80,0.08)', border: 'rgba(240,80,80,0.2)' },
  media: { color: '#d4c060', bg: 'rgba(212,192,60,0.08)', border: 'rgba(212,192,60,0.2)' },
  baja: { color: '#6a7080', bg: 'rgba(100,110,128,0.08)', border: 'rgba(100,110,128,0.15)' },
}

export default function TareasPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<Task['priority']>('media')

  function addTask() {
    if (!newTitle.trim()) return
    const task: Task = {
      id: Date.now().toString(), title: newTitle.trim(), description: '',
      status: 'pendiente', priority: newPriority, due_date: null,
      created_at: new Date().toISOString(),
    }
    setTasks([task, ...tasks])
    setNewTitle('')
    setShowForm(false)
  }

  function toggleStatus(id: string) {
    setTasks(tasks.map((t) => {
      if (t.id !== id) return t
      const next: Record<Task['status'], Task['status']> = {
        pendiente: 'en_progreso', en_progreso: 'completada', completada: 'pendiente',
      }
      return { ...t, status: next[t.status] }
    }))
  }

  function deleteTask(id: string) {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  const pending = tasks.filter((t) => t.status === 'pendiente')
  const inProgress = tasks.filter((t) => t.status === 'en_progreso')
  const done = tasks.filter((t) => t.status === 'completada')

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} style={{ color: S.silver }} />
              <h1 className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: S.silverDim }}>Mis Tareas</h1>
            </div>
            <p className="text-xs" style={{ color: S.silverDim }}>
              {pending.length + inProgress.length} activas · {done.length} completadas
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-xl transition-all"
            style={{ background: 'rgba(180,185,210,0.08)', color: S.silver, border: `1px solid ${S.borderActive}` }}>
            <Plus size={14} /> Nueva tarea
          </button>
        </div>

        {showForm && (
          <div className="p-4 rounded-2xl mb-6" style={{ background: S.card, border: `1px solid ${S.borderActive}`, boxShadow: '0 0 20px rgba(180,185,210,0.06)' }}>
            <input
              type="text"
              placeholder="¿Qué necesitas hacer?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              autoFocus
              className="w-full text-sm border-0 outline-none mb-3"
              style={{ background: 'transparent', color: S.silverBright }}
            />
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: S.silverDim }}>Prioridad:</span>
              {(['alta', 'media', 'baja'] as Task['priority'][]).map((p) => {
                const ps = priorityStyle[p]
                return (
                  <button key={p} onClick={() => setNewPriority(p)}
                    className="text-xs px-3 py-1 rounded-full font-medium capitalize transition-all"
                    style={newPriority === p
                      ? { background: ps.bg, color: ps.color, border: `1px solid ${ps.border}` }
                      : { background: 'transparent', color: S.silverDim, border: `1px solid ${S.border}` }}>
                    {p}
                  </button>
                )
              })}
              <button onClick={addTask}
                className="ml-auto text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-xl transition-all"
                style={{ background: 'rgba(180,185,210,0.1)', color: S.silverBright, border: `1px solid ${S.borderActive}` }}>
                Agregar
              </button>
            </div>
          </div>
        )}

        {[
          { label: 'En progreso', items: inProgress, icon: <Clock size={14} style={{ color: '#d4c060' }} /> },
          { label: 'Pendientes', items: pending, icon: <AlertCircle size={14} style={{ color: S.silverDim }} /> },
          { label: 'Completadas', items: done, icon: <CheckCircle2 size={14} style={{ color: '#70c080' }} /> },
        ].map(({ label, items, icon }) =>
          items.length > 0 ? (
            <div key={label} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                {icon}
                <span className="text-xs font-bold tracking-wider uppercase" style={{ color: S.silverDim }}>{label}</span>
                <span className="text-xs" style={{ color: S.silverDim }}>({items.length})</span>
              </div>
              <div className="space-y-2">
                {items.map((task) => {
                  const ps = priorityStyle[task.priority]
                  return (
                    <div key={task.id}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
                      style={{ background: S.card, border: `1px solid ${task.status === 'completada' ? S.border : S.borderActive}`, opacity: task.status === 'completada' ? 0.5 : 1 }}>
                      <button onClick={() => toggleStatus(task.id)} className="flex-shrink-0">
                        {task.status === 'completada'
                          ? <CheckCircle2 size={20} style={{ color: '#70c080' }} />
                          : task.status === 'en_progreso'
                          ? <Clock size={20} style={{ color: '#d4c060' }} />
                          : <Circle size={20} style={{ color: S.silverDim }} />
                        }
                      </button>
                      <span className="flex-1 text-sm"
                        style={{ color: task.status === 'completada' ? S.silverDim : S.silverBright, textDecoration: task.status === 'completada' ? 'line-through' : 'none' }}>
                        {task.title}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                        style={{ background: ps.bg, color: ps.color, border: `1px solid ${ps.border}` }}>
                        {task.priority}
                      </span>
                      <button onClick={() => deleteTask(task.id)} style={{ color: S.silverDim }} className="transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null
        )}

        {tasks.length === 0 && (
          <div className="text-center py-16" style={{ color: S.silverDim }}>
            <CheckCircle2 size={48} className="mx-auto mb-3" style={{ opacity: 0.15 }} />
            <p className="text-base">Sin tareas. ¡Agrega la primera!</p>
          </div>
        )}
      </div>
    </div>
  )
}
