import { useState } from "react";

function Checkin() {
  const [stress, setStress] = useState(1);
  const [savedMessage, setSavedMessage] = useState("");

  function handleSave() {
    // hier könntest du später API / Backend speichern
    console.log("Stress gespeichert:", stress);

    setSavedMessage(`Stress-Level ${stress} wurde gespeichert`);

    setTimeout(() => {
      setSavedMessage("");
    }, 2500);
  }

  return (
    <div className="checkin-container">
      <h1>Check In Page</h1>

      <h2>Stress-Level</h2>
      <h3>Welche Belastung empfinden Sie momentan?</h3>

      <input
        className="stress-slider"
        type="range"
        min="1"
        max="10"
        value={stress}
        onChange={(e) => setStress(Number(e.target.value))}
      />

      <div className="stress-labels">
        <span>1 entspannt</span>
        <span>10 sehr stressig</span>
      </div>

      <p className="stress-value">{stress}</p>

      <button className="submit-button" onClick={handleSave}>
        Speichern
      </button>

      {savedMessage && (
        <p className="success-message">{savedMessage}</p>
      )}
    </div>
  );
}

export default Checkin;