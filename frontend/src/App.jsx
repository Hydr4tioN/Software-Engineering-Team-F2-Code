import { Routes, Route } from "react-router-dom";
import Home from "./Home.jsx";
import Register from "./Register.jsx";
import Checkin from "./Checkin.jsx";
import Dashboard from "./Dashboard.jsx";
import Login from "./Login.jsx";
import "./App.css";


function App() {
  return (
    <main className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkin" element={<Checkin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </main>
  );
}

export default App;