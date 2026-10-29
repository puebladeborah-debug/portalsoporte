import { detalleCaso, noPermitido } from '@/lib/casosHandler'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return detalleCaso(request, id)
}
export const POST = noPermitido
export const PUT = noPermitido
export const PATCH = noPermitido
export const DELETE = noPermitido
