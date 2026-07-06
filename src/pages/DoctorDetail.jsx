import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom'
import { getAvailableDates, TIME_SLOTS } from '../utils/dates'
import { fetchDoctor, fetchBookedSlots, createAppointment } from '../api/client'
import { useSession } from '../lib/auth-client'

function getInitials(name) {
  return name
    .replace('Dr. ', '')
    .split(' ')
    .map((p) => p[0])
    .join('')
}

export default function DoctorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: session, isPending: sessionPending } = useSession()

  const [doctor, setDoctor] = useState(null)
  const [status, setStatus] = useState('loading')

  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [bookedTimes, setBookedTimes] = useState([])
  const [form, setForm] = useState({ patientName: '', phone: '', reason: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDoctor(id)
      .then((data) => {
        setDoctor(data)
        const dates = getAvailableDates(data.workDays)
        setSelectedDate(dates[0]?.key ?? null)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [id])

  const availableDates = useMemo(() => (doctor ? getAvailableDates(doctor.workDays) : []), [doctor])

  useEffect(() => {
    if (!doctor || !selectedDate) return
    fetchBookedSlots(doctor.id, selectedDate)
      .then((appointments) => setBookedTimes(appointments.map((a) => a.time)))
      .catch(() => setBookedTimes([]))
  }, [doctor, selectedDate])

  if (status === 'loading') {
    return (
      <div className="page">
        <p className="empty-state">Loading doctor...</p>
      </div>
    )
  }

  if (status === 'error' || !doctor) {
    return (
      <div className="page">
        <p className="empty-state">Doctor not found.</p>
        <Link to="/" className="btn-secondary">
          Back to doctors
        </Link>
      </div>
    )
  }

  const selectedDateLabel = availableDates.find((d) => d.key === selectedDate)?.label

  function handleSelectDate(dateKey) {
    setSelectedDate(dateKey)
    setSelectedTime(null)
    setError('')
  }

  function handleSelectTime(time) {
    setSelectedTime(time)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time slot.')
      return
    }
    if (!form.patientName.trim() || !form.phone.trim()) {
      setError('Please fill in patient name and phone number.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await createAppointment({
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        date: selectedDate,
        dateLabel: selectedDateLabel,
        time: selectedTime,
        patientName: form.patientName.trim(),
        phone: form.phone.trim(),
        reason: form.reason.trim(),
      })
      navigate('/appointments')
    } catch (err) {
      setError(err.message)
      const appointments = await fetchBookedSlots(doctor.id, selectedDate).catch(() => [])
      setBookedTimes(appointments.map((a) => a.time))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <Link to="/" className="back-link">
        ← Back to doctors
      </Link>

      <div className="doctor-detail-header">
        <div className="avatar large">{getInitials(doctor.name)}</div>
        <div>
          <h1>{doctor.name}</h1>
          <p className="specialty">{doctor.specialty}</p>
          <p className="meta">
            {doctor.experienceYears} yrs exp · {doctor.location} · ★ {doctor.rating}
          </p>
          <p className="bio">{doctor.bio}</p>
          <p className="fee">Consultation fee: ₹{doctor.fee}</p>
        </div>
      </div>

      <section className="booking-section">
        <h2>Select a date</h2>
        <div className="date-tabs">
          {availableDates.map((d) => (
            <button
              key={d.key}
              type="button"
              className={`date-tab ${selectedDate === d.key ? 'selected' : ''}`}
              onClick={() => handleSelectDate(d.key)}
            >
              {d.label}
            </button>
          ))}
        </div>

        <h2>Select a time slot</h2>
        <div className="slot-grid">
          {TIME_SLOTS.map((time) => {
            const booked = bookedTimes.includes(time)
            return (
              <button
                key={time}
                type="button"
                disabled={booked}
                className={`slot ${selectedTime === time ? 'selected' : ''} ${booked ? 'booked' : ''}`}
                onClick={() => handleSelectTime(time)}
              >
                {time}
              </button>
            )
          })}
        </div>

        <h2>Patient details</h2>
        {!sessionPending && !session ? (
          <div className="auth-prompt">
            <p>Please sign in to book this appointment.</p>
            <Link to="/login" state={{ from: location.pathname }} className="btn-primary">
              Sign In to Book
            </Link>
          </div>
        ) : (
          <form className="booking-form" onSubmit={handleSubmit}>
            <label>
              Patient name
              <input
                type="text"
                value={form.patientName}
                onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                placeholder="Full name"
              />
            </label>
            <label>
              Phone number
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. 9876543210"
              />
            </label>
            <label>
              Reason for visit (optional)
              <textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Briefly describe your symptoms or reason for the visit"
                rows={3}
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </form>
        )}
      </section>
    </div>
  )
}
