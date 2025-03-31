import React, { useState } from "react";
import SkyOpsGovMap from "./SkyOpsGovMap";

export default function SkyOpsPlanner() {
  const [currentAction, setCurrentAction] = useState(null); // "start" | "end" | "rectangle"
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [rectanglePoints, setRectanglePoints] = useState([]);

  // פעולה שתיקרא בעת לחיצה על המפה
  const handleMapClick = (lat, lng) => {
    if (currentAction === "start") {
      setStartPoint({ lat, lng });
      setCurrentAction(null);
    } else if (currentAction === "end") {
      setEndPoint({ lat, lng });
      setCurrentAction(null);
    } else if (currentAction === "rectangle") {
      if (!startPoint || !endPoint) {
        alert("יש לבחור נקודות התחלה וסיום קודם!");
        return;
      }
      const rect = buildRectanglePoints(startPoint, endPoint);
      setRectanglePoints(rect);
      setCurrentAction(null);
      // כאן תוכל להוסיף קריאה לפונקציה לציור המלבן על המפה
      alert("מלבן נבחר, יש להוסיף קוד לציורו על המפה (אופציונלי).");
    }
  };

  // בונה מערך של 4 נקודות שמגדירות מלבן המקיף את startPoint ו-endPoint
  function buildRectanglePoints(sp, ep) {
    const minLat = Math.min(sp.lat, ep.lat);
    const maxLat = Math.max(sp.lat, ep.lat);
    const minLng = Math.min(sp.lng, ep.lng);
    const maxLng = Math.max(sp.lng, ep.lng);

    return [
      { lat: minLat, lng: minLng },
      { lat: minLat, lng: maxLng },
      { lat: maxLat, lng: maxLng },
      { lat: maxLat, lng: minLng }
    ];
  }

  const resetAll = () => {
    setStartPoint(null);
    setEndPoint(null);
    setRectanglePoints([]);
    setCurrentAction(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* שורת כלים עליונה */}
      <div
        style={{
          height: "60px",
          background: "#eee",
          borderBottom: "1px solid #ccc",
          display: "flex",
          alignItems: "center",
          padding: "0 1rem",
          gap: "1rem"
        }}
      >
        <button onClick={() => setCurrentAction("start")}>בחר התחלה</button>
        <button onClick={() => setCurrentAction("end")}>בחר סיום</button>
        <button onClick={() => setCurrentAction("rectangle")}>צור מלבן</button>
        <button onClick={resetAll} style={{ marginLeft: "auto" }}>
          איפוס הכול
        </button>
      </div>

      {/* אזור המפה */}
      <div style={{ flex: 1 }}>
        <SkyOpsGovMap onMapClick={handleMapClick} />
      </div>
    </div>
  );
}
