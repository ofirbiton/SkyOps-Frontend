import React, { useEffect } from "react";
import "./MapContainer.css";

export default function MapContainer() {
  useEffect(() => {
    // בעת טעינת המסמך, יוצרים את המפה בתוך האלמנט עם id="map"
    window.jQuery(document).ready(function () {
      window.govmap.createMap("map", {
        token: "7f0764a7-7a42-4214-a98b-cb669559d9cb",
        
        showXY: true,
        identifyOnClick: true,
        isEmbeddedToggle: false,
        background: "1",
        layersMode: 1,
        zoomButtons: false,
      });
    });
  }, []);

  // div זה נוצר על ידי React ומוגדר id="map" כך שהGovMap יזהה אותו
  return <div id="map" className="map-container"></div>;
}
