import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics/')
        setData(res.data)
      } catch (err) {
        console.error('Failed to load analytics', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Aggregating system intelligence...</div>
  if (!data) return <div style={{ padding: 40, textAlign: 'center' }}>Could not load analytics.</div>

  const metrics = data.metrics || {}
  const spendByCat = data.spend_by_category || []
  const hotelPrices = data.hotel_price_by_city || []
  const tripsPerUser = data.trips_per_user || []

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#8b5cf6', textTransform: 'uppercase' }}>
          EXECUTIVE INTELLIGENCE
        </span>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '6px 0 4px', color: '#0f172a' }}>
          Platform Analytics & Aggregates
        </h1>
        <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
          Advanced SQL aggregates: category spending sums, city hotel price averages, and traveler trip frequency.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18, marginBottom: 32 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 22 }}>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Total Generated Trips</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>{metrics.total_trips || 0}</div>
          <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>Saved in normalized relational 3NF tables</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 22 }}>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Active Registered Travelers</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#3b82f6', marginTop: 8 }}>{metrics.active_travelers || 0}</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Unique users with itineraries</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 22 }}>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Total Recorded Spending</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#f59e0b', marginTop: 8 }}>
            ₹{Number(metrics.total_expenses_logged || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Across bookings & custom expenses</div>
        </div>
      </div>

      {/* 3 Grid Analytics Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 24 }}>
        {/* 1. Spend per Category */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>
              1. Spend per Category (SUM)
            </h3>
            <span style={{ fontSize: 10, background: '#f1f5f9', padding: '3px 6px', borderRadius: 4, fontWeight: 600 }}>SQL AGGREGATE</span>
          </div>
          {spendByCat.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>No expenses found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {spendByCat.map((item) => (
                <div key={item.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{item.category}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{item.count} total transaction(s)</div>
                  </div>
                  <strong style={{ fontSize: 14, color: '#059669' }}>
                    ₹{Number(item.total).toLocaleString('en-IN')}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Average Hotel Price per City */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>
              2. Avg Hotel Price per City (AVG)
            </h3>
            <span style={{ fontSize: 10, background: '#f1f5f9', padding: '3px 6px', borderRadius: 4, fontWeight: 600 }}>SQL AGGREGATE</span>
          </div>
          {hotelPrices.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>No hotels cataloged.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {hotelPrices.map((item) => (
                <div key={item['destination__name']} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>
                      📍 {item['destination__name']}, {item['destination__country']}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{item.count} properties tracked</div>
                  </div>
                  <strong style={{ fontSize: 14, color: '#3b82f6' }}>
                    ₹{Math.round(item.avg_price).toLocaleString('en-IN')} / night
                  </strong>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Trips per User */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>
              3. Trips per User (COUNT)
            </h3>
            <span style={{ fontSize: 10, background: '#f1f5f9', padding: '3px 6px', borderRadius: 4, fontWeight: 600 }}>SQL AGGREGATE</span>
          </div>
          {tripsPerUser.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>No traveler records found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tripsPerUser.map((item) => (
                <div key={item['user__username']} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>
                      👤 {item['user__username']}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{item['user__email']}</div>
                  </div>
                  <span style={{ background: '#8b5cf6', color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                    {item.trip_count} trip(s)
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
