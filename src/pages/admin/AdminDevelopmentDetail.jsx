// src/pages/admin/AdminDevelopmentDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";

export default function AdminDevelopmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await API.get(`/admin/development/${id}`);
    setAssessment(res.data.assessment);
    setItems(res.data.results);
  }

  function levelBadge(level) {
    if (level === 3) return <span className="badge bg-success">3</span>;
    if (level === 2) return <span className="badge bg-warning text-dark">2</span>;
    return <span className="badge bg-danger">1</span>;
  }

  if (!assessment) return null;

  return (
    <div className="container-fluid">

      {/* 🔵 ปุ่มกลับ */}
      <div className="mb-3">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/admin/development")}
        >
          ← ย้อนกลับ
        </button>
      </div>

      <h4 className="mb-3">รายละเอียดผลประเมินพัฒนาการเด็ก</h4>

      {/* ===== Summary ===== */}
      <div className="mb-4">
        <div>
          <strong>วันที่ประเมิน:</strong>{" "}
          {new Date(assessment.assessment_date).toLocaleDateString("th-TH")}
        </div>

        <div>
          <strong>คะแนนรวม:</strong> {assessment.total_score} / 40
        </div>

        <div>
          <strong>ระดับพัฒนาการ:</strong>{" "}
          <span className="fw-bold">{assessment.result_level}</span>
        </div>
      </div>

      {/* ===== Detail Table ===== */}
      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-light text-center">
            <tr>
              <th style={{ width: 70 }}>ข้อ</th>
              <th>รายการประเมิน</th>
              <th style={{ width: 120 }}>ระดับ</th>
            </tr>
          </thead>

          <tbody>
            {items.map((it) => (
              <tr key={it.item_no}>
                <td className="text-center">{it.item_no}</td>
                <td>{it.description}</td>
                <td className="text-center">{levelBadge(it.level_id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Legend ===== */}
      <div className="mt-3 text-muted">
        <strong>เกณฑ์การประเมิน:</strong>{" "}
        <span className="badge bg-success ms-2">3</span> ทำได้สม่ำเสมอ
        <span className="badge bg-warning text-dark ms-3">2</span> ทำได้บางครั้ง
        <span className="badge bg-danger ms-3">1</span> ยังทำไม่ได้
      </div>

    </div>
  );
}
