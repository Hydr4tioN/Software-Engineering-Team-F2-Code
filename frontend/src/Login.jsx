import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE_URL = 'http://localhost:3000'

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) { setError("Bitte E-Mail eingeben"); return; }
    if (!passwort.trim()) { setError("Bitte Passwort eingeben"); return; }

    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: passwort }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Ungültige Anmeldedaten");
        return;
      }

      localStorage.setItem('token', data.accessToken);
      navigate("/dashboard");
    } catch {
      setError("Server nicht erreichbar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-container">
      <h1>Login</h1>
      <h3>Melde dich mit deinem Account an</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Passwort"
          value={passwort}
          onChange={(e) => setPasswort(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Wird angemeldet..." : "Anmelden"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
      <p>Noch kein Konto? <Link to="/register">Registrieren</Link></p>
    </div>
  );
}

export default Login;