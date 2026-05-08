import React, { useEffect, useState } from "react";
import API from "../api/api";

export default function EnrollmentStatus() {
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  async function load() {
    try {
      const res = await API.get("/enrollments/my");
      setEnrollment(res.data || null);
    } catch (err) {
      console.error(err);
      setEnrollment(null);
    } finally {
      setLoading(false);
    }
  }
  load();
}, []);

  function parseJSON(v) {
    try {
      return typeof v === "string" ? JSON.parse(v) : v || {};
    } catch {
      return {};
    }
  }

  if (loading) {
    return (
      <div className="container mt-4">
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="container mt-4">
        <h3>สถานะการสมัครเรียน</h3>
        <div className="alert alert-info">
          ยังไม่พบข้อมูลการสมัคร
        </div>
      </div>
    );
  }

  const d = parseJSON(enrollment.extra_json);

  return (
    <div className="container mt-4">
      <h3>สถานะการสมัครเรียน</h3>

      {enrollment.status === "pending" && (
        <div className="alert alert-warning">
          ใบสมัครของท่านอยู่ระหว่างการพิจารณา
        </div>
      )}

      {enrollment.status === "approved" && (
        <div className="alert alert-success">
          ใบสมัครได้รับการอนุมัติแล้ว<br />
          กรุณาติดต่อศูนย์พัฒนาเด็กเล็ก
        </div>
      )}

      {enrollment.status === "rejected" && (
        <div className="alert alert-danger">
          <b>ไม่อนุมัติ</b><br />
          <b>เหตุผล:</b> {enrollment.note}
        </div>
      )}

      <div className="card mt-4">
        <div className="card-header">ข้อมูลการสมัครเรียน</div>
        <div className="card-body">

          <h6>ข้อมูลเด็ก</h6>
          <p>
            {d.student_prefix} {d.student_firstname} {d.student_lastname}
            {" "}({d.student_nickname || "-"})
          </p>
          <p>วันเกิด: {d.birth_date || "-"}</p>
          <p>ระดับที่สมัคร: {d.apply_level || "-"}</p>

          <hr />

          <h6>ที่อยู่ตามทะเบียนบ้าน</h6>
          <p>
            บ้านเลขที่ {d.reg_house_no || "-"} หมู่ {d.reg_moo || "-"}<br />
            ต.{d.reg_tambon || "-"} อ.{d.reg_amphur || "-"} จ.{d.reg_province || "-"}
          </p>

          <hr />

          <h6>ข้อมูลบิดา</h6>
          <p>
            {d.father_prefix || ""} {d.father_firstname || "-"} {d.father_lastname || "-"}
          </p>
          <p>อาชีพ: {d.father_job || "-"}</p>
          <p>โทรศัพท์: {d.father_phone || "-"}</p>

          <hr />

          <h6>ข้อมูลมารดา</h6>
          <p>
            {d.mother_prefix || ""} {d.mother_firstname || "-"} {d.mother_lastname || "-"}
          </p>
          <p>อาชีพ: {d.mother_job || "-"}</p>
          <p>โทรศัพท์: {d.mother_phone || "-"}</p>

          <hr />

          <h6>ผู้ยื่นใบสมัคร</h6>
          <p>
            {d.sender_prefix || ""} {d.sender_firstname || "-"} {d.sender_lastname || "-"}
          </p>
          <p>ความสัมพันธ์: {d.sender_relation || "-"}</p>
          <p>โทรศัพท์: {d.sender_phone || "-"}</p>

        </div>
      </div>
    </div>
  );
}
