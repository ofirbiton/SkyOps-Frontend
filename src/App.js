import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import MapContainer from "./components/MapContainer/MapContainer";
import MissionResult from "./components/MissionResult/MissionResult";

function AppContent() {
  const [taskMode, setTaskMode] = useState(false);
  const location = useLocation();

  const toggleTaskMode = (forceValue) => {
    if (typeof forceValue === "boolean") {
      setTaskMode(forceValue);
    } else {
      setTaskMode(prev => !prev);
    }
  };

  useEffect(() => {
    if (location.pathname === "/" && location.state?.fromMissionResult) {
      setTaskMode(true);
      window.history.replaceState({}, document.title); // איפוס state כדי שלא יתקע
    }
  }, [location]);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
              <Header taskMode={taskMode} onToggleTaskMode={toggleTaskMode} />
              <div style={{ flex: 1, overflow: "hidden" }}>
                <MapContainer />
              </div>
            </div>
          }
        />
        <Route path="/mission-result" element={<MissionResult />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
