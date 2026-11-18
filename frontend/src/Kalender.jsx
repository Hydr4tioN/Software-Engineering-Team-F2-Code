
import { useEffect, useState } from "react";
import { DAY_NAMES, toDateStr } from "./timelineUtils";
import EventSelectionMenu from "./EventSelectionMenu";
import StressShield from "./StressShield";
import { getStressTolerance } from "./eventsApi";
import "./Kalender.css";

function Kalender() {
  const [selectedDate, setSelectedDate] = useState(
    toDateStr(new Date())
  );

  const [view, setView] = useState("day");
  const [menuDate, setMenuDate] = useState(null);
  const [notice, setNotice] = useState("");

  // Stresstoleranz des gewählten Tages (#200), kommt vom Backend (#220).
  // Gemerkt wird, für welchen Tag die Antwort gilt: Passt sie nicht zum
  // gewählten Tag (lädt noch) oder ist sie null (Fehler), zeigt die Anzeige „–“.
  const [loaded, setLoaded] = useState({ date: null, result: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true; // verwirft veraltete Antworten bei schnellem Tageswechsel
    getStressTolerance(selectedDate)
      .then((result) => active && setLoaded({ date: selectedDate, result }))
      .catch(() => active && setLoaded({ date: selectedDate, result: null }));
    return () => {
      active = false;
    };
  }, [selectedDate, reloadKey]);

  const stressTolerance = loaded.date === selectedDate ? loaded.result : null;

  const hours = Array.from(
    { length: 24 },
    (_, index) => index
  );

  // Datum anzeigen
  const dateForDisplay = new Date(
    selectedDate + "T12:00:00"
  );

  const germanDate = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dateForDisplay);

  // Wochenbeginn berechnen (Montag)
  const weekStart = new Date(dateForDisplay);

  weekStart.setDate(
    weekStart.getDate() -
      (weekStart.getDay() || 7) +
      1
  );

  const weekDays = DAY_NAMES.map((name, index) => {
    const date = new Date(weekStart);

    date.setDate(weekStart.getDate() + index);

    return {
      name,
      date,
    };
  });

  // Kalenderwoche berechnen
  const thursday = new Date(dateForDisplay);

  thursday.setDate(
    thursday.getDate() +
      4 -
      (thursday.getDay() || 7)
  );

  const yearStart = new Date(
    thursday.getFullYear(),
    0,
    1
  );

  const weekNumber = Math.ceil(
    ((thursday - yearStart) / 86400000 + 1) / 7
  );

  const weekRange =
    weekDays[0].date.toLocaleDateString("de-DE") +
    " – " +
    weekDays[6].date.toLocaleDateString("de-DE");

  // Ereignis-Auswahlmenü öffnen
  function openEventMenu(date) {
    setNotice("");
    setMenuDate(date);
  }

  // Ereignis-Auswahlmenü schließen
  function closeEventMenu() {
    setMenuDate(null);
  }

  // Nach dem Speichern
  function handleEventSaved() {
    setNotice("Ereignis erfolgreich gespeichert.");
    setMenuDate(null);
    setReloadKey((key) => key + 1); // neuer Termin → Stresstoleranz neu laden
  }

  return (
    <div className="kalender-container">

      {/* Kalender-Header */}
      <header className="kalender-header">
        <h1>
          {view === "day"
            ? "Tagesansicht"
            : "Wochenansicht"}
        </h1>

        <input
          type="date"
          lang="de-DE"
          value={selectedDate}
          onChange={(event) =>
            setSelectedDate(event.target.value)
          }
        />
      </header>

      {/* Datum / Kalenderwoche */}
      <div className="kalender-date">
        {view === "day"
          ? germanDate
          : `KW ${weekNumber} · ${weekRange}`}
      </div>

      {/* Wechsel zwischen Tages- und Wochenansicht */}
      <div className="kalender-view-switch">
        <button
          type="button"
          className={view === "day" ? "active" : ""}
          onClick={() => setView("day")}
        >
          Tagesansicht
        </button>

        <button
          type="button"
          className={view === "week" ? "active" : ""}
          onClick={() => setView("week")}
        >
          Wochenansicht
        </button>
      </div>

      {/* Tagesansicht */}
      {view === "day" ? (
        <div className="kalender-day-view">

          <StressShield
            value={stressTolerance?.value}
            max={stressTolerance?.max ?? 100}
          />

          <button
            type="button"
            onClick={() => openEventMenu(selectedDate)}
          >
            + Ereignis hinzufügen
          </button>

          <div className="kalender-grid">

            {/* Uhrzeiten */}
            <div className="kalender-times">
              {hours.map((hour) => (
                <div
                  className="kalender-hour"
                  key={hour}
                >
                  {String(hour).padStart(2, "0")}:00
                </div>
              ))}

              <div className="kalender-end-time">
                23:59
              </div>
            </div>

            {/* Tages-Zeitleiste */}
            <div className="kalender-timeline">
              {hours.map((hour) => (
                <div
                  className="kalender-hour-line"
                  key={hour}
                />
              ))}
            </div>

          </div>
        </div>
      ) : (

        /* Wochenansicht */
        <div className="kalender-week-grid">

          {/* Uhrzeiten */}
          <div className="kalender-week-times">
            {hours.map((hour) => (
              <div
                className="kalender-hour"
                key={hour}
              >
                {String(hour).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Wochentage */}
          {weekDays.map((day) => (
            <div
              className="kalender-week-column"
              key={toDateStr(day.date)}
            >

              {/* Überschrift des Wochentags */}
              <div className="kalender-week-heading">
                <strong>{day.name}</strong>

                <span>
                  {day.date.toLocaleDateString("de-DE")}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    openEventMenu(toDateStr(day.date))
                  }
                  aria-label={`Ereignis am ${day.name} hinzufügen`}
                >
                  +
                </button>
              </div>

              {/* Zeitleiste pro Wochentag */}
              <div className="kalender-week-timeline">
                {hours.map((hour) => (
                  <div
                    className="kalender-hour-line"
                    key={hour}
                  />
                ))}
              </div>

            </div>
          ))}

        </div>
      )}

      {/* Erfolgsmeldung */}
      {notice && (
        <p role="status" className="kalender-notice">
          {notice}
        </p>
      )}

      {/* Ereignis-Auswahlmenü */}
      {menuDate && (
        <EventSelectionMenu
          date={menuDate}
          onClose={closeEventMenu}
          onSaved={handleEventSaved}
        />
      )}

    </div>
  );
}

export default Kalender;
