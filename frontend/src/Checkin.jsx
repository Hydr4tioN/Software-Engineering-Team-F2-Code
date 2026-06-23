import { useEffect, useState } from "react";
import "./Checkin.css";

const API_BASE_URL = "http://localhost:3000/api";

function Checkin() {
  const [stress, setStress] = useState(0);
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [error, setError] = useState("");

  async function loadEntries() {
    setLoadingEntries(true);

    try {
      const response = await fetch(`${API_BASE_URL}/entries`);

      if (!response.ok) {
        throw new Error("Abrufen fehlgeschlagen");
      }

      const data = await response.json();

      setEntries(data);
      setError("");
    } catch (error) {
      setError("Check-In-Daten konnten nicht geladen werden.");
    } finally {
      setLoadingEntries(false);
    }
  }

  useEffect(() => {
    loadEntries();
  }, []);

  return (
    <div className="checkin-container">
      <h2>Stress-Level</h2>

      <input
        type="range"
        min="0"
        max="100"
        value={stress}
        onChange={(e) => setStress(e.target.value)}
      />

      <p>{stress}%</p>

      <h2>Gespeicherte Check-Ins</h2>

      {error && <p className="error">{error}</p>}

      {loadingEntries ? (
        <p>Daten werden geladen...</p>
      ) : entries.length === 0 ? (
        <p>Keine Daten vorhanden</p>
      ) : (
        <ul>
          {entries.map((entry) => (
            <li key={entry.id}>
              <strong>#{entry.id}</strong> {entry.text}
              {entry.createdAt && (
                <span> – {new Date(entry.createdAt).toLocaleString("de-DE")}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Checkin;