import { useState } from "react";

function Checkin() {
    const [stress, setStress] = useState(0);

    return (
        <div className="checkin-container">
          <h1> Check In Page </h1>
          
            <h2>Stress-Level</h2>
            <h4> Welche belastung empfinden sie momentan? </h4>

            <input
                className="stress-slider"
                type="range"
                min="0"
                max="10"
                value={stress}
                onChange={(e) => setStress(e.target.value)}
            />
            <div className="stress-labels">
              <span>0 sehr entspannt</span>
              <span>10 sehr stressig</span>
            </div>

            <p>{stress}</p>
        </div>
    );
}

export default Checkin;