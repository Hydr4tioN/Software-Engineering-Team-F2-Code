import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [passwort, setPasswort] = useState("");
    const [error, setError] = useState("");

function handleSubmit(e) {
        e.preventDefault();

        if (!email.trim()) {
            setError("Bitte E-Mail eingeben");
            return;
        }   

        if (!passwort.trim()) {
            setError("Bitte Passwort eingeben");
            return;
        }

        setError("");
        navigate("/checkin");
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

                <button type="submit">
                    Anmelden
                </button>
                {error && <p className="error">{error}</p>}
            </form>
        </div>
    );
}

export default Login;

