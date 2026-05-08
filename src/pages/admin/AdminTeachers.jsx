import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../../api/api";

export default function AdminTeacherCreate() {
  const [params] = useSearchParams();
  const user_id = params.get("user_id");

  const [centers, setCenters] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [teachers, setTeachers] = useState([]);

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
    const res = await API.get(`/classrooms?center_id=${centerId}`);
    setClassrooms(res.data.rows || res.data || []);
  }

  async function loadTeachers() {
    const res = await API.get("/admin/teachers");
    setTeachers(res.data.rows || []);
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "center_id") {
      loadClassrooms(value);
      setForm((f) => ({ ...f, classroom_id: "" }));
    }
  }

  async function submit(e) {
    e.preventDefault();
    await API.post("/admin/teachers", {
      user_id,
      ...form,
    });

    alert("บันทึกข้อมูลครูเรียบร้อย");

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
    <div className="container mt-4">

      {/* ===== ฟอร์มเพิ่ม ===== */}
      <div className="card p-4">
        <h4>เพิ่มข้อมูลครู</h4>

        <form onSubmit={submit}>
          <div className="row">
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
          </div>

          <div className="row mt-2">
            <div className="col-md-6">
              <label>เบอร์โทร</label>
              <input className="form-control" name="phone" value={form.phone} onChange={onChange} />
            </div>

          </div>

          <div className="row mt-2">
            <div className="col-md-6">
              <label>ศูนย์</label>
              <select className="form-select" name="center_id" value={form.center_id} onChange={onChange} required>
                <option value="">เลือกศูนย์</option>
                {centers.map((c) => (
                  <option key={c.center_id} value={c.center_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label>ห้องเรียน</label>
              <select className="form-select" name="classroom_id" value={form.classroom_id} onChange={onChange} required>
                <option value="">เลือกห้อง</option>
                {classrooms.map((r) => (
                  <option key={r.classroom_id} value={r.classroom_id}>
                    {r.classroom_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button className="btn btn-success mt-3 w-100">
            บันทึกข้อมูลครู
          </button>
        </form>
      </div>

      {/* ===== ตารางรายชื่อ ===== */}
      <hr className="my-4" />
        <h5>รายชื่อครู</h5>

        <table className="table table-bordered mt-2">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>ชื่อ-สกุล</th>
              <th>ศูนย์</th>
              <th>ห้อง</th>
              <th>เบอร์</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  );
}
