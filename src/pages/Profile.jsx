// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import API from "../api/api";
import "../styles/Profile.css";

const FILE_BASE = import.meta.env.VITE_API_URL.replace("/api", "");

export default function Profile() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    loadAvatar();
  }, []);

  async function loadAvatar() {
    try {
      const res = await API.get(`/users/${user.user_id}/avatar`);
      setAvatar(res.data?.image_url || null);
    } catch {
      setAvatar(null);
    }
  }

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
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
            <label>Username</label>
            <span>{user?.username}</span>
          </div>
          <div>
            <label>Role</label>
            <span className={`badge role-${user?.role}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
