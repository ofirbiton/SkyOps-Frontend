export async function drawPixelsOnStreetsImage(streetsImageUrl, takeoffPixel, landingPixel) {
    if (!streetsImageUrl || !takeoffPixel || !landingPixel) {
      throw new Error("חסרים נתונים לציור הפיקסלים.");
    }
  
    const streetsImg = new Image();
    streetsImg.crossOrigin = "anonymous";
    streetsImg.src = streetsImageUrl;
  
    await new Promise((resolve) => streetsImg.onload = resolve);
  
    const canvas = document.createElement("canvas");
    canvas.width = streetsImg.width;
    canvas.height = streetsImg.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(streetsImg, 0, 0);
  
    // ציור נקודת המראה בירוק
    ctx.fillStyle = "lime";
    ctx.fillRect(takeoffPixel.x, takeoffPixel.y, 1, 1);
  
    // ציור נקודת נחיתה באדום
    ctx.fillStyle = "red";
    ctx.fillRect(landingPixel.x, landingPixel.y, 1, 1);
  
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/png");
    });
  }
  