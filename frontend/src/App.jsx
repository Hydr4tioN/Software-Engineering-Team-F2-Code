import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login from './Login.jsx'
import Register from './Register.jsx'
import './App.css'

const API_BASE_URL = 'http://localhost:3000'

// ── Geschützte Route: leitet zur Login-Seite weiter wenn nicht angemeldet ──
function ProtectedRoute({ token, children }) {
  if (!token) return <Navigate to="/login" replace />
  return children
}

// ── Dashboard: Check-In erfassen + Daten anzeigen ──
function Dashboard({ token, onLogout }) {
  const [stressLevel, setStressLevel] = useState(5)
  const [energyLevel, setEnergyLevel] = useState(5)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [chartData, setChartData] = useState(null)

  useEffect(() => {
    loadChartData()
  }, [])

  async function loadChartData() {
    try {
      const res = await fetch(`${API_BASE_URL}/check-ins/chart`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      setChartData(json)
    } catch {
      setError('Daten konnten nicht geladen werden.')
    }
  }

  async function handleCheckIn(e) {
    e.preventDefault()
    setMessage('')
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/check-ins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stress_level: Number(stressLevel),
          energy_level: Number(energyLevel),
        }),
      })
      if (!res.ok) throw new Error()
      setMessage('Check-In erfolgreich gespeichert!')
      loadChartData()
    } catch {
      setError('Check-In konnte nicht gespeichert werden.')
    }
  }

  return (
    <main className="app">
      <section className="hero">
        <h1>EnergyBalance</h1>
        <button onClick={onLogout} style={{ float: 'right' }}>Abmelden</button>
      </section>

      <section className="interaction">
        <h2>Check-In</h2>
        <form onSubmit={handleCheckIn} className="entry-form">
          <label>
            Stresslevel: <strong>{stressLevel}</strong>
            <input
              type="range" min="1" max="10"
              value={stressLevel}
              onChange={(e) => setStressLevel(e.target.value)}
            />
          </label>
          <label>
            Energielevel: <strong>{energyLevel}</strong>
            <input
              type="range" min="1" max="10"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(e.target.value)}
            />
          </label>
          <button type="submit">Speichern</button>
        </form>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p className="error">{error}</p>}
      </section>

      <section className="interaction">
        <h2>Verlauf</h2>
        {!chartData || chartData.labels?.length === 0 ? (
          <p>Keine Daten vorhanden. Füge deinen ersten Check-In hinzu!</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Zeitpunkt</th>
                <th>Stress</th>
                <th>Energie</th>
              </tr>
            </thead>
            <tbody>
              {chartData.labels.map((label, i) => (
                <tr key={i}>
                  <td>{new Date(label).toLocaleString('de-DE')}</td>
                  <td>{chartData.stressData[i]?.y}</td>
                  <td>{chartData.energyData[i]?.y}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}

// ── App Root ──
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const navigate = useNavigate()

  function handleLoginSuccess(accessToken) {
    localStorage.setItem('token', accessToken)
    setToken(accessToken)
    navigate('/dashboard')
  }

  function handleLogout() {
    localStorage.removeItem('token')
    setToken(null)
    navigate('/login')
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
      <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} apiBase={API_BASE_URL} />} />
      <Route path="/register" element={<Register apiBase={API_BASE_URL} />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute token={token}>
            <Dashboard token={token} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
