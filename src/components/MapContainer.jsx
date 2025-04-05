import React, { useEffect } from "react";
import "./MapContainer.css";

export default function MapContainer() {
  useEffect(() => {
    window.jQuery(document).ready(function () {
      window.govmap.createMap("map", {
        token: "5a4b8472-b95b-4687-8179-0ccb621c7990",
        showXY: true,
        identifyOnClick: true,
        isEmbeddedToggle: false,
        background: "1",
        layersMode: 1,
        zoomButtons: false,
      });
    });
  }, []);

  return (
    <>
      

      {/* מפת govmap */}
      <div id="map" className="map-container"></div>
    </>
  );
}
