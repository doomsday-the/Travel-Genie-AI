import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [flights, setFlights] = useState([])
  const [hotels, setHotels] = useState([])
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState('')
  const [activeTab, setActiveTab] = useState('my-bookings')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const loadAll = async () => {
    try {
      const [bRes, fRes, hRes, tRes] = await Promise.all([
        api.get('/bookings/'),
        api.get('/flights/'),
        api.get('/hotels/'),
        api.get('/trips/'),
      ])
      setBookings(bRes.data?.results || bRes.data || [])
      setFlights(fRes.data?.results || fRes.data || [])
      setHotels(hRes.data?.results || hRes.data || [])
      const myTrips = tRes.data?.results || tRes.data || []
      setTrips(myTrips)
      if (myTrips.length > 0 && !selectedTrip) {
        setSelectedTrip(myTrips[0].id)
      }
    } catch (err) {
      console.error('Failed to load bookings data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const handleBook = async (type, item) => {
    if (!selectedTrip) {
      alert('Please select a trip to associate this reservation with!')
      return
    }
    const amount = type === 'flight' ? item.price : item.price_per_night
    try {
      await api.post('/bookings/', {
        trip: selectedTrip,
        booking_type: type,
        flight: type === 'flight' ? item.id : null,
        hotel: type === 'hotel' ? item.id : null,
        amount: Number(amount),
        status: 'confirmed',
      })
      setMsg(`Successfully booked ${type === 'flight' ? item.airline : item.name}! Expense automatically logged.`)
      setTimeout(() => setMsg(''), 4000)
      loadAll()
      setActiveTab('my-bookings')
    } catch (err) {
      alert(err.response?.data?.detail || 'Booking failed.')
    }
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#10b981', textTransform: 'uppercase' }}>
          RESERVATIONS & COMMERCE
        </span>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '6px 0 4px', color: '#0f172a' }}>
          Travel Bookings
        </h1>
        <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
          Atomic all-or-nothing reservations: creating a booking automatically records a verified expense into your trip budget.
        </p>
      </div>

      {msg && (
        <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 13, fontWeight: 600 }}>
          ✅ {msg}
        </div>
      )}

      {/* Target Trip Selector & Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, background: '#f1f5f9', padding: 4, borderRadius: 8 }}>
          {[
            { id: 'my-bookings', label: `My Bookings (${bookings.length})` },
            { id: 'flights', label: 'Browse Flights' },
            { id: 'hotels', label: 'Browse Hotels' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                border: 'none',
                background: activeTab === tab.id ? '#fff' : 'transparent',
                color: activeTab === tab.id ? '#0f172a' : '#64748b',
                padding: '8px 16px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Apply to Trip:</span>
          <select
            value={selectedTrip}
            onChange={(e) => setSelectedTrip(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              fontWeight: 600,
              color: '#0f172a',
            }}
          >
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.destination_detail?.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading reservations...</div>
      ) : activeTab === 'my-bookings' ? (
        /* My Bookings List */
        bookings.length === 0 ? (
          <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 14, padding: 40, textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 6px', color: '#1e293b' }}>No bookings found</h3>
            <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 16px' }}>
              Choose a flight or hotel from the tabs above to create your first confirmed reservation.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
            {bookings.map((b) => (
              <div key={b.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>{b.booking_type === 'flight' ? '✈️' : '🏨'}</span>
                  <span style={{ fontSize: 11, background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: 4, fontWeight: 700, textTransform: 'uppercase' }}>
                    {b.status}
                  </span>
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
                  {b.flight_detail?.airline || b.hotel_detail?.name || `${b.booking_type.toUpperCase()} Booking`}
                </h4>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                  For trip: <strong>{trips.find((t) => t.id === b.trip)?.title || `Trip #${b.trip}`}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Booked {new Date(b.booked_at).toLocaleDateString()}</span>
                  <strong style={{ fontSize: 16, color: '#0f172a' }}>₹{Number(b.amount).toLocaleString('en-IN')}</strong>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'flights' ? (
        /* Flights List */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
          {flights.map((f) => (
            <div key={f.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>✈️ {f.airline}</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#059669' }}>₹{Number(f.price).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ fontSize: 13, color: '#475569', marginBottom: 6 }}>
                <strong>{f.origin}</strong> → <strong>{f.destination_detail?.name || 'Destination'}</strong>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
                Departs: {new Date(f.depart_at).toLocaleString()}
              </div>
              <button
                onClick={() => handleBook('flight', f)}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Book Flight & Log Expense
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Hotels List */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
          {hotels.map((h) => (
            <div key={h.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#0f172a' }}>🏨 {h.name}</h4>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    📍 {h.destination_detail?.name}, {h.destination_detail?.country} · ★ {h.rating}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#059669' }}>
                    ₹{Number(h.price_per_night).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>per night</div>
                </div>
              </div>
              <button
                onClick={() => handleBook('hotel', h)}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: 10,
                }}
              >
                Reserve Stay & Log Expense
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
