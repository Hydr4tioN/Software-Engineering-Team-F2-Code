import { useState } from "react";

function Register() {
    const [email, setEmail] = useState("");
    const [passwort, setPasswort] = useState("");

  return (
    <div>
      <h1>Registrierung</h1>

      <h3>
        Erstelle einen Account für dein Stress Management
      </h3>
      
      <input
        type="email"
        placeholder="E-Mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        />
    <br></br>
    
    <input
    type="password"
    placeholder="Passwort"
    value={passwort}
    onChange={(e) => setPasswort(e.target.value)}
    />
    <br></br>


    </div>
    
  );
}

export default Register;