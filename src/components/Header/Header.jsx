import React, { useState } from "react";
import styles from "./Header.module.css";

import Logo from "./Logo/Logo";
import SearchBar from "./SearchBar/SearchBar";
import TaskButtons from "./TaskButtons/TaskButtons";
import FloatingConfirmButtons from "./FloatingConfirmButtons/FloatingConfirmButtons";
import MapClickOverlay from "./MapClickOverlay/MapClickOverlay";
import LoadingOverlay from "./LoadingOverlay/LoadingOverlay";

import { useNavigate, useLocation } from "react-router-dom";
import { useSearch } from "./hooks/useSearch";
import { useExportMap } from "./hooks/useExportMap";
import { useSafeClear } from "./hooks/useSafeClear";
import { useMissionSubmit } from "./hooks/useMissionSubmit";

import { showMeasureTool } from "./utils/govmapApi";
import { drawPixelsOnStreetsImage } from "./utils/imageUtils";

export default function Header() {
  const [searchText, setSearchText] = useState("");
  const [pendingRectangle, setPendingRectangle] = useState(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [orthoImageUrl, setOrthoImageUrl] = useState(null);
  const [streetsImageUrl, setStreetsImageUrl] = useState(null);
  const [takeoffPixel, setTakeoffPixel] = useState(null);
  const [landingPixel, setLandingPixel] = useState(null);
  const [clickStage, setClickStage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [boundingBox, setBoundingBox] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [taskMode, setTaskMode] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { searchAddress } = useSearch();
  const { exportMapImage } = useExportMap(setOrthoImageUrl, setStreetsImageUrl, setClickStage);
  const { safeClearDrawings } = useSafeClear();
  const { sendMission } = useMissionSubmit(navigate, setIsSubmitting, setIsLoadingRoute);

  const handleSearch = async (e) => {
    e?.preventDefault?.();
    try {
      await searchAddress(searchText);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleTaskMode = () => {
    if (!taskMode) {
      navigate("/");
      setTaskMode(true);
    } else {
      setPendingRectangle(null);
      setSearchText("");
      setHasDrawn(false);
      setOrthoImageUrl(null);
      setStreetsImageUrl(null);
      setClickStage(null);
      setTakeoffPixel(null);
      setLandingPixel(null);
      setBoundingBox(null);
      safeClearDrawings();
      setTaskMode(false);
    }
  };

  const handleDrawRectangle = () => {
    if (!window.govmap) return;

    const startDrawing = () => {
      setPendingRectangle(null);
      setHasDrawn(true);

      window.govmap
        .draw(window.govmap.drawType.Rectangle)
        .progress((response) => {
          try {
            const wkt = response?.wkt;
            if (!wkt || !wkt.startsWith("POLYGON")) return;

            const coords = wkt
              .replace("POLYGON((", "")
              .replace("))", "")
              .split(",")
              .map((pair) => pair.trim().split(" ").map(Number));

            const [x1, y1] = coords[0];
            const [x2, y2] = coords[2];

            const width = Math.abs(x2 - x1);
            const height = Math.abs(y2 - y1);
            if (width < 100 || height < 100 || width > 1500 || height > 1500) {
              alert("⚠️ מימדי המלבן לא חוקיים. נסה/י שוב.");
              startDrawing();
              return;
            }

            setPendingRectangle({ x1, y1, x2, y2 });
            setBoundingBox({ x1, y1, x2, y2 });

            window.govmap.zoomToXY({
              x: (x1 + x2) / 2,
              y: (y1 + y2) / 2,
              level: 9,
              marker: false,
            });
          } catch (err) {
            console.error("שגיאה בבדיקת המלבן:", err);
            alert("אירעה שגיאה.");
          }
        });
    };

    startDrawing();
  };

  return (
    <>
      <div className={styles.header}>
        <SearchBar
          searchText={searchText}
          setSearchText={setSearchText}
          handleSearch={handleSearch}
          taskMode={taskMode}
          location={location}
        />
        <Logo onToggleTaskMode={setTaskMode} />
      </div>

      <MapClickOverlay
        orthoImageUrl={orthoImageUrl}
        clickStage={clickStage}
        takeoffPixel={takeoffPixel}
        landingPixel={landingPixel}
        mousePosition={mousePosition}
        setMousePosition={setMousePosition}
        setClickStage={setClickStage}
        setTakeoffPixel={setTakeoffPixel}
        setLandingPixel={setLandingPixel}
        sendMission={() =>
          sendMission({
            orthoImageUrl,
            drawPixelsOnStreetsImage: () => drawPixelsOnStreetsImage(streetsImageUrl, takeoffPixel, landingPixel),
            boundingBox,
            setIsSubmittingCallback: setIsSubmitting,
            setIsLoadingRouteCallback: setIsLoadingRoute,
          })
        }
      />

      <FloatingConfirmButtons
        pendingRectangle={pendingRectangle}
        exportMapImage={exportMapImage}
        setPendingRectangle={setPendingRectangle}
        handleDrawRectangle={handleDrawRectangle}
      />

      <LoadingOverlay isLoadingRoute={isLoadingRoute} />

      <TaskButtons
        taskMode={taskMode}
        hasDrawn={hasDrawn}
        location={location}
        handleToggleTaskMode={handleToggleTaskMode}
        handleDrawRectangle={handleDrawRectangle}
      />
    </>
  );
}
