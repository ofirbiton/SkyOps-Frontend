import React, { useState } from "react";
import govmapService from "./govmapService";

export default function SearchAddress() {
  const [address, setAddress] = useState("");

  // מתעדכן בכל הקלדה בשדה הטקסט
  const handleChange = (e) => {
    setAddress(e.target.value);
  };

  // פונקציית חיפוש: geocode + zoom
  const handleSearch = async () => {
    if (!address.trim()) return;
    try {
      // קריאה לפונקציה geocode
      const response = await govmapService.geocode({
        keyword: address,
        type: window.govmap.geocodeType.FullResult, // מביא תוצאות מלאות
      });

      console.log("geocode response => ", response);

      // אם נמצא לפחות איזשהו מקום
      if (response?.data?.length > 0) {
        // ניקח את התוצאה הראשונה
        const first = response.data[0];
        // אם יש X ו-Y במענה, נתמקד בעזרת zoomToXY
        if (first.X && first.Y) {
          govmapService.zoomToXY({
            x: first.X,
            y: first.Y,
            level: 12,    // רמת הזום, בחר מה שמתאים
            marker: true, // לשים סמן במפה
          });
        }
      } else {
        console.log("לא נמצאו תוצאות לכתובת:", address);
      }
    } catch (error) {
      console.error("שגיאה בפעולת geocode:", error);
    }
  };

  // אם המשתמש לוחץ Enter בתוך ה־input, נפעיל את handleSearch
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="הכנס כתובת..."
        value={address}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
