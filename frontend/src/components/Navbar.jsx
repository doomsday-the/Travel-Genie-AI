import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  return (
    <nav style={{ display: 'flex', gap: 16, padding: 12, borderBottom: '1px solid #ddd' }}>
      <strong>TravelGenie AI</strong>
      {user ? (
        <>
          <Link to="/">Dashboard</Link>
          <Link to="/trips">Trips</Link>
          <Link to="/plan">Plan Trip</Link>
          <Link to="/bookings">Bookings</Link>
          <Link to="/budget">Budget</Link>
          {user.role === 'admin' && (
            <>
              <Link to="/admin/destinations">Destinations</Link>
              <Link to="/admin/users">Users</Link>
              <Link to="/admin/analytics">Analytics</Link>
            </>
          )}
          <button onClick={logout} style={{ marginLeft: 'auto' }}>Logout ({user.username})</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  )
}
