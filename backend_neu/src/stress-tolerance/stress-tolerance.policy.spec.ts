import { calculateStressTolerance } from './stress-tolerance.policy';

describe('calculateStressTolerance (#198)', () => {
  it('startet ohne Ereignisse bei 100', () => {
    expect(calculateStressTolerance([])).toBe(100);
  });

  it('addiert die Belastungswerte aller Ereignisse des Tages', () => {
    // Beispiel aus dem Setup: Lehrveranstaltung -55, Sport -30
    expect(calculateStressTolerance([-55, -30])).toBe(15);
  });

  it('fällt nie unter 0', () => {
    expect(calculateStressTolerance([-30, -30, -30, -30])).toBe(0);
  });

  it('ergibt genau 0, wenn die Belastung 100 beträgt', () => {
    expect(calculateStressTolerance([-50, -50])).toBe(0);
  });

  it('berücksichtigt einen negativen Bonus', () => {
    // Beispiel Regelbetrieb (3): 100 - 60 - 20 = 20
    expect(calculateStressTolerance([-30, -30], -20)).toBe(20);
  });

  it('übersteigt nie 100', () => {
    expect(calculateStressTolerance([], 20)).toBe(100);
  });
});
