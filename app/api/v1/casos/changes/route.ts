import { listarCasos, noPermitido } from '@/lib/casosHandler'

// Polling: casos modificados después de `since`, del más antiguo al más nuevo.
export const GET = (request: Request) => listarCasos(request, 'cambios')
export const POST = noPermitido
export const PUT = noPermitido
export const PATCH = noPermitido
export const DELETE = noPermitido
