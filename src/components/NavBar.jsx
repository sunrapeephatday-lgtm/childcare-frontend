import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API, { setAuthToken } from '../api/api';
import {
  User,
  UserCircle,
  LogOut,
  GraduationCap,
  Users,
} from "lucide-react";
import "../styles/NavBar.css";

export default function NavBar({ user, onLogout }) {
  const navigate = useNavigate();
  const role = user?.role || null;

  function handleUserLogout() {
    try {
      setAuthToken && setAuthToken(null);
    } catch (e) {}

    if (onLogout) {
      onLogout();
    }
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light navbar-custom">
      <div className="container-fluid px-3 d-flex align-items-center justify-content-between flex-nowrap">

        {/* LEFT */}
        {role === "parent" || !user ? (
          <Link to="/" className="logo-link d-flex align-items-center text-decoration-none">
            <img src="/images/logo1.png" alt="โลโก้" className="nav-logo" />
            <span className="brand-text ms-2">
              ระบบจัดการศูนย์พัฒนาเด็กเล็ก
            </span>
          </Link>
        ) : (
          <div className="logo-link d-flex align-items-center text-decoration-none">
            <img src="/images/logo1.png" alt="โลโก้" className="nav-logo" />
            <span className="brand-text ms-2">
              ระบบจัดการศูนย์พัฒนาเด็กเล็ก
            </span>
          </div>
        )}

        {/* TOGGLER */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* MENU */}
        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav ms-auto align-items-center">

            {!user && (
              <>
                <li className="nav-item">
                  <Link className="btn" to="/login">เข้าสู่ระบบ</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn" to="/register">สมัครสมาชิก</Link>
                </li>
              </>
            )}

            {user && role === 'parent' && (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link d-flex align-items-center gap-2"
                    to="#"
                    onClick={async (e) => {
                      e.preventDefault();

                      const token = sessionStorage.getItem("token");

                      if (!token) {
                        navigate("/login");
                        return;
                      }

                      try {
                        const res = await API.get("/enrollments/my");
                        const enrollment = res.data;

                        if (enrollment?.status === "pending") {
                          alert("คุณมีใบสมัครที่กำลังรอพิจารณาอยู่");
                          navigate("/");
                          return;
                        }

                        if (enrollment?.status === "approved") {
                          const ok = window.confirm(
                            "คุณเคยสมัครเรียนแล้ว ต้องการสมัครบุตรหลานเพิ่มหรือไม่?"
                          );

                          if (!ok) {
                            navigate("/");
                            return;
                          }
                        }

                        navigate("/enroll");
                      } catch (err) {
                        navigate("/enroll");
                      }
                    }}
                  >
                    <GraduationCap size={18} />
                    <span>สมัครเรียน</span>
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className="nav-link d-flex align-items-center gap-2"
                    to="/my-children"
                  >
                    <Users size={18} />
                    <span>ข้อมูลบุตรหลาน</span>
                  </Link>
                </li>

                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle d-flex align-items-center gap-2"
                    href="#!"
                    data-bs-toggle="dropdown"
                  >
                    <User size={16} />
                    <span>สวัสดี, {user.username}</span>
                  </a>

                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center gap-2"
                        onClick={() => navigate('/profile')}
                      >
                        <UserCircle size={16} />
                        <span>โปรไฟล์</span>
                      </button>
                    </li>

                    <li><hr className="dropdown-divider" /></li>

                    <li>
                      <button
                        className="dropdown-item text-danger d-flex align-items-center gap-2"
                        onClick={handleUserLogout}
                      >
                        <LogOut size={16} />
                        <span>ออกจากระบบ</span>
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            )}

            {user && role === 'teacher' && (
              <>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle d-flex align-items-center gap-2"
                    href="#!"
                    data-bs-toggle="dropdown"
                  >
                    <User size={16} />
                    <span>{user.username}</span>
                  </a>

                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center gap-2"
                        onClick={() => navigate('/profile')}
                      >
                        <UserCircle size={16} />
                        <span>โปรไฟล์</span>
                      </button>
                    </li>

                    <li><hr className="dropdown-divider" /></li>

                    <li>
                      <button
                        className="dropdown-item text-danger d-flex align-items-center gap-2"
                        onClick={handleUserLogout}
                      >
                        <LogOut size={16} />
                        <span>ออกจากระบบ</span>
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            )}

            {user && role === 'admin' && (
              <>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle d-flex align-items-center gap-2"
                    href="#!"
                    data-bs-toggle="dropdown"
                  >
                    <User size={16} />
                    <span>{user.username}</span>
                  </a>

                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center gap-2"
                        onClick={() => navigate('/profile')}
                      >
                        <UserCircle size={16} />
                        <span>โปรไฟล์</span>
                      </button>
                    </li>

                    <li><hr className="dropdown-divider" /></li>

                    <li>
                      <button
                        className="dropdown-item text-danger d-flex align-items-center gap-2"
                        onClick={handleUserLogout}
                      >
                        <LogOut size={16} />
                        <span>ออกจากระบบ</span>
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
}