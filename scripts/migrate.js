#!/usr/bin/env node

/**
 * Migration runner — reads SQL files from supabase/migrations/ in order,
 * tracks applied migrations in _migrations table, skips already-run ones.
 *
 * Usage: pnpm migrate
 * Requires: DATABASE_URL in .env.local or environment
 */

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌  DATABASE_URL is not set in .env.local')
  process.exit(1)
}

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations')

async function run() {
  const isInit = process.argv.includes('--init')

  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await client.connect()
  console.log('✅  Connected to database\n')

  // Create tracking table if it doesn't exist
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  // Read migration files sorted by name
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort()

  // --init: mark all existing files as applied WITHOUT running them
  // Use this once when the DB already has migrations applied manually
  if (isInit) {
    console.log('🔧  Init mode: marking all migrations as applied (no SQL executed)\n')
    for (const file of files) {
      await client.query(
        'INSERT INTO _migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING',
        [file]
      )
      console.log(`✅  marked ${file}`)
    }
    console.log('\n✨  Done. Run "pnpm migrate" to apply future migrations.')
    await client.end()
    return
  }

  // Get already-applied migrations
  const { rows: applied } = await client.query('SELECT filename FROM _migrations ORDER BY filename')
  const appliedSet = new Set(applied.map(r => r.filename))

  let ran = 0
  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`⏭   skip  ${file}`)
      continue
    }

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
    console.log(`🔄  apply ${file} ...`)

    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file])
      await client.query('COMMIT')
      console.log(`✅  done  ${file}`)
      ran++
    } catch (err) {
      await client.query('ROLLBACK')
      console.error(`❌  failed ${file}:`, err.message)
      await client.end()
      process.exit(1)
    }
  }

  await client.end()

  if (ran === 0) {
    console.log('\n✨  All migrations already up to date.')
  } else {
    console.log(`\n✨  Applied ${ran} migration(s) successfully.`)
  }
}

run().catch(err => {
  console.error('❌  Unexpected error:', err.message)
  process.exit(1)
})
