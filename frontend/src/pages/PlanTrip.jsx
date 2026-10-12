import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'

const POPULAR_DESTINATIONS = ['Jaipur', 'Kyoto', 'Lisbon', 'Bali', 'Paris', 'New York']
const INTEREST_OPTIONS = ['Historical Sites', 'Local Food & Cafes', 'Nature & Hiking', 'Shopping & Markets', 'Photography', 'Nightlife & Lounges']

export default function PlanTrip() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialPrompt = searchParams.get('prompt') || ''

  const [destination, setDestination] = useState(initialPrompt.includes('Japan') ? 'Kyoto' : 'Jaipur')
  const [days, setDays] = useState(3)
  const [budget, setBudget] = useState('moderate')
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString().split('T')[0]
  })
  const [selectedInterests, setSelectedInterests] = useState(['Historical Sites', 'Local Food & Cafes'])
  const [prompt, setPrompt] = useState(initialPrompt)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { data } = await api.post('/ai/plan/', {
        destination,
        days: Number(days),
        budget,
        start_date: startDate,
        interests: selectedInterests,
        prompt: prompt.trim(),
      })
      // Direct redirect to the newly created normalized trip
      navigate(`/trips/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not generate itinerary. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#10b981', textTransform: 'uppercase' }}>
          AI TRAVEL AGENT
        </span>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: '6px 0 6px', color: '#0f172a' }}>
          Craft Your Next Dream Journey
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0, maxWidth: 600, marginInline: 'auto' }}>
          Powered by Gemini / Groq. Instant 3NF relational normalization saves your itinerary, budget, and packing list.
        </p>
      </div>

      <form
        onSubmit={submit}
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* Destination Selection */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
            Where would you like to travel?
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {POPULAR_DESTINATIONS.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setDestination(city)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  background: destination === city ? '#10b981' : '#f8fafc',
                  color: destination === city ? '#fff' : '#475569',
                  borderColor: destination === city ? '#10b981' : '#e2e8f0',
                }}
              >
                📍 {city}
              </button>
            ))}
          </div>
          <input
            type="text"
            required
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Or type any city or country (e.g. Barcelona, Rome, Tokyo)..."
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 14,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Days & Start Date */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
              Trip Duration ({days} Days)
            </label>
            <input
              type="range"
              min="1"
              max="14"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#10b981' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              <span>1 Day</span>
              <span>7 Days</span>
              <span>14 Days</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
              Departure Date
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Budget Tier */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
            Budget Tier
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { id: 'budget', label: 'Backpacker / Budget', desc: 'Hostels, public transport, street food' },
              { id: 'moderate', label: 'Comfortable / Moderate', desc: 'Boutique stays, mixed dining, paid entries' },
              { id: 'luxury', label: 'Luxury / Premium', desc: '5-star resorts, private transfers, fine dining' },
            ].map((b) => (
              <div
                key={b.id}
                onClick={() => setBudget(b.id)}
                style={{
                  border: '2px solid',
                  borderColor: budget === b.id ? '#10b981' : '#e2e8f0',
                  background: budget === b.id ? '#ecfdf5' : '#fff',
                  borderRadius: 10,
                  padding: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{b.label}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
            Travel Vibes & Interests
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {INTEREST_OPTIONS.map((i) => {
              const active = selectedInterests.includes(i)
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleInterest(i)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    background: active ? '#0f172a' : '#f8fafc',
                    color: active ? '#fff' : '#475569',
                    borderColor: active ? '#0f172a' : '#cbd5e1',
                  }}
                >
                  {active ? '✓ ' : '+ '} {i}
                </button>
              )
            })}
          </div>
        </div>

        {/* Custom AI Prompt */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
            Special Instructions / Prompt for AI (Optional)
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Traveling with family, love vegan cafes, want scenic morning viewpoints and avoid crowded tourist traps..."
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 12, borderRadius: 8, fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={busy}
          style={{
            background: busy ? '#94a3b8' : '#10b981',
            color: '#fff',
            padding: 16,
            borderRadius: 10,
            border: 'none',
            fontSize: 15,
            fontWeight: 700,
            cursor: busy ? 'not-allowed' : 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
          }}
        >
          {busy ? (
            <>
              <span className="spinner">⏳</span> Generating & Normalizing Itinerary into Database...
            </>
          ) : (
            <>
              <span>✨</span> Generate Smart Itinerary
            </>
          )}
        </button>
      </form>
    </div>
  )
}
