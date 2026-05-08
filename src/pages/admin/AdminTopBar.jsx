import React from "react";
import { User, UserCircle, LogOut, Menu, X } from "lucide-react";

export default function AdminTopBar({
  user,
  onLogout,
  onMenu,
  sidebarOpen
}) {
  return (
    <div className="admin-topbar">
      <div className="topbar-title d-flex align-items-center gap-2">
        <img
          src="/images/logo1.png"
          alt="logo"
          style={{
            width: "34px",
            height: "34px",
            objectFit: "contain"
          }}
        />
        <span>ระบบจัดการศูนย์เด็กเล็ก</span>
      </div>

      <div className="dropdown topbar-user">
  <button
  className="dropdown-toggle user-menu-toggle"
  type="button"
  data-bs-toggle="dropdown"
>
  <Menu size={24} />
</button>

  <ul className="dropdown-menu dropdown-menu-end">
    <li>
      <button className="dropdown-item d-flex align-items-center gap-2">
        <UserCircle size={16} />
        <span>โปรไฟล์</span>
      </button>
    </li>

    <li>
      <hr className="dropdown-divider" />
    </li>

    <li>
      <button
        className="dropdown-item text-danger d-flex align-items-center gap-2"
        onClick={onLogout}
      >
        <LogOut size={16} />
        <span>ออกจากระบบ</span>
      </button>
    </li>
  </ul>
</div>
      {/* ปุ่มลอยมุมล่างซ้าย */}
      <button className="floating-menu-btn" onClick={onMenu}>
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </div>
  );
}