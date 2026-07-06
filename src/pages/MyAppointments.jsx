import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAppointments, cancelAppointment } from '../api/client'
import AppointmentCard from '../components/AppointmentCard'

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    fetchAppointments()
      .then((data) => {
        setAppointments(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  async function handleCancel(id) {
    const updated = await cancelAppointment(id)
    setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)))
  }

  if (status === 'loading') {
    return (
      <div className="page">
        <p className="empty-state">Loading appointments...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="page">
        <p className="empty-state">Couldn't load appointments. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Appointments</h1>
        <p>All appointments booked so far.</p>
      </div>

      {appointments.length === 0 ? (
        <div className="empty-state">
          <p>You haven't booked any appointments yet.</p>
          <Link to="/" className="btn-primary">
            Find a Doctor
          </Link>
        </div>
      ) : (
        <div className="appointment-list">
          {appointments.map((appt) => (
            <AppointmentCard key={appt.id} appointment={appt} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </div>
  )
}
