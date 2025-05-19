// ImagePixelEditor.js
/**
 * צובע פיקסלי המראה/נחיתה + אזורי No-Fly (פוליגונים) על תמונת הרחובות,
 * ומחזיר Blob (‏PNG) לשילוח לשרת.
 *
 * @param {string}  imageUrl           – כתובת התמונה (streets)
 * @param {{x,y}}   takeoffPixel       – פיקסל המראה
 * @param {{x,y}}   landingPixel       – פיקסל נחיתה
 * @param {Array}   noFlyPolygons      – מערך פוליגונים; כל פוליגון = [[itmX,itmY], ...]
 * @param {{x1,y1,x2,y2}} boundingBox  – גבולות המלבן ב-ITM (כפי שהוחזר מ-GovMap)
 * @returns {Promise<Blob>}
 */
export async function drawPixelsOnImage(
  imageUrl,
  takeoffPixel,
  landingPixel,
  noFlyPolygons = [],
  boundingBox
) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imageUrl;
  await new Promise((res) => (img.onload = res));

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  /* 🟢 פיקסל המראה */
  ctx.fillStyle = "lime";
  ctx.fillRect(takeoffPixel.x, takeoffPixel.y, 1, 1);

  /* 🔴 פיקסל נחיתה */
  ctx.fillStyle = "red";
  ctx.fillRect(landingPixel.x, landingPixel.y, 1, 1);

  /* 🟡 אזורי No-Fly */
  if (noFlyPolygons.length && boundingBox) {
    const xmin = Math.min(boundingBox.x1, boundingBox.x2);
    const xmax = Math.max(boundingBox.x1, boundingBox.x2);
    const ymin = Math.min(boundingBox.y1, boundingBox.y2);
    const ymax = Math.max(boundingBox.y1, boundingBox.y2);
    const scaleX = canvas.width / (xmax - xmin);
    const scaleY = canvas.height / (ymax - ymin);

    // פונקציית המרה ITM → פיקסל
    const itmToPixel = (x, y) => ({
      x: Math.round((x - xmin) * scaleX),
      y: Math.round((ymax - y) * scaleY), // ‏y‏ הפוך (ראש-התמונה = ‏y-max)
    });

    ctx.fillStyle = "rgb(246,246,246)"; // צבע של מבנה

    noFlyPolygons.forEach((poly) => {
      if (poly.length < 3) return; // לא פוליגון
      ctx.beginPath();
      const first = itmToPixel(poly[0][0], poly[0][1]);
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i < poly.length; i++) {
        const p = itmToPixel(poly[i][0], poly[i][1]);
        ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.fill();
    });
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      console.log("🗺️ Blob רחובות עם פיקסלים + No-Fly Zones:", blob);
      resolve(blob);
    }, "image/png");
  });
}

/**
 * מצייר מסגרות אדומות + מספרים על תצלום האורטו ומחזיר Blob.
 *
 * @param {string}  imageUrl          – כתובת תצלום האורטו
 * @param {Array}   noFlyPolygons     – [[itmX,itmY], ...] per polygon
 * @param {{x1,y1,x2,y2}} boundingBox – גבולות המלבן ב-ITM
 * @returns {Promise<Blob>}
 */
export async function drawPolygonsOnImage(
  imageUrl,
  noFlyPolygons = [],
  boundingBox,
  takeoffPixel = null,
  landingPixel = null
) {
  if (!boundingBox) {
    return (await fetch(imageUrl)).blob(); // אין מה לצייר – נחזיר Blob מקורי
  }

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imageUrl;
  await new Promise((res) => (img.onload = res));

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  /* המרות ITM → פיקסל */
  const { x1, y1, x2, y2 } = boundingBox;
  const xmin = Math.min(x1, x2);
  const xmax = Math.max(x1, x2);
  const ymin = Math.min(y1, y2);
  const ymax = Math.max(y1, y2);
  const scaleX = canvas.width  / (xmax - xmin);
  const scaleY = canvas.height / (ymax - ymin);
  const itmToPx = (x, y) => ({
    x: (x - xmin) * scaleX,
    y: (ymax - y) * scaleY,
  });

  const centroid = (pts) => {
    const sum = pts.reduce((a, p) => ({ x: a.x + p.x, y: a.y + p.y }), { x: 0, y: 0 });
    return { x: sum.x / pts.length, y: sum.y / pts.length };
  };

  ctx.strokeStyle = "red";
  ctx.lineWidth   = 2;
  ctx.font        = "bold 24px sans-serif";
  ctx.fillStyle   = "red";
  ctx.textAlign   = "center";
  ctx.textBaseline= "middle";

  noFlyPolygons.forEach((poly, idx) => {
    if (poly.length < 3) return;
    const pts = poly.map(([x, y]) => itmToPx(x, y));
    /* קו מתאר */
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.stroke();
    /* מספר במרכז */
    const c = centroid(pts);
    ctx.fillText(idx + 1, c.x, c.y);
  });

  /* 🛫 משולש המראה (ירוק) */
  if (takeoffPixel) {
    ctx.fillStyle = "rgb(51,201,86)";
    ctx.beginPath();
    // ctx.moveTo(takeoffPixel.x, takeoffPixel.y - 16);
    // ctx.lineTo(takeoffPixel.x - 9, takeoffPixel.y + 6);
    // ctx.lineTo(takeoffPixel.x + 9, takeoffPixel.y + 6);
    ctx.moveTo(takeoffPixel.x, takeoffPixel.y);        // קודקוד על הנקודה  ✅
    ctx.lineTo(takeoffPixel.x - 9, takeoffPixel.y - 22);
    ctx.lineTo(takeoffPixel.x + 9, takeoffPixel.y - 22);
    ctx.closePath();
    ctx.fill();
  }

  /* 🛬 משולש נחיתה (אדום) */
  if (landingPixel) {
    ctx.fillStyle = "rgb(205,45,61)";
    ctx.beginPath();
    // ctx.moveTo(landingPixel.x, landingPixel.y - 16);
    // ctx.lineTo(landingPixel.x - 9, landingPixel.y + 6);
    // ctx.lineTo(landingPixel.x + 9, landingPixel.y + 6);
    ctx.moveTo(landingPixel.x, landingPixel.y);        // קודקוד על הנקודה  ✅
    ctx.lineTo(landingPixel.x - 9, landingPixel.y - 22);
    ctx.lineTo(landingPixel.x + 9, landingPixel.y - 22);
    ctx.closePath();
    ctx.fill();
  }

  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
}