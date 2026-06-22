import { useState } from "react";

function Checkin() {
    const [stress, setStress] = useState(0);

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