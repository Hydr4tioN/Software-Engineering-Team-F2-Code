import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import Home from "./Home.jsx";
import Register from "./Register.jsx";
import Checkin from "./Checkin.jsx";
import Dashboard from "./Dashboard.jsx";
import Login from "./Login.jsx";

import {
  FaHome,
  FaHeart,
  FaChartLine,
  FaLightbulb,
  FaCog
} from "react-icons/fa";

import "./App.css";

function App() {
  const location = useLocation();

  // Bottom Nav NICHT auf Home anzeigen
  const hideBottomNav = location.pathname === "/";

  return (
    <>
      <main className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>

      {!hideBottomNav && (
        <nav className="bottom-nav">
          <NavLink to="/dashboard" className="nav-item">
            <FaHome />
            <span>Home</span>
          </NavLink>

          <NavLink to="/checkin" className="nav-item">
            <FaHeart />
            <span>Check In</span>
          </NavLink>

          <NavLink to="/dashboard" className="nav-item">
            <FaChartLine />
            <span>Verlauf</span>
          </NavLink>




        </nav>
      )}
    </>
  );
}

export default App;