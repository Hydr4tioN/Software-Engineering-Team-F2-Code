
import { useState } from "react";
import { DAY_NAMES, toDateStr } from "./timelineUtils";
import EventSelectionMenu from "./EventSelectionMenu";
import "./Kalender.css";

function Kalender() {
  // Aktuelles Datum
  const [selectedDate, setSelectedDate] = useState(
    toDateStr(new Date())
  );

  // Tagesansicht oder Wochenansicht
  const [view, setView] = useState("day");

  // Datum, für das das Ereignismenü geöffnet ist
  const [menuDate, setMenuDate] = useState(null);

  // Erfolgsmeldung
  const [notice, setNotice] = useState("");

  // 24 Stunden
  const hours = Array.from(
    { length: 24 },
    (_, index) => index
  );

  // Datum für die Anzeige
  const dateForDisplay = new Date(
    selectedDate + "T12:00:00"
  );

  const germanDate = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dateForDisplay);

  // Wochenbeginn: Montag
  const weekStart = new Date(dateForDisplay);

  weekStart.setDate(
    weekStart.getDate() -
      (weekStart.getDay() || 7) +
      1
  );

  // Alle Tage der aktuellen Woche
  const weekDays = DAY_NAMES.map((name, index) => {
    const date = new Date(weekStart);

    date.setDate(
      weekStart.getDate() + index
    );

    return {
      name,
      date,
    };
  });

  // Kalenderwoche berechnen (ISO)
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

  // Zeitraum der Woche
  const weekRange =
    weekDays[0].date.toLocaleDateString("de-DE") +
    " – " +
    weekDays[6].date.toLocaleDateString("de-DE");

  // Ereignismenü öffnen oder schließen
  function toggleEventMenu(date) {
    setNotice("");

    setMenuDate((previousDate) =>
      previousDate === date ? null : date
    );
  }

  // Nach erfolgreichem Speichern
  function handleEventSaved() {
    setNotice("Ereignis erfolgreich gespeichert.");
    setMenuDate(null);
  }

  // Datum wechseln
  function handleDateChange(event) {
    if (!event.target.value) return;

    setSelectedDate(event.target.value);
    setMenuDate(null);
    setNotice("");
  }

  // Ansicht wechseln
  function changeView(newView) {
    setView(newView);
    setMenuDate(null);
    setNotice("");
  }

  return (
    <div className="kalender-container">

      {/* Kalenderüberschrift */}
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
          onChange={handleDateChange}
        />
      </header>

      {/* Datum oder Kalenderwoche */}
      <div className="kalender-date">
        {view === "day"
          ? germanDate
          : `KW ${weekNumber} · ${weekRange}`}
      </div>

      {/* Umschalten zwischen Tages- und Wochenansicht */}
      <div className="kalender-view-switch">

        <button
          type="button"
          className={
            view === "day" ? "active" : ""
          }
          onClick={() => changeView("day")}
        >
          Tagesansicht
        </button>

        <button
          type="button"
          className={
            view === "week" ? "active" : ""
          }
          onClick={() => changeView("week")}
        >
          Wochenansicht
        </button>

      </div>

      {/* Erfolgsmeldung */}
      {notice && (
        <p
          className="kalender-notice"
          role="status"
        >
          {notice}
        </p>
      )}

      {/* ========================= */}
      {/* TAGESANSICHT              */}
      {/* ========================= */}

      {view === "day" ? (

        <div className="kalender-day-view">

          {/* Ereignis hinzufügen */}
          <div className="kalender-event-action">

            <button
              type="button"
              className="kalender-add-event-button"
              onClick={() =>
                toggleEventMenu(selectedDate)
              }
              aria-expanded={
                menuDate === selectedDate
              }
            >
              + Ereignis hinzufügen
            </button>

            {/* Menü direkt unter dem Button */}
            {menuDate === selectedDate && (
              <EventSelectionMenu
                date={selectedDate}
                onClose={() =>
                  setMenuDate(null)
                }
                onSaved={handleEventSaved}
              />
            )}

          </div>

          {/* Tageskalender mit Uhrzeiten */}
          <div className="kalender-grid">

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

        /* ========================= */
        /* WOCHENANSICHT             */
        /* ========================= */

        <div className="kalender-week-grid">

          {/* Uhrzeiten links */}
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

          {/* Einzelne Wochentage */}
          {weekDays.map((day) => {
            const dayDate = toDateStr(day.date);

            return (
              <div
                className="kalender-week-column"
                key={dayDate}
              >

                {/* Überschrift des Wochentags */}
                <div className="kalender-week-heading">

                  <strong>{day.name}</strong>

                  <span>
                    {day.date.toLocaleDateString(
                      "de-DE"
                    )}
                  </span>

                  {/* Plus-Button */}
                  <button
                    type="button"
                    onClick={() =>
                      toggleEventMenu(dayDate)
                    }
                    aria-label={
                      `Ereignis am ${day.name} hinzufügen`
                    }
                    aria-expanded={
                      menuDate === dayDate
                    }
                  >
                    +
                  </button>

                </div>

                
{menuDate === dayDate && (
  <div className="kalender-week-menu">
    <EventSelectionMenu
      date={dayDate}
      onClose={() => setMenuDate(null)}
      onSaved={handleEventSaved}
    />
  </div>
)}


                {/* Zeitleiste des Wochentags */}
                <div className="kalender-week-timeline">
                  {hours.map((hour) => (
                    <div
                      className="kalender-hour-line"
                      key={hour}
                    />
                  ))}
                </div>

              </div>
            );
          })}

        </div>

      )}

    </div>
  );
}

export default Kalender;
