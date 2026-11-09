import { FaShieldAlt } from "react-icons/fa";
import "./StressShield.css";

// Reine Anzeige der Stresstoleranz (#200). Kennt keine Datenquelle:
// Wert und Maximum kommen als Props (Maximum später ≠ 100, z. B. mit Bonus).
function StressShield({ value, max = 100 }) {
  const known = typeof value === "number";
  const ratio = known && max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  // Laut Wireframe: Standard blau, unter 20 % rot (Schwelle der Warnung)
  const level = ratio < 0.2 ? "low" : "ok";

  return (
    <div className={`stress-shield stress-shield--${known ? level : "unknown"}`}>
      <FaShieldAlt className="stress-shield__icon" aria-hidden="true" />
      <div className="stress-shield__body">
        <span className="stress-shield__label">Stresstoleranz</span>
        <div
          className="stress-shield__bar"
          role="meter"
          aria-label="Stresstoleranz"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={known ? value : undefined}
        >
          <div className="stress-shield__fill" style={{ width: `${ratio * 100}%` }} />
        </div>
      </div>
      <strong className="stress-shield__value">
        {known ? value : "–"}/{max}
      </strong>
    </div>
  );
}

export default StressShield;
