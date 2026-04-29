import { query } from './db'
import bcrypt from 'bcrypt'

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
                                        active boolean not null default true,
                                        role text not null default 'user'
   )`,

  `create table if not exists personal_access_tokens (
                                                         id bigserial primary key,
                                                         tokenable_type text not null,
                                                         tokenable_id bigint not null references users(id) on delete cascade,
                                                         name text not null default 'api',
                                                         token varchar(64) not null unique,
                                                         abilities text null,
                                                         last_used_at timestamptz null,
                                                         expires_at timestamptz null,
                                                         created_at timestamptz not null default now(),
                                                         updated_at timestamptz not null default now()
   )`,

  `create index if not exists idx_personal_access_tokens_tokenable on personal_access_tokens (tokenable_type, tokenable_id)`,
  `create index if not exists idx_personal_access_tokens_expires_at on personal_access_tokens (expires_at)`,

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
]

export async function runMigrations() {
  // 1. Выполняем все SQL-миграции
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

  // 2. Создаём дефолтного суперадмина, если его нет
  const existingAdmin = await query(`SELECT id FROM users WHERE email = $1`, ['root'])
  if (existingAdmin.rows.length === 0) {
    const hashedPassword = await bcrypt.hash('root', 10)
    await query(
      `INSERT INTO users (name, email, password, role, active, email_verified_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Super Admin', 'root', hashedPassword, 'superadmin', true, new Date()]
    )
    console.log('✅ Default superadmin user created (email: root, password: root)')
  } else {
    console.log('ℹ️ Superadmin already exists, skipping creation')
  }

  console.log('🎉 All migrations completed successfully')
}
