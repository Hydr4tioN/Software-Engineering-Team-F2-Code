import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
  } from "recharts";
  
function Visualisierung({ entries }) {

  const avgStress = entries.length
    ? (entries.reduce((sum, e) => sum + e.stress_level, 0) / entries.length).toFixed(1)
    : "-";

  const avgEnergy = entries.length
    ? (entries.reduce((sum, e) => sum + e.energy_level, 0) / entries.length).toFixed(1)
    : "-";

  const chartData = entries.map((entry, index) => ({
  date: new Date(entry.created_at).toLocaleString("de-DE", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit"
  }),
  stress: entry.stress_level,
  energy: entry.energy_level,
  index: index
}));

  return (
    <div>
      <h2>Stress- und Energieverlauf</h2>

      <div style={{ display: "flex", gap: "2rem", marginBottom: "1rem" }}>
        <p>⌀ Stress: <strong>{avgStress}</strong> / 10</p>
        <p>⌀ Energie: <strong>{avgEnergy}</strong> / 10</p>
      </div>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" tickFormatter={(i) => chartData[i]?.date ?? i} />
            <YAxis domain={[1, 10]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="stress" name="Stress" stroke="#d97757" strokeWidth={3} />
            <Line type="monotone" dataKey="energy" name="Energie" stroke="#6b7f6b" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Visualisierung;