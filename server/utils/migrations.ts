import { query } from './db'
import bcrypt from 'bcrypt'

// Миграции для создания таблиц (без изменений)
const migrations = [
  `create table if not exists users (
                                        id bigserial primary key,
                                        name text not null,
                                        email text not null unique,
                                        email_verified_at timestamptz null,
                                        password text not null,
                                        remember_token text null,
                                        created_at timestamptz not null default now(),
                                        updated_at timestamptz not null default now(),
                                        active boolean not null default true
   )`,

  `create table if not exists sis (
                                      id bigserial primary key,
                                      org_title text not null default '',
                                      mit_number text not null default '',
                                      mit_title text not null,
                                      mi_number text not null default '',
                                      mit_notation text not null default '',
                                      mi_modification text not null default '',
                                      verification_date timestamptz null,
                                      valid_date timestamptz null,
                                      result_docnum text not null default '',
                                      applicability boolean not null default false,
                                      created_at timestamptz not null default now(),
                                      updated_at timestamptz not null default now(),
                                      comment text not null default '',
                                      sync_date timestamptz null,
                                      status bigint not null default 0,
                                      user_id bigint not null default 0
   )`,

  `create index if not exists idx_sis_status on sis (status)`,

  `create table if not exists roles (
                                        id bigserial primary key,
                                        name text not null unique,
                                        ru_name text not null unique,
                                        description text,
                                        created_at timestamptz not null default now(),
                                        updated_at timestamptz not null default now()
   )`,

  `create table if not exists permissions (
                                              id bigserial primary key,
                                              name text not null unique,
                                              resource text,
                                              action text,
                                              description text,
                                              created_at timestamptz not null default now(),
                                              updated_at timestamptz not null default now()
   )`,

  `create table if not exists role_permissions (
                                                   role_id bigint not null references roles(id) on delete cascade,
                                                   permission_id bigint not null references permissions(id) on delete cascade,
                                                   primary key (role_id, permission_id)
   )`,

  `create table if not exists user_roles (
                                             user_id bigint not null references users(id) on delete cascade,
                                             role_id bigint not null references roles(id) on delete cascade,
                                             primary key (user_id, role_id)
   )`,

  `create index if not exists idx_user_roles_user_id on user_roles(user_id)`,
  `create index if not exists idx_role_permissions_role_id on role_permissions(role_id)`,
]

export async function runMigrations() {
  // 1. Выполняем SQL-миграции для создания таблиц
  for (const sql of migrations) {
    try {
      await query(sql)
      console.log(`✅ Migration executed: ${sql.substring(0, 60)}...`)
    } catch (err: any) {
      console.error(`❌ Migration failed: ${sql}`)
      console.error(err.message)
      throw err
    }
  }

  // 2. Создаём дефолтного суперадмина (root), если его нет
  const existingAdmin = await query(`SELECT id FROM users WHERE email = $1`, ['root'])
  if (existingAdmin.rows.length === 0) {
    const hashedPassword = await bcrypt.hash('root', 10)
    await query(
      `INSERT INTO users (name, email, password, active, email_verified_at)
       VALUES ($1, $2, $3, $4, $5)`,
      ['Суперадмини', 'root', hashedPassword, true, new Date()]
    )
    console.log('✅ Default superadmin user created (email: root, password: root)')
  } else {
    console.log('ℹ️ Superadmin already exists, skipping creation')
  }

  // ------------------------------------------------------------
  // 3. Создание ролей (только если отсутствуют)
  // ------------------------------------------------------------
  const rolesToCreate = [
    { name: 'superadmin', ru_name: 'Суперадминистратор', description: 'Полный доступ ко всему' },
    { name: 'admin', ru_name: 'Администратор', description: 'Администратор, управление пользователями и контентом' },
    { name: 'user', ru_name: 'Пользователь', description: 'Обычный пользователь' }
  ]
  for (const role of rolesToCreate) {
    const existing = await query(`SELECT id FROM roles WHERE name = $1`, [role.name])
    if (existing.rows.length === 0) {
      await query(`INSERT INTO roles (name, ru_name, description) VALUES ($1, $2, $3)`, [role.name, role.ru_name, role.description])
      console.log(`✅ Role created: ${role.name}`)
    } else {
      console.log(`ℹ️ Role already exists: ${role.name}`)
    }
  }

  // ------------------------------------------------------------
  // 4. Создание базовых разрешений (только если отсутствуют)
  // ------------------------------------------------------------
  const permissionsToCreate = [
    { name: 'users.view', resource: 'users', action: 'view', description: 'Просмотр списка пользователей' },
    { name: 'users.create', resource: 'users', action: 'create', description: 'Создание пользователей' },
    { name: 'users.edit', resource: 'users', action: 'edit', description: 'Редактирование пользователей' },
    { name: 'users.delete', resource: 'users', action: 'delete', description: 'Удаление пользователей' },
    { name: 'sis.view', resource: 'sis', action: 'view', description: 'Просмотр записей СИС' },
    { name: 'sis.create', resource: 'sis', action: 'create', description: 'Создание записей СИС' },
    { name: 'sis.edit', resource: 'sis', action: 'edit', description: 'Редактирование записей СИС' },
    { name: 'sis.delete', resource: 'sis', action: 'delete', description: 'Удаление записей СИС' },
    { name: 'sis.approve', resource: 'sis', action: 'approve', description: 'Утверждение поверки' }
  ]
  for (const perm of permissionsToCreate) {
    const existing = await query(`SELECT id FROM permissions WHERE name = $1`, [perm.name])
    if (existing.rows.length === 0) {
      await query(
        `INSERT INTO permissions (name, resource, action, description) VALUES ($1, $2, $3, $4)`,
        [perm.name, perm.resource, perm.action, perm.description]
      )
      console.log(`✅ Permission created: ${perm.name}`)
    } else {
      console.log(`ℹ️ Permission already exists: ${perm.name}`)
    }
  }

  // ------------------------------------------------------------
  // 5. Назначение прав ролям (только если ещё не назначены)
  // ------------------------------------------------------------
  // superadmin – все разрешения
  const superadminRole = await query(`SELECT id FROM roles WHERE name = 'superadmin'`)
  if (superadminRole.rows.length > 0) {
    const allPerms = await query(`SELECT id FROM permissions`)
    for (const perm of allPerms.rows) {
      await query(
        `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [superadminRole.rows[0].id, perm.id]
      )
    }
    console.log(`✅ All permissions assigned to superadmin`)
  }

  // admin – ограниченный набор прав (без удаления и утверждения)
  const adminRole = await query(`SELECT id FROM roles WHERE name = 'admin'`)
  if (adminRole.rows.length > 0) {
    const adminPerms = await query(`SELECT id FROM permissions WHERE name IN ('users.view','users.create','users.edit','sis.view','sis.create','sis.edit')`)
    for (const perm of adminPerms.rows) {
      await query(
        `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [adminRole.rows[0].id, perm.id]
      )
    }
    console.log(`✅ Admin permissions assigned`)
  }

  // user – только просмотр СИС
  const userRole = await query(`SELECT id FROM roles WHERE name = 'user'`)
  if (userRole.rows.length > 0) {
    const userPerms = await query(`SELECT id FROM permissions WHERE name IN ('sis.view')`)
    for (const perm of userPerms.rows) {
      await query(
        `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [userRole.rows[0].id, perm.id]
      )
    }
    console.log(`✅ User permissions assigned`)
  }

  // ------------------------------------------------------------
  // 6. Назначаем пользователю root роль superadmin
  // ------------------------------------------------------------
  const rootUser = await query(`SELECT id FROM users WHERE email = 'root'`)
  if (rootUser.rows.length > 0) {
    const superadminRoleForRoot = await query(`SELECT id FROM roles WHERE name = 'superadmin'`)
    if (superadminRoleForRoot.rows.length > 0) {
      await query(
        `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [rootUser.rows[0].id, superadminRoleForRoot.rows[0].id]
      )
      console.log(`✅ Root user assigned to superadmin role`)
    }
  }

  console.log('🎉 All migrations completed successfully')
}
