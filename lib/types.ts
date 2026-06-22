export type Category = {
  id: string
  name: string
  slug: string
  icon: string
  description: string
  order: number
}

export type Article = {
  id: string
  title: string
  content: string
  category_id: string
  category?: Category
  tags: string[]
  created_at: string
  updated_at: string
}

export type Task = {
  id: string
  title: string
  description: string
  status: 'pendiente' | 'en_progreso' | 'completada'
  priority: 'alta' | 'media' | 'baja'
  due_date: string | null
  created_at: string
}
