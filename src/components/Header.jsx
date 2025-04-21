import React, { useState, useRef } from "react";
import "./Header.css";
import logo from "../Images/skyops logo.png";

export default function Header({ taskMode, onToggleTaskMode }) {
  const [searchText, setSearchText] = useState("");
  const [pendingRectangle, setPendingRectangle] = useState(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [orthoImageUrl, setOrthoImageUrl] = useState(null);
  const [streetsImageUrl, setStreetsImageUrl] = useState(null);
  const [takeoffPixel, setTakeoffPixel] = useState(null);
  const [landingPixel, setLandingPixel] = useState(null);
  const [clickStage, setClickStage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [boundingBox, setBoundingBox] = useState(null);
  const imageRef = useRef();

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
    const sharedParams = `?CenterX=${centerX}&CenterY=${centerY}` +
      `&sExtent=${extentParam}` +
      `&Level=9&Resolution=0.661459656252646&Scale=2500` +
      `&VisibleLayers={}&DefinitionExp={}&AddMapiLogo=true`;

    const urlStreets = `${baseUrl}${sharedParams}&IsSharedBg=false&VisibleBg=["MapCacheNational"]`;
    const urlOrtho = `${baseUrl}${sharedParams}&IsSharedBg=true&VisibleBg=[19]`;

    setOrthoImageUrl(urlOrtho);
    setStreetsImageUrl(urlStreets);
    setClickStage("takeoff");
  };

  const handleImageClick = (e) => {
    if (!imageRef.current) return;
    const offsetX = e.nativeEvent.offsetX;
    const offsetY = e.nativeEvent.offsetY;
    const image = imageRef.current;
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;
    const displayedWidth = image.clientWidth;
    const displayedHeight = image.clientHeight;
    
    // חישוב יחס תצוגה מול תמונה מקורית
    const scaleX = naturalWidth / displayedWidth;
    const scaleY = naturalHeight / displayedHeight;
    
    // חישוב קואורדינטות מדויקות בהתאם לתמונה המקורית
    const correctedX = Math.round(e.nativeEvent.offsetX * scaleX);
    const correctedY = Math.round(e.nativeEvent.offsetY * scaleY);
    
    if (clickStage === "takeoff") {
      setTakeoffPixel({ x: correctedX, y: correctedY });
    } else if (clickStage === "landing") {
      setLandingPixel({ x: correctedX, y: correctedY });
    }
  };
  const drawPixelsOnStreetsImage = async () => {
    const streetsImg = new Image();
    streetsImg.crossOrigin = "anonymous";
    streetsImg.src = streetsImageUrl;

    await new Promise((res) => streetsImg.onload = res);

    const canvas = document.createElement("canvas");
    canvas.width = streetsImg.width;
    canvas.height = streetsImg.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(streetsImg, 0, 0);

    ctx.fillStyle = "lime";
    ctx.fillRect(takeoffPixel.x, takeoffPixel.y, 1, 1);

    ctx.fillStyle = "red";
    ctx.fillRect(landingPixel.x, landingPixel.y, 1, 1);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        console.log("🗺️ Blob רחובות עם פיקסלים:", blob);
        resolve(blob);
      }, "image/png");
    });
  };

  const handleDrawRectangle = () => {
    if (!window.govmap) return;

    const startDrawing = () => {
      setPendingRectangle(null);
      setHasDrawn(true);

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
            if (width < 100 || height < 100 || width > 1500 || height > 1500) {
              alert("⚠️ מימדי המלבן לא חוקיים. נסה/י שוב.");
              startDrawing();
              return;
            }

            setPendingRectangle({ x1, y1, x2, y2 });
            setBoundingBox({ x1, y1, x2, y2 });

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
      setHasDrawn(false);
      setOrthoImageUrl(null);
      setStreetsImageUrl(null);
      setClickStage(null);
      setTakeoffPixel(null);
      setLandingPixel(null);
      setBoundingBox(null);
    }

    onToggleTaskMode();
  };

  return (
    <>
      <div className="header">
        {/* חיפוש */}
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
          <button className="secondary-button" onClick={() => window.govmap?.showMeasure()}>
            הפעל מדידה
          </button>
        </div>

        {/* כפתורים */}
        <div className="button-bar">
          {taskMode && !hasDrawn && (
            <button className="secondary-button" onClick={handleDrawRectangle}>
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

      {orthoImageUrl && clickStage && (
        <div style={{
          position: "absolute",
          top: "10vh",
          left: 0,
          width: "100%",
          height: "90vh",
          backgroundColor: "white",
          zIndex: 2000,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column"
        }}>
          <div style={{ position: "relative" }}>
            <img
              ref={imageRef}
              src={orthoImageUrl}
              alt="תצלום אוויר"
              onClick={handleImageClick}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                border: "1px solid #ccc",
                cursor: "crosshair"
              }}
            />
            {takeoffPixel && (
              <div style={{
                position: "absolute",
                top: takeoffPixel.y - 5,
                left: takeoffPixel.x - 5,
                width: 10,
                height: 10,
                backgroundColor: "lime",
                borderRadius: "50%",
                border: "2px solid black",
                pointerEvents: "none"
              }} />
            )}
            {landingPixel && (
              <div style={{
                position: "absolute",
                top: landingPixel.y - 5,
                left: landingPixel.x - 5,
                width: 10,
                height: 10,
                backgroundColor: "red",
                borderRadius: "50%",
                border: "2px solid black",
                pointerEvents: "none"
              }} />
            )}
          </div>

          {/* כפתורים לפי שלב */}
          {clickStage === "takeoff" && takeoffPixel && (
            <button onClick={() => setClickStage("landing")} className="primary-button mt-2">
              אישור נקודת המראה
            </button>
          )}
          {clickStage === "landing" && landingPixel && (
            <button onClick={() => setClickStage("done")} className="primary-button mt-2">
              אישור נקודת נחיתה
            </button>
          )}
          {clickStage === "done" && takeoffPixel && landingPixel && (
            <button
            onClick={async () => {
              if (isSubmitting) return;
              setIsSubmitting(true);
            
              try {
                // קבלת תצלום האוויר
                const orthoRes = await fetch(orthoImageUrl);
                const orthoBlob = await orthoRes.blob();
            
                // יצירת מפת רחובות עם פיקסלים
                const streetsBlob = await drawPixelsOnStreetsImage();
            
                // בניית ה־FormData
                const formData = new FormData();
                formData.append("satellite_image", orthoBlob, "ortho.png");
                formData.append("buildings_image", streetsBlob, "streets_with_markers.png");
            
                // בניית הקואורדינטות בפורמט "(x, y)"
                const topLeftCoord = `(${boundingBox.x1}, ${boundingBox.y1})`;
                const bottomRightCoord = `(${boundingBox.x2}, ${boundingBox.y2})`;
                formData.append("top_left_coord", topLeftCoord);
                formData.append("bottom_right_coord", bottomRightCoord);
            
                // שליחה לשרת
                const response = await fetch("http://127.0.0.1:5000/api/create-mission", {
                  method: "POST",
                  body: formData,
                });
            
                const result = await response.json();
                console.log("📡 תגובת השרת:", result);
            
                // איפוס
                setOrthoImageUrl(null);
                setStreetsImageUrl(null);
                setClickStage(null);
                setTakeoffPixel(null);
                setLandingPixel(null);
                setHasDrawn(false);
                setPendingRectangle(null);
                setIsSubmitting(false);
              } catch (error) {
                console.error("❌ שגיאה בשליחה לשרת:", error);
                alert("אירעה שגיאה בשליחת המשימה.");
                setIsSubmitting(false);
              }
            }}
              className="primary-button mt-2"
            >
              אישור שליחת משימה
            </button>
          )}
        </div>
      )}

      {pendingRectangle && !orthoImageUrl && (
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
