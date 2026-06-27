import Visualisierung from "./visualisierung";

function Dashboard() {

  const demoEntries = [
    {
      id: 1,
      stress_level: 3,
      energie_level: 8,
      entry_date: "2026-06-20"
    },
    {
      id: 2,
      stress_level: 5,
      energie_level: 6,
      entry_date: "2026-06-21"
    },
    {
      id: 3,
      stress_level: 8,
      energie_level: 3,
      entry_date: "2026-06-22"
    },
    {
      id: 4,
      stress_level: 4,
      energie_level: 7,
      entry_date: "2026-06-23"
    }
  ];

  return (
    <div className="checkin-container">

      <h1>Dashboard</h1>

      <Visualisierung entries={demoEntries} />

    </div>
  );
}

export default Dashboard;