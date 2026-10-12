import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function Destinations() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    name: '',
    country: '',
    currency_code: 'INR',
    visa_info: 'Visa on arrival / eVisa',
    best_season: 'October to March',
    description: '',
    latitude: '26.912400',
    longitude: '75.787300',
  })
  const [newAttraction, setNewAttraction] = useState({
    destination: '',
    name: '',
    category: 'Architecture',
    avg_cost: '500',
    latitude: '',
    longitude: '',
  })
  const [expandedDest, setExpandedDest] = useState(null)

  const loadDestinations = async () => {
    try {
      const res = await api.get('/destinations/')
      setDestinations(res.data?.results || res.data || [])
    } catch (err) {
      console.error('Failed to load destinations', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDestinations()
  }, [])

  const handleCreateDest = async (e) => {
    e.preventDefault()
    try {
      await api.post('/destinations/', form)
      setShowAdd(false)
      setForm({
        name: '',
        country: '',
        currency_code: 'INR',
        visa_info: 'Visa on arrival / eVisa',
        best_season: 'October to March',
        description: '',
        latitude: '26.912400',
        longitude: '75.787300',
      })
      loadDestinations()
    } catch (err) {
      alert('Failed to create destination.')
    }
  }

  const handleCreateAttraction = async (destId, e) => {
    e.preventDefault()
    try {
      await api.post('/attractions/', {
        ...newAttraction,
        destination: destId,
        avg_cost: Number(newAttraction.avg_cost),
      })
      setNewAttraction({ destination: '', name: '', category: 'Architecture', avg_cost: '500', latitude: '', longitude: '' })
      loadDestinations()
    } catch (err) {
      alert('Failed to add attraction.')
    }
  }

  const handleDeleteDest = async (id) => {
    if (!window.confirm('Delete this destination and its attractions?')) return
    try {
      await api.delete(`/destinations/${id}/`)
      loadDestinations()
    } catch (err) {
      alert('Cannot delete destination with active trip references.')
    }
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#8b5cf6', textTransform: 'uppercase' }}>
            ADMINISTRATION PORTAL
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '6px 0 4px', color: '#0f172a' }}>
            Destinations & Attractions
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
            Curate geographic hubs, seasonal best periods, currencies, and tourist attractions.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            background: '#8b5cf6',
            color: '#fff',
            border: 'none',
            padding: '12px 20px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {showAdd ? 'Cancel' : '+ Add Destination'}
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleCreateDest}
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 24,
            marginBottom: 28,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>City / Hub Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Country</label>
            <input
              type="text"
              required
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Currency Code</label>
            <input
              type="text"
              required
              value={form.currency_code}
              onChange={(e) => setForm({ ...form, currency_code: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Latitude</label>
            <input
              type="text"
              required
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Longitude</label>
            <input
              type="text"
              required
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button
              type="submit"
              style={{
                background: '#10b981',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 8,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Save Destination
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading destinations...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {destinations.map((d) => (
            <div key={d.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
                    📍 {d.name}, {d.country}
                  </h3>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    Currency: <strong>{d.currency_code}</strong> · Coordinates: ({d.latitude}, {d.longitude}) · Visa: {d.visa_info}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setExpandedDest(expandedDest === d.id ? null : d.id)}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {expandedDest === d.id ? 'Hide Attractions' : `View Attractions (${d.attractions?.length || 0})`}
                  </button>
                  <button
                    onClick={() => handleDeleteDest(d.id)}
                    style={{
                      background: '#fee2e2',
                      border: 'none',
                      color: '#b91c1c',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {expandedDest === d.id && (
                <div style={{ marginTop: 20, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 12 }}>
                    Attractions in {d.name}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginBottom: 16 }}>
                    {d.attractions?.map((att) => (
                      <div key={att.id} style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{att.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                          {att.category} · Avg Cost: ₹{Number(att.avg_cost).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add attraction inline form */}
                  <form
                    onSubmit={(e) => handleCreateAttraction(d.id, e)}
                    style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}
                  >
                    <input
                      type="text"
                      required
                      placeholder="Attraction name"
                      value={newAttraction.name}
                      onChange={(e) => setNewAttraction({ ...newAttraction, name: e.target.value })}
                      style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                    />
                    <input
                      type="text"
                      placeholder="Category"
                      value={newAttraction.category}
                      onChange={(e) => setNewAttraction({ ...newAttraction, category: e.target.value })}
                      style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                    />
                    <input
                      type="number"
                      placeholder="Avg Cost (₹)"
                      value={newAttraction.avg_cost}
                      onChange={(e) => setNewAttraction({ ...newAttraction, avg_cost: e.target.value })}
                      style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12, width: 100 }}
                    />
                    <button
                      type="submit"
                      style={{
                        background: '#0f172a',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      + Add Attraction
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
