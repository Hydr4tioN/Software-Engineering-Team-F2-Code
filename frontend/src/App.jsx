import { useEffect, useState } from 'react'
import './App.css'
import { Routes, Route, Link } from "react-router-dom";
import Register from "./Register.jsx"

const API_BASE_URL = 'http://localhost:3000/api'

function App() {
  const [backendStatus, setBackendStatus] = useState('wird geprüft...')
  const [entries, setEntries] = useState([])
  const [newEntryText, setNewEntryText] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadBackendStatus()
    loadEntries()
  }, [])

  async function loadBackendStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`)
      const data = await response.json()

      setBackendStatus(`${data.status} - ${data.service}`)
    } catch (error) {
      setBackendStatus('Backend nicht erreichbar')
    }
  }

  async function loadEntries() {
    try {
      const response = await fetch(`${API_BASE_URL}/entries`)
      const data = await response.json()

      setEntries(data)
      setError('')
    } catch (error) {
      setError('Belastungseinträge konnten nicht vom Backend geladen werden.')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (newEntryText.trim() === '') {
      setError('Bitte gib eine Belastung ein.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newEntryText }),
      })

      if (!response.ok) {
        throw new Error('Speichern fehlgeschlagen')
      }

      const savedEntry = await response.json()

      setEntries([...entries, savedEntry])
      setNewEntryText('')
      setError('')
    } catch (error) {
      setError('Belastungseintrag konnte nicht gespeichert werden.')
    }
  }

  return (
    <main className="app">

      <Routes>
        <Route
          path="/"
          element={
            <div>

              <h1>Belastungs-Tracker</h1>

              <Link to="/register">
                Zur Registrierung
              </Link>

              <hr />

              <p><b>API Status:</b> {backendStatus}</p>

              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={newEntryText}
                  onChange={(e) => setNewEntryText(e.target.value)}
                  placeholder="Belastung eingeben"
                />
                <button type="submit">Speichern</button>
              </form>

              {error && <p>{error}</p>}

              <ul>
                {entries.map((entry) => (
                  <li key={entry.id}>
                    #{entry.id} {entry.text}
                  </li>
                ))}
              </ul>

            </div>
          }
        />
        <Route
          path="/register"
          element={<Register />}
        />

      </Routes>

    </main>
  )
}

export default App