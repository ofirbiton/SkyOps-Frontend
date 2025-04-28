import React from "react";
import styles from "./FloatingConfirmButtons.module.css";

export default function FloatingConfirmButtons({
  pendingRectangle,
  exportMapImage,
  setPendingRectangle,
  handleDrawRectangle,
}) {
  if (!pendingRectangle) return null;

  return (
    <div className={styles.floatingButtons}>
      <button
        className={styles.primaryButton}
        onClick={() => {
          exportMapImage(pendingRectangle);
          setPendingRectangle(null);
        }}
      >
        אישור גבולות גזרה
      </button>
      <button
        className={styles.secondaryButton}
        onClick={() => {
          setPendingRectangle(null);
          handleDrawRectangle();
        }}
      >
        סימון גבולות גזרה מחדש
      </button>
    </div>
  );
}
