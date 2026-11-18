import { afterEach, describe, expect, it, vi } from "vitest";
import { getStressTolerance } from "./eventsApi";

// Supabase wird ersetzt: eingeloggt mit festem Test-Token
vi.mock("./supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: { access_token: "test-token" } } }),
    },
  },
}));

const respond = (status, body) =>
  vi.fn().mockResolvedValue({ ok: status < 400, status, json: () => Promise.resolve(body) });

afterEach(() => vi.unstubAllGlobals());

// Testfälle B1–B2 aus Issue #200 (vor der Umsetzung festgelegt)
describe("getStressTolerance (#200)", () => {
  it("B1: ruft den Endpoint mit Datum und Token auf und liefert die Antwort", async () => {
    const fetchMock = respond(200, { date: "2026-11-18", value: 100, max: 100, min: 0 });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getStressTolerance("2026-11-18");

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:3000/api/stress-tolerance?date=2026-11-18");
    expect(options.headers.Authorization).toBe("Bearer test-token");
    expect(result).toMatchObject({ value: 100, max: 100 });
  });

  it("B2: Backend-Fehler → wirft, damit keine falsche Zahl angezeigt wird", async () => {
    vi.stubGlobal("fetch", respond(500, { message: "Internal Server Error" }));

    await expect(getStressTolerance("2026-11-18")).rejects.toThrow();
  });
});
