import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function Register() {
  const nav = useNavigate()
  const [f, setF] = useState({ username: '', email: '', password: '' })
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    try { await api.post('/auth/register/', f); nav('/login') }
    catch (e2) { setErr(JSON.stringify(e2.response?.data || 'Registration failed')) }
  }
  return (
    <form onSubmit={submit} style={{ padding: 16 }}>
      <h2>Register</h2>
      <input placeholder="Username" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} />
      <input type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <input type="password" placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
      <button>Create account</button>
      {err && <p style={{ color: 'crimson' }}>{err}</p>}
    </form>
  )
}
