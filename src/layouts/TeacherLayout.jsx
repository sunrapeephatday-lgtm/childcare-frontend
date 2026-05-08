import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Users,
  ClipboardList,
  UtensilsCrossed,
  Activity,
  UserCog,
  School,
  GraduationCap,
  Building2,
  Menu,
  X,
} from "lucide-react";
import "../styles/TeacherLayout.css";

export default function TeacherLayout({ children }) {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    "teacher-link" + (isActive ? " active" : "");

  return (
    <>

      {open && (
        <div
          className="teacher-sidebar-overlay"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="teacher-layout">
        <button
          className="teacher-sidebar-toggle d-lg-none"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        <aside className={`teacher-sidebar ${open ? "open" : ""}`}>

          <NavLink
  to="/teacher/children"
  className={linkClass}
  onClick={() => setOpen(false)}
>
  <Users size={18} />
  <span>ข้อมูลนักเรียนในห้อง</span>
</NavLink>

<NavLink
  to="/teacher/daily-menu"
  className={linkClass}
  onClick={() => setOpen(false)}
>
  <UtensilsCrossed size={18} />
  <span>จัดทำรายการเมนูอาหาร</span>
</NavLink>

<NavLink
  to="/teacher/checkin"
  className={linkClass}
  onClick={() => setOpen(false)}
>
  <ClipboardList size={18} />
  <span>บันทึกเช็คชื่อการมาเรียน</span>
</NavLink>

<NavLink
  to="/teacher/measurements"
  className={linkClass}
  onClick={() => setOpen(false)}
>
  <Activity size={18} />
  <span>บันทึกน้ำหนักและส่วนสูง</span>
</NavLink>

<NavLink
  to="/teacher/health"
  className={linkClass}
  onClick={() => setOpen(false)}
>
  <UserCog size={18} />
  <span>บันทึกสุขภาพ</span>
</NavLink>

<NavLink
  to="/teacher/brushings"
  className={linkClass}
  onClick={() => setOpen(false)}
>
  <School size={18} />
  <span>บันทึกการแปรงฟัน</span>
</NavLink>

<NavLink
  to="/teacher/milk"
  className={linkClass}
  onClick={() => setOpen(false)}
>
  <GraduationCap size={18} />
  <span>บันทึกการดื่มนม</span>
</NavLink>

<NavLink
  to="/teacher/lunch-eating"
  className={linkClass}
  onClick={() => setOpen(false)}
>
  <Building2 size={18} />
  <span>บันทึกการรับประทานอาหารกลางวัน</span>
</NavLink>
        </aside>

        <main className="teacher-content">{children}</main>
      </div>
    </>
  );
}