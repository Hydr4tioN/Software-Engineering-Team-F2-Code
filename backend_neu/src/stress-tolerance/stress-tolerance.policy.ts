import { STRESS_TOLERANCE } from './stress-tolerance.constants';

/**
 * Berechnet die Stresstoleranz eines Tages (#198).
 *
 * Regel: START + Summe der Belastungswerte + Bonus, begrenzt auf [MIN, MAX].
 * Belastungswerte sind negativ (z. B. Moderat = -30).
 * Reine Funktion: kennt weder Datenbank noch HTTP – alle Werte kommen als Parameter.
 *
 * @param loadValues Belastungswerte aller Ereignisse des Tages
 * @param bonus      optionaler Bonus aus dem Energielevel (Standard 0)
 */
export function calculateStressTolerance(
  loadValues: number[],
  bonus = 0,
): number {
  const sum = loadValues.reduce((acc, value) => acc + value, 0);
  const raw = STRESS_TOLERANCE.START + sum + bonus;
  return Math.min(STRESS_TOLERANCE.MAX, Math.max(STRESS_TOLERANCE.MIN, raw));
}
