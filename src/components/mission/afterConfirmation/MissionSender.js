// MissionSender.js
export async function sendMission({
  orthoImageUrl,
  streetsImageBlob,
  boundingBox,
  takeoffPixel,   
  landingPixel,
  speed,
  altitude,      
  onSuccess,
  onError,
  setIsSubmitting,
  setIsLoadingRoute,
  navigate,
  skipNavigate = false
}) {
  if (!orthoImageUrl || !streetsImageBlob || !boundingBox) return;

  try {
    setIsSubmitting(true);
    setIsLoadingRoute(true);

    // ממיר את כתובת התצלום (URL) ל‑Blob כדי לשלוח כ‑File
    const orthoBlob = await (await fetch(orthoImageUrl)).blob();

    /* ---------- FormData ל‑/api/create-mission ---------- */
    const formData = new FormData();
    formData.append("satellite_image", orthoBlob, "ortho.png");
    formData.append("buildings_image", streetsImageBlob, "streets_with_markers.png");

    /*
     * 🔑 סידור נכון של ארבע הקואורדינטות
     * המשתמש יכול לגרור מלבן בכל כיוון, ולכן חייבים לוודא שה‑top‑left
     * הוא באמת בפינה הצפון‑מערבית ו‑bottom‑right בפינה הדרום‑מזרחית.
     */
    const { x1, y1, x2, y2 } = boundingBox;
    const minX = Math.min(x1, x2);      // שמאל
    const maxX = Math.max(x1, x2);      // ימין
    const maxY = Math.max(y1, y2);      // צפון (ITM גדל צפונה)
    const minY = Math.min(y1, y2);      // דרום

    formData.append("top_left_coord", `(${minX}, ${maxY})`);       // (שמאל, צפון)
    formData.append("bottom_right_coord", `(${maxX}, ${minY})`);   // (ימין, דרום)

    // const SERVER_URL = "https://skyops-backend-production-0228.up.railway.app";

    const response = await fetch("https://skyops-backend-production-0228.up.railway.app/api/create-mission", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message || "שליחה נכשלה");

    /* ---------- שמירת תוצאות או ניווט ---------- */
    if (!skipNavigate && navigate) {
      navigate("/mission-result", {
        state: {
          imageUrl: result.satelliteImageUrl,
          textFileUrl: result.coordinatesFileUrl,
          takeoffPixel,
          landingPixel,
          speed,
          altitude,
        },
      });
    }

    onSuccess?.();
    setIsSubmitting(false);
    setIsLoadingRoute(false);

    /* נחזיר את הנתונים בכל מקרה – שיהיו זמינים למי שקרא עם skipNavigate=true */
    return {
      satelliteImageUrl: result.satelliteImageUrl,
      coordinatesFileUrl: result.coordinatesFileUrl,
    };

  } catch (error) {
    console.error("❌ שגיאה בשליחה לשרת:", error);
    alert("אירעה שגיאה בשליחת המשימה.");
    onError?.();
    setIsSubmitting(false);
    setIsLoadingRoute(false);
  }
}
