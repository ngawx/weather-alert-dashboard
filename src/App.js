import React, { useEffect, useState } from "react";
import { fetchWeatherAlerts } from "./services/weatherService";

function App() {
  const [alerts, setAlerts] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch alerts
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await fetchWeatherAlerts();
        if (Array.isArray(data)) {
          setAlerts(data);
          setLastUpdated(new Date().toLocaleString());
        } else {
          setAlerts([]);
        }
      } catch (error) {
        console.error("Error loading alerts:", error);
        setAlerts([]);
      }
    };

    loadAlerts();
    const interval = setInterval(loadAlerts, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Update live clock every second
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Determine EDT/EST
  const isDaylightSaving = currentTime.toLocaleString("en-US", {
    timeZoneName: "short",
  }).includes("DT");
  const timeSuffix = isDaylightSaving ? "EDT" : "EST";

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 relative flex flex-col items-center">
      {/* Clock in top-left */}
      <div className="absolute top-4 left-6 text-lg font-mono">
        {currentTime.toLocaleTimeString()} {timeSuffix}
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-center mb-4">U.S. Weather Alert Dashboard</h1>

      {/* Stats Row */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center w-full max-w-4xl gap-4">
        <p className="text-sm text-gray-400">Last Refreshed: {lastUpdated || "Loading..."}</p>
        <div className="bg-gray-800 text-white px-4 py-2 rounded-lg border-2 border-white font-semibold shadow-md">
          Active Alerts: {alerts.length}
        </div>
      </div>

      {/* Alert Tiles */}
      {alerts.length === 0 ? (
        <p className="text-center text-gray-400 mt-6">No active alerts</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className="bg-gray-800 border-l-8 border-red-500 p-4 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-bold">{alert.properties?.event || "Unknown Event"}</h2>
              <p className="text-sm text-gray-300">{alert.properties?.headline || "No headline available"}</p>
              <p className="text-xs text-gray-500 mt-2">
                Issued by: {alert.properties?.senderName || "Unknown Office"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className="text-xs text-gray-500 mt-10 text-center">
        © 2025 P.J. Gudz. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
