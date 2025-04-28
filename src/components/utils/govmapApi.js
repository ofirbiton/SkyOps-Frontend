export async function geocodeAddress(keyword) {
    if (!keyword.trim()) {
      throw new Error("יש להזין מחרוזת חיפוש תקינה.");
    }
  
    try {
      const response = await window.govmap.geocode({
        keyword,
        type: window.govmap.geocodeType.AccuracyOnly,
      });
  
      if (response?.data?.length > 0 && response.data[0].ResultType === 1) {
        const { X, Y } = response.data[0];
        return { x: X, y: Y };
      } else {
        throw new Error("לא נמצאה תוצאה מדויקת.");
      }
    } catch (error) {
      console.error("שגיאה ב־geocodeAddress:", error);
      throw new Error("שגיאה בחיפוש כתובת.");
    }
  }
  
  export function showMeasureTool() {
    try {
      window.govmap?.showMeasure();
    } catch (error) {
      console.error("שגיאה בהפעלת כלי מדידה:", error);
    }
  }
  