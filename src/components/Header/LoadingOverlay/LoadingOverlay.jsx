import React from "react";
import styles from "./LoadingOverlay.module.css";

export default function LoadingOverlay({ isLoadingRoute }) {
  if (!isLoadingRoute) return null;

  return (
    <div className={styles.loadingOverlay}>
      <div className={styles.loadingText}>...המסלול בהכנה</div>
      <div className={styles.spinner}></div>
    </div>
  );
}
