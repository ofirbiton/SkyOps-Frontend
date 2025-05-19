// TakeoffLandingSelector.jsx
import React, { useRef, useEffect } from "react";

export default function TakeoffLandingSelector({
  imageUrl,
  clickStage,
  takeoffPixel,
  landingPixel,
  mousePosition,
  onImageClick,
  onMouseMove,
  onApproveTakeoff,
  onApproveLanding,
  onSendMission,
  imageRef,
  isDrawingNoFly,
  onAddNoFlyZone,
  onImageDoubleClick,
  currentPoly,
  noFlyPolygons,
  boundingBox,
  onRemoveNoFly,
  noFlyCount
}) {
  const overlayRef = useRef(null);
  useEffect(() => {
  const imgEl = imageRef.current;
  const cv    = overlayRef.current;
  if (!imgEl || !cv) return;

  /* התאמת קנבס */
  const { width, height } = imgEl.getBoundingClientRect();
  cv.width  = width;
  cv.height = height;
  const ctx = cv.getContext("2d");
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.strokeStyle = "red";
  ctx.lineWidth   = 2;

  /* ITM → פיקסל-תמונה */
  const itmToPx = (xitm, yitm) => {
    if (!boundingBox) return { x: 0, y: 0 };
    const xmin = Math.min(boundingBox.x1, boundingBox.x2);
    const xmax = Math.max(boundingBox.x1, boundingBox.x2);
    const ymin = Math.min(boundingBox.y1, boundingBox.y2);
    const ymax = Math.max(boundingBox.y1, boundingBox.y2);
    const x = ((xitm - xmin) * imgEl.naturalWidth)  / (xmax - xmin);
    const y = ((ymax - yitm) * imgEl.naturalHeight) / (ymax - ymin);
    return { x, y };
  };

  /* קו מתאר */
  const drawPoly = (pts, dashed = false) => {
    if (pts.length < 2) return;
    ctx.setLineDash(dashed ? [6, 4] : []);
    ctx.beginPath();
    ctx.moveTo(pts[0].x * width / imgEl.naturalWidth,
               pts[0].y * height / imgEl.naturalHeight);
    pts.slice(1).forEach(p =>
      ctx.lineTo(p.x * width / imgEl.naturalWidth,
                 p.y * height / imgEl.naturalHeight)
    );
    ctx.closePath();
    ctx.stroke();
  };

  /* מרכז פוליגון */
  const centroid = (pts) => {
    const sum = pts.reduce(
      (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
      { x: 0, y: 0 }
    );
    return { x: sum.x / pts.length, y: sum.y / pts.length };
  };

  /* 🔴 פוליגונים קבועים + מספר */
  noFlyPolygons.forEach((polyItm, idx) => {
    const ptsPx = polyItm.map(([x, y]) => itmToPx(x, y));
    drawPoly(ptsPx);

    const c = centroid(ptsPx);
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "red";
    ctx.fillText(
      idx + 1,
      c.x * width / imgEl.naturalWidth,
      c.y * height / imgEl.naturalHeight
    );
  });

  /* פוליגון זמני (מקווקו) */
  if (isDrawingNoFly && currentPoly.length) {
    drawPoly(currentPoly, true);
  }
}, [noFlyPolygons, currentPoly, isDrawingNoFly, boundingBox]);

  return (
    <div
      style={{
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
        flexDirection: "column",
      }}
    >
      {/* כותרת */}
      {clickStage === "takeoff" && (
        <div
          style={{
            marginBottom: "10px",
            fontSize: "18px",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          בחר נקודת המראה
        </div>
      )}
      {clickStage === "landing" && (
        <div
          style={{
            marginBottom: "10px",
            fontSize: "18px",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          בחר נקודת נחיתה
        </div>
      )}

      {/* תיבה גלילה – מוצגת רק כשהתמונה חורגת מהחלון */}
      <div
        style={{
          position: "relative",
          maxWidth: "90vw",
          maxHeight: "80vh",
          overflow: "auto", // גלילה אוטומטית לשני הכיוונים
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="ortophoto"
          onClick={onImageClick}
          onMouseMove={onMouseMove}
          onDoubleClick={onImageDoubleClick}
          style={{
            display: "block", // מבטל רווח תחתון
            maxWidth: "none", // מציג גודל מקורי – לא מכווץ
            maxHeight: "none",
            cursor: "crosshair",
            zIndex: 100,
          }}
        />

        <canvas
          ref={overlayRef}      
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",   
          }}
        />

        {/* משולש ירוק – נקודת המראה */}
        {takeoffPixel && (
          <div
            style={{
              position: "absolute",
              top: takeoffPixel.y - 16,
              left: takeoffPixel.x - 9,
              width: 0,
              height: 0,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: "22px solid rgb(51, 201, 86)",
              filter: "drop-shadow(0 0 2px black)",
              pointerEvents: "none",
              zIndex: 1000,
            }}
          />
        )}

        {/* משולש אדום – נקודת נחיתה */}
        {landingPixel && (
          <div
            style={{
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
              zIndex: 1000,
            }}
          />
        )}
      </div>

      {/* כפתורי אישור השלבים */}
      {clickStage === "takeoff" && takeoffPixel && (
        <button onClick={onApproveTakeoff} className="primary-button mt-2">
          אישור נקודת המראה
        </button>
      )}
      {clickStage === "landing" && landingPixel && (
        <button onClick={onApproveLanding} className="primary-button mt-2">
          אישור נקודת נחיתה
        </button>
      )}
      
      {clickStage === "done" && (
        <>
          <button onClick={onAddNoFlyZone} className="secondary-button mt-2">
            {isDrawingNoFly ? "ביטול ציור אזור" : "הוספת אזור אסור לטיסה"}
          </button>

          {isDrawingNoFly && (
            <div style={{ marginTop: 4, color: "#cc5500" }}>
              לחצו נקודות על-גבי התמונה | Double-Click לסיום
            </div>
          )}

          {noFlyCount > 0 && !isDrawingNoFly && (
            <div style={{ marginTop: 4, fontSize: 14 }}>נוספו {noFlyCount} אזורי No-Fly</div>
          )}


          {!isDrawingNoFly && noFlyPolygons.length > 0 && (
            <div style={{ marginTop: 6, maxHeight: 100, overflowY: "auto" }}>
              {noFlyPolygons.map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ marginInlineEnd: 4 }}>אזור {i + 1}</span>
                  <button
                    onClick={() => onRemoveNoFly(i)}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      color: "#d11",
                      fontSize: 14,
                    }}
                    title="מחק"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}


          {/* כפתור שליחת משימה */}
          {!isDrawingNoFly && takeoffPixel && landingPixel && (
            <button onClick={onSendMission} className="primary-button mt-2">
              אישור שליחת משימה
            </button>
          )}
        </>
      )}
    </div>
  );
}
