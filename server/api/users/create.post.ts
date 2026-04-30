import { query } from '../../utils/db'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const body = await readBody(event)
  const {email, name, password, role_id} = body

  if (!email || !name || !password) {
    setResponseStatus(event, 400)
    return {
      success: false,
      message: 'Missing fields: email, name, password'
    }
  }

  const saltRounds = 10
  const password_hash = await bcrypt.hash(password, saltRounds)

  try {
    // Начинаем транзакцию
    await query('BEGIN')

    const insertResult = await query(
      'INSERT INTO users (email, name, password) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, name, password_hash]
    )
    const newUser = insertResult.rows[0]

    // Назначаем роль (по умолчанию 'user', если не указана)
    let targetRoleId = role_id
    if (!targetRoleId) {
      const defaultRole = await query(`
          SELECT id
          FROM roles
          WHERE name = 'user'
      `)
      if (defaultRole.rows.length) targetRoleId = defaultRole.rows[0].id
      else throw new Error('Default role not found')
    }

    await query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
      [newUser.id, targetRoleId]
    )

    await query('COMMIT')

    const result = await query(`SELECT * FROM users WHERE id = ${newUser.id}`)
    const user = result.rows[0]
    delete user.password

    // Возвращаем пользователя с role_id
    return {
      success: true,
      user: {
        ...user,
        role_id: targetRoleId
      }
    }
  }
  catch (error: any) {
    await query('ROLLBACK')
    if (error.code === '23505') {
      setResponseStatus(event, 409)
      return {
        success: false,
        message: 'User with this email already exists'
      }
    }
    console.error(error)
    setResponseStatus(event, 500)
    return {
      success: false,
      message: 'Internal server error'
    }
  }
})
