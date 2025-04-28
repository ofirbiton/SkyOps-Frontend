import React, { useRef } from "react";
import styles from "./MapClickOverlay.module.css";

export default function MapClickOverlay({
  orthoImageUrl,
  clickStage,
  takeoffPixel,
  landingPixel,
  mousePosition,
  setMousePosition,
  setClickStage,
  setTakeoffPixel,
  setLandingPixel,
  sendMission,
}) {
  const imageRef = useRef(null);

  if (!orthoImageUrl || !clickStage) return null;

  const handleImageClick = (e) => {
    if (!imageRef.current) return;
    const image = imageRef.current;
    const scaleX = image.naturalWidth / image.clientWidth;
    const scaleY = image.naturalHeight / image.clientHeight;
    const correctedX = Math.round(e.nativeEvent.offsetX * scaleX);
    const correctedY = Math.round(e.nativeEvent.offsetY * scaleY);

    if (clickStage === "takeoff") {
      setTakeoffPixel({ x: correctedX, y: correctedY });
    } else if (clickStage === "landing") {
      setLandingPixel({ x: correctedX, y: correctedY });
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.imageWrapper}>
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
          className={styles.image}
        />

        {takeoffPixel && (
          <div
            className={styles.markerTakeoff}
            style={{ top: takeoffPixel.y - 16, left: takeoffPixel.x - 9 }}
          />
        )}

        {landingPixel && (
          <div
            className={styles.markerLanding}
            style={{ top: landingPixel.y - 16, left: landingPixel.x - 9 }}
          />
        )}

        {clickStage && (
          <div
            className={styles.tooltip}
            style={{
              top: mousePosition.y + 20,
              left: mousePosition.x + 20,
            }}
          >
            {clickStage === "takeoff" ? "בחר נקודת המראה" : clickStage === "landing" ? "בחר נקודת נחיתה" : ""}
          </div>
        )}
      </div>

      <div className={styles.buttonWrapper}>
        {clickStage === "takeoff" && takeoffPixel && (
          <button className={styles.primaryButton} onClick={() => setClickStage("landing")}>
            אישור נקודת המראה
          </button>
        )}
        {clickStage === "landing" && landingPixel && (
          <button className={styles.primaryButton} onClick={() => setClickStage("done")}>
            אישור נקודת נחיתה
          </button>
        )}
        {clickStage === "done" && takeoffPixel && landingPixel && (
          <button className={styles.primaryButton} onClick={sendMission}>
            אישור שליחת משימה
          </button>
        )}
      </div>
    </div>
  );
}
