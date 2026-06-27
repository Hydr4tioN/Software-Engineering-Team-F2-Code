import { useEffect, useState } from "react";
import { supabase } from '../supabaseClient';
import Visualisierung from "./visualisierung"; // 1. ADD THIS IMPORT! (Make sure the path is correct)
const API_BASE_URL = "http://localhost:3000/api";

function Checkin() {
  const [stress, setStress] = useState(0);
  const [energie, setEnergie] = useState(1);
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [error, setError] = useState("");
  const demoEntries = [
    {
      id: 1,
      stress: 3,
      energie: 7,
      createdAt: "2026-06-20"
    },
    {
      id: 2,
      stress: 6,
      energie: 4,
      createdAt: "2026-06-22"
    },
    {
      id: 3,
      stress: 4,
      energie: 5,
      createdAt: "2026-06-24"
    },
    {
      id: 4,
      stress: 8,
      energie: 2,
      createdAt: "2026-06-26"
    }
  ];
  
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

  async function handleSave() {
    console.log("Stress gespeichert:", stress);
    
    // Check for improper input
    if(stress === 0) {
      setError("Bitte wähle einen Stress-Level aus, bevor du speicherst.");
      return;
    }
    
    try {
      setError(""); // clear error if input is valid
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("Du musst eingeloggt sein, um zu speichern!");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          stressLevel: stress,
          user_id: session.user.id // <--- Pitching the ID to the backend!
        }),
      });

      if (!response.ok) {
        throw new Error("Server returned an error");
      }
      
      loadEntries();
    } catch {
      setError("Check-In konnte nicht gespeichert werden.");
    }
  }

  return (
    <div className="checkin-container">
      <h2>Stress-Level</h2>

      <input
        type="range"
        min="1"
        max="10"
        value={stress}
        onChange={(e) => setStress(Number(e.target.value))}
      />

      <p>{stress}</p>

      <button onClick={handleSave}>Speichern</button>

      <p className="stress-value">{stress}</p>

      <h2>Energie-Level</h2>

      <input
       className="stress-slider"
        type="range"
        min="1"
        max="10"
        value={energie}
        onChange={(e) => setEnergie(Number(e.target.value))}
      />
      <p className="stress-value">{energie}</p>


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
          {entries.map((entry) => (
            <li key={entry.id}>
            Stress: {entry.stress_level}% - {new Date(entry.entry_date).toLocaleString()}           
             </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Checkin;