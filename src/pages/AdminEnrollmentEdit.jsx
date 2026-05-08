import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";

export default function AdminEnrollmentEdit() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [form,setForm] = useState({});
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [status,setStatus] = useState("");

  useEffect(()=>{
    load();
  },[id]);

  async function load(){
    try{
      const res = await API.get(`/enrollments/${id}`);
      const row = res.data;

      setStatus(row.status);

      const data =
        typeof row.extra_json === "string"
          ? JSON.parse(row.extra_json)
          : row.extra_json || {};

      setForm(data);

    }catch(err){
      alert("โหลดข้อมูลไม่สำเร็จ");
      navigate("/admin/enrollments");
    }
    setLoading(false);
  }

  function change(e){
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function save(){
    if(status !== "pending") return;

    setSaving(true);

    try{
      await API.put(`/enrollments/${id}`,{
        extra_json: form
      });

      alert("บันทึกแล้ว");
      navigate("/admin/enrollments");

    }catch(err){
      alert("บันทึกไม่สำเร็จ");
    }

    setSaving(false);
  }

  if(loading) return <div className="container my-4">กำลังโหลด...</div>;

  return (
    <div className="container my-4">

      <h3 className="mb-3">แก้ไขใบสมัคร</h3>

      {status !== "pending" &&
        <div className="alert alert-warning">
          ใบสมัครอนุมัติแล้ว แก้ไขไม่ได้
        </div>
      }

      <div className="card p-3">

        {/* ================= เด็ก ================= */}
        <h5>ข้อมูลเด็ก</h5>
        <Row>
          <Input label="คำนำหน้า" name="prefix" form={form} change={change}/>
          <Input label="ชื่อ" name="first_name" form={form} change={change}/>
          <Input label="นามสกุล" name="last_name" form={form} change={change}/>
          <Input label="ชื่อเล่น" name="nickname" form={form} change={change}/>
          <Input label="เลขบัตร" name="citizen_id" form={form} change={change}/>
          <Input label="วันเกิด" name="birth_date" type="date" form={form} change={change}/>
          <Input label="ระดับที่สมัคร" name="apply_level" form={form} change={change}/>
          <Input label="เชื้อชาติ" name="ethnicity" form={form} change={change}/>
          <Input label="สัญชาติ" name="nationality" form={form} change={change}/>
          <Input label="ศาสนา" name="religion" form={form} change={change}/>
          <Input label="หมู่เลือด" name="blood_group" form={form} change={change}/>
          <Input label="น้ำหนักแรกเกิด" name="birth_weight" form={form} change={change}/>
          <Input label="ส่วนสูงแรกเกิด" name="birth_height" form={form} change={change}/>
          <Input label="วัคซีน" name="vaccine" form={form} change={change}/>
          <Input label="โรคประจำตัว" name="congenital_disease" form={form} change={change}/>
          <Input label="แพ้ยา" name="drug_allergy" form={form} change={change}/>
          <Input label="แพ้อาหาร" name="food_allergy" form={form} change={change}/>
          <Input label="ช่วยเหลือตัวเอง" name="self_help_ability" form={form} change={change}/>
          <Input label="พฤติกรรมเด็ก" name="child_behavior" form={form} change={change}/>
          <Input label="ประวัติป่วย" name="illness_history" form={form} change={change}/>
          <Input label="โรคพันธุกรรม" name="genetic_disease" form={form} change={change}/>
          <Input label="โรงเรียนเดิม" name="previous_school" form={form} change={change}/>
          <Input label="ข้อมูลเพิ่มเติม" name="additional_info" form={form} change={change}/>
          <Input label="โทรฉุกเฉิน" name="emergency_phone" form={form} change={change}/>
          <Input label="เป็นบุตรคนที่" name="child_order" form={form} change={change}/>
          <Input label="พี่น้องทั้งหมด" name="total_siblings" form={form} change={change}/>
          <Input label="พี่ชาย" name="male_siblings" form={form} change={change}/>
          <Input label="พี่สาว" name="female_siblings" form={form} change={change}/>
        </Row>

        <hr/>

        {/* ================= ที่อยู่ทะเบียนบ้าน ================= */}
        <h5>ทะเบียนบ้าน</h5>
        <Row>
          <Input label="บ้านเลขที่" name="reg_house_no" form={form} change={change}/>
          <Input label="หมู่" name="reg_moo" form={form} change={change}/>
          <Input label="ตำบล" name="reg_tambon" form={form} change={change}/>
          <Input label="อำเภอ" name="reg_amphur" form={form} change={change}/>
          <Input label="จังหวัด" name="reg_province" form={form} change={change}/>
          <Input label="รหัสไปรษณีย์" name="reg_postcode" form={form} change={change}/>
        </Row>

        <hr/>

        {/* ================= ที่อยู่ปัจจุบัน ================= */}
        <h5>ที่อยู่ปัจจุบัน</h5>
        <Row>
          <Input label="บ้านเลขที่" name="curr_house_no" form={form} change={change}/>
          <Input label="หมู่" name="curr_moo" form={form} change={change}/>
          <Input label="ตำบล" name="curr_tambon" form={form} change={change}/>
          <Input label="อำเภอ" name="curr_amphur" form={form} change={change}/>
          <Input label="จังหวัด" name="curr_province" form={form} change={change}/>
          <Input label="รหัสไปรษณีย์" name="curr_postcode" form={form} change={change}/>
        </Row>

        <hr/>

        {/* ================= มารดา ================= */}
        <h5>มารดา</h5>
        <Row>
          <Input label="คำนำหน้า" name="mother_prefix" form={form} change={change}/>
          <Input label="ชื่อ" name="mother_firstname" form={form} change={change}/>
          <Input label="นามสกุล" name="mother_lastname" form={form} change={change}/>
          <Input label="เลขบัตร" name="mother_idcard" form={form} change={change}/>
          <Input label="วันเกิด" name="mother_birthdate" type="date" form={form} change={change}/>
          <Input label="เชื้อชาติ" name="mother_ethnicity" form={form} change={change}/>
          <Input label="สัญชาติ" name="mother_nationality" form={form} change={change}/>
          <Input label="ศาสนา" name="mother_religion" form={form} change={change}/>
          <Input label="หมู่เลือด" name="mother_blood" form={form} change={change}/>
          <Input label="โทรศัพท์" name="mother_phone" form={form} change={change}/>
          <Input label="อาชีพ" name="mother_job" form={form} change={change}/>
          <Input label="รายได้" name="mother_income" form={form} change={change}/>
        </Row>

        <hr/>

        {/* ================= บิดา ================= */}
        <h5>บิดา</h5>
        <Row>
          <Input label="คำนำหน้า" name="father_prefix" form={form} change={change}/>
          <Input label="ชื่อ" name="father_firstname" form={form} change={change}/>
          <Input label="นามสกุล" name="father_lastname" form={form} change={change}/>
          <Input label="เลขบัตร" name="father_idcard" form={form} change={change}/>
          <Input label="วันเกิด" name="father_birthdate" type="date" form={form} change={change}/>
          <Input label="เชื้อชาติ" name="father_ethnicity" form={form} change={change}/>
          <Input label="สัญชาติ" name="father_nationality" form={form} change={change}/>
          <Input label="ศาสนา" name="father_religion" form={form} change={change}/>
          <Input label="หมู่เลือด" name="father_blood" form={form} change={change}/>
          <Input label="โทรศัพท์" name="father_phone" form={form} change={change}/>
          <Input label="อาชีพ" name="father_job" form={form} change={change}/>
          <Input label="รายได้" name="father_income" form={form} change={change}/>
        </Row>

        <hr/>

        {/* ================= ผู้รับส่ง ================= */}
        <h5>ผู้รับส่ง</h5>
        <Row>
          <Input label="คำนำหน้า" name="sender_prefix" form={form} change={change}/>
          <Input label="ชื่อ" name="sender_firstname" form={form} change={change}/>
          <Input label="นามสกุล" name="sender_lastname" form={form} change={change}/>
          <Input label="ความสัมพันธ์" name="sender_relation" form={form} change={change}/>
          <Input label="โทรศัพท์" name="sender_phone" form={form} change={change}/>
        </Row>

        <div className="mt-4">
          <button
            className="btn btn-primary"
            disabled={saving || status !== "pending"}
            onClick={save}
          >
            บันทึก
          </button>
          <button
            className="btn btn-secondary ms-2"
            onClick={()=>navigate("/admin/enrollments")}
          >
            ย้อนกลับ
          </button>
        </div>

      </div>
    </div>
  );
}

/* ===== helper ===== */

function Row({children}){
  return <div className="row g-3">{children}</div>;
}

function Input({label,name,form,change,type="text"}){
  return (
    <div className="col-md-4">
      <label className="form-label">{label}</label>
      <input
        className="form-control"
        type={type}
        name={name}
        value={form[name] || ""}
        onChange={change}
      />
    </div>
  );
}