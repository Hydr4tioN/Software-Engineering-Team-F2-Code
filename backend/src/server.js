/**
 * Express ist das Backend-Framework.
 * Damit erstellen wir den HTTP-Server und definieren REST-Endpunkte.
 */
const express = require('express')
/**
 * CORS erlaubt dem Frontend auf Port 573,
 * Anfragen an das Backend auf Port 3000 zu senden.
 */
const cors = require('cors')
/**
 * Erstellt eine Express-Anwendung.
 * Über diese Variable werden Middleware und Routen registriert.
 */
const app = express()
/**
 * Port, auf dem das Backend lokal erreichbar ist.
 */
const PORT = 3000
/**
 * Aktiviert CORS für eingehende Anfragen.
 * Ohne CORS würde der Browser die Kommunikation zwischen Frontend und Backend blockieren.
 */
app.use(cors())
/**
 * Aktiviert das automatische Lesen von JSON-Daten im Request-Body.
 * Dadurch ist req.body bei POST-Anfragen nutzbar.
 */
app.use(express.json())

/**
 * Temporäre Persistenz im Arbeitsspeicher.
 * Die Daten bleiben nur erhalten, solange der Backend-Prozess läuft.
 */
const entries = [
  {
    id: 1,
    text: 'Erster temporärer Eintrag aus dem Backend',
    createdAt: new Date().toISOString(),
  },
]
/**
 * GET-Endpunkt zum Prüfen, ob das Backend erreichbar ist.
 * Wird vom Frontend genutzt, um den API-Status anzuzeigen.
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PWA-SE Backend',
    timestamp: new Date().toISOString(),
  })
})
/**
 * GET-Endpunkt zum Laden aller gespeicherten Belastungseinträge.
 * Das Backend gibt das entries-Array als JSON zurück.
 */
app.get('/api/entries', (req, res) => {
  res.json(entries)
})
/**
 * POST-Endpunkt zum Speichern eines neuen Belastungseintrags.
 * Das Frontend sendet dafür JSON im Format: { "text": "..."}
 */
app.post('/api/entries', (req, res) => {
  // Destructuring: Der Wert text wird aus req.body herausgeholt.
  const { text } = req.body

  /**
   * Ein leerer oder fehlender Text wird abgelehnt.
   * HTTP 400 bedeutet: fehlerhafte Anfrage des Clients.
   */
  if (!text || text.trim() === '') {
    return res.status(400).json({
      error: 'Text darf nicht leer sein',
    })
  }
  /**
   * Neuer Eintrag wird als JavaScript-Objekt erstellt.
   * Die ID wird hier vereinfacht aus der aktuellen Array-Länge berechnet.
   */
  const newEntry = {
    id: entries.length + 1,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  }
  // Der neue Eintrag wird im temporären Array gespeichert.
  entries.push(newEntry)

  /**
   * HTTP 201 bedeutet: Ressource wurde erfolgreich erstellt.
   * Das Backend gibt den gespeicherten Eintrag als JSON zurück.
   */
  res.status(201).json(newEntry)
})
/**
 * Startet den HTTP-Server.
 * Die Callback-Funktion wird ausgeführt, sobald der Server läuft.
 */
app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`)
})