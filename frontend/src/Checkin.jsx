import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const API_BASE_URL = "http://localhost:3000/api";

function Checkin() {

  const navigate = useNavigate();

  const [stress, setStress] = useState(1);
  const [energie, setEnergie] = useState(1);
  const [error, setError] = useState("");

  async function handleSave() {

    try {

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Bitte einloggen");
        return;
      }

      await fetch(`${API_BASE_URL}/entries`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          stressLevel: stress,
          energyLevel: energie,
          user_id: session.user.id
        })
      });

      navigate("/dashboard");

    } catch {
      setError("Speichern fehlgeschlagen");
    }
  }

  return (
    <div className="checkin-container">
      

      <h1>Wie geht es dir heute? </h1>
      <h6> (Deine Eingaben helfen uns dir bessere Tipps zu geben um deine Situation besser einzuschätzen) </h6>

      <h2>Stress-Level</h2>



      <input
        className="stress-slider"
        type="range"
        min="1"
        max="10"
        value={stress}
        onChange={(e)=>setStress(Number(e.target.value))}
      />

      <p>{stress}</p>

      <h2>Energie-Level</h2>

      <input
        className="stress-slider"
        type="range"
        min="1"
        max="10"
        value={energie}
        onChange={(e)=>setEnergie(Number(e.target.value))}
      />

      <p>{energie}</p>

      <button onClick={handleSave}>
        Speichern
      </button>

      {error && <p>{error}</p>}

    </div>
  );
}

export default Checkin;