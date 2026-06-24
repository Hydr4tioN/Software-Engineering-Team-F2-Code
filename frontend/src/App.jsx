import { Routes, Route } from "react-router-dom";
import Home from "./Home.jsx";
import Register from "./Register.jsx";
import Checkin from "./Checkin.jsx";
import Dashboard from "./Dashboard.jsx";
import "./App.css";


function App() {
  return (
    <main className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkin" element={<Checkin />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </main>
  );
}

export default App;