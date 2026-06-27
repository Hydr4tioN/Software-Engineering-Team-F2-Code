import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '../supabaseClient'; 

function Register() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [passwort, setPasswort] = useState("");
    const [error, setError] = useState("");
    const [name, setName] = useState("");
    const [vorname, setVorname] = useState("");

    async function handleSubmit(event) {
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

        try {
            const { data, error: supabaseError } = await supabase.auth.signUp({
                email: email,
                password: passwort,
            });

            if (supabaseError) {
                setError("Fehler: " + supabaseError.message);
                return;
            }

            setError("");
            alert("Erfolgreich registriert!");
            navigate("/Login"); 

        } catch (err) {
            setError("Verbindung zum Server fehlgeschlagen.");
        }
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

                <input type="name" placeholder="Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                />

                <input type="vorname" placeholder ="Vorname" 
                value={vorname}
                onChange={(e) => setVorname(e.target.value)}
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