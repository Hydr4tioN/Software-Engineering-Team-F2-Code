import { BadRequestException } from "@nestjs/common";
import { StressToleranceService } from "./stress-tolerance.service";
import { isoWeekday, isValidDate } from "./stress-tolerance.day";
import {
  DayOccurrence,
  StressToleranceDataSource,
} from "./stress-tolerance.types";

/** Fake-Adapter: ersetzt Supabase im Test (Port & Adapter macht das möglich). */
class FakeDataSource implements StressToleranceDataSource {
  constructor(
    private readonly occurrences: DayOccurrence[] = [],
    private readonly loadValues: Record<string, number> = {},
  ) {}

  findOccurrencesForDay = jest.fn(async () => this.occurrences);
  findLoadValues = jest.fn(
    async () => new Map(Object.entries(this.loadValues)),
  );
}

const occurrence = (eventId: string, isStatic = false): DayOccurrence => ({
  occurrenceId: `occ-${eventId}`,
  eventId,
  eventName: eventId,
  isStatic,
  startTime: "10:00",
  endTime: "11:00",
});

const CLIENT = {};
const USER = "user-1";
const DATE = "2026-11-18";

describe("StressToleranceService.getForDay", () => {
  it("liefert 100, wenn der Tag keine Termine hat", async () => {
    const source = new FakeDataSource();
    const result = await new StressToleranceService(source).getForDay(
      CLIENT,
      USER,
      DATE,
    );

    expect(result).toEqual({
      date: DATE,
      value: 100,
      max: 100,
      min: 0,
      consideredOccurrences: 0,
    });
    expect(source.findLoadValues).not.toHaveBeenCalled();
  });

  it("zieht die Belastungswerte aller Termine des Tages ab", async () => {
    const source = new FakeDataSource(
      [occurrence("sport"), occurrence("lernzeit")],
      { sport: -30, lernzeit: -20 },
    );
    const result = await new StressToleranceService(source).getForDay(
      CLIENT,
      USER,
      DATE,
    );

    expect(result.value).toBe(50);
    expect(result.consideredOccurrences).toBe(2);
  });

  it("zählt ein Ereignis mit zwei Terminen am selben Tag doppelt", async () => {
    const source = new FakeDataSource(
      [occurrence("sport"), occurrence("sport")],
      { sport: -30 },
    );
    const result = await new StressToleranceService(source).getForDay(
      CLIENT,
      USER,
      DATE,
    );

    expect(result.value).toBe(40);
    expect(source.findLoadValues).toHaveBeenCalledWith(CLIENT, USER, ["sport"]);
  });

  it("wertet Ereignisse ohne gespeicherten Belastungswert als 0 (bis #202)", async () => {
    const source = new FakeDataSource([occurrence("sport")], {});
    const result = await new StressToleranceService(source).getForDay(
      CLIENT,
      USER,
      DATE,
    );

    expect(result.value).toBe(100);
  });

  it("lässt statische Ereignisse vorerst außen vor (bis #201)", async () => {
    const source = new FakeDataSource(
      [occurrence("sport"), occurrence("nebenjob", true)],
      { sport: -20, nebenjob: -40 },
    );
    const result = await new StressToleranceService(source).getForDay(
      CLIENT,
      USER,
      DATE,
    );

    expect(result.value).toBe(80);
  });

  it("fällt nie unter 0", async () => {
    const source = new FakeDataSource(
      [occurrence("a"), occurrence("b"), occurrence("c")],
      { a: -50, b: -50, c: -50 },
    );
    const result = await new StressToleranceService(source).getForDay(
      CLIENT,
      USER,
      DATE,
    );

    expect(result.value).toBe(0);
  });

  it("gibt Supabase-Client und User-ID an die Datenquelle weiter", async () => {
    const source = new FakeDataSource();
    await new StressToleranceService(source).getForDay(CLIENT, USER, DATE);

    expect(source.findOccurrencesForDay).toHaveBeenCalledWith(
      CLIENT,
      USER,
      DATE,
    );
  });

  it.each([undefined, "", "18.11.2026", "2026-11-1", "2026-02-30"])(
    "lehnt ungültiges Datum %p mit 400 ab",
    async (date) => {
      const service = new StressToleranceService(new FakeDataSource());
      await expect(
        service.getForDay(CLIENT, USER, date as string),
      ).rejects.toBeInstanceOf(BadRequestException);
    },
  );
});

describe("Tages-Hilfsfunktionen", () => {
  it("erkennt gültige und ungültige Daten", () => {
    expect(isValidDate("2026-11-18")).toBe(true);
    expect(isValidDate("2028-02-29")).toBe(true); // Schaltjahr
    expect(isValidDate("2026-02-29")).toBe(false);
  });

  it("berechnet den Wochentag nach ISO (Montag = 1, Sonntag = 7)", () => {
    expect(isoWeekday("2026-11-16")).toBe(1); // Montag
    expect(isoWeekday("2026-11-18")).toBe(3); // Mittwoch
    expect(isoWeekday("2026-11-22")).toBe(7); // Sonntag
  });
});
