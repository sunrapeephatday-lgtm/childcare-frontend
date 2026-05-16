// src/pages/admin/AdminDevelopmentList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/api";

const PAGE_SIZE = 10;

export default function AdminDevelopmentList() {
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedRows = rows.slice(startIndex, startIndex + PAGE_SIZE);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (page) =>
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 2
  );

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
            {rows.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  ยังไม่มีข้อมูล
                </td>
              </tr>
            )}

            {paginatedRows.map((r) => (
              <tr key={r.assessment_id}>

                <td className="text-start ps-3">
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

      {rows.length > PAGE_SIZE && (
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
          <div className="text-muted small">
            แสดง {startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, rows.length)} จาก {rows.length} รายการ
          </div>

          <nav aria-label="Development pagination">
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button
                  type="button"
                  className="page-link"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  ก่อนหน้า
                </button>
              </li>

              {pageNumbers.map((page,index)=>{
                const prevPage = pageNumbers[index - 1];
                const showGap = prevPage && page - prevPage > 1;

                return (
                  <React.Fragment key={page}>
                    {showGap && (
                      <li className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    )}
                    <li className={`page-item ${currentPage === page ? "active" : ""}`}>
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </li>
                  </React.Fragment>
                );
              })}

              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button
                  type="button"
                  className="page-link"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                >
                  ถัดไป
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
