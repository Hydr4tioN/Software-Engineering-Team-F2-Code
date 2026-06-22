import { useState } from "react";

function Register() {
    const [email, setEmail] = useState("");
    const [passwort, setPasswort] = useState("");
    const [error, setError] = useState("");

    function handleSubmit(event) {
        event.preventDefault();

        if (email.trim() === "") {
            setError("Bitte E-Mail eingeben");
            return;
        }

        if (passwort.trim() === "") {
            setError("Bitte Passwort eingeben");
            return;
        }

        if (passwort.length < 6) {
            setError("Passwort muss mindestens 6 Zeichen haben");
            return;
        }

        setError("");
        console.log("Formular gültig:", { email, passwort });
    }

    return (
        <div className="register-container">
            <h1>Registrierung</h1>

            <h3>Erstelle einen Account für dein Stress Management</h3>

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
                    Registrieren
                </button>

                {error && <p className="error">{error}</p>}

            </form>
        </div>
    );
}

export default Register;