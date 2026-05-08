import React from 'react';
import { Routes, Route } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout';
import ParentLayout from '../layouts/ParentLayout';
import TeacherLayout from '../layouts/TeacherLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';

// pages you already have:
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Announcements from '../pages/Announcements';
import AnnouncementDetail from '../pages/AnnouncementDetail';
import Children from '../pages/Children';
import ChildDetail from '../pages/ChildDetail';

// new pages:
import Enrollment from '../pages/Enrollment';
import MyChildren from '../pages/MyChildren';
import AdminCreateTeacher from '../pages/AdminCreateTeacher';
import TeacherAttendance from '../pages/TeacherAttendance';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/announcements/:id" element={<AnnouncementDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Parent */}
      <Route element={<ProtectedRoute allowedRoles={['parent']}><ParentLayout /></ProtectedRoute>}>
        <Route path="/enroll" element={<Enrollment />} />
        <Route path="/my-children" element={<MyChildren />} />
      </Route>

      {/* Teacher */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']}><TeacherLayout /></ProtectedRoute>}>
        <Route path="/teacher/enrollments" element={<div>Enrollments list (todo)</div>} />
        <Route path="/teacher/classroom" element={<div>Classroom (todo)</div>} />
        <Route path="/teacher/attendance" element={<TeacherAttendance />} />
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
        <Route path="/admin/users" element={<AdminCreateTeacher />} />
        <Route path="/admin/announcements" element={<Announcements />} />
        <Route path="/admin/enrollments" element={<div>All enrollments (todo)</div>} />
        <Route path="/admin/menus" element={<div>Menus (todo)</div>} />
      </Route>

      {/* catchall */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
