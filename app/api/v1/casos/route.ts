import { listarCasos, noPermitido } from '@/lib/casosHandler'

export const GET = (request: Request) => listarCasos(request, 'lista')
export const POST = noPermitido
export const PUT = noPermitido
export const PATCH = noPermitido
export const DELETE = noPermitido
