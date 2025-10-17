const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL || process.env.PG_CONNECTION || 'postgres://postgres:postgres@localhost:5432/pwa_db'

const poolConfig = { connectionString }

// If the connection string requests SSL (e.g. "sslmode=require"), enable ssl with relaxed validation
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require')) {
  poolConfig.ssl = { rejectUnauthorized: false }
}

const pool = new Pool(poolConfig)

async function saveEntries(entries) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const inserted = []
    for (const e of entries) {
      const { title, description, createdAt } = e
      const res = await client.query(
        'INSERT INTO activities (title, description, created_at) VALUES ($1, $2, $3) RETURNING id',
        [title, description || null, createdAt]
      )
      inserted.push(res.rows[0].id)
    }
    await client.query('COMMIT')
    return inserted
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

module.exports = { saveEntries, pool }
