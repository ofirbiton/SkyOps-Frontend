import React from "react";
import styles from "./SearchBar.module.css";

export default function SearchBar({ searchText, setSearchText, handleSearch, taskMode, location }) {
  if (taskMode || location.pathname !== "/") return null;

  return (
    <form className={styles.searchContainer} onSubmit={handleSearch}>
      <input
        type="text"
        className={styles.searchInput}
        placeholder="חפש כתובת"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <button type="submit" className={styles.secondaryButton}>
        חפש
      </button>
      <button
        type="button"
        className={styles.secondaryButton}
        onClick={() => window.govmap?.showMeasure()}
      >
        הפעל מדידה
      </button>
    </form>
  );
}
