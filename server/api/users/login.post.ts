import { query } from '../../utils/db'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password, remember } = body

  const result = await query('SELECT * FROM users WHERE email = $1', [email])
  const user = result.rows[0]

  if (!user) {
    return {
      success: false,
      message: 'Invalid credentials'
    }
  }

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    return {
      success: false,
      message: 'Invalid credentials'
    }
  }

  // Получаем role_id пользователя
  const roleResult = await query(
    `SELECT role_id FROM user_roles WHERE user_id = $1 LIMIT 1`,
    [user.id]
  )
  const role_id = roleResult.rows[0]?.role_id || null

  const maxAge = remember ? 60 * 60 * 24 * 30 : undefined

  const _user = {
    id: user.id,
    email: user.email,
    name: user.name,
    email_verified_at: user.email_verified_at,
    created_at: user.created_at,
    updated_at: user.updated_at,
    active: user.active,
    role_id: role_id
  }

  await setUserSession(event, {
    user: _user,
    loggedInAt: Date.now()
  }, { maxAge })

  return {
    success: true,
    user: _user
  }
})
