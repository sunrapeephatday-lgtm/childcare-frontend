// src/pages/AdminEnrollments.jsx
import React, { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

/* ================= คำนวณระดับชั้นจริง ================= */
function calculateApplyLevel(birthDate) {
  if (!birthDate) return "-";

  const birth = new Date(birthDate);

  const now = new Date();
  let thaiYear = now.getFullYear() + 543;

  // ก่อน พ.ค. = ยังเป็นปีการศึกษาเดิม
  if (now.getMonth() < 4) thaiYear--;

  const cutoff = new Date(thaiYear - 543, 4, 16);

  let age = cutoff.getFullYear() - birth.getFullYear();
  const m = cutoff.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && cutoff.getDate() < birth.getDate())) {
    age--;
  }

  return age < 3 ? "ต่ำกว่า 3 ปี" : "อายุ 3 ปี";
}

export default function AdminEnrollments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await API.get("/enrollments");
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setMsg({
        type: "danger",
        text: err?.response?.data?.error || "โหลดข้อมูลไม่สำเร็จ",
      });
    } finally {
      setLoading(false);
    }
  }

  function renderStatus(status) {
    if (status === "pending") return "รอพิจารณา";
    if (status === "approved") return "รับเข้าแล้ว";
    if (status === "rejected") return "ไม่รับเข้า";
    return status;
  }

  function badgeClass(status) {
    if (status === "pending") return "bg-warning";
    if (status === "approved") return "bg-success";
    if (status === "rejected") return "bg-danger";
    return "bg-secondary";
  }

  return (
    <div className="container my-4">

      {/* header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-3 fw-bold text-success section-title">จัดการการสมัครเรียน</h5>

        <div className="d-flex gap-2">
      
          <button
            className="btn btn-outline-secondary"
            onClick={load}
            disabled={loading}
          >
            {loading ? "กำลังโหลด..." : "รีเฟรช"}
          </button>
        </div>
      </div>

      {/* alert */}
      {msg && (
        <div className={`alert alert-${msg.type || "info"}`}>
          {msg.text}
        </div>
      )}

      {/* table */}
      <div className="table-responsive">
        <table  className="table table-striped table-sm align-middle" style={{ fontSize: "14px" }}>
          <thead>
            <tr>
              <th>ลำดับ</th>
              <th>ชื่อ-นามสกุล</th>
              <th>ชั้นที่สมัคร</th>
              <th>ห้อง</th>
              <th>เบอร์ติดต่อ</th>
              <th>วันที่สมัคร</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={8} className="text-center">
                  ไม่มีข้อมูล
                </td>
              </tr>
            )}

            {rows.map((r, idx) => {
              let data = {};
              try {
                data =
                  typeof r.extra_json === "string"
                    ? JSON.parse(r.extra_json)
                    : r.extra_json || {};
              } catch {
                data = {};
              }

              return (
                <tr key={r.enrollment_id}>
                  <td>{idx + 1}</td>

                  <td className="text-start ps-3">
                      {data.prefix}{data.first_name} {data.last_name}
                  </td>

                  {/* ⭐ ใช้คำนวณจริง */}
                  <td>
                    {data.apply_level
                      ? data.apply_level.includes("อายุ")
                        ? data.apply_level
                        : "อายุ" + data.apply_level
                      : "-"}
                  </td>

                  <td>
                    {r.status === "rejected"
                      ? "ไม่รับเข้า"
                      : r.classroom_name
                      ? r.classroom_name
                      : r.status === "pending"
                      ? "รอพิจารณา"
                      : "-"}
                  </td>

                  <td>
                    {data.mother_phone ||
                      data.father_phone ||
                      data.sender_phone ||
                      "-"}
                  </td>

                  <td>
                    {r.created_at
                      ? new Date(r.created_at).toLocaleDateString("th-TH")
                      : "-"}
                  </td>

                  <td>
                    <span className={`badge ${badgeClass(r.status)}`}>
                      {renderStatus(r.status)}
                    </span>
                  </td>

                  <td className="d-flex gap-1">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() =>
                        navigate(`/admin/enrollments/${r.enrollment_id}`)
                      }
                    >
                      รายละเอียด
                    </button>

                    {r.status === "pending" && (
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() =>
                          navigate(
                            `/admin/enrollments/${r.enrollment_id}/edit`
                          )
                        }
                      >
                        แก้ไข
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}