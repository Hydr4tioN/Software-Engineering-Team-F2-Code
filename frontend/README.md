# SE-PWA

Walking Skeleton für eine Progressive Web App mit React, Vite, Node.js und Express.

Ziel dieses Standes ist ein minimaler technischer Durchstich vom Frontend über eine REST-API bis zu einer temporären Persistenz im Backend.

## Technologie-Stack

| Bereich | Technologie |
|---|---|
| Frontend | React + JavaScript + Vite |
| Backend | Node.js + Express |
| API-Kommunikation | REST API mit JSON |
| Persistenz | Temporäres Array im Backend |
| Versionsverwaltung | Git |
| Entwicklungsumgebung | VS Code / lokales Terminal |

## Projektstruktur

```text
SE-PWA/
├── frontend/   # React + Vite Frontend
├── backend/    # Node.js + Express Backend
├── docs/       # Dokumentation
└── README.md
```

## Voraussetzungen

Installiert sein müssen:

- Node.js
- npm
- Git

Versionen prüfen:

```bash
node -v
npm -v
git --version
```

## Installation

Nach dem Klonen oder Herunterladen des Projekts müssen die Abhängigkeiten für Frontend und Backend separat installiert werden.

### Backend installieren

Im Root-Ordner `SE-PWA`:

```bash
cd backend
npm install
```

### Frontend installieren

Zurück in den Root-Ordner wechseln und dann ins Frontend:

```bash
cd ..
cd frontend
npm install
```

Alternativ direkt aus dem Root-Ordner:

```bash
cd frontend
npm install
```

## Lokaler Start

Für die lokale Ausführung werden zwei Terminals benötigt:

- ein Terminal für das Backend
- ein Terminal für das Frontend

### Backend starten

Im Root-Ordner `SE-PWA`:

```bash
cd backend
npm run dev
```

Das Backend läuft danach unter:

```text
http://localhost:3000
```

Verfügbare Test-Endpunkte:

```text
GET  http://localhost:3000/api/health
GET  http://localhost:3000/api/entries
POST http://localhost:3000/api/entries
```

### Frontend starten

In einem zweiten Terminal im Root-Ordner `SE-PWA`:

```bash
cd frontend
npm run dev
```

Das Frontend läuft danach unter:

```text
http://localhost:5173
```

## Walking-Skeleton-Nachweis

Der aktuelle Stand zeigt einen minimalen technischen Durchstich:

```text
React Frontend
→ fetch()
→ Express REST API
→ temporäre Persistenz im Backend
→ JSON-Antwort zurück an das Frontend
```

Das Frontend kann aktuell:

- den Backend-Status über `/api/health` anzeigen,
- Einträge über `/api/entries` laden,
- neue Einträge per Formular an das Backend senden,
- gespeicherte Einträge direkt anzeigen.

Damit sind folgende Punkte des Walking Skeletons abgedeckt:

- technische Grundstruktur,
- Verbindung über relevante Komponenten,
- minimale Interaktion zwischen UI, API, Backend und temporärer Persistenz,
- reproduzierbare lokale Startmöglichkeit,
- erste Evidenz, dass der Ansatz praktikabel ist.

## Temporäre Persistenz

Die Einträge werden aktuell nur in einem Array im Backend gespeichert.

Das bedeutet:

- neue Einträge bleiben während der laufenden Backend-Sitzung erhalten,
- nach einem Neustart des Backends gehen neu hinzugefügte Einträge verloren,
- diese Lösung ist bewusst nur für den Walking Skeleton gedacht.

Später soll die temporäre Persistenz durch Supabase PostgreSQL ersetzt werden.

## Beispielablauf

1. Backend starten.
2. Frontend starten.
3. Im Browser `http://localhost:5173` öffnen.
4. Das Frontend ruft den Backend-Status ab.
5. Das Frontend lädt vorhandene Einträge vom Backend.
6. Über das Formular kann ein neuer Eintrag gespeichert werden.
7. Der neue Eintrag wird im Backend temporär gespeichert und im Frontend angezeigt.

## Aktueller Stand

Erledigt:

- React + Vite Frontend eingerichtet,
- Node.js + Express Backend eingerichtet,
- REST-Endpunkte erstellt,
- Frontend mit Backend verbunden,
- temporäre Persistenz im Backend umgesetzt,
- lokale Startbarkeit dokumentiert.

Noch offen:

- Supabase PostgreSQL anbinden,
- Supabase Auth ergänzen,
- fachliches Domänenmodell ausarbeiten,
- Routing im Frontend ergänzen,
- Tests ergänzen,
- Deployment vorbereiten.