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
            <button className="secondary">
              Registrieren
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Home;