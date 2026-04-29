// server/api/users.get.ts
import { query } from '../utils/db'

export default defineEventHandler(async (event) => {
  // Защита: только авторизованные пользователи
  await requireUserSession(event)

  try {
    const result = await query('SELECT id, email, name, created_at FROM users ORDER BY id')
    return result.rows
  }
  catch (error) {
    console.error(error)
    throw createError({statusCode: 500, message: 'Database error'})
  }
})
