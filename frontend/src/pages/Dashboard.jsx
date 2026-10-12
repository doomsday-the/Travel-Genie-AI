import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../auth/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [trips, setTrips] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [tripsRes, bookingsRes] = await Promise.all([
          api.get('/trips/'),
          api.get('/bookings/'),
        ])
        setTrips(tripsRes.data?.results || tripsRes.data || [])
        setBookings(bookingsRes.data?.results || bookingsRes.data || [])
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const nextTrip = trips[0]

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#10b981', textTransform: 'uppercase' }}>
            TRAVELER DASHBOARD
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '6px 0 4px', color: '#0f172a' }}>
            Welcome back, {user?.first_name || user?.username || 'Explorer'}
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
            Here is what’s on the horizon for your upcoming journeys.
          </p>
        </div>
        <Link
          to="/plan"
          style={{
            background: '#10b981',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
          }}
        >
          <span>✨</span> Plan New Trip
        </Link>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Total Planned Trips</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>{trips.length}</div>
          <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>Across global destinations</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Active Bookings</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#3b82f6', marginTop: 8 }}>{bookings.length}</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Flights & Hotel stays</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Days on the Road</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#f59e0b', marginTop: 8 }}>
            {trips.reduce((acc, t) => acc + (t.days?.length || 3), 0)}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Curated itinerary days</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>User Status</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#8b5cf6', marginTop: 8, textTransform: 'capitalize' }}>
            {user?.role || 'Traveler'}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Role-based access enabled</div>
        </div>
      </div>

      {/* Featured Next Journey */}
      {nextTrip ? (
        <div
          style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
            color: '#fff',
            borderRadius: 16,
            padding: 32,
            marginBottom: 36,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 20,
            boxShadow: '0 8px 24px rgba(6, 78, 59, 0.2)',
          }}
        >
          <div>
            <span style={{ background: 'rgba(255,255,255,0.18)', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
              NEXT UPCOMING JOURNEY
            </span>
            <h2 style={{ fontSize: 26, fontWeight: 800, margin: '14px 0 8px' }}>{nextTrip.title}</h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: 14 }}>
              📍 {nextTrip.destination_detail?.name || 'Destination'}, {nextTrip.destination_detail?.country} · {nextTrip.start_date} to {nextTrip.end_date}
            </p>
          </div>
          <Link
            to={`/trips/${nextTrip.id}`}
            style={{
              background: '#fff',
              color: '#065f46',
              padding: '12px 24px',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            View Full Itinerary & Map →
          </Link>
        </div>
      ) : (
        <div style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 16, padding: 36, textAlign: 'center', marginBottom: 36 }}>
          <h3 style={{ margin: '0 0 8px', color: '#1e293b' }}>No trips planned yet</h3>
          <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 16px' }}>Let TravelGenie AI generate your next customized holiday in seconds.</p>
          <Link to="/plan" style={{ background: '#10b981', color: '#fff', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
            Start Planning
          </Link>
        </div>
      )}

      {/* Recent Trips & Bookings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        {/* Trips List */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Recent Trips</h3>
            <Link to="/trips" style={{ fontSize: 12, color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
          </div>
          {loading ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Loading journeys...</p>
          ) : trips.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>No journeys found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {trips.slice(0, 4).map((t) => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{t.destination_detail?.name} · {t.start_date}</div>
                  </div>
                  <Link to={`/trips/${t.id}`} style={{ fontSize: 12, color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>
                    Open →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bookings List */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Recent Bookings</h3>
            <Link to="/bookings" style={{ fontSize: 12, color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>Manage →</Link>
          </div>
          {loading ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>No active reservations yet. Browse flights & hotels to book.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {bookings.slice(0, 4).map((b) => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>
                      {b.booking_type === 'flight' ? '✈️ ' + (b.flight_detail?.airline || 'Flight') : '🏨 ' + (b.hotel_detail?.name || 'Hotel')}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                      ₹{Number(b.amount).toLocaleString('en-IN')} · <span style={{ color: '#10b981', fontWeight: 600 }}>{b.status}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, background: '#e2e8f0', padding: '4px 8px', borderRadius: 4, textTransform: 'uppercase', fontWeight: 600 }}>
                    {b.booking_type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
