import { useCallback } from "react";

export function useSearch() {
  const searchAddress = useCallback(async (searchText) => {
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
  }, []);

  return { searchAddress };
}
