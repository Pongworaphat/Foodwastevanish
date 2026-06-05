import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  if (!user) {
    return <Navigate to="/signin" />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
}