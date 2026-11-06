import { STRESS_TOLERANCE } from './stress-tolerance.constants';

/**
 * Berechnet die Stresstoleranz eines Tages (#198).
 *
 * Regel: START + Summe der Belastungswerte, nicht kleiner als MIN.
 * Belastungswerte sind negativ (z. B. Moderat = -30).
 * Reine Funktion: kennt weder Datenbank noch HTTP – alle Werte kommen als Parameter.
 *
 * Geplante Erweiterung (Energielevel-Bonus, späterer Sprint):
 * Bonus als zusätzlicher Parameter; Maximum der Anzeige wird dann START + Bonus.
 *
 * @param loadValues Belastungswerte aller Ereignisse des Tages
 */
export function calculateStressTolerance(loadValues: number[]): number {
  const sum = loadValues.reduce((acc, value) => acc + value, 0);
  const raw = STRESS_TOLERANCE.START + sum;
  return Math.max(STRESS_TOLERANCE.MIN, raw);
}
