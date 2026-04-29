import { query } from '../utils/db'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {email, password} = body

  // Ищем пользователя в БД
  const result = await query('SELECT * FROM users WHERE email = $1', [email])
  const user = result.rows[0]

  if (!user) {
    return {error: true, message: 'Invalid credentials'}
  }

  // Проверка пароля (предполагаем, что хранится хеш)
  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    return {error: true, message: 'Invalid credentials'}
  }

  // Устанавливаем сессию
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    loggedInAt: Date.now()
  })

  return {success: true}
})
