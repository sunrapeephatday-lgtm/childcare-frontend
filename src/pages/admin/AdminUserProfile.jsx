// src/pages/admin/AdminUserProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";
import "../../styles/Profile.css";

const FILE_BASE = import.meta.env.VITE_API_URL.replace("/api", "");

export default function AdminUserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    loadUser();
    loadAvatar();
  }, [id]);

  async function loadUser() {
    try {
      const res = await API.get(`/admin/users/${id}`);
      setUser(res.data);
    } catch (err) {
      alert("โหลดข้อมูลผู้ใช้ไม่สำเร็จ");
    }
  }

  async function loadAvatar() {
    try {
      const res = await API.get(`/users/${id}/avatar`);
      setAvatar(res.data?.image_url || null);
    } catch {
      setAvatar(null);
    }
  }

  if (!user) return <div className="container">กำลังโหลด...</div>;

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
          ← ย้อนกลับ
        </button>

        {/* รูปโปรไฟล์ */}
        <div className="profile-avatar">
          <img
            src={
              avatar
                ? FILE_BASE + avatar
                : "/images/default-avatar.png"
            }
            alt="avatar"
          />
        </div>

        <h3 className="profile-title">โปรไฟล์ผู้ใช้</h3>

        <div className="profile-info">
          <div>
            <label>User ID</label>
            <span>{user.user_id}</span>
          </div>
          <div>
            <label>Username</label>
            <span>{user.username}</span>
          </div>
          <div>
  <label>ชื่อ</label>
  <span>
    {(user.prefix || "") + (user.first_name || "")} {user.last_name || "-"}
  </span>
</div>
          <div>
            <label>Role</label>
            <span className={`badge role-${user.role}`}>
              {user.role}
            </span>
          </div>
          <div>
            <label>วันที่สมัคร</label>
            <span>
              {new Date(user.created_at).toLocaleDateString("th-TH")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
