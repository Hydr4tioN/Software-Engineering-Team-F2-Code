import { useEffect, useState } from "react";

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
      if (!response.ok) throw new Error();

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
      <h2>Stress-Level</h2>

      <input
        type="range"
        min="0"
        max="100"
        value={stress}
        onChange={(e) => setStress(Number(e.target.value))}
      />

      <p>{stress}%</p>

      <button onClick={handleSave}>Speichern</button>

      <h2>Gespeicherte Check-Ins</h2>

      {error && <p>{error}</p>}

      {loadingEntries ? (
        <p>Laden...</p>
      ) : (
        <ul>
          {entries.map((entry) => (
            <li key={entry.id}>{entry.text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Checkin;