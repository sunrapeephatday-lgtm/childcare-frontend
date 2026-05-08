// frontend/src/pages/TeacherAttendance.jsx
import React, { useEffect, useState } from "react";
import API from "../api/api";

export default function TeacherAttendance() {
  const [children, setChildren] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // เรียก API ดึงเด็กในห้องของครู (backend ต้องมี endpoint /api/teacher/children)
    API.get("/teacher/children")
      .then(res => {
        setChildren((res.data || []).map(c => ({ ...c, attendance_status: c.attendance_status || "present" })));
      })
      .catch(err => {
        console.error(err);
        setChildren([]);
      })
      .finally(()=>setLoading(false));
  }, []);

  function setStatus(idx, value) {
    setChildren(prev => prev.map((c,i) => i===idx ? { ...c, attendance_status: value } : c));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const records = children.map(c => ({ child_id: c.child_id, date, status: c.attendance_status }));
      await API.post("/teacher/attendance", { records });
      alert("บันทึกเรียบร้อย");
    } catch (err) {
      console.error(err);
      alert("บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container my-4">
      <h3>เช็คชื่อ (สำหรับครู)</h3>
      <div className="card mb-3 p-3">
        <div className="mb-3">
          <label>วันที่</label>
          <input type="date" className="form-control" value={date} onChange={e=>setDate(e.target.value)} />
        </div>

        {loading && <p>กำลังโหลดข้อมูลเด็ก...</p>}
        {!loading && children.length === 0 && <div className="alert alert-info">ไม่พบเด็กในห้องของคุณ</div>}

        {!loading && children.map((c, idx) => (
          <div key={c.child_id || idx} className="d-flex align-items-center justify-content-between border rounded p-2 mb-2">
            <div>
              <strong>{c.child_name || c.first_name || "ไม่มีชื่อ"}</strong>
              <div className="small text-muted">เกิด: {c.dob || "-"}</div>
            </div>
            <div>
              <select className="form-select form-select-sm" value={c.attendance_status} onChange={(e)=>setStatus(idx, e.target.value)}>
                <option value="present">มา</option>
                <option value="absent">ขาด</option>
                <option value="leave">ลา</option>
              </select>
            </div>
          </div>
        ))}

        <div className="mt-3">
          <button className="btn btn-primary me-2" onClick={handleSave} disabled={saving}>{saving ? "กำลังบันทึก..." : "บันทึก"}</button>
        </div>
      </div>
    </div>
  );
}
