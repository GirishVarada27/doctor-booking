import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import RequireAuth from './components/RequireAuth'
import DoctorsList from './pages/DoctorsList'
import DoctorDetail from './pages/DoctorDetail'
import MyAppointments from './pages/MyAppointments'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<DoctorsList />} />
          <Route path="/doctor/:id" element={<DoctorDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/appointments"
            element={
              <RequireAuth>
                <MyAppointments />
              </RequireAuth>
            }
          />
        </Routes>
      </main>
    </>
  )
}

export default App
