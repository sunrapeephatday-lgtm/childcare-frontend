// src/pages/admin/AdminDevelopmentList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/api";

export default function AdminDevelopmentList() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await API.get("/admin/development");
    setRows(res.data || []);
  }

  return (
    <div className="container-fluid">

      <h5 className="mb-3 fw-bold text-success section-title">ผลการประเมินพัฒนาการเด็ก</h5>

      {/* 🔴 จุดสำคัญที่สุด — wrapper */}
      <div className="table-responsive">

        <table className="table table-bordered align-middle">
          <thead className="table-light text-center">
            <tr>
              <th style={{ minWidth: 130 }}>วันที่ประเมิน</th>
              <th style={{ minWidth: 120 }}>ชื่อ-นามสกุล</th>
              <th style={{ minWidth: 120 }}>คะแนนรวม</th>
              <th style={{ minWidth: 180 }}>ระดับพัฒนาการ</th>
              <th style={{ minWidth: 120 }}>การจัดการ</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.assessment_id}>

                <td className="text-center">
                  {new Date(r.assessment_date).toLocaleDateString("th-TH")}
                </td>

                <td className="text-start ps-3">
                  {r.prefix}{r.first_name} {r.last_name}
                </td>

                <td className="text-center fw-bold">
  {r.total_score} / 40 
</td>

                <td className="text-center">
                  <span
                    className={
                      r.result_level === "สมวัย"
                        ? "badge bg-success"
                        : r.result_level === "ควรส่งเสริมเพิ่มเติม"
                        ? "badge bg-warning text-dark"
                        : "badge bg-danger"
                    }
                  >
                    {r.result_level}
                  </span>
                </td>

                <td className="text-center">
                  <Link
                    to={`/admin/development/${r.assessment_id}`}
                    className="btn btn-sm btn-outline-primary"
                  >
                    ดูรายละเอียด
                  </Link>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}
