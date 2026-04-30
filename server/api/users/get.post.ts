import { query } from '../../utils/db'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  try {
    const result = await query(`
        SELECT
            u.id, u.email, u.email_verified_at, u.name, u.created_at, u.updated_at, u.active,
            ur.role_id
        FROM users u
                 LEFT JOIN (
            SELECT DISTINCT ON (user_id) user_id, role_id
            FROM user_roles
        ) ur ON u.id = ur.user_id
        ORDER BY u.id
    `)
    return result.rows
  } catch (error) {
    console.error(error)
    throw createError({ statusCode: 500, message: 'Database error' })
  }
})
