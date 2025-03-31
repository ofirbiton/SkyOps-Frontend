import React, { useEffect } from "react";
import "./MapContainer.css";

export default function MapContainer() {
  useEffect(() => {
    // יצירת המפה כאשר הדף נטען
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

  const showExample = () => {
    govmap.showMeasure();  
  };

  return (
      <div id="map" className="map-container"></div>
      <button onClick={showExample}>Show Example</button>
  );
}
