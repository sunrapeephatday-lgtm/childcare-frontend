import React, { useEffect, useState } from "react";
import API from "../../api/api";

const PAGE_SIZE = 10;

export default function AdminCenters() {
  const [rows, setRows] = useState([]);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    school_id: "",
    name: "",
    district: "",
    province: "",
    phone: "",
    email: "",
    LGO: "",
    ORG_code: ""
  });

  useEffect(() => {
    load();
  }, []);

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
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  async function load() {
    const res = await API.get("/centers");
    setRows(res.data);
  }

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit() {
    if (editId) {
      await API.put(`/centers/${editId}`, form);
    } else {
      await API.post("/centers", form);
    }
    reset();
    load();
  }

  function edit(row) {
  setEditId(row.center_id);

  setForm({
    school_id: row.school_id || "",
    name: row.name || "",
    district: row.district || "",
    province: row.province || "",
    phone: row.phone || "",
    email: row.email || "",
    LGO: row.LGO || "",
    ORG_code: row.ORG_code || ""
  });
}

  async function del(id) {
    if (!window.confirm("ยืนยันการลบศูนย์พัฒนาเด็กเล็กนี้?")) return;
    await API.delete(`/centers/${id}`);
    load();
  }

  function reset() {
    setEditId(null);
    setForm({
      school_id: "",
      name: "",
      district: "",
      province: "",
      phone: "",
      email: "",
      LGO: "",
      ORG_code: ""
    });
  }

  return (
  <div>
    <h5 className="mb-3 fw-bold text-success section-title">จัดการศูนย์เด็กเล็ก</h5>

    {/* ===== FORM ===== */}
    <div className="row g-2 mb-3">
    {Object.keys(form).map(k => {
  const labels = {
    school_id: "รหัสโรงเรียน",
    name: "ชื่อศูนย์",
    district: "อำเภอ",
    province: "จังหวัด",
    phone: "เบอร์โทรศัพท์",
    email: "อีเมล",
    LGO: "สังกัด",
    ORG_code: "รหัสองค์กร"
  };

  return (
    <div className="col-12 col-md-3" key={k}>
      <label className="form-label ">
        {labels[k]}
      </label>

      <input
        name={k}
        value={form[k] || ""}
        onChange={onChange}
        className="form-control"
      />
    </div>
  );
})}

      {/* 🔥 ปุ่มย้ายมาล่าง */}
      <div className="col-12 d-flex justify-content-start gap-2 mt-3">
        <button className="btn btn-success px-5" onClick={submit}>
          {editId ? "บันทึก" : "เพิ่ม"}
        </button>

        {editId && (
          <button
            className="btn btn-outline-secondary px-4"
            onClick={reset}
          >
            ยกเลิก
          </button>
        )}
      </div>
    </div>

    {/* ===== TABLE (ตัวที่ต้องครอบ) ===== */}
    <h5 className="mt-4 mb-3 fw-bold text-success section-title">จำนวนศูนย์เด็กเล็ก</h5>
    <div className="table-responsive">
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>ชื่อศูนย์เด็กเล็ก</th>
            <th>อำเภอ</th>
            <th>จังหวัด</th>
            <th>เบอร์โทรศัพท์</th>
            <th>อีเมล</th>
            <th>สังกัด</th>
            <th>รหัสองค์กร</th>
            <th>การจัดการ </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan="8" className="text-center py-4">
                ยังไม่มีข้อมูล
              </td>
            </tr>
          )}

          {paginatedRows.map(r => (
            <tr key={r.center_id}>
              <td className="text-start ps-3">{r.name}</td>
              <td className="text-start ps-3">{r.district}</td>
              <td className="text-start ps-3">{r.province}</td>
              <td className="text-start ps-3">{r.phone}</td>
              <td className="text-start ps-3">{r.email}</td>
              <td className="text-start ps-3">{r.LGO}</td>
              <td>{r.ORG_code}</td>
              <td>
                <button className="btn btn-sm btn-outline-orange me-2" onClick={() => edit(r)}>แก้</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => del(r.center_id)}>ลบ</button>
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

        <nav aria-label="Center pagination">
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

            {pageNumbers.map((page, index) => {
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
