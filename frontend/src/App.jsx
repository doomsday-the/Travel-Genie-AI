import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './auth/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Trips from './pages/Trips'
import TripDetail from './pages/TripDetail'
import PlanTrip from './pages/PlanTrip'
import Bookings from './pages/Bookings'
import Budget from './pages/Budget'
import Destinations from './pages/admin/Destinations'
import Users from './pages/admin/Users'
import Analytics from './pages/admin/Analytics'

const P = ({ children, role }) => <ProtectedRoute role={role}>{children}</ProtectedRoute>

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<P><Dashboard /></P>} />
        <Route path="/trips" element={<P><Trips /></P>} />
        <Route path="/trips/:id" element={<P><TripDetail /></P>} />
        <Route path="/plan" element={<P><PlanTrip /></P>} />
        <Route path="/bookings" element={<P><Bookings /></P>} />
        <Route path="/budget" element={<P><Budget /></P>} />
        <Route path="/admin/destinations" element={<P role="admin"><Destinations /></P>} />
        <Route path="/admin/users" element={<P role="admin"><Users /></P>} />
        <Route path="/admin/analytics" element={<P role="admin"><Analytics /></P>} />
      </Routes>
    </>
  )
}
