import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import "../styles/Children.css";

export default function Children() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  async function loadChildren() {
    try {
      const res = await API.get("/children/my");
      const raw = res.data || [];

      // แปลงข้อมูล backend -> frontend
      const formatted = raw.map((c) => ({
        child_id: c.child_id,
        prefix: c.prefix,
        first_name: c.first_name,
        last_name: c.last_name,
        nickname: c.nickname,
        birth_date: c.birth_date,
        citizen_id: c.citizen_id,
        ethnicity: c.ethnicity,
        nationality: c.nationality,
        religion: c.religion,

        // address
        house_no: c.house_no,
        village: c.village,
        subdistrict: c.subdistrict,
        district: c.district,
        province: c.province,

        attendance_score: c.attendance_score,
        milk_score: c.milk_score,
        toothbrush_score: c.toothbrush_score,
        lunch_score: c.lunch_score,
        latest_weight: c.latest_weight,
        latest_height: c.latest_height,
        latest_health_note: c.latest_health_note,
        latest_hair_condition: c.latest_hair_condition,
        latest_oral_cavity: c.latest_oral_cavity,
        latest_fingernail: c.latest_fingernail,
        latest_toenail: c.latest_toenail,
        note: c.note,
        // ⭐ พ่อแม่ (string -> array)
        parents: c.parents_info
  ? [...new Set(c.parents_info.split("||"))]
  : [],

        // teacher
        teacher: {
          prefix: c.teacher_prefix,
          first_name: c.teacher_firstname,
          last_name: c.teacher_lastname,
          phone: c.teacher_phone,
        },
      }));

      setChildren(formatted);
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถโหลดข้อมูลบุตรหลานได้");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="m-4">กำลังโหลดข้อมูล...</p>;

  return (
    <div className="children-page">
      <div className="container my-4">
        <h3 className="children-title mb-4">
          ข้อมูลบุตรหลาน ({children.length} คน)
        </h3>

        {children.length === 0 ? (
          <div className="children-empty">ไม่พบข้อมูล</div>
        ) : (
          <div className="row">
            {/* ===== LEFT: CHILD INFO ===== */}
            <div className="col-md-4">
              {children.map((c) => (
                <div className="card h-100 child-card mb-4" key={c.child_id}>
                  <div className="card-body">
                    <h5 className="child-name">
                      {c.prefix}
                      {c.first_name} {c.last_name}
                    </h5>

                    <div className="child-info">
                      <p>
                        <strong>ชื่อเล่น:</strong> {c.nickname || "-"}
                      </p>

                      <p>
                        <strong>วันเดือนปีเกิด:</strong>{" "}
                        {c.birth_date
                          ? new Date(c.birth_date).toLocaleDateString("th-TH", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : "-"}
                      </p>

                      <p>
                        <strong>เลขบัตรประชาชน:</strong> {c.citizen_id || "-"}
                      </p>
                      <p>
                        <strong>เชื้อชาติ:</strong> {c.ethnicity || "-"}
                      </p>
                      <p>
                        <strong>สัญชาติ:</strong> {c.nationality || "-"}
                      </p>
                      <p>
                        <strong>ศาสนา:</strong> {c.religion || "-"}
                      </p>
                    </div>

                    <hr />

                    {/* ADDRESS */}
                    <div className="child-address">
                      <strong>ที่อยู่ปัจจุบัน:</strong>
                      <br />
                      บ้านเลขที่ {c.house_no || "-"} หมู่ {c.village || "-"}{" "}
                      ตำบล{c.subdistrict || "-"} อำเภอ{c.district || "-"}{" "}
                      จังหวัด{c.province || "-"}
                    </div>

                    <hr />

                    {/* PARENTS */}
                    {c.parents.map((p, i) => (
                      <div className="parent-box" key={i}>
                        <strong>ผู้ปกครอง:</strong>{" "}
                        {p
                          .replace(/[()]/g, "")
                          .replace("ผู้ปกครอง:", "")
                          .trim()}
                      </div>
                    ))}
                    <Link
                      to={`/parent/children/${c.child_id}/evaluation`}
                      className="btn child-btn w-100 mt-3"
                    >
                      ประเมินพัฒนาการ
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* ===== RIGHT: TEACHER ===== */}
            <div className="col-md-8">
              <div className="card teacher-card">
                <div className="card-body">
                  <h4 className="mb-3">ครูประจำชั้น</h4>

                  {children.map((c) => (
                    <div key={c.child_id} className="teacher-box mb-3">
                      <strong>
                        {c.teacher.prefix || ""}
                        {c.teacher.first_name || "-"}{" "}
                        {c.teacher.last_name || ""}
                      </strong>
                      <br />
                      โทร: {c.teacher.phone || "-"}
                    </div>
                  ))}
                  <h4 className="mb-4">กิจกรรมและพัฒนาการรายวัน</h4>

                  {children.map((c) => (
                    <div key={c.child_id} className="mb-4">
                      <div className="score-grid">
                        <div className="score-item">
                          <span>มาเรียน</span>
                          <strong>{c.attendance_score || 0} วัน</strong>
                        </div>

                        <div className="score-item">
                          <span>ดื่มนม</span>
                          <strong>{c.milk_score || 0} ครั้ง</strong>
                        </div>

                        <div className="score-item">
                          <span>แปรงฟัน</span>
                          <strong>{c.toothbrush_score || 0} ครั้ง</strong>
                        </div>

                        <div className="score-item">
                          <span>อาหารกลางวัน</span>
                          <strong>{c.lunch_score || 0} ครั้ง</strong>
                        </div>

                        <div className="score-item">
                          <span>สุขภาพ(รายเดือน)</span>
                          <strong>
                            {[
                              c.latest_hair_condition,
                              c.latest_oral_cavity,
                              c.latest_fingernail,
                              c.latest_toenail,
                            ].includes("ปรับปรุง")
                              ? "ปรับปรุง"
                              : [
                                    c.latest_hair_condition,
                                    c.latest_oral_cavity,
                                    c.latest_fingernail,
                                    c.latest_toenail,
                                  ].includes("ปานกลาง")
                                ? "ปานกลาง"
                                : [
                                      c.latest_hair_condition,
                                      c.latest_oral_cavity,
                                      c.latest_fingernail,
                                      c.latest_toenail,
                                    ].includes("ดี")
                                  ? "ดี"
                                  : "ปกติ"}
                          </strong>
                        </div>

                        <div className="score-item">
                          <span>น้ำหนักล่าสุด(รายเดือน)</span>
                          <strong>{c.latest_weight || "-"} กก.</strong>
                        </div>

                        <div className="score-item">
                          <span>ส่วนสูงล่าสุด(รายเดือน)</span>
                          <strong>{c.latest_height || "-"} ซม.</strong>
                        </div>
                      </div>
                      <div className="child-note-box mt-3">
                        <div className="note-title">บันทึกจากครู</div>
                        <div className="note-content">
                          {c.note || "ยังไม่มีบันทึกจากครู"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
