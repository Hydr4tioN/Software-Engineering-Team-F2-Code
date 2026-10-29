/**
 * Zentrale Werte für die Stresstoleranz (#198).
 * Änderungen am Wertebereich nur hier vornehmen.
 */
export const STRESS_TOLERANCE = {
  START: 100, // Startwert jedes Tages
  MIN: 0, // darf nicht unterschritten werden
  MAX: 100, // Obergrenze der Skala (offen: Begrenzung bei positivem Bonus, Klärung mit PO)
} as const;
