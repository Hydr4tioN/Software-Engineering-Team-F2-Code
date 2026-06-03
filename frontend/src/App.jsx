import './App.css'

function App() {
  return (
    <main className="app">
      <section className="hero">
        <h1>PWA-SE</h1>
        <p>
          Entwicklungsstart für die neue Progressive Web App mit React und Vite.
        </p>
      </section>

      <section className="overview">
        <h2>Projektstatus</h2>

        <div className="card-grid">
          <article className="card">
            <h3>Frontend</h3>
            <p>React + JavaScript + Vite</p>
          </article>

          <article className="card">
            <h3>PWA</h3>
            <p>Wird später mit Manifest und Service Worker ergänzt.</p>
          </article>

          <article className="card">
            <h3>Backend</h3>
            <p>Noch nicht angebunden.</p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default App