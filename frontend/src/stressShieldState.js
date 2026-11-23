// Darstellungslogik der Stresstoleranz-Anzeige (#200), ohne React testbar.
// Ab diesem Anteil am Maximum ist die Anzeige rot (PO-Entscheidung: ≤ 20 % ist rot).
export const LOW_THRESHOLD_PERCENT = 20;

export function shieldState(value, max) {
  const known = typeof value === "number" && max > 0;
  if (!known) {
    return { level: "unknown", percent: 0, text: `–/${max}` };
  }

  const percent = Math.min(100, Math.max(0, (value * 100) / max));
  const level = percent <= LOW_THRESHOLD_PERCENT ? "low" : "ok";
  return { level, percent, text: `${value}/${max}` };
}
