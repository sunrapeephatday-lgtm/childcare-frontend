// frontend/src/pages/Admission.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admission() {
  const navigate = useNavigate();
  const STORAGE_KEY = "enrollDraft";

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const [form, setForm] = useState({
    guardian_prefix: "",
    guardian_firstname: "",
    guardian_lastname: "",
    guardian_phone: "",
    guardian_address: "",
    guardian_contact_place: "",
    relation_to_child: "",

    child_fullname: "",
    child_nickname: "",
    child_birthdate: "",

    consent_date: "",
    consent_place: "",
    signature_name: "",
  });

  /* ===== LOAD DRAFT FROM ENROLLMENT ===== */
  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const draft = JSON.parse(raw);

        const merged = {
          guardian_prefix: draft.mother_prefix || draft.father_prefix || "",
          guardian_firstname:
            draft.mother_firstname || draft.father_firstname || "",
          guardian_lastname:
            draft.mother_lastname || draft.father_lastname || "",
          guardian_phone: draft.mother_phone || draft.father_phone || "",
          guardian_address: [
  draft.curr_house_no,
  draft.curr_moo,
  draft.curr_tambon,
  draft.curr_amphur,
  draft.curr_province,
].filter(Boolean).join(" "),

          relation_to_child: "ผู้ปกครอง",

          child_fullname: `${draft.student_prefix || ""}${draft.student_firstname || ""} ${draft.student_lastname || ""}`.trim(),
          child_nickname: draft.student_nickname || "",
          child_birthdate: draft.birth_date || "",
        };

        setForm((s) => ({ ...s, ...merged }));
      } catch (e) {
        console.warn("อ่าน draft ไม่สำเร็จ", e);
      }
    }
    setLoading(false);
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function saveAdmissionToDraft() {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const old = raw ? JSON.parse(raw) : {};
    const merged = {
      ...old,
      admission: { ...form },
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }

  function handleBack() {
    saveAdmissionToDraft();
    navigate("/enroll");
  }

  function handleNext() {
    if (!form.guardian_firstname || !form.guardian_lastname) {
      setMsg({ type: "danger", text: "กรุณากรอกชื่อ-นามสกุลผู้ปกครอง" });
      return;
    }
    saveAdmissionToDraft();
    navigate("/record");
  }

  if (loading) return <div className="container my-4">Loading…</div>;

  return (
    <div className="container my-4">
      <h2 className="mb-3">แบบฟอร์มมอบตัว / ใบยินยอม</h2>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* ===== ผู้ปกครอง ===== */}
      <div className="card mb-3">
        <div className="card-body">
          <h5>ข้อมูลผู้มอบตัว / ผู้ปกครอง</h5>

          <div className="row g-3">
            <div className="col-md-2">
              <select
                className="form-select"
                name="guardian_prefix"
                value={form.guardian_prefix}
                onChange={onChange}
              >
                <option value="">คำนำหน้า</option>
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="นางสาว">นางสาว</option>
              </select>
            </div>

            <div className="col-md-5">
              <input
                className="form-control"
                name="guardian_firstname"
                value={form.guardian_firstname}
                onChange={onChange}
                placeholder="ชื่อ"
              />
            </div>

            <div className="col-md-5">
              <input
                className="form-control"
                name="guardian_lastname"
                value={form.guardian_lastname}
                onChange={onChange}
                placeholder="นามสกุล"
              />
            </div>

            <div className="col-md-4">
              <input
                className="form-control"
                name="guardian_phone"
                value={form.guardian_phone}
                onChange={onChange}
                placeholder="โทรศัพท์"
              />
            </div>

            <div className="col-12">
              <input
                className="form-control"
                name="guardian_address"
                value={form.guardian_address}
                onChange={onChange}
                placeholder="ที่อยู่"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== ข้อมูลเด็ก ===== */}
      <div className="card mb-3">
        <div className="card-body">
          <h5>ข้อมูลเด็ก</h5>

          <input readOnly className="form-control mb-2" value={form.child_fullname} />
          <input readOnly className="form-control mb-2" value={form.child_nickname} />
          <input readOnly className="form-control" value={form.child_birthdate} />
        </div>
      </div>

      {/* ===== ปุ่ม ===== */}
      <div className="mb-4">
        <button className="btn btn-outline-secondary me-2" onClick={handleBack}>
          ย้อนกลับ
        </button>
        <button className="btn btn-success" onClick={handleNext}>
          ถัดไป
        </button>
      </div>
    </div>
  );
}
