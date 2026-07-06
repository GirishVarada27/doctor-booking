import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

function serializeDoctor(row) {
  return {
    id: row.id,
    name: row.name,
    specialty: row.specialty,
    experienceYears: row.experience_years,
    rating: Number(row.rating),
    location: row.location,
    fee: row.fee,
    bio: row.bio,
    workDays: row.work_days,
  }
}

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM doctors ORDER BY name')
    res.json(rows.map(serializeDoctor))
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM doctors WHERE id = $1', [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' })
    }
    res.json(serializeDoctor(rows[0]))
  } catch (err) {
    next(err)
  }
})

export default router
