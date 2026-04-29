import { query } from '../utils/db'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {email, password, remember} = body

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

  // Устанавливаем сессию с учетом флага "Запомнить меня"
  // Если remember=true, сессия будет жить 30 дней, иначе - до закрытия браузера
  const maxAge = remember ? 60 * 60 * 24 * 30 : undefined // 30 дней в секундах

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    loggedInAt: Date.now()
  }, {
    maxAge
  })

  return {success: true}
})
