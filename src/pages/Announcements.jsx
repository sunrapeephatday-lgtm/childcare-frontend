// src/pages/Announcements.jsx (ผู้ปกครอง)
import React, { useEffect, useState } from 'react';
import API from '../api/api';
import { Link } from 'react-router-dom';

const FILE_BASE = import.meta.env.VITE_API_URL.replace("/api", "");

const formatThaiDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function Announcements() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('/announcements');
        setRows(res.data.rows || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="container my-4">
      <h3 className="mb-3">ข่าวประชาสัมพันธ์</h3>

      {rows.length === 0 && (
        <div className="text-muted">ไม่พบประกาศ</div>
      )}

      {rows.map(r => (
        <div key={r.announcement_id} className="card mb-3 shadow-sm">
          <div className="card-body d-flex gap-3">

            {/* ===== COVER IMAGE ===== */}
            {r.cover_image && (
              <img
                src={`${API_HOST}${r.cover_image}`}
                alt={r.title || 'announcement'}
                style={{
                  width: 160,
                  height: 120,
                  objectFit: 'cover',
                  borderRadius: 10,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              />
            )}

            {/* ===== CONTENT ===== */}
            <div>
              <h5 className="mb-1">{r.title}</h5>

              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  fontSize: 14,
                  lineHeight: 1.6
                }}
              >
                {r.content}
              </div>

              <p className="news-meta">
                เพิ่มโดย {r.created_by_name || "admin"} • {formatThaiDate(r.created_at)}
              </p>
            </div>

          </div>
        </div>
      ))}

      <div className="mt-3">
        <Link to="/">← กลับหน้าแรก</Link>
      </div>
    </div>
  );
}
