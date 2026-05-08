import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const location = useLocation();
  const user = JSON.parse(sessionStorage.getItem("user"));

  // ยังไม่ login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // มี role กำหนด และ role ไม่ตรง
  if (role && user.role !== role) {
    // ถ้า admin แต่เข้า teacher
    if (user.role === "admin") return <Navigate to="/admin" replace />;

    // ถ้า teacher
    if (user.role === "teacher") return <Navigate to="/teacher/children" replace />;

    // user ทั่วไป
    return <Navigate to="/" replace />;
  }

  return children;
}
