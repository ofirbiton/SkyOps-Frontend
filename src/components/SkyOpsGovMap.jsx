import React, { useEffect, useRef } from "react";

export default function SkyOpsGovMap({
  onMapClick,
  domain = process.env.REACT_APP_GOVMAP_DOMAIN || "https://www.skyops.co.il",
  token = process.env.REACT_APP_GOVMAP_TOKEN || "7f0764a7-7a42-4214-a98b-cb669559d9cb"
}) {
  const govmapRef = useRef(null);

  useEffect(() => {
    if (!window.GovMap) {
      console.error(
        "GovMap script not loaded! ודא שקובץ govmap.js מוטמע ב־public/index.html"
      );
      return;
    }

    const config = {
      licKey: token,
      layers: "VECTOR",
      zoom: 10,
      center: { x: 34.8, y: 32.1 }, // x = longitude, y = latitude
      appName: "SkyOpsApp"
    };

    // יצירת מופע GovMap; בדוק במסמכי GovMap אם יש צורך לשלוח domain כפרמטר שלישי
    govmapRef.current = new window.GovMap(config, "mapContainer", domain);

    govmapRef.current.RegisterEvent("MapLoaded", () => {
      console.log("GovMap loaded!");
    });

    govmapRef.current.RegisterEvent("MapClick", (e) => {
      if (onMapClick) {
        const lat = e.location.y;
        const lng = e.location.x;
        onMapClick(lat, lng);
      }
    });
  }, [onMapClick, domain, token]);

  return (
    <div
      id="mapContainer"
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden"
      }}
    />
  );
}
