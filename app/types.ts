export interface User {
  id: number
  email: string
  name: string
  created_at: string
  role_id?: number | null
}

export interface Role {
  id: number
  name: string
  ru_name: string
  description: string
}
