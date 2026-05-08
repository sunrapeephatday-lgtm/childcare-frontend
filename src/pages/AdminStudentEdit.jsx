import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function AdminStudentEdit(){

  const { id } = useParams();
  const navigate = useNavigate();

  const [form,setForm] = useState({});
  const [rooms,setRooms] = useState([]);
  const [loading,setLoading] = useState(false);

  useEffect(()=>{
    load();
  },[id]);

  async function load(){
    setLoading(true);
    try{

      const res = await API.get(`/students/${id}`);

const d = res.data;

setForm({
  ...d,
  birth_date: d.birth_date
    ? d.birth_date.split("T")[0]
    : ""
});
      const r = await API.get("/classrooms");
setRooms(r.data.rows || []);

    }catch(err){
      alert("โหลดข้อมูลเด็กไม่สำเร็จ");
      navigate("/admin/students");
    }
    setLoading(false);
  }

  function handleChange(e){
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function save(e){
    e.preventDefault();

    try{
      await API.put(`/students/${id}`,form);
      alert("บันทึกสำเร็จ");
      navigate("/admin/students");
    }catch{
      alert("บันทึกไม่สำเร็จ");
    }
  }

  return (
    <div className="container my-4">

      <h3 className="mb-3">แก้ไขข้อมูลนักเรียน</h3>

      {loading && <div>กำลังโหลด...</div>}

      {!loading && (
        <form onSubmit={save} className="card p-3">

          <div className="row">

            {/* ⭐ ข้อมูลพื้นฐาน */}
            <div className="col-md-2 mb-2">
              <label>คำนำหน้า</label>
              <input className="form-control"
                name="prefix"
                value={form.prefix || ""}
                onChange={handleChange}/>
            </div>

            <div className="col-md-3 mb-2">
              <label>เลขประจำตัวนักเรียน</label>
              <input className="form-control"
                name="child_code"
                value={form.child_code || ""}
                onChange={handleChange}/>
              </div>

            <div className="col-md-4 mb-2">
              <label>ชื่อ</label>
              <input className="form-control"
                name="first_name"
                value={form.first_name || ""}
                onChange={handleChange}/>
            </div>

            <div className="col-md-4 mb-2">
              <label>นามสกุล</label>
              <input className="form-control"
                name="last_name"
                value={form.last_name || ""}
                onChange={handleChange}/>
            </div>

            <div className="col-md-2 mb-2">
              <label>ชื่อเล่น</label>
              <input className="form-control"
                name="nickname"
                value={form.nickname || ""}
                onChange={handleChange}/>
            </div>

            <div className="col-md-4 mb-2">
              <label>เลขบัตร</label>
              <input className="form-control"
                name="citizen_id"
                value={form.citizen_id || ""}
                onChange={handleChange}/>
            </div>

            <div className="col-md-4 mb-2">
              <label>วันเกิด</label>
              <input type="date" className="form-control"
                name="birth_date"
                value={form.birth_date || ""}
                onChange={handleChange}/>
            </div>

            <div className="col-md-4 mb-2">
              <label>ห้องเรียน</label>
              <select className="form-control"
                name="classroom_id"
                value={form.classroom_id || ""}
                onChange={handleChange}>
                <option value="">เลือกห้อง</option>
                {rooms.map(r=>(
                  <option key={r.classroom_id} value={r.classroom_id}>
                    {r.classroom_name}
                  </option>
                ))}
              </select>
            </div>

            {/* ⭐ สุขภาพ */}
            <div className="col-md-3 mb-2">
              <label>หมู่เลือด</label>
              <input className="form-control"
                name="blood"
                value={form.blood || ""}
                onChange={handleChange}/>
            </div>

            <div className="col-md-3 mb-2">
              <label>น้ำหนัก</label>
              <input className="form-control"
                name="birth_weight"
                value={form.birth_weight || ""}
                onChange={handleChange}/>
            </div>

            <div className="col-md-3 mb-2">
              <label>ส่วนสูง</label>
              <input className="form-control"
                name="birth_height"
                value={form.birth_height || ""}
                onChange={handleChange}/>
            </div>

            <div className="col-md-3 mb-2">
              <label>รับวัคซีน</label>
              <input className="form-control"
                name="vaccine"
                value={form.vaccine || ""}
                onChange={handleChange}/>
            </div>

            {/* ⭐ พ่อ */}
            <div className="col-md-3 mb-2">
              <label>ชื่อพ่อ</label>
              <input className="form-control"
                name="father_firstname"
                value={form.father_firstname || ""}
                onChange={handleChange}/>
            </div>

            <div className="col-md-3 mb-2">
              <label>อาชีพพ่อ</label>
              <input className="form-control"
                name="father_job"
                value={form.father_job || ""}
                onChange={handleChange}/>
            </div>

            {/* ⭐ แม่ */}
            <div className="col-md-3 mb-2">
              <label>ชื่อแม่</label>
              <input className="form-control"
                name="mother_firstname"
                value={form.mother_firstname || ""}
                onChange={handleChange}/>
            </div>

            <div className="col-md-3 mb-2">
              <label>อาชีพแม่</label>
              <input className="form-control"
                name="mother_job"
                value={form.mother_job || ""}
                onChange={handleChange}/>
            </div>

          </div>

          <div className="mt-3">
            <button className="btn btn-primary me-2">
              บันทึก
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={()=>navigate("/admin/students")}
            >
              ยกเลิก
            </button>
          </div>

        </form>
      )}

    </div>
  );
}