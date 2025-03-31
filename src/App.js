import React, { useState } from "react";
import Header from "./components/Header";
import MapContainer from "./components/MapContainer";

function App() {
  const [taskMode, setTaskMode] = useState(false);

  const toggleTaskMode = () => {
    setTaskMode((prev) => !prev);
  };

  // הגדרה: flex-column, גובה ורוחב 100%, והסטריפ + מפת גובה מלא
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
      {/* סטריפ עליון */}
      <Header taskMode={taskMode} onToggleTaskMode={toggleTaskMode} />

      {/* אזור המפה תופס את כל השטח הנותר */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <MapContainer />
      </div>
    </div>
  );
}

export default App;
