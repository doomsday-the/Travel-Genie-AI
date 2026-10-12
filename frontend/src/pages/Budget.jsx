import { useState, useEffect } from 'react'
import api from '../api/axios'

const CATEGORIES = ['Flights', 'Hotels', 'Food & Dining', 'Activities', 'Shopping', 'Local Transport', 'Other']

export default function Budget() {
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState('')
  const [summary, setSummary] = useState(null)
  const [categories, setCategories] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  // Add expense form state
  const [form, setForm] = useState({
    category: 'Food & Dining',
    amount: '',
    spent_on: new Date().toISOString().split('T')[0],
    note: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadTrips = async () => {
    try {
      const res = await api.get('/trips/')
      const list = res.data?.results || res.data || []
      setTrips(list)
      if (list.length > 0) {
        setSelectedTrip(list[0].id)
      }
    } catch (err) {
      console.error('Failed to load trips', err)
    } finally {
      setLoading(false)
    }
  }

  const loadTripBudget = async (tripId) => {
    if (!tripId) return
    try {
      const [sumRes, catRes, expRes] = await Promise.all([
        api.get(`/trips/${tripId}/cost-summary/`),
        api.get(`/trips/${tripId}/spend-by-category/`),
        api.get(`/expenses/?trip=${tripId}`),
      ])
      setSummary(sumRes.data)
      setCategories(catRes.data || [])
      setExpenses(expRes.data?.results || expRes.data || [])
    } catch (err) {
      console.error('Failed to load trip budget details', err)
    }
  }

  useEffect(() => {
    loadTrips()
  }, [])

  useEffect(() => {
    if (selectedTrip) {
      loadTripBudget(selectedTrip)
    }
  }, [selectedTrip])

  const handleAddExpense = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post('/expenses/', {
        trip: selectedTrip,
        category: form.category,
        amount: Number(form.amount),
        spent_on: form.spent_on,
        note: form.note,
      })
      setForm({ ...form, amount: '', note: '' })
      loadTripBudget(selectedTrip)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to record expense.')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteExpense = async (id) => {
    if (!window.confirm('Delete this expense entry?')) return
    try {
      await api.delete(`/expenses/${id}/`)
      loadTripBudget(selectedTrip)
    } catch (err) {
      alert('Failed to delete expense.')
    }
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#10b981', textTransform: 'uppercase' }}>
            FINANCIAL INTELLIGENCE
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '6px 0 4px', color: '#0f172a' }}>
            Trip Budget & Expenses
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
            Powered by SQL View (v_trip_cost_summary) and database procedure aggregations.
          </p>
        </div>

        {/* Trip Selector */}
        {trips.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Selected Journey:</span>
            <select
              value={selectedTrip}
              onChange={(e) => setSelectedTrip(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 14,
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
        )}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading financial portfolio...</div>
      ) : !selectedTrip ? (
        <div style={{ background: '#f8fafc', padding: 40, borderRadius: 14, textAlign: 'center', border: '1px dashed #cbd5e1' }}>
          No trips available. Create a trip first to track budgets!
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18, marginBottom: 28 }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 22 }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Total Allocated Budget</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
                ₹{Number(summary?.budget || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>Trip ceiling target</div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 22 }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Total Spent So Far</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b', marginTop: 8 }}>
                ₹{Number(summary?.spent || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                {summary?.budget ? `${((summary.spent / summary.budget) * 100).toFixed(1)}% of budget utilized` : ''}
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 22 }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Remaining Balance</div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: (summary?.remaining || 0) < 0 ? '#ef4444' : '#10b981',
                  marginTop: 8,
                }}
              >
                ₹{Number(summary?.remaining || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 11, color: (summary?.remaining || 0) < 0 ? '#ef4444' : '#059669', marginTop: 4 }}>
                {(summary?.remaining || 0) < 0 ? '⚠️ Budget exceeded (Audit trigger active)' : 'Within target allocation'}
              </div>
            </div>
          </div>

          {/* Budget Progress Bar */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
              <span>BUDGET UTILIZATION GAUGE</span>
              <span>{Math.round(((summary?.spent || 0) / (summary?.budget || 1)) * 100)}%</span>
            </div>
            <div style={{ background: '#e2e8f0', height: 12, borderRadius: 6, overflow: 'hidden' }}>
              <div
                style={{
                  background: (summary?.remaining || 0) < 0 ? '#ef4444' : '#10b981',
                  height: '100%',
                  width: `${Math.min(100, ((summary?.spent || 0) / (summary?.budget || 1)) * 100)}%`,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>

          {/* 2-Column: Category Breakdown & Add Expense Form */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)', gap: 28, marginBottom: 32 }}>
            {/* Category Breakdown */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 16px', color: '#0f172a' }}>
                Spend by Category (SQL Grouping)
              </h3>
              {categories.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 13 }}>No categorized expenses recorded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {categories.map((c) => {
                    const percent = summary?.spent ? Math.round((c.total / summary.spent) * 100) : 0
                    return (
                      <div key={c.category}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                          <span style={{ fontWeight: 600, color: '#334155' }}>{c.category}</span>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>
                            ₹{Number(c.total).toLocaleString('en-IN')} <small style={{ color: '#94a3b8' }}>({percent}%)</small>
                          </span>
                        </div>
                        <div style={{ background: '#f1f5f9', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ background: '#3b82f6', height: '100%', width: `${percent}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Add Expense Form */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 16px', color: '#0f172a' }}>
                Log New Expense
              </h3>
              <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                    Amount (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="e.g. 1500"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                    Date Spent
                  </label>
                  <input
                    type="date"
                    required
                    value={form.spent_on}
                    onChange={(e) => setForm({ ...form, spent_on: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                    Note / Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Traditional dinner at bazaar"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>

                {error && <div style={{ color: '#ef4444', fontSize: 12 }}>⚠️ {error}</div>}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: '#10b981',
                    color: '#fff',
                    padding: '12px',
                    borderRadius: 8,
                    border: 'none',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    marginTop: 6,
                  }}
                >
                  {submitting ? 'Logging...' : 'Record Expense'}
                </button>
              </form>
            </div>
          </div>

          {/* Complete Expense History Table */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 16px', color: '#0f172a' }}>
              Transaction Log ({expenses.length} Records)
            </h3>
            {expenses.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13 }}>No expenses found for this trip.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                      <th style={{ padding: '10px 12px' }}>Date</th>
                      <th style={{ padding: '10px 12px' }}>Category</th>
                      <th style={{ padding: '10px 12px' }}>Description / Note</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => (
                      <tr key={exp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px' }}>{exp.spent_on}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 4, fontWeight: 600, fontSize: 11 }}>
                            {exp.category}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#334155' }}>{exp.note || '—'}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                          ₹{Number(exp.amount).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
