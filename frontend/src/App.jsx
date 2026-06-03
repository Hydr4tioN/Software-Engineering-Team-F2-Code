import { useEffect, useState } from 'react'
import './App.css'
/**
 * Basisadresse des Express-Backends.
 * Alle API-Endpunkte werden relativ zu dieser Adresse aufgerufen.
 */
const API_BASE_URL = 'http://localhost:3000/api'

function App() {
  // State für den aktuellen Backend-Status 
  const [backendStatus, setBackendStatus] = useState('wird geprüft...')
  // State für alle Belastungseinträge, die vom Backend geladen werden
  const [entries, setEntries] = useState([])
  // State für Fehlermeldungen in der Oberfläche
  const [newEntryText, setNewEntryText] = useState('')
  const [error, setError] = useState('')
/**
 * use Effect wird einmal beim ersten Laden der Komponente ausgeführt.
 * Dadurch werden Backend-Status und vorhandene Einträge direkt geladen.
 */
  useEffect(() => {
    loadBackendStatus()
    loadEntries()
  }, [])

  async function loadBackendStatus() {
    try {
      // GET-Anfrage an das Backend, um zu prüfen, ob die API erreichbar ist.
      const response = await fetch(`${API_BASE_URL}/health`)
      const data = await response.json()

      setBackendStatus(`${data.status} - ${data.service}`)
    } catch (error) {
      setBackendStatus('Backend nicht erreichbar')
    }
  }

  async function loadEntries() {
    try {
      // GET-Anfrage an das Backend, um alle gespeicherten Einträge zu laden.
      const response = await fetch(`${API_BASE_URL}/entries`)
      const data = await response.json()

      setEntries(data)
      setError('')
    } catch (error) {
      setError('Belastungseinträge konnten nicht vom Backend geladen werden.')
    }
  }

  async function handleSubmit(event) {
    // Verhindert das automatische Neuladen der Seite beim Absenden des Formulars.
    event.preventDefault()

    // Ein leerer Eintrag soll nicht gespeichert werden.
    if (newEntryText.trim() === '') {
      setError('Bitte gib eine Belastung ein.')
      return
    }

    try {
      /**
       * POST-Anfrage an das Backend.
       * Der neue Belastungseintrag wird als JSON im Request-Body gesendet.
       */
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
      /**
       * Der neue Eintrag wird zusätzlich lokal in den State übernommen,
       * damit die Liste im Frontend sofort aktualisiert wird.
       */
      setEntries([...entries, savedEntry])
      // Eingabefeld und Fehlermeldung zurücksetzen
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