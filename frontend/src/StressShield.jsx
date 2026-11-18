import { FaShieldAlt } from "react-icons/fa";
import { shieldState } from "./stressShieldState";
import "./StressShield.css";

// Reine Anzeige der Stresstoleranz (#200). Kennt keine Datenquelle:
// Wert und Maximum kommen als Props vom Backend (#220).
function StressShield({ value, max = 100 }) {
  const { level, percent, text } = shieldState(value, max);

  return (
    <div className={`stress-shield stress-shield--${level}`}>
      <FaShieldAlt className="stress-shield__icon" aria-hidden="true" />
      <div className="stress-shield__body">
        <span className="stress-shield__label">Stresstoleranz</span>
        <div
          className="stress-shield__bar"
          role="meter"
          aria-label="Stresstoleranz"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={level === "unknown" ? undefined : value}
        >
          <div className="stress-shield__fill" style={{ width: `${percent}%` }} />
        </div>
      </div>
      <strong className="stress-shield__value">{text}</strong>
    </div>
  );
}

export default StressShield;
