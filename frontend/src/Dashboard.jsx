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

function Dashboard() {
  const chartData = [
    {
      date: "Mo",
      stress: 4,
      energy: 7
    },
    {
      date: "Di",
      stress: 6,
      energy: 5
    },
    {
      date: "Mi",
      stress: 8,
      energy: 3
    },
    {
      date: "Do",
      stress: 5,
      energy: 6
    }
  ];

  return (
    <div>
      <h2>Stress- und Energieverlauf</h2>

      <p>
        Gemeinsames Diagramm für Stress- und Energiewerte.
      </p>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="date"
              label={{
                value: "Zeit",
                position: "insideBottom",
                offset: -5
              }}
            />

            <YAxis
              label={{
                value: "Wert 1-10",
                angle: -90,
                position: "insideLeft"
              }}
            />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="stress"
              name="Stresslevel"
              stroke="#ff4d4f"
            />

            <Line
              type="monotone"
              dataKey="energy"
              name="Energielevel"
              stroke="#52c41a"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Dashboard;