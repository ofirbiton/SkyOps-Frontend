import React from "react";
import "./Header.css";
import logo from "../Images/skyops logo.png"; // ודא שהנתיב נכון

export default function Header({ taskMode, onToggleTaskMode }) {
  return (
    <div className="header">
      <div className="logo">
        <img src={logo} alt="DroneOps Logo" className="logo-img" />
      </div>
      <div className="button-group">
        {taskMode && (
          <>
            <button className="secondary-button">סימון נקודת נחיתה</button>
            <button className="secondary-button">סימון נקודת המראה</button>
            <button className="secondary-button">סימון גבולות גזרה</button>
          </>
        )}
        <button className="primary-button" onClick={onToggleTaskMode}>
          {taskMode ? "ביטול משימה" : "יצירת משימה חדשה"}
        </button>
      </div>
    </div>
  );
}
