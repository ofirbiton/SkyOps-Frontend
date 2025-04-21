import React, { useEffect, useRef, useState } from "react";
import "./MapContainer.css";

export default function MapContainer() {
  const [scale, setScale] = useState(null);
  const isInit = useRef(false);

  useEffect(() => {
    if (isInit.current) return;

    window.jQuery(document).ready(function () {
      window.govmap.createMap("map", {
        token: "5a4b8472-b95b-4687-8179-0ccb621c7990", 
        layers: ["contour"],
        showXY: true,
        identifyOnClick: true,
        isEmbeddedToggle: false,
        background: "2",
        layersMode: 1,
        zoomButtons: false,
        onLoad: () => console.log("GovMap loaded"),
      });

      // מאזין לשינוי קנה מידה
      window.govmap
        .onEvent(window.govmap.events.EXTENT_CHANGE)
        .progress((e) => {
          if (e?.lod?.scale) {
            setScale(Math.round(e.lod.scale));
          }
        });

      isInit.current = true;
    });
  }, []);

  return (
    <>
      {/* קנה מידה מוצג בפינה */}
      {scale && (
        <div className="scale-box">
          1:{scale.toLocaleString()}
        </div>
      )}

      {/* מפת govmap */}
      <div id="map" className="map-container"></div>
    </>
  );
}
