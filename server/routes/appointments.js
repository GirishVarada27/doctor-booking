import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/require-auth.js'

const router = Router()

function serializeAppointment(row) {
  return {
    id: row.id,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    specialty: row.specialty,
    date: row.date,
    dateLabel: row.date_label,
    time: row.time,
    patientName: row.patient_name,
    phone: row.phone,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
  }
}

const SELECT_COLUMNS = `
  id, doctor_id, doctor_name, specialty, date::text AS date, date_label,
  time, patient_name, phone, reason, status, created_at
`

// Public: used to grey out already-booked slots on the doctor page.
// Only exposes the booked time, never other patients' details.
router.get('/', async (req, res, next) => {
  try {
    const { doctorId, date } = req.query

    if (!doctorId || !date) {
      return res.status(400).json({ error: 'doctorId and date query params are required' })
    }

    const { rows } = await pool.query(
      `SELECT time FROM appointments
       WHERE doctor_id = $1 AND date = $2 AND status != 'cancelled'`,
      [doctorId, date]
    )
    res.json(rows.map((row) => ({ time: row.time })))
  } catch (err) {
    next(err)
  }
})

// The signed-in user's own appointments.
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${SELECT_COLUMNS} FROM appointments WHERE user_id = $1 ORDER BY date, time`,
      [req.user.id]
    )
    res.json(rows.map(serializeAppointment))
  } catch (err) {
    next(err)
  }
})

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { doctorId, doctorName, specialty, date, dateLabel, time, patientName, phone, reason } = req.body

    if (!doctorId || !date || !time || !patientName?.trim() || !phone?.trim()) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const existing = await pool.query(
      `SELECT id FROM appointments
       WHERE doctor_id = $1 AND date = $2 AND time = $3 AND status != 'cancelled'`,
      [doctorId, date, time]
    )
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'This slot has already been booked' })
    }

    const { rows } = await pool.query(
      `INSERT INTO appointments (id, user_id, doctor_id, doctor_name, specialty, date, date_label, time, patient_name, phone, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING ${SELECT_COLUMNS}`,
      [randomUUID(), req.user.id, doctorId, doctorName, specialty, date, dateLabel, time, patientName.trim(), phone.trim(), reason?.trim() || '']
    )
    res.status(201).json(serializeAppointment(rows[0]))
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/cancel', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `UPDATE appointments SET status = 'cancelled'
       WHERE id = $1 AND user_id = $2
       RETURNING ${SELECT_COLUMNS}`,
      [req.params.id, req.user.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' })
    }
    res.json(serializeAppointment(rows[0]))
  } catch (err) {
    next(err)
  }
})

export default router
