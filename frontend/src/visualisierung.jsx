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
  
    const chartData = entries.map((entry, index) => ({
      zeit: new Date(entry.createdAt).toLocaleDateString("de-DE"),
      stress: entry.stress,
      nummer: index + 1
    }));
  
    return (
      <div className="diagram-container">
  
        <h2>Stressverlauf</h2>
  
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
  
            <CartesianGrid strokeDasharray="4 4" />
  
            <XAxis dataKey="zeit" />
  
            <YAxis
              domain={[1, 10]}
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
  
      </div>
    );
  }
  
  export default Visualisierung;