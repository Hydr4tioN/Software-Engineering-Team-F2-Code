import { useEffect, useState } from "react";
import Visualisierung from "./visualisierung";

const API_BASE_URL = "http://localhost:3000/api";

function Checkin() {
  const [stress, setStress] = useState(1);
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [error, setError] = useState("");

  const demoEntries = [
    {
      id: 1,
      stress: 3,
      createdAt: "2026-06-20"
    },
    {
      id: 2,
      stress: 6,
      createdAt: "2026-06-22"
    },
    {
      id: 3,
      stress: 4,
      createdAt: "2026-06-24"
    },
    {
      id: 4,
      stress: 8,
      createdAt: "2026-06-26"
    }
  ];

  async function loadEntries() {
    setLoadingEntries(true);

    try {
      const response = await fetch(`${API_BASE_URL}/entries`);

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      setEntries(data);
      setError("");

    } catch {
      setError("Check-In-Daten konnten nicht geladen werden.");
    } finally {
      setLoadingEntries(false);
    }
  }

  useEffect(() => {
    loadEntries();
  }, []);

  function handleSave() {
    console.log("Stress gespeichert:", stress);
  }

  return (
    <div className="checkin-container">

      <h1>Check In</h1>

      <h2>Stress-Level</h2>

      <input
        className="stress-slider"
        type="range"
        min="1"
        max="10"
        value={stress}
        onChange={(e) => setStress(Number(e.target.value))}
      />

      <p className="stress-value">{stress}</p>

      <button onClick={handleSave}>
        Speichern
      </button>

      <Visualisierung
        entries={entries.length ? entries : demoEntries}
      />

      <h2>Gespeicherte Check-Ins</h2>

      {error && <p>{error}</p>}

      {loadingEntries ? (
        <p>Laden...</p>
      ) : (
        <ul>
          {(entries.length ? entries : demoEntries).map((entry) => (
            <li key={entry.id}>
              Stress: {entry.stress}
            </li>
          ))}
        </ul>
      )}

    </div>
  );
}

export default Checkin;