import { NavLink, useNavigate } from 'react-router-dom'
import { useSession, signOut } from '../lib/auth-client'

export default function Navbar() {
  const { data: session } = useSession()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="navbar">
      <NavLink to="/" className="brand">
        MediBook
      </NavLink>
      <nav className="nav-links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          Find a Doctor
        </NavLink>
        <NavLink to="/appointments" className={({ isActive }) => (isActive ? 'active' : '')}>
          My Appointments
        </NavLink>
        {session ? (
          <span className="nav-session">
            <span className="nav-user">{session.user.name || session.user.email}</span>
            <button type="button" className="btn-secondary" onClick={handleSignOut}>
              Sign Out
            </button>
          </span>
        ) : (
          <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')}>
            Sign In
          </NavLink>
        )}
      </nav>
    </header>
  )
}
