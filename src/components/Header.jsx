import React, { useState } from "react";
import "./Header.css";
import logo from "../Images/skyops logo.png";

export default function Header({ taskMode, onToggleTaskMode }) {
  const [searchText, setSearchText] = useState("");
  const [pendingRectangle, setPendingRectangle] = useState(null);
  const [hasDrawn, setHasDrawn] = useState(false); // חדש

  const exportMapImage = ({ x1, y1, x2, y2 }) => {
    const xMin = Math.min(x1, x2);
    const xMax = Math.max(x1, x2);
    const yMin = Math.min(y1, y2);
    const yMax = Math.max(y1, y2);
    const centerX = (xMin + xMax) / 2;
    const centerY = (yMin + yMax) / 2;

    const extentParam = encodeURIComponent(
      JSON.stringify({
        spatialReference: { wkid: 2039 },
        xmin: xMin,
        ymin: yMin,
        xmax: xMax,
        ymax: yMax,
      })
    );

    const baseUrl = "https://ags.govmap.gov.il/ExportMap/ExportMap";

    const urlStreets = `${baseUrl}?CenterX=${centerX}&CenterY=${centerY}&sExtent=${extentParam}&Level=9&Resolution=0.661459656252646&Scale=2500&VisibleLayers={}&IsSharedBg=false&VisibleBg=["MapCacheNational"]&AddMapiLogo=true&DefinitionExp={}`;
    const urlOrtho = `${baseUrl}?CenterX=${centerX}&CenterY=${centerY}&sExtent=${extentParam}&Level=9&Resolution=0.661459656252646&Scale=2500&VisibleLayers={}&IsSharedBg=true&VisibleBg=[19]&AddMapiLogo=true&DefinitionExp={}`;

    window.open(urlStreets, "_blank");
    window.open(urlOrtho, "_blank");
  };

  const handleDrawRectangle = () => {
    if (!window.govmap) return;

    const startDrawing = () => {
      setPendingRectangle(null);
      setHasDrawn(true); // חדש – מונע מהכפתור להופיע שוב

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
            if (width < 100 || height < 100) {
              alert("⚠️ המלבן קטן מידי. אנא בחר/י בשנית.");
              startDrawing();
              return;
            }

            if (width > 1500 || height > 1500) {
              alert("⚠️ המלבן חורג מהמידות. אנא בחר/י בשנית.");
              startDrawing();
              return;
            }

            setPendingRectangle({ x1, y1, x2, y2 });

            window.govmap.zoomToXY({
              x: (x1 + x2) / 2,
              y: (y1 + y2) / 2,
              level: 9,
              marker: false,
            });
          } catch (err) {
            console.error("שגיאה בבדיקת המלבן:", err);
            alert("אירעה שגיאה.");
          }
        });
    };

    startDrawing();
  };

  const handleSearch = async (e) => {
    e?.preventDefault?.();
    if (!searchText.trim()) return;

    try {
      const response = await window.govmap.geocode({
        keyword: searchText,
        type: window.govmap.geocodeType.AccuracyOnly,
      });

      if (response?.data?.length > 0 && response.data[0].ResultType === 1) {
        const { X, Y } = response.data[0];
        window.govmap.zoomToXY({ x: X, y: Y, level: 6 });
      } else {
        alert("לא נמצאה תוצאה מדויקת.");
      }
    } catch (error) {
      console.error("שגיאת חיפוש:", error);
      alert("שגיאה בביצוע החיפוש.");
    }
  };

  const handleToggleTaskMode = () => {
    if (taskMode) {
      setPendingRectangle(null);
      setSearchText("");
      setHasDrawn(false); // מאפס את הדגל כשמבטלים משימה

      if (window.govmap?.clear) {
        window.govmap.clear();
      }
    }

    onToggleTaskMode();
  };

  return (
    <>
      <div className="header">
        <div className="search-container">
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
        </div>

        <div className="button-bar">
          {taskMode && !hasDrawn && (
            <button
              className="secondary-button"
              onClick={handleDrawRectangle}
            >
              סימון גבולות גזרה
            </button>
          )}
          <button className="primary-button" onClick={handleToggleTaskMode}>
            {taskMode ? "ביטול משימה" : "יצירת משימה חדשה"}
          </button>
        </div>

        <div className="logo">
          <img src={logo} alt="DroneOps Logo" className="logo-img" />
        </div>
      </div>

      {pendingRectangle && (
        <div className="floating-confirm-buttons">
          <button
            className="primary-button"
            onClick={() => {
              exportMapImage(pendingRectangle);
              setPendingRectangle(null);
            }}
          >
            אישור גבולות גזרה
          </button>
          <button
            className="secondary-button"
            onClick={() => {
              setPendingRectangle(null);
              handleDrawRectangle();
            }}
          >
            סימון גבולות גזרה מחדש
          </button>
        </div>
      )}
    </>
  );
}
