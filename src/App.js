import React, { useEffect, useState, useRef } from "react";
import { fetchWeatherAlerts } from "./services/weatherService";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [alerts, setAlerts] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const alertsPerPage = 4;
  const resumeTimeout = useRef(null);

  // 🔍 Filter alerts for NWS Peachtree City (FFC)
  const filteredAlerts = alerts.filter(
    (alert) =>
      alert.properties.senderName &&
      alert.properties.senderName.toLowerCase().includes("nws peachtree city")
  );

  // Auto-scroll every 8 seconds
  useEffect(() => {
    if (!autoScroll || filteredAlerts.length <= alertsPerPage) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + alertsPerPage;
        return nextIndex >= filteredAlerts.length ? 0 : nextIndex;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [filteredAlerts, autoScroll]);

  // Fetch alerts from NOAA
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await fetchWeatherAlerts();
        setAlerts(Array.isArray(data) ? data : []);
        setLastUpdated(new Date().toLocaleString());
      } catch (error) {
        console.error("Error fetching weather alerts:", error);
        setAlerts([]);
      }
    };

    loadAlerts();
    const interval = setInterval(loadAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  // Clock update
  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  // Pause auto-scroll, resume after 10 seconds
  const pauseAndResumeAutoScroll = () => {
    setAutoScroll(false);
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    resumeTimeout.current = setTimeout(() => {
      setAutoScroll(true);
    }, 10000);
  };

  const handleTileClick = () => {
    pauseAndResumeAutoScroll();
  };

  const handleNext = () => {
    pauseAndResumeAutoScroll();
    setCurrentIndex((prev) =>
      (prev + alertsPerPage) >= filteredAlerts.length ? 0 : prev + alertsPerPage
    );
  };

  const handlePrev = () => {
    pauseAndResumeAutoScroll();
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(filteredAlerts.length - alertsPerPage, 0) : prev - alertsPerPage
    );
  };

  const isDaylightSaving = currentTime
    .toLocaleString("en-US", { timeZoneName: "short" })
    .includes("DT");
  const timeSuffix = isDaylightSaving ? "EDT" : "EST";

  const getAlertStyles = (event) => {
    const colors = {
      "Tornado Warning": "bg-red-700 border-red-900 animate-pulse",
      "Tornado Watch": "bg-orange-600 border-orange-800",
      "Severe Thunderstorm Warning": "bg-orange-500 border-orange-700 animate-pulse",
      "Severe Thunderstorm Watch": "bg-yellow-500 border-yellow-700",
      "Flood Warning": "bg-green-600 border-green-800",
      "Flash Flood Warning": "bg-green-800 border-green-900",
      "Winter Storm Warning": "bg-blue-500 border-blue-700",
      "Blizzard Warning": "bg-purple-700 border-purple-900",
      "High Wind Warning": "bg-yellow-600 border-yellow-800",
      "Wind Advisory": "bg-gray-500 border-gray-700",
      "Heat Advisory": "bg-orange-400 border-orange-600",
      "Excessive Heat Warning": "bg-red-800 border-red-900",
      "Freeze Warning": "bg-blue-600 border-blue-800",
      "Frost Advisory": "bg-blue-300 border-blue-500",
      "Dense Fog Advisory": "bg-gray-700 border-gray-900",
      "Special Weather Statement": "bg-indigo-500 border-indigo-700",
    };
    return colors[event] || "bg-gray-800 border-gray-600";
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Unknown";
    return new Date(timeString).toLocaleString("en-US", {
      timeZoneName: "short",
    });
  };

  const visibleAlerts = filteredAlerts.slice(currentIndex, currentIndex + alertsPerPage);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center relative">
      {/* Clock */}
      <div className="absolute top-4 left-6 text-lg font-mono">
        {currentTime.toLocaleTimeString()} {timeSuffix}
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-center mb-2">NWS Peachtree City Alerts</h1>

      {/* Total Alerts */}
      <div className="text-center text-lg font-semibold bg-gray-800 px-6 py-2 rounded-full border-2 border-white shadow-md mb-6">
        Active Alerts: {filteredAlerts.length}
      </div>

      {/* Last Updated */}
      <p className="text-sm text-gray-400 mb-4">
        Last Refreshed: {lastUpdated || "Loading..."}
      </p>

      {/* Alert Tiles */}
      <div className="w-full max-w-xl">
        {filteredAlerts.length === 0 ? (
          <div className="text-center text-gray-400">No active alerts from NWS Peachtree City.</div>
        ) : (
          <AnimatePresence mode="wait">
            {visibleAlerts.map((alert, index) => {
              const {
                event,
                areaDesc,
                effective,
                expires,
              } = alert.properties;

              const alertStyle = getAlertStyles(event);
              const counties = areaDesc?.replace(/;/g, ", ") || "Unknown";

              return (
                <motion.div
                  key={index}
                  onClick={handleTileClick}
                  className={`p-3 mb-3 ${alertStyle} border-l-8 rounded-md shadow-md cursor-pointer transition-transform hover:scale-[1.01]`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-lg font-bold leading-snug">{event}</h2>

                  <p className="text-xs mt-2">
                    🕒 <strong>Effective:</strong> {formatTime(effective)}
                    <br />
                    ⏳ <strong>Expires:</strong> {formatTime(expires)}
                  </p>

                  <p className="text-xs mt-2 text-gray-200">
                    📍 <strong>Counties Affected:</strong> {counties}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Navigation Buttons */}
      {filteredAlerts.length > alertsPerPage && (
        <div className="mt-4 flex gap-4">
          <button
            onClick={handlePrev}
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-all duration-300"
          >
            ◀ Previous
          </button>
          <button
            onClick={handleNext}
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-all duration-300"
          >
            Next ▶
          </button>
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
