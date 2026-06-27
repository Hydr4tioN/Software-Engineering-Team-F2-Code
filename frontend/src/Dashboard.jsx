import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { supabase } from "../supabaseClient";
import Visualisierung from "./visualisierung";

function Dashboard() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    setLoading(true);
    setError("");

    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError) {
      setError("Session-Fehler: " + sessionError.message);
      setLoading(false);
      return;
    }

    if (!session) {
      setError("Bitte einloggen");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("stress_entries")
      .select("*")
      .eq("user_id", session.user.id)
      .order("entry_date", { ascending: true });

    if (error) {
      setError("Fehler beim Laden der Daten: " + error.message);
      setLoading(false);
      return;
    }

    setEntries(data || []);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div className="checkin-container">
      <h1>Dashboard</h1>

      {loading && <p>Laden...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && entries.length === 0 && (
        <p>Keine Einträge vorhanden.</p>
      )}
      {!loading && entries.length > 0 && <Visualisierung entries={entries} />}

      <button className="logout-btn-top" onClick={handleLogout}>
        <FaSignOutAlt />
      </button>
    </div>
  );
}

export default Dashboard;