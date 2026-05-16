// src/pages/AdminUsers.jsx
import React, { useEffect, useState } from "react";
import API from "../../api/api";
import "../../styles/AdminLayout.css";
import "../../styles/admin.css";

const PAGE_SIZE = 10;

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [centers, setCenters] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [form, setForm] = useState({
    center_id: "",
    email: "",
    username: "",
    password: "",
    prefix: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "teacher",
  });
  const [editId, setEditId] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const currentUser = JSON.parse(sessionStorage.getItem("user"));
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedRows = rows.slice(startIndex, startIndex + PAGE_SIZE);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (page) =>
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 2
  );

  async function load() {
    setLoading(true);
    setAlert(null);
    try {
      const res = await API.get("/admin/users");
      setRows(res.data.rows || []);
    } catch (err) {
      console.error("load users err", err);
      const text = err?.response?.data?.error || err?.message || "โหลดข้อมูลล้มเหลว";
      setAlert({ type: "danger", text });
    } finally {
      setLoading(false);
    }
  }

  async function loadCenters() {
    try {
      const res = await API.get("/admin/users/centers/list");
      setCenters(res.data.rows || []);
    } catch (e) {
      console.error("load centers err", e);
    }
  }

  async function loadClassrooms(centerId) {
    try {
      if (!centerId) {
        setClassrooms([]);
        return;
      }
      const res = await API.get(`/classrooms/center/${centerId}`);
      setClassrooms(res.data.rows || []);
    } catch (e) {
      console.error("load classrooms err", e);
      setClassrooms([]);
    }
  }

  useEffect(() => {
    load();
    loadCenters();
  }, []);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function openCreate() {
    setModalMode("create");
    setForm({
      center_id: "",
      email: "",
      username: "",
      password: "",
      prefix: "",
      first_name: "",
      last_name: "",
      phone: "",
      role: "teacher",
    });
    setEditId(null);
    setAvatarFile(null);
    setShowModal(true);
  }

  function openEdit(user) {
    setModalMode("edit");
    setForm({
      center_id: user.center_id || "",
      classroom_id: user.classroom_id || "",
      email: user.email || "",
      username: user.username || "",
      password: "",
      prefix: user.prefix || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone: user.phone || "",
      role: user.role || "teacher",
      parent_id: user.parent_id || "",
    });
    if (user.center_id) {
      loadClassrooms(user.center_id);
    }
    setEditId(user.user_id);
    setAvatarFile(null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditId(null);
    setForm({
      center_id: "",
      email: "",
      username: "",
      password: "",
      prefix: "",
      first_name: "",
      last_name: "",
      phone: "",
      role: "teacher",
    });
    setAvatarFile(null);
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === "center_id") {
      loadClassrooms(value);
    }
  }

  async function submitCreate(e) {
    e.preventDefault();
    setAlert(null);
    try {
      const res = await API.post("/admin/users", {
        center_id: form.center_id,
        classroom_id: form.classroom_id,
        email: form.email,
        username: form.username,
        password: form.password,
        prefix: form.prefix,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        role: form.role,
      });

      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        await API.post(`/admin/users/${res.data.user_id}/avatar`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setAlert({ type: "success", text: "สร้างผู้ใช้เรียบร้อย" });
      closeModal();
      load();
    } catch (err) {
      console.error(err);
      setAlert({
        type: "danger",
        text: err?.response?.data?.error || "สร้างผู้ใช้ล้มเหลว",
      });
    }
  }

  async function submitEdit(e) {
    e.preventDefault();
    if (!editId) return;
    setAlert(null);
    try {
      await API.put(`/admin/users/${editId}`, {
        center_id: form.center_id,
        classroom_id: form.classroom_id,
        email: form.email,
        username: form.username,
        password: form.password,
        prefix: form.prefix,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        role: form.role,
      });

      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        await API.post(`/admin/users/${editId}/avatar`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setAlert({ type: "success", text: "แก้ไขผู้ใช้เรียบร้อย" });
      closeModal();
      load();
    } catch (err) {
      console.error(err);
      setAlert({
        type: "danger",
        text: err?.response?.data?.error || "แก้ไขผู้ใช้ล้มเหลว",
      });
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("ยืนยันลบผู้ใช้นี้?")) return;
    setAlert(null);
    try {
      await API.delete(`/admin/users/${id}`);
      setAlert({ type: "success", text: "ลบผู้ใช้เรียบร้อย" });
      load();
    } catch (err) {
      console.error(err);
      setAlert({
        type: "danger",
        text: err?.response?.data?.error || "ลบผู้ใช้ล้มเหลว",
      });
    }
  }

  function renderRole(role) {
    const map = {
      admin: "bg-danger",
      teacher: "bg-success",
      parent: "bg-secondary",
    };
    return <span className={`badge ${map[role] || "bg-secondary"}`}>{role}</span>;
  }

  return (
    <div className="container my-4">
      <h5 className="mb-3 fw-bold text-success section-title">
        จัดการผู้ใช้
      </h5>

      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible`}>
          {alert.text}
          <button
            type="button"
            className="btn-close"
            onClick={() => setAlert(null)}
          />
        </div>
      )}

      <div className="mb-3 d-flex justify-content-between align-items-center">
        <button className="btn btn-primary" onClick={openCreate}>
          + สร้างผู้ใช้
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={load}
          disabled={loading}
        >
          {loading ? "กำลังโหลด..." : "รีโหลด"}
        </button>
      </div>

      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover table-sm mb-0"style={{ fontSize: "14px" }}>
            <thead className="table-light">
              <tr>
                <th style={{ width: 60 }}>ลำดับ</th>
                <th style={{ width: 150 }}>Username</th>
                <th style={{ width: 120 }}>ชื่อ-นามสกุล</th>
                <th style={{ width: 120 }}>Role</th>
                <th style={{ width: 120 }}>วันที่สมัคร</th>
                <th style={{ width: 180 }}>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    ไม่มีผู้ใช้
                  </td>
                </tr>
              )}
              {paginatedRows.map((r, idx) => {
                const isSelf = r.user_id === currentUser?.user_id;
                return (
                  <tr key={r.user_id}>
                    <td>{startIndex + idx + 1}</td>
                    <td className="text-start ps-3">
                      {r.username}
                      {isSelf && (
                        <div className="text-muted small">
                          (บัญชีปัจจุบัน)
                        </div>
                      )}
                    </td>
                    <td className="text-start ps-3">
                        {`${r.prefix || ""}${r.first_name || ""} ${r.last_name || ""}`.trim() || "-"}
                    </td>
                    <td>{renderRole(r.role)}</td>
                    <td>
                      {new Date(r.created_at).toLocaleDateString("th-TH", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td style={{ width: 180, whiteSpace: "nowrap" }}>
                     <a
  href={`/admin/users/${r.user_id}`}
  className="btn btn-sm btn-outline-info me-1"
>
  โปรไฟล์
</a>

<button
  className="btn btn-sm btn-outline-orange me-1"
  onClick={() => openEdit(r)}
  disabled={isSelf}
>
  แก้ไข
</button>

<button
  className="btn btn-sm btn-outline-danger"
  onClick={() => handleDelete(r.user_id)}
  disabled={isSelf}
>
  ลบ
</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {rows.length > PAGE_SIZE && (
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
          <div className="text-muted small">
            แสดง {startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, rows.length)} จาก {rows.length} รายการ
          </div>

          <nav aria-label="User pagination">
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

      {/* Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <form
                onSubmit={modalMode === "create" ? submitCreate : submitEdit}
              >
                <div className="modal-header">
                  <h5 className="modal-title">
                    {modalMode === "create"
                      ? "สร้างผู้ใช้ใหม่"
                      : `แก้ไขผู้ใช้ ${editId}`}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                  />
                </div>

                <div
                  className="modal-body"
                  style={{ maxHeight: "60vh", overflowY: "auto" }}
                >
                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label">ศูนย์</label>
                      <select
                        className="form-select"
                        name="center_id"
                        value={form.center_id}
                        onChange={onChange}
                        required
                      >
                        <option value="">-- เลือกศูนย์ --</option>
                        {centers.map((c) => (
                          <option key={c.center_id} value={c.center_id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">ห้องเรียน</label>
                      <select
                        className="form-select"
                        name="classroom_id"
                        value={form.classroom_id}
                        onChange={onChange}
                      >
                        <option value="">-- เลือกห้องเรียน --</option>
                        {classrooms.map((c) => (
                          <option key={c.classroom_id} value={c.classroom_id}>
                            {c.classroom_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        className="form-control"
                        name="email"
                        value={form.email}
                        onChange={onChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">คำนำหน้า</label>
                      <select
                        className="form-select"
                        name="prefix"
                        value={form.prefix}
                        onChange={onChange}
                      >
                        <option value="">-- เลือกคำนำหน้า --</option>
                        <option value="นาย">นาย</option>
                        <option value="นาง">นาง</option>
                        <option value="นางสาว">นางสาว</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">ชื่อ</label>
                      <input
                        className="form-control"
                        name="first_name"
                        value={form.first_name}
                        onChange={onChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">นามสกุล</label>
                      <input
                        className="form-control"
                        name="last_name"
                        value={form.last_name}
                        onChange={onChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">เบอร์โทร</label>
                      <input
                        className="form-control"
                        name="phone"
                        value={form.phone}
                        onChange={onChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Username</label>
                      <input
                        className="form-control"
                        name="username"
                        value={form.username}
                        onChange={onChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label">
                      Password
                      {modalMode === "edit" && " (กรอกเฉพาะถ้าต้องการเปลี่ยน)"}
                    </label>
                    <input
                      className="form-control"
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={onChange}
                      minLength={modalMode === "create" ? 6 : undefined}
                      required={modalMode === "create"}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      name="role"
                      value={form.role}
                      onChange={onChange}
                    >
                      <option value="admin">admin</option>
                      <option value="teacher">teacher</option>
                      <option value="parent">parent</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label">รูปโปรไฟล์</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) =>
                        setAvatarFile(e.target.files?.[0] || null)
                      }
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={closeModal}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="btn btn-outline-success"
                  >
                    {modalMode === "create" ? "สร้าง" : "บันทึก"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
