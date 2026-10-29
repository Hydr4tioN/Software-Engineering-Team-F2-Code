/**
 * Zentrale Werte für die Stresstoleranz (#198).
 * Änderungen am Wertebereich nur hier vornehmen.
 */
export const STRESS_TOLERANCE = {
  START: 100, // Startwert jedes Tages = Maximum der Anzeige ("x / 100")
  MIN: 0, // darf nicht unterschritten werden
} as const;
