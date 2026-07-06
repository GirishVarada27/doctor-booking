import { Link } from 'react-router-dom'

function getInitials(name) {
  return name
    .replace('Dr. ', '')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export default function DoctorCard({ doctor }) {
  return (
    <Link to={`/doctor/${doctor.id}`} className="doctor-card">
      <div className="avatar">{getInitials(doctor.name)}</div>
      <div className="doctor-card-body">
        <h3>{doctor.name}</h3>
        <p className="specialty">{doctor.specialty}</p>
        <p className="meta">
          {doctor.experienceYears} yrs exp · {doctor.location}
        </p>
        <div className="doctor-card-footer">
          <span className="rating">★ {doctor.rating}</span>
          <span className="fee">₹{doctor.fee} fee</span>
        </div>
      </div>
    </Link>
  )
}
