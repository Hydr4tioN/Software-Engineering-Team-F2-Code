import { useState } from "react"
import './Checkin.css';

    function Checkin() {
        const Stress_Levels = ["Niedrig", "Mittel", "Hoch", "Sehr Hoch"];
        const Stress_Factor = 0

        return (
            <div className="checkin-container">
              <h2>Stress-Level</h2>
        
              <input
                type="range"
                min="0"
                max="100"
                value={stress}
                onChange={(e) => setStress(e.target.value)}
              />
        
              <p>{stress}%</p>
            </div>
          );
        }
    export default Checkin;