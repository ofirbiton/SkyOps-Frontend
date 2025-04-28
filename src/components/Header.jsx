import React, { useState, useRef } from "react";
import "./Header.css";
import logo from "../Images/skyops logo.png";
import { useNavigate, useLocation } from "react-router-dom";


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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const imageRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();


  const handleResetAndGoHome = () => {
    safeClearDrawings();
    setPendingRectangle(null);
    setSearchText("");
    setHasDrawn(false);
    setOrthoImageUrl(null);
    setStreetsImageUrl(null);
    setClickStage(null);
    setTakeoffPixel(null);
    setLandingPixel(null);
    setBoundingBox(null);
    setIsSubmitting(false);
    onToggleTaskMode(false); // איפוס taskMode אם רלוונטי
    navigate("/");
  };
  

  const sendMission = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsLoadingRoute(true);
    try {
      const orthoBlob = await (await fetch(orthoImageUrl)).blob();
      const streetsBlob = await drawPixelsOnStreetsImage();
  
      const formData = new FormData();
      formData.append("satellite_image", orthoBlob, "ortho.png");
      formData.append("buildings_image", streetsBlob, "streets_with_markers.png");
      formData.append("top_left_coord", `(${boundingBox.x1}, ${boundingBox.y1})`);
      formData.append("bottom_right_coord", `(${boundingBox.x2}, ${boundingBox.y2})`);
  
      const response = await fetch("https://skyops-backend-production.up.railway.app/api/create-mission", {
        method: "POST",
        body: formData,
      });
  
      const result = await response.json();
      if (!result.success) throw new Error(result.message || "שליחה נכשלה");

      navigate("/mission-result", {
        state: {
          imageUrl: result.satelliteImageUrl,
          textFileUrl: result.coordinatesFileUrl,
        }
      });
      
  
    } catch (error) {
      console.error("❌ שגיאה בשליחה לשרת:", error);
      alert("אירעה שגיאה בשליחת המשימה.");
      setIsSubmitting(false);
      setIsLoadingRoute(false);
    }
  };
  
  function safeClearDrawings() {
    if (
      window.govmapReady &&
      window.govmap &&
      typeof window.govmap.clearDrawings === "function"
    ) {
      try {
        window.govmap.clearDrawings();
      } catch (_) {
        // שקט מוחלט – בלי console.error
      }
    }
  }


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
    if (!taskMode) {
      // אם לוחץ על "יצירת משימה חדשה" – ננווט לדף הבית ונפעיל taskMode
      navigate("/");
      onToggleTaskMode(true);
    } else {
      // ביטול משימה
      setPendingRectangle(null);
      setSearchText("");
      setHasDrawn(false);
      setOrthoImageUrl(null);
      setStreetsImageUrl(null);
      setClickStage(null);
      setTakeoffPixel(null);
      setLandingPixel(null);
      setBoundingBox(null);
      safeClearDrawings();
      onToggleTaskMode(false);
    }
  };
  

  return (
    <>
      <div className="header">
        {/* חיפוש */}
        <div
            className="search-container"
            style={{ justifyContent: taskMode || location.pathname === "/mission-result" ? "flex-start" : "space-between" }}
          >
            {/* שורת חיפוש תופיע רק אם אין משימה פעילה ולא בדף התוצאה */}
            {!taskMode && location.pathname === "/" && (
              <>
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
              </>
            )}

            {/* יופיע תמיד, אבל ממוקם בהתאם ל־flex-start/space-between */}
            <button className="secondary-button" onClick={() => window.govmap?.showMeasure()}>
              הפעל מדידה
            </button>

            <div className="button-bar">
              {taskMode && !hasDrawn && location.pathname === "/" && (
                <button className="secondary-button" onClick={handleDrawRectangle}>
                  סימון גבולות גזרה
                </button>
              )}
              <button className="primary-button" onClick={handleToggleTaskMode}>
                {taskMode ? "ביטול משימה" : "יצירת משימה חדשה"}
              </button>
            </div>
          </div>



        {/* כפתורים */}
       
        <div className="logo" onClick={handleResetAndGoHome} style={{ cursor: "pointer" }}>
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
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setMousePosition({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                });
              }}
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
                top: takeoffPixel.y - 16,  // מיקום המשולש מעל הנקודה
                left: takeoffPixel.x - 9,
                width: 0,
                height: 0,
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: "22px solid rgb(51, 201, 86)	",  // צבע ירוק
                filter: "drop-shadow(0 0 2px black)",
                pointerEvents: "none",
                zIndex: 1000
              }} />
            )}

            {landingPixel && (
              <div style={{
                position: "absolute",
                top: landingPixel.y - 16,
                left: landingPixel.x - 9,
                width: 0,
                height: 0,
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: "22px solid rgb(205, 45, 61)", 
                filter: "drop-shadow(0 0 2px black)",
                pointerEvents: "none",
                zIndex: 1000
              }} />
            )}


            {clickStage === "takeoff" && (
              <div style={{
                position: "absolute",
                top: mousePosition.y + 20,
                left: mousePosition.x + 20,
                backgroundColor: "white",
                padding: "4px 8px",
                borderRadius: "6px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                fontSize: "14px",
                pointerEvents: "none",
                zIndex: 10
              }}>
                בחר נקודת המראה
              </div>
            )}

            {clickStage === "landing" && (
              <div style={{
                position: "absolute",
                top: mousePosition.y + 20,
                left: mousePosition.x + 20,
                backgroundColor: "white",
                padding: "4px 8px",
                borderRadius: "6px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                fontSize: "14px",
                pointerEvents: "none",
                zIndex: 10
              }}>
                בחר נקודת נחיתה
              </div>
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
              className="primary-button mt-2"
              onClick={sendMission}
            >
              אישור שליחת משימה
            </button>
          )}
        </div>
      )}
      {/* const response = await fetch("https://skyops-backend-production.up.railway.app/api/create-mission", { */}
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
      {isLoadingRoute && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(255,255,255,0.8)",
            zIndex: 5000,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#007bff"
          }}>
            ...המסלול בהכנה
            <div style={{
              marginTop: 20,
              width: 40,
              height: 40,
              border: "5px solid #f3f3f3",
              borderTop: "5px solid #007bff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }} />
            <style>
              {`@keyframes spin { 0% { transform: rotate(0); } 100% { transform: rotate(360deg); } }`}
            </style>
          </div>
        )}

    </>
  );
}
