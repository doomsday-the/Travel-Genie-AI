import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function Trips() {
  const [trips, setTrips] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadTrips = async () => {
    try {
      const res = await api.get('/trips/')
      setTrips(res.data?.results || res.data || [])
    } catch (err) {
      console.error('Failed to load trips', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrips()
  }, [])

  const deleteTrip = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this trip and its itinerary?')) return
    try {
      await api.delete(`/trips/${id}/`)
      setTrips(trips.filter((t) => t.id !== id))
    } catch (err) {
      alert('Failed to delete trip.')
    }
  }

  const filteredTrips = trips.filter((t) => {
    const matchesFilter = filter === 'all' || t.status === filter
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.destination_detail?.name.toLowerCase().includes(search.toLowerCase()) ||
      t.destination_detail?.country.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#10b981', textTransform: 'uppercase' }}>
            ITINERARY PORTFOLIO
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '6px 0 4px', color: '#0f172a' }}>My Trips</h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
            Browse and manage your AI-generated travel itineraries.
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
          }}
        >
          <span>✨</span> Plan New Trip
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by trip or destination..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 260,
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            fontSize: 13,
          }}
        />
        <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 8 }}>
          {['all', 'planned', 'ongoing', 'done'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              style={{
                border: 'none',
                background: filter === st ? '#fff' : 'transparent',
                color: filter === st ? '#0f172a' : '#64748b',
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: filter === st ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                textTransform: 'capitalize',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading your journeys...</div>
      ) : filteredTrips.length === 0 ? (
        <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 14, padding: 40, textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 6px', color: '#1e293b' }}>No trips found</h3>
          <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 16px' }}>Try a different filter or generate a new journey with AI.</p>
          <Link to="/plan" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>
            Plan a trip now →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filteredTrips.map((t) => {
            const packedCount = t.packing_items?.filter((p) => p.is_packed).length || 0
            const totalPack = t.packing_items?.length || 0

            return (
              <div
                key={t.id}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 14,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '4px 8px',
                        borderRadius: 4,
                        background: t.status === 'ongoing' ? '#fef3c7' : '#ecfdf5',
                        color: t.status === 'ongoing' ? '#d97706' : '#059669',
                      }}
                    >
                      {t.status}
                    </span>
                    <button
                      onClick={(e) => deleteTrip(t.id, e)}
                      title="Delete trip"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: 14,
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                    {t.title}
                  </h3>
                  <div style={{ fontSize: 13, color: '#475569', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                    <span>📍</span>
                    <strong>{t.destination_detail?.name}</strong>, {t.destination_detail?.country}
                  </div>

                  <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                    <div>🗓️ {t.start_date} → {t.end_date}</div>
                    <div style={{ marginTop: 4 }}>📋 {t.days?.length || 0} Itinerary Days planned</div>
                    {totalPack > 0 && (
                      <div style={{ marginTop: 4 }}>🎒 Packing: {packedCount}/{totalPack} items ready</div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Created {new Date(t.created_at).toLocaleDateString()}</span>
                  <Link
                    to={`/trips/${t.id}`}
                    style={{
                      background: '#0f172a',
                      color: '#fff',
                      padding: '8px 14px',
                      borderRadius: 6,
                      textDecoration: 'none',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
