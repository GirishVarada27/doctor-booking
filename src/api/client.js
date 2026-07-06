const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed with status ${res.status}`)
  }

  return res.status === 204 ? null : res.json()
}

export const fetchDoctors = () => request('/doctors')

export const fetchDoctor = (id) => request(`/doctors/${id}`)

export const fetchBookedSlots = (doctorId, date) =>
  request(`/appointments?doctorId=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`)

export const fetchAppointments = () => request('/appointments/mine')

export const createAppointment = (payload) =>
  request('/appointments', { method: 'POST', body: JSON.stringify(payload) })

export const cancelAppointment = (id) =>
  request(`/appointments/${id}/cancel`, { method: 'PATCH' })
