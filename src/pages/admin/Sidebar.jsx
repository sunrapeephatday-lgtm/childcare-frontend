// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="logo">ศูนย์เด็กเล็ก</h2>

      <nav>
        <NavLink to="/admin">Dashboard</NavLink>

        <NavLink to="/admin/children">
          ข้อมูลเด็ก
        </NavLink>

        {/* แก้ตรงนี้ */}
        <NavLink to="/admin/teachers/create">
          ครู / บุคลากร
        </NavLink>

        <NavLink to="/admin/classrooms">
          ข้อมูลห้องเรียน
        </NavLink>

        <NavLink to="/admin/enrollments">
          สมัครเข้าเรียน
        </NavLink>

        <NavLink to="/admin/development">
          ผลประเมินพัฒนาการ
        </NavLink>

        <NavLink to="/admin/announcements">
          ประกาศ
        </NavLink>

        <NavLink to="/admin/daily-menu">
          เมนูอาหาร
        </NavLink>
      </nav>
    </aside>
  );
}
