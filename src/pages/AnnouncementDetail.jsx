import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { fileUrl } from "./utils/fileUrl";   // ⭐ สำคัญ

export default function AnnouncementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [announcement, setAnnouncement] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    setMsg(null);

    try {
      const res = await API.get(`/announcements/${id}`);

      setAnnouncement(res.data.announcement || null);
      setImages(res.data.images || []);
    } catch (err) {
      console.error("load announcement error:", err);
      setMsg("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("ยืนยันลบประกาศนี้?")) return;

    try {
      await API.delete(`/announcements/${id}`);
      navigate("/admin/announcements");
    } catch (err) {
      console.error(err);
      alert("ลบไม่สำเร็จ");
    }
  }

  // ===== Loading =====
  if (loading)
    return <div className="container my-4">กำลังโหลด...</div>;

  // ===== Not found =====
  if (!announcement)
    return <div className="container my-4">ไม่พบประกาศ</div>;

  // format วันที่
  const createdDate = announcement.created_at
  ? new Date(announcement.created_at).toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  : "-";

  return (
    <div className="container my-4">

      {msg && <div className="alert alert-danger">{msg}</div>}

      {/* ===== Title ===== */}
      <h2>{announcement.title || "ประกาศ"}</h2>
      <div className="text-muted mb-3">
        {createdDate}
      </div>

      {/* ===== GALLERY ===== */}
      {images.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
            marginBottom: 24
          }}
        >
          {images.map(img => (
            <img
              key={img.image_id}
              src={fileUrl(img.image_url)}   // ⭐ ตัวสำคัญที่สุด
              alt="announcement"
              onError={(e)=>{e.target.style.display="none"}}
              style={{
                width: "100%",
                height: 160,
                objectFit: "cover",
                borderRadius: 10,
                boxShadow: "0 6px 18px rgba(0,0,0,0.15)"
              }}
            />
          ))}
        </div>
      )}

      {/* ===== Content ===== */}
      <div style={{ whiteSpace: "pre-wrap", marginBottom: 24 }}>
        {announcement.content}
      </div>

      {/* ===== Buttons ===== */}
      <div className="d-flex flex-wrap gap-2">
        <Link
          to={`/admin/announcements/${id}/edit`}
          className="btn btn-outline-orange"
        >
          แก้ไข
        </Link>

        <button
          className="btn btn-outline-danger"
          onClick={handleDelete}
        >
          ลบ
        </button>

        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
        >
          ย้อนกลับ
        </button>
      </div>
    </div>
  );
}
