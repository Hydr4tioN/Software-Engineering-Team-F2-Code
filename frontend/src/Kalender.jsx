import { useEffect, useState } from "react";
import { DAY_NAMES, toDateStr } from "./timelineUtils";
import StressShield from "./StressShield";
import { getStressTolerance } from "./eventsApi";
import "./Kalender.css";
import { useNavigate, useSearchParams } from "react-router-dom";

function Kalender() {
  const navigate = useNavigate();


  const [selectedDate, setSelectedDate] = useState(
    toDateStr(new Date())
  );


  const [view, setView] = useState("day");


  const [loaded, setLoaded] = useState({
    date: null,
    result: null,
  });

  // Stresstoleranz beim Datumswechsel laden
  useEffect(() => {
    let active = true;

    getStressTolerance(selectedDate)
      .then((result) => {
        if (active) {
          setLoaded({
            date: selectedDate,
            result,
          });
        }
      })
      .catch(() => {
        if (active) {
          setLoaded({
            date: selectedDate,
            result: null,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [selectedDate]);

  const stressTolerance =
    loaded.date === selectedDate
      ? loaded.result
      : null;

  // Datum ändern
  function handleDateChange(event) {
    setSelectedDate(event.target.value);
  }

  // Tages- oder Wochenansicht wechseln
  function changeView(newView) {
    setView(newView);
  }

  // 24 Stunden
  const hours = Array.from(
    { length: 24 },
    (_, index) => index
  );

  // Datum für die Anzeige
  const dateForDisplay = new Date(
    selectedDate + "T12:00:00"
  );

  const germanDate = new Intl.DateTimeFormat(
    "de-DE",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(dateForDisplay);

  // Wochenbeginn: Montag
  const weekStart = new Date(dateForDisplay);

  weekStart.setDate(
    weekStart.getDate() -
      (weekStart.getDay() || 7) +
      1
  );

  // Wochentage berechnen
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

  // Wochenzeitraum
  const weekRange =
    weekDays[0].date.toLocaleDateString("de-DE") +
    " – " +
    weekDays[6].date.toLocaleDateString("de-DE");

  // Zur Ereignisse-Seite mit vorgewähltem Datum
  function toggleEventMenu(date) {
    navigate(`/ereignisse?date=${date}`);
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

      {/* Datum und Kalenderwoche */}
      <div className="kalender-date">
        {view === "day"
          ? germanDate
          : `KW ${weekNumber} · ${weekRange}`}
      </div>

      {/* Umschalten der Kalenderansicht */}
      <div className="kalender-view-switch">

        <button
          type="button"
          className={view === "day" ? "active" : ""}
          onClick={() => changeView("day")}
        >
          Tagesansicht
        </button>

        <button
          type="button"
          className={view === "week" ? "active" : ""}
          onClick={() => changeView("week")}
        >
          Wochenansicht
        </button>

      </div>

      {/* TAGESANSICHT */}
      {view === "day" ? (

        <div className="kalender-day-view">

          {/* Stresstoleranz-Anzeige */}
          <StressShield
            value={stressTolerance?.value}
            max={stressTolerance?.max ?? 100}
          />

          {/* Ereignis hinzufügen */}
          <button
            type="button"
            className="kalender-add-event-button"
            onClick={() =>
              toggleEventMenu(selectedDate)
            }
          >
            + Ereignis hinzufügen
          </button>

          {/* Tageskalender */}
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

        /* WOCHENANSICHT */
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
          {weekDays.map((day) => {
            const dayDate = toDateStr(day.date);

            return (
              <div
                className="kalender-week-column"
                key={dayDate}
              >

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
                  >
                    +
                  </button>

                </div>

                {/* Zeitleiste */}
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