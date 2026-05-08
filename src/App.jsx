import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";

/* ===== Public ===== */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Announcements from "./pages/Announcements";
import StaffPage from "./pages/StaffPage";
/* ===== Parent ===== */
import Children from "./pages/Children";
import ChildDetail from "./pages/ChildDetail";
import Enrollment from "./pages/Enrollment";
import EnrollmentStatus from "./pages/EnrollmentStatus";
import MyEnrollment from "./pages/MyEnrollment";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
/* ===== Teacher ===== */
import ChildrenInClass from "./pages/ChildrenInClass";
import CheckinPage from "./pages/Checkin";
import MeasurementsPage from "./pages/Measurements";
import HealthPage from "./pages/Health";
import BrushingsPage from "./pages/Brushings";
import MilkPage from "./pages/Milk";
import LunchEating from "./pages/LunchEating";
import TeacherDailyMenu from "./pages/teacher/TeacherDailyMenu";
import TeacherLayout from "./layouts/TeacherLayout";

/* ===== Evaluation ===== */
import DevelopmentAssessment from "./pages/evaluation/DevelopmentAssessment";
import AdminDevelopmentList from "./pages/admin/AdminDevelopmentList";
import AdminDevelopmentDetail from "./pages/admin/AdminDevelopmentDetail";

/* ===== Admin ===== */
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";          // 👈 ต้องมีจริง
import AdminAnnouncements from "./pages/AdminAnnouncements";
import AnnouncementForm from "./pages/AnnouncementForm";
import AnnouncementDetail from "./pages/AnnouncementDetail";
import AdminEnrollments from "./pages/AdminEnrollments";
import AdminEnrollmentDetail from "./pages/AdminEnrollmentDetail";
import AdminEnrollmentEdit from "./pages/AdminEnrollmentEdit";
import ChildrenCount from "./pages/ChildrenCount";
import AdminDailyMenu from "./pages/AdminDailyMenu";
import AdminUserProfile from "./pages/admin/AdminUserProfile";
import AdminCenters from "./pages/admin/AdminCenters";
import AdminClassrooms from "./pages/admin/AdminClassrooms";
import AdminTeacherCreate from "./pages/admin/AdminTeacherCreate";
import AcademicYear from "./pages/admin/AcademicYear";
import AdminStudents from "./pages/AdminStudents";
import AdminStudentEdit from "./pages/AdminStudentEdit";

function App() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminPage = location.pathname.startsWith("/admin");

  useEffect(() => {
  if (location.pathname === "/admin") {
    document.title = "แดชบอร์ด";
  } else if (location.pathname.includes("/users")) {
    document.title = "จัดการผู้ใช้";
  } else if (location.pathname.includes("/teachers")) {
    document.title = "ข้อมูลครู";
  } else {
    document.title = "ระบบจัดการศูนย์เด็กเล็ก";
  }
}, [location.pathname]);

  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
  const syncUser = () => {
    const savedUser = sessionStorage.getItem("user");
    setUser(savedUser ? JSON.parse(savedUser) : null);
  };

  
  window.addEventListener("storage", syncUser);
  window.addEventListener("focus", syncUser);

  return () => {
    window.removeEventListener("storage", syncUser);
    window.removeEventListener("focus", syncUser);
  };
}, []);

  function handleLogout() {
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("token");

  setUser(null);

  navigate("/", { replace: true });

  setTimeout(() => {
    window.location.reload();
  }, 50);
}

  useEffect(() => {
  let timeout;

  const logoutUser = () => {
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("token");
  setUser(null);

  navigate("/login", { replace: true });

  setTimeout(() => {
    window.location.reload();
  }, 50);
};

  const resetTimer = () => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      alert("ไม่มีการใช้งานเกิน 30 นาที ระบบจะออกจากระบบอัตโนมัติ");
      logoutUser();
    }, 30 * 60 * 1000);
  };

  const events = ["mousemove", "keydown", "click", "scroll"];

  events.forEach((event) => {
    window.addEventListener(event, resetTimer);
  });

  resetTimer();

  return () => {
    clearTimeout(timeout);

    events.forEach((event) => {
      window.removeEventListener(event, resetTimer);
    });
  };
}, [navigate]);

  return (
    <>
      {/* ===== Navbar (ไม่แสดงใน Admin) ===== */}
      {!isAdminPage && <NavBar user={user} onLogout={handleLogout} />}

      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/"  element={
    <div style={{width:"100%"}}>
      <Home />
    </div>
  } />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/staff" element={<StaffPage />} />
        {/* ================= PARENT ================= */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute role="parent">
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-children"
          element={
            <ProtectedRoute role="parent">
              <Children />
            </ProtectedRoute>
          }
        />

        <Route
          path="/children/:id"
          element={
            <ProtectedRoute role="parent">
              <ChildDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent/children/:childId/evaluation"
          element={
            <ProtectedRoute role="parent">
              <DevelopmentAssessment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/enroll"
          element={
            <ProtectedRoute role="parent">
              <Enrollment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/enrollment-status"
          element={
            <ProtectedRoute role="parent">
              <EnrollmentStatus />
            </ProtectedRoute>
          }
        />

        <Route
          path="/enrollments/my"
          element={
            <ProtectedRoute role="parent">
              <MyEnrollment />
            </ProtectedRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* ================= TEACHER ================= */}
        <Route
  path="/teacher/children"
  element={
    <ProtectedRoute role="teacher">
      <TeacherLayout>
        <ChildrenInClass />
      </TeacherLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/teacher/evaluation/:childId"
  element={
    <ProtectedRoute role="teacher">
      <TeacherLayout>
        <DevelopmentAssessment />
      </TeacherLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/teacher/checkin"
  element={
    <ProtectedRoute role="teacher">
      <TeacherLayout>
        <CheckinPage />
      </TeacherLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/teacher/measurements"
  element={
    <ProtectedRoute role="teacher">
      <TeacherLayout>
        <MeasurementsPage />
      </TeacherLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/teacher/health"
  element={
    <ProtectedRoute role="teacher">
      <TeacherLayout>
        <HealthPage />
      </TeacherLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/teacher/brushings"
  element={
    <ProtectedRoute role="teacher">
      <TeacherLayout>
        <BrushingsPage />
      </TeacherLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/teacher/lunch-eating"
  element={
    <ProtectedRoute role="teacher">
      <TeacherLayout>
        <LunchEating />
      </TeacherLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/teacher/milk"
  element={
    <ProtectedRoute role="teacher">
      <TeacherLayout>
        <MilkPage />
      </TeacherLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/teacher/daily-menu"
  element={
    <ProtectedRoute role="teacher">
      <TeacherLayout>
        <TeacherDailyMenu />
      </TeacherLayout>
    </ProtectedRoute>
  }
/>

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />

          {/* 👇 จัดการผู้ใช้ */}
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserProfile />} />

          {/* ครู */}
          <Route path="teachers/create" element={<AdminTeacherCreate />} />
          <Route path="/admin/academic-year" element={<AcademicYear />} />

          {/* อื่น ๆ */}
          <Route path="centers" element={<AdminCenters />} />
          <Route path="classrooms" element={<AdminClassrooms />} />
          <Route path="children-count" element={<ChildrenCount />} />

          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="announcements/new" element={<AnnouncementForm />} />
          <Route path="announcements/:id" element={<AnnouncementDetail />} />
          <Route path="announcements/:id/edit" element={<AnnouncementForm />} />

          <Route path="enrollments" element={<AdminEnrollments />} />
          <Route path="enrollments/:id" element={<AdminEnrollmentDetail />} />
          <Route path="enrollments/:id/edit" element={<AdminEnrollmentEdit />} />

          <Route path="daily-menu" element={<AdminDailyMenu />} />
          <Route path="development" element={<AdminDevelopmentList />} />
          <Route path="development/:id" element={<AdminDevelopmentDetail />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="students/:id/edit" element={<AdminStudentEdit />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
