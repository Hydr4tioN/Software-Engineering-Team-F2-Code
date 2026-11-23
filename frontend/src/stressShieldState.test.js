import { describe, expect, it } from "vitest";
import { shieldState } from "./stressShieldState";

// Testfälle A1–A10 aus Issue #200 (vor der Umsetzung festgelegt)
describe("shieldState (#200)", () => {
  it("A1: normaler Wert → blau, Balken und Text", () => {
    expect(shieldState(70, 100)).toEqual({ level: "ok", percent: 70, text: "70/100" });
  });

  it("A2: Grenzwert 20 → rot (≤ 20 % ist rot)", () => {
    expect(shieldState(20, 100).level).toBe("low");
  });

  it("A3: Grenzwert 21 → blau", () => {
    expect(shieldState(21, 100).level).toBe("ok");
  });

  it("A4: Untergrenze 0 → rot, leerer Balken", () => {
    expect(shieldState(0, 100)).toMatchObject({ level: "low", percent: 0 });
  });

  it("A5: Obergrenze 100 → blau, voller Balken", () => {
    expect(shieldState(100, 100)).toMatchObject({ level: "ok", percent: 100 });
  });

  it("A6: anderes Maximum, genau 20 % (30 von 150) → rot", () => {
    expect(shieldState(30, 150)).toEqual({ level: "low", percent: 20, text: "30/150" });
  });

  it("A7: anderes Maximum, knapp über 20 % (31 von 150) → blau", () => {
    expect(shieldState(31, 150).level).toBe("ok");
  });

  it("A8: Wert fehlt (lädt oder Fehler) → unbekannt, „–“", () => {
    expect(shieldState(null, 100)).toEqual({ level: "unknown", percent: 0, text: "–/100" });
  });

  it("A9: Wert über Maximum → Balken bleibt bei 100 %", () => {
    expect(shieldState(120, 100).percent).toBe(100);
  });

  it("A10: Maximum 0 → unbekannt, keine Division durch 0", () => {
    expect(shieldState(0, 0)).toMatchObject({ level: "unknown", percent: 0 });
  });
});
