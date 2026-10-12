import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const loadUsers = async () => {
    try {
      const res = await api.get('/auth/users/')
      setUsers(res.data?.results || res.data || [])
    } catch (err) {
      console.error('Failed to load users', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/auth/users/${userId}/`, { role: newRole })
      setMsg(`Updated user role to ${newRole.toUpperCase()}`)
      setTimeout(() => setMsg(''), 3000)
      loadUsers()
    } catch (err) {
      alert('Failed to update role.')
    }
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#8b5cf6', textTransform: 'uppercase' }}>
          USER ACCESS & SECURITY
        </span>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '6px 0 4px', color: '#0f172a' }}>
          User Directory & Roles
        </h1>
        <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
          Manage role-based access control (RBAC). Admin and Traveler roles enforced at menu, route, and API layers.
        </p>
      </div>

      {msg && (
        <div style={{ background: '#ecfdf5', color: '#065f46', padding: '10px 16px', borderRadius: 8, marginBottom: 20, fontSize: 13, fontWeight: 600 }}>
          ✅ {msg}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading user directory...</div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '14px 18px' }}>User</th>
                  <th style={{ padding: '14px 18px' }}>Email Address</th>
                  <th style={{ padding: '14px 18px' }}>Date Joined</th>
                  <th style={{ padding: '14px 18px' }}>Assigned Role (RBAC)</th>
                  <th style={{ padding: '14px 18px', textAlign: 'center' }}>Modify Access</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{u.username}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>
                        {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}` : 'No display name'}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#475569' }}>{u.email}</td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>
                      {new Date(u.date_joined).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          background: u.role === 'admin' ? '#f3e8ff' : '#ecfdf5',
                          color: u.role === 'admin' ? '#7e22ce' : '#047857',
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontWeight: 700,
                          fontSize: 11,
                          textTransform: 'uppercase',
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#0f172a',
                        }}
                      >
                        <option value="user">Traveler (User)</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
