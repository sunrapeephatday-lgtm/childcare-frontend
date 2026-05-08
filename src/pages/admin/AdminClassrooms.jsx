// src/pages/admin/AdminClassrooms.jsx
import { useEffect, useState } from "react";
import API from "../../api/api";

export default function AdminClassrooms() {

  /* ================= STATE ================= */
  const [rows, setRows] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    center_id: "",
    classroom_name: "",
  });

  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState(null);

  /* ================= LOAD ================= */
  useEffect(() => {
    load();
    loadCenters();
  }, []);

  async function load() {
  try {
    setLoading(true);

    const res = await API.get("/classrooms");

    // ⭐ จุดแก้จริง
    setRows(res.data.rows || res.data || []);

  } catch (err) {
    console.error(err);
    setMsg({ type: "danger", text: "โหลดห้องเรียนไม่สำเร็จ" });
  } finally {
    setLoading(false);
  }
}

  async function loadCenters() {
  try {
    const res = await API.get("/centers");

    setCenters(res.data.rows || res.data || []);

  } catch (err) {
    console.error(err);
    setMsg({ type: "danger", text: "โหลดศูนย์ไม่สำเร็จ" });
  }
}

  /* ================= FORM ================= */
  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setMsg(null);

    if (!form.center_id || !form.classroom_name) {
      setMsg({ type: "warning", text: "กรอกข้อมูลให้ครบ" });
      return;
    }

    try {
      if (editId) {
        await API.put(`/classrooms/${editId}`, form);
        setMsg({ type: "success", text: "แก้ไขห้องเรียนเรียบร้อย" });
      } else {
        await API.post("/classrooms", form);
        setMsg({ type: "success", text: "เพิ่มห้องเรียนเรียบร้อย" });
      }

      reset();
      load();

    } catch (err) {
      console.error(err);
      setMsg({ type: "danger", text: "บันทึกไม่สำเร็จ" });
    }
  }

  function edit(row) {
    setForm({
      center_id: row.center_id,
      classroom_name: row.classroom_name,
    });
    setEditId(row.classroom_id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function del(id) {
    if (!window.confirm("ลบห้องเรียนนี้?")) return;

    try {
      await API.delete(`/classrooms/${id}`);
      setMsg({ type: "success", text: "ลบเรียบร้อย" });
      load();
    } catch (err) {
      console.error(err);
      setMsg({ type: "danger", text: "ลบไม่สำเร็จ" });
    }
  }

  function reset() {
    setForm({ center_id: "", classroom_name: "" });
    setEditId(null);
  }

  /* ================= UI ================= */
  return (
    <div>

      <h5 className="mb-3 fw-bold text-success section-title">จัดการห้องเรียน</h5>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* ===== FORM ===== */}
      <form onSubmit={submit} className="mb-4 classroom-form">

        <div className="row g-2">

          <div className="col-12 col-md-5">
            <label className="form-label">ศูนย์</label>
            <select
              name="center_id"
              value={form.center_id}
              onChange={onChange}
              className="form-select"
              required
            >
              <option value="">-- เลือกศูนย์ --</option>
              {centers.map(c => (
                <option key={c.center_id} value={c.center_id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-5">
            <label className="form-label">ชื่อห้องเรียน</label>
            <input
              name="classroom_name"
              placeholder="เช่น ห้อง 3 ขวบ"
              value={form.classroom_name}
              onChange={onChange}
              className="form-control"
              required
            />
          </div>

        </div>

        {/* 🔥 ปุ่มอยู่ล่าง */}
        <div className="d-flex justify-content-start gap-2 mt-3">

          <button type="submit" className="btn btn-success px-5">
            {editId ? "บันทึก" : "เพิ่ม"}
          </button>

          {editId && (
            <button
              type="button"
              className="btn btn-outline-secondary px-4"
              onClick={reset}
            >
              ยกเลิก
            </button>
          )}

        </div>

      </form>

      {/* ===== TABLE ===== */}
      <h5 className="mb-3 fw-bold text-success section-title">จำนวนห้องเรียน</h5>
      <div className="card">
        <div className="card-body p-0">

          {/* จุดสำคัญ: ทำให้มือถือปัดซ้ายขวาได้ */}
          <div className="table-scroll">

            <table  className="table table-bordered table-hover table-sm mb-0" style={{ fontSize: "14px" }}>
              <thead className="table-light">
                <tr>
                  <th style={{ minWidth: 45 }}>ศูนย์</th>
                  <th style={{ minWidth: 25 }}>ห้องเรียน</th>
                  <th style={{ minWidth: 20 }} className="text-center">การจัดการ</th>
                </tr>
              </thead>

              <tbody>

                {loading && (
                  <tr>
                    <td colSpan="3" className="text-center py-4">
                      กำลังโหลด...
                    </td>
                  </tr>
                )}

                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-4">
                      ยังไม่มีข้อมูล
                    </td>
                  </tr>
                )}

                {rows.map(r => (
                  <tr key={r.classroom_id}>
                    <td>{r.center_name}</td>
                    <td>{r.classroom_name}</td>
                    <td className="text-center" style={{ whiteSpace: "nowrap" }}>
  <button
    onClick={() => edit(r)}
    className="btn btn-sm btn-outline-orange me-1 px-2"
  >
    แก้ไข
  </button>

  <button
    onClick={() => del(r.classroom_id)}
    className="btn btn-sm btn-outline-danger px-2"
  >
    ลบ
  </button>
</td>
                  </tr>
                ))}

              </tbody>
            </table>

          </div>
        </div>
      </div>

    </div>
  );
}
