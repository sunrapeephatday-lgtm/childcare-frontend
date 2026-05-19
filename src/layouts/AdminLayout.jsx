import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  Building2,
  Megaphone,
  FileText,
  UtensilsCrossed,
  Activity,
} from "lucide-react";
import NavBar from "../components/NavBar";
import "../styles/AdminLayout.css";

export default function AdminLayout() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [open, setOpen] = useState(false);

  function handleLogout() {
    sessionStorage.clear();
    window.location.href = "/login";
  }

  const linkClass = ({ isActive }) =>
    "list-group-item list-group-item-action" +
    (isActive ? " active" : "");

  return (
    <div className="admin-wrapper">

      {/* TOPBAR */}
      <NavBar
        user={user}
        onLogout={handleLogout}
      />

      {/* overlay มือถือ */}
      {open && (
        <div
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="admin-body">

        {/* SIDEBAR */}
        <aside className={`admin-sidebar ${open ? "open" : ""}`}>
          <div className="list-group list-group-flush">
            <NavLink to="/admin" end className={linkClass}>
              <LayoutDashboard size={18} />
              <span>แดชบอร์ด</span>
            </NavLink>

            <NavLink to="/admin/users" className={linkClass}>
              <Users size={18} />
              <span>จัดการผู้ใช้</span>
            </NavLink>

            <NavLink to="/admin/teachers/create" className={linkClass}>
              <GraduationCap size={18} />
              <span>เพิ่มข้อมูลครู</span>
            </NavLink>

            <NavLink to="/admin/classrooms" className={linkClass}>
              <School size={18} />
              <span>ข้อมูลห้องเรียน</span>
            </NavLink>

            <NavLink to="/admin/centers" className={linkClass}>
              <Building2 size={18} />
              <span>ข้อมูลศูนย์เด็กเล็ก</span>
            </NavLink>

            <NavLink to="/admin/announcements" className={linkClass}>
              <Megaphone size={18} />
              <span>ข่าวประกาศ</span>
            </NavLink>

            <NavLink to="/admin/enrollments" className={linkClass}>
              <FileText size={18} />
              <span>สมัครเรียน</span>
            </NavLink>

            <NavLink to="/admin/students" className={linkClass}>
              <Users size={18} />
              <span>จัดการนักเรียน</span>
            </NavLink>

            <NavLink to="/admin/daily-menu" className={linkClass}>
              <UtensilsCrossed size={18} />
              <span>เมนูอาหาร</span>
            </NavLink>

            <NavLink to="/admin/development" className={linkClass}>
              <Activity size={18} />
              <span>พัฒนาการเด็กเล็ก</span>
            </NavLink>
          </div>
        </aside>

        {/* CONTENT */}
               <main className="admin-content">
          <div className="content-card">
            <Outlet />
          </div>
        </main>

        <button
          className="floating-menu-btn"
          onClick={() => setOpen(!open)}
        >
          {open ? "×" : "☰"}
        </button>

      </div>
    </div>
  );
}