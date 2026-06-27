import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="interaction">
      <div className="center">

        <h1>Herzlich willkommen</h1>
        <h3>Manage deinen Stress einfacher!</h3>

        <div className="nav-buttons">
          <Link to="/login">
            <button>
              Einloggen
            </button>
          </Link>

          <Link to="/register">
            <button className="nav-buttons">
              Registrieren
            </button>
          </Link>

          <Link to="/checkin">
            <button className="secondary">
              Ohne anmeldung zum Checkin
            </button>
          </Link>

        </div>

      </div>
    </div>
  );
}

export default Home;