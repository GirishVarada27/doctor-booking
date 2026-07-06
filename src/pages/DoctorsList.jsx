import { useEffect, useMemo, useState } from 'react'
import { SPECIALTIES } from '../data/specialties'
import { fetchDoctors } from '../api/client'
import DoctorCard from '../components/DoctorCard'

export default function DoctorsList() {
  const [doctors, setDoctors] = useState([])
  const [status, setStatus] = useState('loading')
  const [query, setQuery] = useState('')
  const [specialty, setSpecialty] = useState('All')

  useEffect(() => {
    fetchDoctors()
      .then((data) => {
        setDoctors(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSpecialty = specialty === 'All' || doc.specialty === specialty
      const matchesQuery =
        query.trim() === '' ||
        doc.name.toLowerCase().includes(query.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(query.toLowerCase())
      return matchesSpecialty && matchesQuery
    })
  }, [doctors, query, specialty])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Find a Doctor</h1>
        <p>Book an appointment with trusted doctors near you.</p>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name or specialty..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
          <option value="All">All Specialties</option>
          {SPECIALTIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {status === 'loading' && <p className="empty-state">Loading doctors...</p>}
      {status === 'error' && (
        <p className="empty-state">Couldn't load doctors. Please try again later.</p>
      )}

      {status === 'ready' && filteredDoctors.length === 0 && (
        <p className="empty-state">No doctors match your search.</p>
      )}

      {status === 'ready' && filteredDoctors.length > 0 && (
        <div className="doctor-grid">
          {filteredDoctors.map((doc) => (
            <DoctorCard key={doc.id} doctor={doc} />
          ))}
        </div>
      )}
    </div>
  )
}
