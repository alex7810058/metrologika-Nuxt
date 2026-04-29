import { Pool, types } from 'pg'

// Парсим BIGINT (int8) как число (ОСТОРОЖНО: может потерять точность при ID > 2^53)
types.setTypeParser(types.builtins.INT8, (val: string) => parseInt(val, 10))

// Парсим NUMERIC и FLOAT8 как float
types.setTypeParser(types.builtins.NUMERIC, (val: string) => parseFloat(val))
types.setTypeParser(types.builtins.FLOAT8, (val: string) => parseFloat(val))

// INT4, INT2 и так по умолчанию числа, но для единообразия:
types.setTypeParser(types.builtins.INT4, (val: string) => parseInt(val, 10))
types.setTypeParser(types.builtins.INT2, (val: string) => parseInt(val, 10))

console.log('DB parsers set: INT8 -> number')

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
})

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL')
})

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err)
  process.exit(-1)
})

export const query = (text: string, params?: any[]) => pool.query(text, params)
export const closeDb = () => pool.end()
