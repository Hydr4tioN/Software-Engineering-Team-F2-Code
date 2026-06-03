import { useEffect, useState } from 'react'
import './App.css'

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
        body: JSON.stringify({
          text: newEntryText,
        }),
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
      <section className="hero">
        <h1>Belastungs-Tracker</h1>
        <p>
          Walking Skeleton zur Erfassung und Anzeige von Belastungseinträgen.
        </p>
      </section>

      <section className="overview">
        <h2>Projektstatus</h2>

        <div className="card-grid">
          <article className="card">
            <h3>App-Oberfläche</h3>
            <p>React + JavaScript + Vite</p>
          </article>

          <article className="card">
            <h3>API-Status</h3>
            <p>{backendStatus}</p>
          </article>

          <article className="card">
            <h3>Temporäre Speicherung</h3>
            <p>Belastungseinträge werden aktuell im Backend zwischengespeichert.</p>
          </article>
        </div>
      </section>

      <section className="interaction">
        <h2>Belastung erfassen</h2>

        <form onSubmit={handleSubmit} className="entry-form">
          <input
            type="text"
            value={newEntryText}
            onChange={(event) => setNewEntryText(event.target.value)}
            placeholder="z. B. Prüfung, Projektstress, Schlafmangel"
          />
          <button type="submit">Speichern</button>
        </form>

        {error && <p className="error">{error}</p>}

        <h3>Erfasste Belastungen</h3>

        <ul className="entry-list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <strong>#{entry.id}</strong> {entry.text}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default App