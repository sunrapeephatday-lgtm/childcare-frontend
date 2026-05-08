import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";
import { fileUrl } from "../pages/utils/fileUrl";

export default function AnnouncementForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD (EDIT MODE) ================= */
  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      try {
        const res = await API.get(`/announcements/${id}`);
        const a = res.data.announcement;

        setTitle(a.title || "");
        setContent(a.content || "");

        // โหลดรูปเดิม
        if (res.data.images) {
          setPreviewUrls(
            res.data.images.map(img => fileUrl(img.image_url))
          );
        }
      } catch (err) {
        console.error(err);
        setMsg({ type: "danger", text: "โหลดข้อมูลไม่สำเร็จ" });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* ================= FILE CHANGE ================= */
  function onFileChange(e) {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);

    // preview รูปใหม่จากเครื่อง
    setPreviewUrls(files.map(f => URL.createObjectURL(f)));
  }

  /* ================= SUBMIT ================= */
  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    if (!content.trim()) {
      setMsg({ type: "warning", text: "กรุณากรอกเนื้อหา" });
      return;
    }

    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("content", content);

      // แนบหลายรูป
      imageFiles.forEach(f => fd.append("images", f));

      // ผู้สร้าง
      const raw = sessionStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        fd.append("created_by", u.user_id || u.teacher_id || "");
      }

      if (id) {
        await API.put(`/announcements/${id}`, fd);
      } else {
        await API.post("/announcements", fd);
      }

      navigate("/admin/announcements");
    } catch (err) {
      console.error(err);
      setMsg({ type: "danger", text: "บันทึกไม่สำเร็จ" });
    }
  }

  /* ================= RENDER ================= */
  return (
    <div className="container my-4">
      <h3 className="mb-3 fw-bold text-success section-title">{id ? "แก้ไขประกาศ" : "สร้างประกาศใหม่"}</h3>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <form onSubmit={handleSubmit}>
        {/* หัวข้อ */}
        <input
          className="form-control mb-2"
          placeholder="หัวข้อ (ถ้ามี)"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        {/* เนื้อหา */}
        <textarea
          className="form-control mb-2"
          rows={6}
          placeholder="เนื้อหา"
          value={content}
          onChange={e => setContent(e.target.value)}
        />

        {/* รูป */}
        <label className="form-label">รูปประกอบ (เลือกได้หลายรูป)</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={onFileChange}
          className="form-control"
        />

        {/* ===== PREVIEW ===== */}
        {previewUrls.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px,1fr))",
              gap: 10,
              marginTop: 12
            }}
          >
            {previewUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt="preview"
                style={{
                  width: "100%",
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 8
                }}
              />
            ))}
          </div>
        )}

        {/* ปุ่ม */}
        <div className="d-flex flex-wrap gap-3 mt-3">
          <button className="btn btn-outline-success" disabled={loading}>
            {loading ? "กำลังบันทึก..." : "บันทึก"}
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate("/admin/announcements")}
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
}
