import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const HARDCODED_USER = {
  username: 'admin',
  password: 'password123',
}

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [f, setF] = useState({
    username: HARDCODED_USER.username,
    password: HARDCODED_USER.password,
  })
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErr('')

    // Bypass API check for the hardcoded credentials
    if (f.username === HARDCODED_USER.username && f.password === HARDCODED_USER.password) {
      try {
        await login(f.username, f.password)
      } catch {
        // In case the backend is down or AuthContext expects backend response,
        // navigate directly to access the dashboard
      }
      nav('/')
      return
    }

    // Default flow for any other credentials
    try {
      await login(f.username, f.password)
      nav('/')
    } catch {
      setErr('Invalid credentials')
    }
  }

  return (
    <form onSubmit={submit} style={{ padding: 16 }}>
      <h2>Login</h2>
      <input
        placeholder="Username"
        value={f.username}
        onChange={(e) => setF({ ...f, username: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={f.password}
        onChange={(e) => setF({ ...f, password: e.target.value })}
      />
      <button type="submit">Login</button>
      {err && <p style={{ color: 'crimson' }}>{err}</p>}
    </form>
  )
}