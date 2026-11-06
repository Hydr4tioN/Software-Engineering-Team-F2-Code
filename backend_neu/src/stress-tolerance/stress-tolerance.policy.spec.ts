import { calculateStressTolerance } from './stress-tolerance.policy';

describe('calculateStressTolerance (#198)', () => {
  it('startet ohne Ereignisse bei 100', () => {
    expect(calculateStressTolerance([])).toBe(100);
  });

  it('zieht ein einzelnes Ereignis ab (Beispiel PO: -50 → 50/100)', () => {
    expect(calculateStressTolerance([-50])).toBe(50);
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
});
