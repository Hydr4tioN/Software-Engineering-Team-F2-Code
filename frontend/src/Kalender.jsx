
import { useState } from "react";
import { DAY_NAMES, toDateStr } from "./timelineUtils";
import "./Kalender.css";

function Kalender() {
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const [view, setView] = useState("day");

  const hours = Array.from({ length: 24 }, (_, index) => index);

  // Datum anzeigen
  const dateForDisplay = new Date(selectedDate + "T12:00:00");

  const germanDate = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dateForDisplay);

  // Wochenbeginn berechnen
  const weekStart = new Date(dateForDisplay);
  weekStart.setDate(weekStart.getDate() - (weekStart.getDay() || 7) + 1);

  const weekDays = DAY_NAMES.map((name, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return { name, date };
  });

  // Kalenderwoche berechnen
  const thursday = new Date(dateForDisplay);
  thursday.setDate(thursday.getDate() + 4 - (thursday.getDay() || 7));
  const yearStart = new Date(thursday.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(
    ((thursday - yearStart) / 86400000 + 1) / 7
  );

  const weekRange =
    weekDays[0].date.toLocaleDateString("de-DE") +
    " – " +
    weekDays[6].date.toLocaleDateString("de-DE");

  return (
    <div className="kalender-container">
      <header className="kalender-header">
        <h1>{view === "day" ? "Tagesansicht" : "Wochenansicht"}</h1>

        <input
          type="date"
          lang="de-DE"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
        />
      </header>

      <div className="kalender-date">
        {view === "day" ? germanDate : `KW ${weekNumber} · ${weekRange}`}
      </div>

      <div className="kalender-view-switch">
        <button
          className={view === "day" ? "active" : ""}
          onClick={() => setView("day")}
        >
          Tagesansicht
        </button>

        <button
          className={view === "week" ? "active" : ""}
          onClick={() => setView("week")}
        >
          Wochenansicht
        </button>
      </div>

      {view === "day" ? (
        <div className="kalender-grid">
          <div className="kalender-times">
            {hours.map((hour) => (
              <div className="kalender-hour" key={hour}>
                {String(hour).padStart(2, "0")}:00
              </div>
            ))}
            <div className="kalender-end-time">23:59</div>
          </div>

          <div className="kalender-timeline">
            {hours.map((hour) => (
              <div className="kalender-hour-line" key={hour} />
            ))}
          </div>
        </div>
      ) : (
        <div className="kalender-week-grid">
          <div className="kalender-week-times">
            {hours.map((hour) => (
              <div className="kalender-hour" key={hour}>
                {String(hour).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {weekDays.map((day) => (
            <div className="kalender-week-column" key={day.name}>
              <div className="kalender-week-heading">
                <strong>{day.name}</strong>
                <span>{day.date.toLocaleDateString("de-DE")}</span>
              </div>

              <div className="kalender-week-timeline">
                {hours.map((hour) => (
                  <div className="kalender-hour-line" key={hour} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Kalender;
