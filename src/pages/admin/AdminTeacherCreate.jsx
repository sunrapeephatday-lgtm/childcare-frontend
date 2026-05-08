import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../../api/api";

export default function AdminTeacherCreate() {

  const [params] = useSearchParams();
  const user_id = params.get("user_id");

  const [centers, setCenters] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    center_id: "",
    classroom_id: "",
    prefix: "",
    first_name: "",
    last_name: "",
    phone: "",
  });

  useEffect(() => {
    loadCenters();
    loadTeachers();
  }, []);

  async function loadCenters() {
    const res = await API.get("/centers");
    setCenters(res.data.rows || res.data || []);
  }

  async function loadClassrooms(centerId) {
    if (!centerId) return setClassrooms([]);
    const res = await API.get(`/classrooms?center_id=${centerId}`);
    setClassrooms(res.data.rows || res.data || []);
  }

  async function loadTeachers() {
    const res = await API.get("/admin/teachers");
    setTeachers(res.data.rows || []);
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === "center_id") {
      loadClassrooms(value);
      setForm(prev => ({ ...prev, classroom_id: "" }));
    }
  }

  function handleEdit(t) {
    setEditId(t.teacher_id);

    setForm({
      center_id: t.center_id || "",
      classroom_id: t.classroom_id || "",
      prefix: t.prefix || "",
      first_name: t.first_name || "",
      last_name: t.last_name || "",
      phone: t.phone || "",
    });

    loadClassrooms(t.center_id);
  }

  function handleCancel() {
    setEditId(null);

    setForm({
      center_id: "",
      classroom_id: "",
      prefix: "",
      first_name: "",
      last_name: "",
      phone: "",
    });

    setClassrooms([]);
  }

  async function handleResign(t) {
  const ok = window.confirm(
    `ต้องการให้ ${t.prefix}${t.first_name} ${t.last_name} ลาออกใช่ไหม`
  );

  if (!ok) return;

  try {
    await API.put(`/admin/teachers/${t.teacher_id}/resign`);
    alert("ครูลาออกเรียบร้อย");
    loadTeachers();
  } catch (err) {
    alert(err?.response?.data?.error || "เกิดข้อผิดพลาด");
  }
}

  async function submit(e) {
    e.preventDefault();

    if (editId) {
      await API.put(`/admin/teachers/${editId}`, form);
      alert("แก้ไขข้อมูลครูเรียบร้อย");
    } else {
      await API.post("/admin/teachers", {
        user_id,
        ...form
      });
      alert("บันทึกข้อมูลครูเรียบร้อย");
    }

    setEditId(null);

    setForm({
      center_id: "",
      classroom_id: "",
      prefix: "",
      first_name: "",
      last_name: "",
      phone: "",
    });

    loadTeachers();
  }

  return (
    <div className="admin-card mt-3">

      {/* ===== FORM ===== */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">

          <h5 className="section-title">เพิ่มข้อมูลครู</h5>

          <form onSubmit={submit}>
            <div className="row g-2">

              <div className="col-md-3">
                <label>คำนำหน้า</label>
                <select className="form-select" name="prefix" value={form.prefix} onChange={onChange} required>
                  <option value="">เลือก</option>
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                </select>
              </div>

              <div className="col-md-4">
                <label>ชื่อ</label>
                <input className="form-control" name="first_name" value={form.first_name} onChange={onChange} required />
              </div>

              <div className="col-md-5">
                <label>นามสกุล</label>
                <input className="form-control" name="last_name" value={form.last_name} onChange={onChange} required />
              </div>

              <div className="col-md-6">
                <label>เบอร์โทรศัพท์</label>
                <input className="form-control" name="phone" value={form.phone} onChange={onChange} />
              </div>


              <div className="col-md-6">
                <label>ศูนย์</label>
                <select className="form-select" name="center_id" value={form.center_id} onChange={onChange} required>
                  <option value="">เลือกศูนย์</option>
                  {centers.map(c => (
                    <option key={c.center_id} value={c.center_id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label>ห้องเรียน</label>
                <select className="form-select" name="classroom_id" value={form.classroom_id} onChange={onChange} required>
                  <option value="">เลือกห้อง</option>
                  {classrooms.map(r => (
                    <option key={r.classroom_id} value={r.classroom_id}>{r.classroom_name}</option>
                  ))}
                </select>
              </div>

              <div className="col-12 mt-2 d-flex gap-2">
                <button className="btn btn-success px-5">
                  {editId ? "บันทึกการแก้ไข" : "บันทึกข้อมูลครู"}
                </button>

                {editId && (
                  <button
                    type="button"
                    className="btn btn-secondary px-4"
                    onClick={handleCancel}
                  >
                    ยกเลิก
                  </button>
                )}
              </div>

            </div>
          </form>

        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="card shadow-sm border-0">
        <div className="card-body">

          <h5 className="section-title">รายชื่อครู</h5>

          <div style={{width:"100%", overflowX:"auto"}}>

            <table className="table table-bordered align-middle" style={{minWidth:650, fontSize: "14px"}}>
              <thead className="table-success">
                <tr>
                  <th style={{width:60}}>ลำดับ</th>
                  <th style={{width:100}}>ชื่อ-นามสกุล</th>
                  <th style={{width:100}}>ศูนย์</th>
                  <th style={{width:100}}>ห้องเรียน</th>
                  <th style={{width:100}}>เบอร์โทรศัพท์</th>
                  <th style={{width:100}}>การจัดการ</th>
                </tr>
              </thead>

              <tbody>
                {teachers.map((t, i) => (
                  <tr key={t.teacher_id}>
                    <td>{i + 1}</td>
                    <td>{t.prefix}{t.first_name} {t.last_name}</td>
                    <td>{t.center_name}</td>
                    <td>{t.classroom_name}</td>
                    <td>{t.phone}</td>
                   <td style={{ whiteSpace: "nowrap" }}>
                    <button className="btn btn-sm btn-outline-orange me-2"onClick={() => handleEdit(t)}>
                      แก้ไข
                    </button>

                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleResign(t)}>
                      ลาออก
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