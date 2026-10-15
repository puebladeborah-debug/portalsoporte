// Mensajes de seguimiento a miembros de Skool, tal como aparecen en los PDF
// "Mensajes acompañamiento Club Sinergético" y "WhatsApp GHL Club Sinergético".
// Los dos PDF tienen los mismos 5 mensajes por plan, así que la lista es una sola.

export type Temporalidad = '3' | '6' | '12'

export const TEMPORALIDADES: { value: Temporalidad; label: string }[] = [
  { value: '3', label: '3 meses' },
  { value: '6', label: '6 meses' },
  { value: '12', label: '12 meses' },
]

export const CANALES = ['Mensaje de acompañamiento', 'WhatsApp GHL'] as const
export type Canal = typeof CANALES[number]

export const MENSAJES: Record<Temporalidad, string[]> = {
  '3': [
    '01 · Primera semana',
    '02 · Segunda semana',
    '03 · Al cumplir un mes',
    '04 · Al comenzar el último mes',
    '05 · Entre 7 y 10 días antes del cierre',
  ],
  '6': [
    '01 · Primera semana',
    '02 · Al cumplir un mes',
    '03 · Al cumplir tres meses',
    '04 · Al comenzar el quinto mes',
    '05 · Dos semanas antes del cierre',
  ],
  '12': [
    '01 · Primera semana',
    '02 · Al cumplir tres meses',
    '03 · Al cumplir seis meses',
    '04 · Al cumplir nueve meses',
    '05 · Al comenzar el último mes',
  ],
}
