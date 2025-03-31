import React, { useEffect } from "react";
import "./MapContainer.css";

export default function MapContainer() {
  useEffect(() => {
    // בעת טעינת המסמך, יוצרים את המפה בתוך האלמנט עם id="map"
    window.jQuery(document).ready(function () {
      window.govmap.createMap("map", {
        token: "5a4b8472-b95b-4687-8179-0ccb621c7990",
        layers: ["GASSTATIONS", "PARCEL_HOKS", "KSHTANN_ASSETS", "bus_stops", "PARCEL_ALL"],
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
