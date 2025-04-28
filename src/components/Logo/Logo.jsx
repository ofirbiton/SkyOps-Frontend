import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Logo.module.css";
import logo from "../../../Images/skyops logo.png";

export default function Logo({ onToggleTaskMode }) {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (typeof onToggleTaskMode === "function") {
      onToggleTaskMode(false);
    }
    navigate("/");
  };

  return (
    <div className={styles.logo} onClick={handleLogoClick}>
      <img src={logo} alt="SkyOps Logo" className={styles.logoImg} />
    </div>
  );
}
