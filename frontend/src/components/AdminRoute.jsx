import { Navigate } from "react-router-dom";
import { getUser } from "../utils/auth";

export default function AdminRoute({ children }) {
  const user = getUser();

  // If user is not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but not admin → redirect to dashboard
  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ If admin → render the protected page
  return children;
}
