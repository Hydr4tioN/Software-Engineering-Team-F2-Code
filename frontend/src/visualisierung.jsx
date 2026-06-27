import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
  } from "recharts";
  
  function Visualisierung({ entries }) {
  
    const chartData = entries.map((entry) => ({
      zeit: new Date(entry.createdAt).toLocaleDateString("de-DE"),
      stress: entry.stress,
      energie:entry.energie
    }));
  
    return (
      <div className="diagram-container">
  
        <h2>Stressverlauf</h2>
  
        <ResponsiveContainer width="100%" height={300}>
  
          <LineChart data={chartData}>
  
            <CartesianGrid strokeDasharray="4 4" />
  
            <XAxis
              dataKey="zeit"
            />
  
            <YAxis
              domain={[1, 10]}
              ticks={[1, 3, 5, 7, 10]}
              tickFormatter={(value) => {
                if (value <= 2) return "Sehr niedrig";
                if (value <= 4) return "Niedrig";
                if (value <= 6) return "Mittel";
                if (value <= 8) return "Hoch";
                return "Sehr hoch";
              }}
            />
  
            <Tooltip />
  
            <Line
              type="monotone"
              dataKey="stress"
              stroke="#6b7f6b"
              strokeWidth={4}
            />
  
          </LineChart>
  
        </ResponsiveContainer>

        <h2>Energieverlauf</h2>

        <ResponsiveContainer width="100%" height={300}>

         <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis
              dataKey="zeit"
            />
            <YAxis
              domain={[1, 10]}
              ticks={[1, 3, 5, 7, 10]}
              tickFormatter={(value) => {
                if (value <= 2) return "Sehr niedrig";
                if (value <= 4) return "Niedrig";
                if (value <= 6) return "Mittel";
                if (value <= 8) return "Hoch";
                return "Sehr hoch";
              }}
            />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="energie"
              stroke="#ffed4dc4"
              strokeWidth={4}
            />
          </LineChart>

        </ResponsiveContainer>

      </div>
    );
  }
  
  export default Visualisierung;