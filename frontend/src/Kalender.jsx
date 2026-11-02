
import { useState } from "react";
import "./Kalender.css";

function Kalender() {
  const [selectedDate, setSelectedDate] = useState("2026-10-31");

  const hours = Array.from({ length: 24 }, (_, index) => index);

  // Datum als deutschen Wochentag anzeigen
  const dateForDisplay = new Date(selectedDate + "T12:00:00");

  const germanDate = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dateForDisplay);

  return (
    <div className="kalender-container">
      <header className="kalender-header">
        <h1>Tagesansicht</h1>

        <input
          type="date"
          lang="de-DE"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
        />
      </header>

      <div className="kalender-date">
        {germanDate}
      </div>

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
    </div>
  );
}

export default Kalender;
