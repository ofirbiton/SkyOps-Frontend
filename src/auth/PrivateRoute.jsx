import { Navigate, Outlet } from "react-router-dom";

/**
 * חוסם גישה למסכים פרטיים אלא אם יש auth=true ב-localStorage.
 * משתמש ב-<Outlet/> כדי לרנדר את ה-Route הצאצא.
 */
export default function PrivateRoute() {
  const isAuth = localStorage.getItem("auth") === "true";
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}
