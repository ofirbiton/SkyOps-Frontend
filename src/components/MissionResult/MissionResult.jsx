import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";

export default function MissionResult({ onToggleTaskMode }) {
  const { state } = useLocation();
  const navigate = useNavigate();

  const imageUrl = state?.imageUrl;
  const textFileUrl = state?.textFileUrl;

  const downloadTextFile = () => {
    const link = document.createElement("a");
    link.href = textFileUrl;
    link.download = "mission_coordinates.txt";
    link.click();
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <Header taskMode={true} onToggleTaskMode={() =>{
        navigate("/", { state: { fromMissionResult: false } });

      }} />
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="תמונת מסלול"
            style={{ maxWidth: "90%", maxHeight: "70vh", border: "1px solid #ccc", borderRadius: "8px", marginBottom: "1rem" }}
          />
        )}
        {textFileUrl && (
          <button className="primary-button" onClick={downloadTextFile}>
            הורד קובץ קורדינטות
          </button>
        )}
      </div>
    </div>
  );
}
