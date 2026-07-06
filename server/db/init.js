import { pool } from '../db.js'
import { auth } from '../auth.js'
import { seedDoctors } from './seed-data.js'
import { getMigrations } from 'better-auth/db/migration'

export async function initDb() {
  const { runMigrations } = await getMigrations(auth.options)
  await runMigrations()

  await pool.query(`
    CREATE TABLE IF NOT EXISTS doctors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      specialty TEXT NOT NULL,
      experience_years INTEGER NOT NULL,
      rating NUMERIC(2,1) NOT NULL,
      location TEXT NOT NULL,
      fee INTEGER NOT NULL,
      bio TEXT NOT NULL,
      work_days INTEGER[] NOT NULL
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id UUID PRIMARY KEY,
      doctor_id TEXT NOT NULL REFERENCES doctors(id),
      doctor_name TEXT NOT NULL,
      specialty TEXT NOT NULL,
      date DATE NOT NULL,
      date_label TEXT NOT NULL,
      time TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      reason TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'upcoming',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  await pool.query(`
    ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE
  `)

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM doctors')

  if (rows[0].count === 0) {
    for (const doc of seedDoctors) {
      await pool.query(
        `INSERT INTO doctors (id, name, specialty, experience_years, rating, location, fee, bio, work_days)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [doc.id, doc.name, doc.specialty, doc.experienceYears, doc.rating, doc.location, doc.fee, doc.bio, doc.workDays]
      )
    }
    console.log(`Seeded ${seedDoctors.length} doctors`)
  }
}
