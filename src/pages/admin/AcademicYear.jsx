import React from "react";
import API from "../../api/api";

export default function AcademicYear() {

  async function handlePromote() {
    if (!window.confirm("ยืนยันการเปิดปีการศึกษาใหม่ ?\nนักเรียนทุกคนจะถูกเลื่อนชั้น"))
      return;

    try {
      const res = await API.post("/enrollments/promote");
      alert(res.data.message);
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + (err.response?.data?.error || ""));
    }
  }

  return (
    <div className="container mt-4">

      <div className="card shadow border-danger">
        <div className="card-body text-center">

          <h3 className="text-danger">ระบบปีการศึกษา</h3>
          <p>
            ปุ่มนี้ใช้เมื่อ “เปิดเทอมใหม่” เท่านั้น  
            ระบบจะเลื่อนนักเรียนทุกคนไปห้องถัดไป
          </p>

          <button
            className="btn btn-danger btn-lg"
            onClick={handlePromote}
          >
            เปิดปีการศึกษาใหม่ / เลื่อนชั้น
          </button>

        </div>
      </div>

    </div>
  );
}
