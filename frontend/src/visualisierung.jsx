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
  
    const chartData = entries.map((entry) => ({
      date: new Date(
        entry.entry_date
      ).toLocaleDateString("de-DE"),
  
      stress:
        entry.stress_level,
  
      energy:
        entry.energie_level
    }));
  
    return (
  
      <div>
  
        <h2>
          Stress- und Energieverlauf
        </h2>
  
        <div
          style={{
            width: "100%",
            height: 320
          }}
        >
  
          <ResponsiveContainer>
  
            <LineChart data={chartData}>
  
              <CartesianGrid
                strokeDasharray="3 3"
              />
  
              <XAxis
                dataKey="date"
              />
  
              <YAxis
                domain={[1, 10]}
              />
  
              <Tooltip />
  
              <Legend />
  
              <Line
                type="monotone"
                dataKey="stress"
                name="Stress"
                stroke="#d97757"
                strokeWidth={3}
              />
  
              <Line
                type="monotone"
                dataKey="energy"
                name="Energie"
                stroke="#6b7f6b"
                strokeWidth={3}
              />
  
            </LineChart>
  
          </ResponsiveContainer>
  
        </div>
  
      </div>
    );
  }
  
  export default Visualisierung;