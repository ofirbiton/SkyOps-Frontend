import React, { useEffect, useRef } from "react";
import "./MapContainer.css";
import govmapService from "./govmapService";

// נייבא את רכיב החיפוש
import SearchAddress from "./SearchAddress";

export default function MapContainer() {
  const isMapCreatedRef = useRef(false);

  useEffect(() => {
    if (!isMapCreatedRef.current) {
      govmapService.createMap("map", {
        token: "7f0764a7-7a42-4214-a98b-cb669559d9cb",
        showXY: true,
        identifyOnClick: true,
        background: "1",
        layersMode: 1,
        zoomButtons: false,
      });
      isMapCreatedRef.current = true;
    }
  }, []);

  return (
    <div className="map-wrapper">
      {/* האלמנט שבו נטענת המפה */}
      <div id="map" className="map-container" />

      {/* אפשר למקם את שורת החיפוש היכן שרוצים על המסך */}
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 9999 }}>
        <SearchAddress />
      </div>
    </div>
  );
}
