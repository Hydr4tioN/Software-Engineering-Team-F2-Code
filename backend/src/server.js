const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

const entries = [
  {
    id: 1,
    text: 'Erster temporärer Eintrag aus dem Backend',
    createdAt: new Date().toISOString(),
  },
]

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PWA-SE Backend',
    timestamp: new Date().toISOString(),
  })
})

app.get('/api/entries', (req, res) => {
  res.json(entries)
})

app.post('/api/entries', (req, res) => {
  const { text } = req.body

  if (!text || text.trim() === '') {
    return res.status(400).json({
      error: 'Text darf nicht leer sein',
    })
  }

  const newEntry = {
    id: entries.length + 1,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  }

  entries.push(newEntry)

  res.status(201).json(newEntry)
})

app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`)
})