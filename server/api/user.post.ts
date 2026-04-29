// server/api/users.post.ts
import { query } from '../utils/db'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  // Только для админов (если нужно) – можно убрать или оставить
  await requireUserSession(event)

  const body = await readBody(event)
  const {email, name, password} = body // теперь получаем обычный пароль

  if (!email || !name || !password) {
    setResponseStatus(event, 400)
    return {error: true, message: 'Missing fields: email, name, password'}
  }

  // Хэшируем пароль на сервере
  const saltRounds = 10
  const password_hash = await bcrypt.hash(password, saltRounds)

  try {
    const result = await query(
      'INSERT INTO users (email, name, password) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, name, password_hash]
    )
    return result.rows[0]
  }
  catch (error: any) {
    if (error.code === '23505') { // нарушение уникальности email
      setResponseStatus(event, 409)
      return {error: true, message: 'User with this email already exists'}
    }
    console.error(error)
    setResponseStatus(event, 500)
    return {error: true, message: 'Internal server error'}
  }
})
