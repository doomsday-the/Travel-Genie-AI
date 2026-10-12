import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import api from '../api/axios'

// Fix default Leaflet icon issue with Vite bundlers
const customPin = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export default function TripDetail() {
  const { id } = useParams()
  const [trip, setTrip] = useState(null)
  const [activeDay, setActiveDay] = useState(0)
  const [weather, setWeather] = useState(null)
  const [costSummary, setCostSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const res = await api.get(`/trips/${id}/`)
      setTrip(res.data)

      // Fetch live weather from backend (Open-Meteo)
      if (res.data.destination) {
        try {
          const wRes = await api.get(`/destinations/${res.data.destination}/weather/`)
          setWeather(wRes.data)
        } catch (e) {
          console.warn('Weather fetch failed', e)
        }
      }

      // Fetch cost summary from SQL view endpoint
      try {
        const cRes = await api.get(`/trips/${id}/cost-summary/`)
        setCostSummary(cRes.data)
      } catch (e) {
        console.warn('Cost summary fetch failed', e)
      }
    } catch (err) {
      console.error('Failed to load trip', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const togglePacking = async (packingId) => {
    try {
      const res = await api.post(`/packing-items/${packingId}/toggle/`)
      setTrip((prev) => ({
        ...prev,
        packing_items: prev.packing_items.map((p) => (p.id === packingId ? res.data : p)),
      }))
    } catch (err) {
      console.error('Failed to toggle packing item', err)
    }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading trip details...</div>
  if (!trip) return <div style={{ padding: 40, textAlign: 'center' }}>Trip not found.</div>

  const dest = trip.destination_detail
  const lat = parseFloat(dest?.latitude || 26.9124)
  const lng = parseFloat(dest?.longitude || 75.7873)
  const currentDay = trip.days?.[activeDay] || trip.days?.[0]

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Breadcrumb & Header */}
      <div style={{ marginBottom: 24 }}>
        <Link to="/trips" style={{ fontSize: 12, color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
          ← Back to all trips
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 30, fontWeight: 800, margin: 0, color: '#0f172a' }}>{trip.title}</h1>
              <span style={{ fontSize: 11, background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: 20, fontWeight: 700, textTransform: 'uppercase' }}>
                {trip.status}
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: 14, margin: '6px 0 0' }}>
              📍 {dest?.name}, {dest?.country} · 🗓️ {trip.start_date} to {trip.end_date} · Best season: {dest?.best_season || 'All year'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link
              to="/bookings"
              style={{
                background: '#0f172a',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Book Flights / Hotels
            </Link>
            <Link
              to="/budget"
              style={{
                background: '#f1f5f9',
                color: '#0f172a',
                padding: '10px 18px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
                border: '1px solid #cbd5e1',
              }}
            >
              Budget Details
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Main content & Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1fr)', gap: 28 }}>
        {/* Left Column: Itinerary Days */}
        <div>
          {/* Day Navigation Tabs */}
          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 12, marginBottom: 20, overflowX: 'auto' }}>
            {trip.days?.map((d, idx) => (
              <button
                key={d.id}
                onClick={() => setActiveDay(idx)}
                style={{
                  background: activeDay === idx ? '#10b981' : '#f8fafc',
                  color: activeDay === idx ? '#fff' : '#475569',
                  border: '1px solid',
                  borderColor: activeDay === idx ? '#10b981' : '#e2e8f0',
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Day {d.day_number}
              </button>
            ))}
          </div>

          {/* Current Day Schedule */}
          {currentDay ? (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    Day {currentDay.day_number}: {currentDay.summary}
                  </h3>
                  {currentDay.date && (
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Date: {currentDay.date}</div>
                  )}
                </div>
                <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>
                  {currentDay.items?.length || 0} Activities
                </span>
              </div>

              {/* Activities Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {currentDay.items?.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      gap: 16,
                      padding: 16,
                      background: '#f8fafc',
                      borderRadius: 10,
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <div
                      style={{
                        background: '#e0f2fe',
                        color: '#0369a1',
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontWeight: 700,
                        fontSize: 12,
                        height: 'fit-content',
                      }}
                    >
                      {item.start_time?.slice(0, 5) || 'Anytime'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                          {item.title}
                        </h4>
                        {Number(item.est_cost) > 0 && (
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>
                            ₹{Number(item.est_cost).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                        {item.notes}
                      </p>
                      {item.attraction_detail && (
                        <div style={{ marginTop: 8, fontSize: 11, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span>🏛️</span> {item.attraction_detail.name} ({item.attraction_detail.category})
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>No itinerary days logged.</div>
          )}
        </div>

        {/* Right Column: Leaflet Map, Weather, Budget, Packing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Interactive Leaflet Map */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
              <span>🗺️ Interactive Map (OpenStreetMap)</span>
              <span style={{ fontSize: 11, color: '#10b981' }}>{dest?.name}</span>
            </div>
            <div style={{ height: 260 }}>
              <MapContainer center={[lat, lng]} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]} icon={customPin}>
                  <Popup>
                    <strong>{dest?.name}</strong>
                    <br />
                    {dest?.country}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          {/* Live Open-Meteo Weather Card */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>LIVE WEATHER FORECAST</span>
              <span style={{ fontSize: 10, color: '#10b981', fontWeight: 600 }}>via Open-Meteo</span>
            </div>
            {weather ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>
                    {weather.current?.temperature}°C
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Wind: {weather.current?.windspeed} km/h</div>
                </div>
                <div style={{ fontSize: 36 }}>🌤️</div>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#94a3b8' }}>Fetching local climate conditions...</div>
            )}
          </div>

          {/* Budget Overview from SQL View */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>BUDGET AT A GLANCE</span>
              <span style={{ fontSize: 10, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                {costSummary?.source === 'sql_view' ? 'SQL View' : 'Live'}
              </span>
            </div>
            {costSummary ? (
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
                  ₹{Number(costSummary.spent).toLocaleString('en-IN')} <span style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>/ ₹{Number(costSummary.budget).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ background: '#e2e8f0', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                  <div
                    style={{
                      background: costSummary.remaining < 0 ? '#ef4444' : '#10b981',
                      height: '100%',
                      width: `${Math.min(100, (costSummary.spent / (costSummary.budget || 1)) * 100)}%`,
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
                  <span>Remaining:</span>
                  <strong style={{ color: costSummary.remaining < 0 ? '#ef4444' : '#059669' }}>
                    ₹{Number(costSummary.remaining).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#94a3b8' }}>Loading budget metrics...</div>
            )}
          </div>

          {/* Packing Checklist */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>PACKING CHECKLIST</span>
              <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>
                {trip.packing_items?.filter((p) => p.is_packed).length || 0}/{trip.packing_items?.length || 0}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {trip.packing_items?.map((item) => (
                <label
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 13,
                    cursor: 'pointer',
                    color: item.is_packed ? '#94a3b8' : '#1e293b',
                    textDecoration: item.is_packed ? 'line-through' : 'none',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={item.is_packed}
                    onChange={() => togglePacking(item.id)}
                    style={{ cursor: 'pointer', width: 15, height: 15 }}
                  />
                  <span>{item.item_name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
