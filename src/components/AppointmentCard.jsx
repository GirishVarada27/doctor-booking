export default function AppointmentCard({ appointment, onCancel }) {
  const isCancelled = appointment.status === 'cancelled'

  return (
    <div className={`appointment-card ${isCancelled ? 'cancelled' : ''}`}>
      <div className="appointment-info">
        <h3>{appointment.doctorName}</h3>
        <p className="specialty">{appointment.specialty}</p>
        <p className="meta">
          {appointment.dateLabel} at {appointment.time}
        </p>
        <p className="meta">Patient: {appointment.patientName}</p>
        {appointment.reason && <p className="meta">Reason: {appointment.reason}</p>}
      </div>
      <div className="appointment-actions">
        <span className={`status-badge ${appointment.status}`}>{appointment.status}</span>
        {!isCancelled && (
          <button type="button" className="btn-secondary" onClick={() => onCancel(appointment.id)}>
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
