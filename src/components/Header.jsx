import React, { useState } from "react";
import "./Header.css";
import logo from "../Images/skyops logo.png";

export default function Header({ taskMode, onToggleTaskMode }) {
  const [searchText, setSearchText] = useState("");

  const handleDrawRectangle = () => {
    if (!window.govmap) return;
  
    const startDrawing = () => {
      window.govmap
        .draw(window.govmap.drawType.Rectangle)
        .progress((response) => {
          try {
            const wkt = response?.wkt;
            if (!wkt || !wkt.startsWith("POLYGON")) return;
  
            const coords = wkt
              .replace("POLYGON((", "")
              .replace("))", "")
              .split(",")
              .map((pair) => pair.trim().split(" ").map(Number));
  
            const [x1, y1] = coords[0];
            const [x2, y2] = coords[2];
  
            const width = Math.abs(x2 - x1);
            const height = Math.abs(y2 - y1);
  
            const maxWidth = 1000;
            const maxHeight = 450;
  
            if (width > maxWidth || height > maxHeight) {
              alert(
                `⚠️ המלבן חורג מהמידות המותרות.\nרוחב מקסימלי: ${maxWidth}, גובה מקסימלי: ${maxHeight}.\nאנא נסה שוב.`
              );
  
              // התחלה מחדש של הציור – רקורסיה
              startDrawing();
              return;
            }
  
            // אם חוקי – התמקדות
            window.govmap.zoomToDrawing();
          } catch (err) {
            console.error("שגיאה בבדיקת המלבן:", err);
            alert("אירעה שגיאה בעת בדיקת המלבן.");
          }
        });
    };
  
    startDrawing(); // התחלת הציור הראשונה
  };
  

  const handleSearch = async (e) => {
    e?.preventDefault?.();
    if (!searchText.trim()) return;

    if (
      !window.govmap ||
      !window.govmap.geocode ||
      !window.govmap.geocodeType
    ) {
      alert("ה־GovMap עדיין לא נטען.");
      return;
    }

    try {
      const response = await window.govmap.geocode({
        keyword: searchText,
        type: window.govmap.geocodeType.AccuracyOnly,
      });

      console.log("תשובת govmap.geocode:", response);

      if (response?.data?.length > 0 && response.data[0].ResultType === 1) {
        const { X, Y } = response.data[0];

        window.govmap.zoomToXY({
          x: X,
          y: Y,
          level: 6,
        });
      } else {
        alert("לא נמצאה תוצאה מדויקת.");
      }
    } catch (error) {
      console.error("שגיאה בחיפוש:", error);
      alert("אירעה שגיאה במהלך החיפוש.");
    }
  };

  return (
    <div className="header">
      <div className="logo">
        <img src={logo} alt="DroneOps Logo" className="logo-img" />
      </div>

      <div className="button-bar">
        {taskMode && (
          <div className="task-buttons">
            <button className="secondary-button">סימון נקודת נחיתה</button>
            <button className="secondary-button">סימון נקודת המראה</button>
            <button className="secondary-button" onClick={handleDrawRectangle}>
              סימון גבולות גזרה
            </button>
          </div>
        )}

        <div className="system-buttons">
          <input
            type="text"
            className="search-input"
            placeholder="חפש כתובת"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button className="secondary-button" onClick={handleSearch}>
            חפש
          </button>
          <button
            className="secondary-button"
            onClick={() => window.govmap?.showMeasure()}
          >
            הפעל מדידה
          </button>
          <button className="primary-button" onClick={onToggleTaskMode}>
            {taskMode ? "ביטול משימה" : "יצירת משימה חדשה"}
          </button>
        </div>
      </div>
    </div>
  );
}
