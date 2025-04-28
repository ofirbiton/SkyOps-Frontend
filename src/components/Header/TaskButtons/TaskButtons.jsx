import React from "react";
import styles from "./TaskButtons.module.css";

export default function TaskButtons({
  taskMode,
  hasDrawn,
  location,
  handleToggleTaskMode,
  handleDrawRectangle,
}) {
  const isHome = location.pathname === "/";

  return (
    <div className={styles.buttonBar}>
      <button
        className={`${styles.primaryButton} ${taskMode ? styles.cancelButton : ""}`}
        onClick={handleToggleTaskMode}
      >
        {taskMode ? "ביטול משימה" : "יצירת משימה חדשה"}
      </button>

      {taskMode && !hasDrawn && isHome && (
        <button className={styles.secondaryButton} onClick={handleDrawRectangle}>
          סימון גבולות גזרה
        </button>
      )}
    </div>
  );
}
