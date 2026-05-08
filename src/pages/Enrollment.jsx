import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import "../styles/Enrollment.css";

function calculateApplyLevel(birthDate) {
  if (!birthDate) return "";

  // To avoid timezone/parsing issues (Safari/iPhone), extract date part
  // and construct a local date using year/month/day numbers.
  const datePart = String(birthDate).split("T")[0];
  const parts = datePart.split("-").map((v) => Number(v));
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return "";
  const [y, m, d] = parts;
  const birth = new Date(y, m - 1, d);

  const today = new Date();
  // ปีการศึกษา (ก่อน พ.ค. = ยังเป็นปีที่แล้ว)
  let academicYear = today.getFullYear() + 543;
  if (today.getMonth() < 4) academicYear -= 1;

  // cutoff 16 พ.ค.
  const cutoff = new Date(academicYear - 543, 4, 16);

  let age = cutoff.getFullYear() - birth.getFullYear();
  const monthDiff = cutoff.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && cutoff.getDate() < birth.getDate())) {
    age--;
  }
if (age === 2) return "อายุต่ำกว่า 3 ปี";
if (age === 3) return "อายุ 3 ปี";

return "ไม่อยู่ในเกณฑ์รับสมัคร";
}

export default function Enrollment() {
  const formTopRef = useRef(null);
  const childBirthRef = useRef(null);
  const childHouseRef = useRef(null);
  const fatherIdRef = useRef(null);
  const fatherHouseRef = useRef(null);
  const motherIdRef = useRef(null);
  const motherHouseRef = useRef(null);
  const initial = {
    /* ===== ข้อมูลเด็ก ===== */
    apply_level: "",
    student_prefix: "",
    student_firstname: "",
    student_lastname: "",
    student_nickname: "",
    student_idcard: "",
    birth_date: "",
    weight: "",
    height: "",
    religion: "", // ศาสนา
    ethnicity: "", // เชื้อชาติ
    nationality: "", // สัญชาติ
    vaccine: "", // การได้รับวัคซีน
    blood_group: "", // หมู่เลือด
    congenital_disease: "", // โรคประจำตัว
    food_allergy: "", // อาหารที่แพ้
    emergency_phone: "", // เบอร์โทรศัพท์ที่สามารถติดต่อได้
    total_siblings: "", // มีพี่น้องทั้งหมด
    male_siblings: "", // เป็นชาย
    female_siblings: "", // เป็นหญิง
    child_order: "", // นักเรียนเป็นบุตรคนที่
    child_behavior: "", // อุปนิสัยของเด็ก
    illness_history: "", // ประวัติการได้รับอุบัติเหตุหรือเจ็บป่วย
    genetic_disease: "", // โรคจากพันธุกรรมหรือความผิดปกติต่าง ๆ
    drug_allergy: "", // แพ้ยา
    previous_school: "", // นักเรียนเคยเข้าโรงเรียนหรือสถานเลี้ยงเด็กมาก่อน
    additional_info: "", // ข้อมูลอื่น ๆ ที่ควรแจ้ง
    self_help_ability: "", // ความสามารถในการช่วยเหลือตนเอง

    /* ===== ที่อยู่เด็ก ===== */
    reg_house_no: "",
    reg_moo: "",
    reg_road: "", 
    reg_tambon: "",
    reg_amphur: "",
    reg_province: "",
    reg_postcode: "",
    curr_house_no: "",
    curr_moo: "",
    curr_road: "",
    curr_tambon: "",
    curr_amphur: "",
    curr_province: "",
    curr_postcode: "",

    /* ===== มารดา ===== */
    mother_prefix: "",
    mother_firstname: "",
    mother_lastname: "",
    mother_idcard: "",
    mother_birthdate: "",
    mother_ethnicity: "",
    mother_nationality: "",
    mother_religion: "",
    mother_blood: "",
    mother_phone: "",
    mother_job: "",
    mother_income: "",
    mother_reg_house_no: "",
    mother_reg_moo: "",
    mother_reg_road: "",
    mother_reg_tambon: "",
    mother_reg_amphur: "",
    mother_reg_province: "",
    mother_curr_house_no: "",
    mother_curr_moo: "",
    mother_curr_road: "",
    mother_curr_tambon: "",
    mother_curr_amphur: "",
    mother_curr_province: "",

    /* ===== บิดา ===== */
    father_prefix: "",
    father_firstname: "",
    father_lastname: "",
    father_idcard: "",
    father_birthdate: "",
    father_ethnicity: "",
    father_nationality: "",
    father_religion: "",
    father_blood: "",
    father_phone: "",
    father_job: "",
    father_income: "",
    father_reg_house_no: "",
    father_reg_moo: "",
    father_reg_road: "",
    father_reg_tambon: "",
    father_reg_amphur: "",
    father_reg_province: "",
    father_curr_house_no: "",
    father_curr_moo: "",
    father_curr_road: "",
    father_curr_tambon: "",
    father_curr_amphur: "",
    father_curr_province: "",

    /* ===== ความดูแล ===== */
    care_responsible: "",
    caregiver_prefix: "",
    caregiver_firstname: "",
    caregiver_lastname: "",
    caregiver_job: "",
    caregiver_income: "",
    caregiver_phone: "",

    /* ===== ผู้รับส่ง ===== */
    sender_prefix: "",
    sender_firstname: "",
    sender_lastname: "",
    sender_relation: "",
    sender_phone: "",
  };

  const [form, setForm] = useState(initial);
  const [msg, setMsg] = useState(null);
  const [pdpa,setPdpa] = useState(false);
  const [myEnrollment, setMyEnrollment] = useState([]);
  const [errors, setErrors] = useState({});
  const needCaregiver = form.care_responsible === "ญาติ";
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // track "same as registration" checkboxes so we can keep fields in sync
  const [sameAddress, setSameAddress] = useState(false);
  const [motherSameAddress, setMotherSameAddress] = useState(false);
  const [fatherSameAddress, setFatherSameAddress] = useState(false);

  // Stable setter for single fields to avoid SyntheticEvent recycling issues
  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value ?? "" }));
  }

  /* ===== ไฟล์แนบ ===== */
  const [files, setFiles] = useState({
    child_birth_certificate: null,
    child_house_reg: null,
    father_idcard_file: null,
    father_house_reg: null,
    mother_idcard_file: null,
    mother_house_reg: null,
  });

useEffect(() => {
  if (loaded) return;

  const token = sessionStorage.getItem("token");
  if (!token) return;

  setLoaded(true);
  loadMyEnrollment();

}, [loaded]);

  // keep current address fields synced when the user checked "same as registration"
  useEffect(() => {
    if (!sameAddress) return;

    setForm((f) => {
      if (
        f.curr_house_no === f.reg_house_no &&
        f.curr_moo === f.reg_moo &&
        f.curr_road === f.reg_road &&
        f.curr_tambon === f.reg_tambon &&
        f.curr_amphur === f.reg_amphur &&
        f.curr_province === f.reg_province &&
        f.curr_postcode === f.reg_postcode
      ) {
        return f;
      }

      return {
        ...f,
        curr_house_no: f.reg_house_no,
        curr_moo: f.reg_moo,
        curr_road: f.reg_road,
        curr_tambon: f.reg_tambon,
        curr_amphur: f.reg_amphur,
        curr_province: f.reg_province,
        curr_postcode: f.reg_postcode,
      };
    });
  }, [sameAddress, form.reg_house_no, form.reg_moo, form.reg_road, form.reg_tambon, form.reg_amphur, form.reg_province]);

  useEffect(() => {
    if (!motherSameAddress) return;

    setForm((f) => {
      if (
        f.mother_curr_house_no === f.mother_reg_house_no &&
        f.mother_curr_moo === f.mother_reg_moo &&
        f.mother_curr_road === f.mother_reg_road &&
        f.mother_curr_tambon === f.mother_reg_tambon &&
        f.mother_curr_amphur === f.mother_reg_amphur &&
        f.mother_curr_province === f.mother_reg_province
      ) {
        return f;
      }

      return {
        ...f,
        mother_curr_house_no: f.mother_reg_house_no,
        mother_curr_moo: f.mother_reg_moo,
        mother_curr_road: f.mother_reg_road,
        mother_curr_tambon: f.mother_reg_tambon,
        mother_curr_amphur: f.mother_reg_amphur,
        mother_curr_province: f.mother_reg_province,
      };
    });
  }, [motherSameAddress, form.mother_reg_house_no, form.mother_reg_moo, form.mother_reg_road, form.mother_reg_tambon, form.mother_reg_amphur, form.mother_reg_province]);

  useEffect(() => {
    if (!fatherSameAddress) return;

    setForm((f) => {
      if (
        f.father_curr_house_no === f.father_reg_house_no &&
        f.father_curr_moo === f.father_reg_moo &&
        f.father_curr_road === f.father_reg_road &&
        f.father_curr_tambon === f.father_reg_tambon &&
        f.father_curr_amphur === f.father_reg_amphur &&
        f.father_curr_province === f.father_reg_province
      ) {
        return f;
      }

      return {
        ...f,
        father_curr_house_no: f.father_reg_house_no,
        father_curr_moo: f.father_reg_moo,
        father_curr_road: f.father_reg_road,
        father_curr_tambon: f.father_reg_tambon,
        father_curr_amphur: f.father_reg_amphur,
        father_curr_province: f.father_reg_province,
      };
    });
  }, [fatherSameAddress, form.father_reg_house_no, form.father_reg_moo, form.father_reg_road, form.father_reg_tambon, form.father_reg_amphur, form.father_reg_province]);

  async function loadMyEnrollment() {
  const token = sessionStorage.getItem("token");
  if (!token) return;

  try {
    const res = await API.get("/enrollments/my");

    // backend ส่ง object ไม่ใช่ array
    setMyEnrollment(res.data || null);

  } catch (err) {
    console.log("loadMyEnrollment:", err?.response?.status);
  }
}

  function statusThai(status) {
    if (status === "approved") return "อนุมัติแล้ว";
    if (status === "pending") return "รอดำเนินการ";
    if (status === "rejected") return "ไม่ผ่านการพิจารณา";
    return status;
  }

  function onChange(e) {
    const { name, value } = e.currentTarget;
    setField(name, value);
  }

  function onFileChange(e) {
    const { name, files: f } = e.currentTarget;
    const file = f[0];

    if (!file) return;

    // ✅ นามสกุลที่อนุญาต
    const allowedTypes = ["image/png", "image/jpeg", "application/pdf"];

    if (!allowedTypes.includes(file.type)) {
      alert("อนุญาตเฉพาะไฟล์ PNG, JPG, PDF เท่านั้น");

      // เคลียร์ input
      e.target.value = "";

      return;
    }

    setFiles((s) => ({ ...s, [name]: file }));
  }

  function validateForm() {
   
    const e = {};
    const noSpaceNoSpecial = /^[A-Za-zก-๙0-9]+$/;
    const onlyNumber = /^\d+$/;
    const idCard13 = /^\d{13}$/;
    const phone10 = /^0\d{9}$/;

    /* ================= ข้อมูลเด็ก ================= */
    if (!form.student_prefix) e.student_prefix = "กรุณาเลือกคำนำหน้า";
    if (!form.student_firstname || !noSpaceNoSpecial.test(form.student_firstname))
      e.student_firstname = "ชื่อเด็กห้ามเว้นวรรค/อักขระพิเศษ";
    if (!form.student_lastname || !noSpaceNoSpecial.test(form.student_lastname))
      e.student_lastname = "นามสกุลเด็กห้ามเว้นวรรค/อักขระพิเศษ";
    if (!form.student_nickname || !noSpaceNoSpecial.test(form.student_nickname))
      e.student_nickname = "ชื่อเล่นห้ามเว้นวรรค/อักขระพิเศษ";
    if (!idCard13.test(form.student_idcard))
      e.student_idcard = "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก";
    if (!form.birth_date) e.birth_date = "กรุณาเลือกวันเกิด";
    if (!form.ethnicity) e.ethnicity = "กรุณากรอกเชื้อชาติ";
    if (!form.nationality) e.nationality = "กรุณากรอกสัญชาติ";
    if (!form.religion) e.religion = "กรุณากรอกศาสนา";
    if (!form.blood_group) e.blood_group = "กรุณาเลือกหมู่เลือด";
    if (!form.vaccine) e.vaccine = "กรุณาเลือกสถานะวัคซีน";
    if (!form.total_siblings) {
      e.total_siblings = "กรุณากรอกจำนวนพี่น้อง";
    }
    if (!form.male_siblings) {
      e.male_siblings = "กรุณากรอกจำนวนพี่น้องชาย";
    }
    if (!form.female_siblings) {
      e.female_siblings = "กรุณากรอกจำนวนพี่น้องหญิง";
    }
    if (
      form.total_siblings &&
      form.male_siblings &&
      form.female_siblings &&
      Number(form.male_siblings) + Number(form.female_siblings) !==
        Number(form.total_siblings)
    ) {
      e.total_siblings = "จำนวนพี่น้องรวมไม่ตรงกับชาย + หญิง";
    }
    if (!form.child_order) e.child_order = "กรุณากรอกลำดับบุตร";
    if (!form.child_behavior) e.child_behavior = "กรุณากรอกอุปนิสัยของเด็ก";
    if (!form.illness_history)
      e.illness_history = "หากไม่มีให้ใส่ ไม่มี";
    if (!form.genetic_disease)
      e.genetic_disease = "หากไม่มีให้ใส่ ไม่มี";
    if (!form.drug_allergy)
      e.drug_allergy = "หากไม่แพ้ยาให้ใส่ ไม่แพ้ยา";
    if (!form.previous_school)
      e.previous_school = "หากไม่เคยให้ใส่ ไม่เคย";
    if (!form.additional_info)
      e.additional_info = "หากไม่มีให้ใส่ ไม่มี";
    if (!form.congenital_disease)
      e.congenital_disease = "หากไม่มีให้ใส่ ไม่มี";
    if (!form.self_help_ability)
      e.self_help_ability = "กรุณากรอกความสามารถในการช่วยเหลือตนเอง";
    if (!form.food_allergy) e.food_allergy = "หากไม่แพ้อาหารให้ใส่ ไม่แพ้อาหาร";
    if (!phone10.test(form.emergency_phone))
      e.emergency_phone = "เบอร์โทรฉุกเฉินต้องขึ้นต้นด้วย 0 และมี 10 หลัก";
    /* ================= ที่อยู่เด็ก ================= */
   [
  "reg_house_no",
  "reg_moo",
  "reg_road",
  "reg_tambon",
  "reg_amphur",
  "reg_province",
  "reg_postcode",
  "curr_house_no",
  "curr_moo",
  "curr_road",
  "curr_tambon",
  "curr_amphur",
  "curr_province",
  "curr_postcode",
].forEach((f) => {
  if (!form[f]) {
    if (f.includes("road")) {
      e[f] = "กรุณากรอกถนน (ถ้าไม่มีให้ใส่ '-')";
    } else {
      e[f] = "กรุณากรอกข้อมูลที่อยู่ให้ครบ";
    }
  }
});

    if (form.reg_postcode && !/^\d{5}$/.test(form.reg_postcode)) {
  e.reg_postcode = "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก";
}

if (form.curr_postcode && !/^\d{5}$/.test(form.curr_postcode)) {
  e.curr_postcode = "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก";
}
    /* ================= มารดา ================= */
    if (!form.mother_prefix) e.mother_prefix = "กรุณาเลือกคำนำหน้ามารดา";
    if (!form.mother_firstname || !noSpaceNoSpecial.test(form.mother_firstname))
      e.mother_firstname = "ชื่อมารดาห้ามเว้นวรรค/อักขระพิเศษ";
    if (!form.mother_lastname || !noSpaceNoSpecial.test(form.mother_lastname))
      e.mother_lastname = "นามสกุลมารดาห้ามเว้นวรรค/อักขระพิเศษ";
    if (!idCard13.test(form.mother_idcard))
      e.mother_idcard = "เลขบัตรประชาชนมารดาไม่ถูกต้อง";
    if (!form.mother_birthdate) e.mother_birthdate = "กรุณาเลือกวันเกิดมารดา";
    if (!form.mother_ethnicity) e.mother_ethnicity = "กรุณากรอกเชื้อชาติมารดา";
    if (!form.mother_nationality) e.mother_nationality = "กรุณากรอกสัญชาติมารดา";
    if (!form.mother_religion) e.mother_religion = "กรุณากรอกศาสนามารดา";
    if (!form.mother_blood) e.mother_blood = "กรุณาเลือกหมู่เลือดมารดา";
    if (!phone10.test(form.mother_phone))
      e.mother_phone = "เบอร์โทรมารดาต้องขึ้นต้นด้วย 0 และมี 10 หลัก";
    if (!form.mother_job) {
  e.mother_job = "กรุณากรอกอาชีพมารดา";
}
if (!form.mother_income) {
  e.mother_income = "กรุณากรอกรายได้";
}

/* ================= ที่อยู่มารดา ================= */
[
  "mother_reg_house_no",
  "mother_reg_moo",
  "mother_reg_road",
  "mother_reg_tambon",
  "mother_reg_amphur",
  "mother_reg_province",
  "mother_curr_house_no",
  "mother_curr_moo",
  "mother_curr_road",
  "mother_curr_tambon",
  "mother_curr_amphur",
  "mother_curr_province",
].forEach((f) => {
  if (!form[f]) {
    if (f.includes("road")) {
      e[f] = "กรุณากรอกถนน (ถ้าไม่มีให้ใส่ '-')";
    } else {
      e[f] = "กรุณากรอกข้อมูลที่อยู่มารดาให้ครบ";
    }
  }
});

    /* ================= บิดา ================= */
    if (!form.father_prefix) e.father_prefix = "กรุณาเลือกคำนำหน้าบิดา";
    if (!form.father_firstname || !noSpaceNoSpecial.test(form.father_firstname))
      e.father_firstname = "ชื่อบิดาห้ามเว้นวรรค/อักขระพิเศษ";
    if (!form.father_lastname || !noSpaceNoSpecial.test(form.father_lastname))
      e.father_lastname = "นามสกุลบิดาห้ามเว้นวรรค/อักขระพิเศษ";
    if (!idCard13.test(form.father_idcard))
      e.father_idcard = "เลขบัตรประชาชนบิดาไม่ถูกต้อง";
    if (!form.father_birthdate) e.father_birthdate = "กรุณาเลือกวันเกิดบิดา";
    if (!form.father_ethnicity) e.father_ethnicity = "กรุณากรอกเชื้อชาติบิดา";
    if (!form.father_nationality) e.father_nationality = "กรุณากรอกสัญชาติบิดา";
    if (!form.father_religion) e.father_religion = "กรุณากรอกศาสนาบิดา";
    if (!form.father_blood) e.father_blood = "กรุณาเลือกหมู่เลือดบิดา";
    if (!phone10.test(form.father_phone))
      e.father_phone = "เบอร์โทรบิดาต้องขึ้นต้นด้วย 0 และมี 10 หลัก";
if (!form.father_job) {
  e.father_job = "กรุณากรอกอาชีพบิดา";
}
if (!form.father_income) {
  e.father_income = "กรุณากรอกรายได้";
}

/* ================= ที่อยู่บิดา ================= */
[
  "father_reg_house_no",
  "father_reg_moo",
  "father_reg_road",
  "father_reg_tambon",
  "father_reg_amphur",
  "father_reg_province",
  "father_curr_house_no",
  "father_curr_moo",
  "father_curr_road",
  "father_curr_tambon",
  "father_curr_amphur",
  "father_curr_province",
].forEach((f) => {
  if (!form[f]) {
    if (f.includes("road")) {
      e[f] = "กรุณากรอกถนน (ถ้าไม่มีให้ใส่ '-')";
    } else {
      e[f] = "กรุณากรอกข้อมูลที่อยู่บิดาให้ครบ";
    }
  }
});

    /* ================= ผู้ดูแล ================= */
    if (!form.care_responsible)
      e.care_responsible = "กรุณาเลือกผู้รับผิดชอบดูแลเด็ก";
    if (["ญาติ"].includes(form.care_responsible)) {
      if (!form.caregiver_prefix)
        e.caregiver_prefix = "กรุณาเลือกคำนำหน้าผู้อุปการะ";
      if (!form.caregiver_firstname)
        e.caregiver_firstname = "กรุณากรอกชื่อผู้อุปการะ";
      if (!form.caregiver_lastname)
        e.caregiver_lastname = "กรุณากรอกนามสกุลผู้อุปการะ";
      if (!form.caregiver_job)
        e.caregiver_job = "กรุณากรอกอาชีพผู้อุปการะ";
      if (!form.caregiver_income)
        e.caregiver_income = "กรุณากรอกรายได้ผู้อุปการะ";
      if (!form.caregiver_phone)
        e.caregiver_phone =
          "เบอร์โทรผู้อุปการะต้องขึ้นต้นด้วย 0 และมี 10 หลัก";
      if (
        form.caregiver_firstname &&
        !noSpaceNoSpecial.test(form.caregiver_firstname)
      ) {
        e.caregiver_firstname =
          "ชื่อผู้อุปการะห้ามมีเว้นวรรคหรืออักขระพิเศษ";
      }
      if (form.caregiver_income && !onlyNumber.test(form.caregiver_income)) {
        e.caregiver_income = "รายได้ผู้อุปการะต้องเป็นตัวเลข";
      }
      if (form.caregiver_phone && !phone10.test(form.caregiver_phone)) {
        e.caregiver_phone =
          "เบอร์โทรผู้อุปการะต้องขึ้นต้นด้วย 0 และมี 10 หลัก";
      }
    }

    /* ================= ผู้รับส่ง ================= */
    if (!form.sender_prefix) e.sender_prefix = "กรุณาเลือกคำนำหน้าผู้รับส่ง";
    if (!form.sender_firstname) e.sender_firstname = "กรุณากรอกชื่อผู้รับส่ง";
    if (!form.sender_lastname) e.sender_lastname = "กรุณากรอกนามสกุลผู้รับส่ง";
    if (!form.sender_relation) e.sender_relation = "กรุณากรอกความสัมพันธ์";
    if (!phone10.test(form.sender_phone))
      e.sender_phone = "เบอร์โทรผู้รับส่งไม่ถูกต้อง";

    /* ================= ตัวเลขที่ควรเป็นตัวเลข ================= */
    if (!form.weight || !onlyNumber.test(form.weight))
      e.weight = "กรุณากรอกน้ำหนักเป็นตัวเลข";

    if (!form.height || !onlyNumber.test(form.height))
      e.height = "กรุณากรอกส่วนสูงเป็นตัวเลข";

    if (form.mother_income && !onlyNumber.test(form.mother_income))
      e.mother_income = "รายได้ต้องเป็นตัวเลข";

    if (form.father_income && !onlyNumber.test(form.father_income))
      e.father_income = "รายได้ต้องเป็นตัวเลข";

    /* ================= เอกสารแนบ ================= */
    const requiredFiles = [
      "child_birth_certificate",
      "child_house_reg",
      "father_idcard_file",
      "father_house_reg",
      "mother_idcard_file",
      "mother_house_reg",
    ];

    // If the user already has an enrollment (myEnrollment), files are optional
    if (!myEnrollment) {
      requiredFiles.forEach((f) => {
        if (!files[f]) {
          e[f] = "ต้องแนบเอกสาร";
        }
      });
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  useEffect(() => {
    const root = formTopRef.current?.parentElement;
    if (!root) return;

    root.querySelectorAll(".field-label-error").forEach((node) => node.remove());

    root.querySelectorAll(".invalid-feedback").forEach((feedback) => {
      const text = feedback.textContent.trim();
      feedback.style.display = "";
      if (!text) return;

      let target = null;
      let current = feedback.previousElementSibling;

      while (current && !target) {
        if (current.matches("input, select, textarea")) {
          current = current.previousElementSibling;
          continue;
        }

        if (current.tagName === "LABEL" || current.tagName === "H6") {
          target = current;
        }

        current = current.previousElementSibling;
      }

      if (!target) return;

      feedback.style.display = "none";

      const error = document.createElement("span");
      error.className = "field-label-error text-danger small ms-2";
      error.textContent = text;
      target.appendChild(error);
    });
  }, [errors]);

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);

    if (!pdpa) {
  setMsg({
    type: "danger",
    text: "กรุณายินยอมข้อมูลส่วนบุคคลก่อนสมัคร"
  });
  setSubmitting(false);
  window.scrollTo({ top: 0, behavior: "smooth" });
  return;
}
if (myEnrollment?.status === "approved") {
  const ok = window.confirm(
    "คุณมีเด็กที่ได้รับการอนุมัติแล้ว\nต้องการสมัครเด็กเพิ่มหรือไม่?"
  );

  if (!ok) {
    setSubmitting(false);
    return;
  }
}

    if (!validateForm()) {
      setMsg({
        type: "danger",
        text: "กรุณากรอกข้อมูลให้ครบและถูกต้อง",
      });

      // 🔥 เพิ่มตรงนี้
      const firstError = document.querySelector(".is-invalid");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      setSubmitting(false);
      return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
      setMsg({
        type: "danger",
        text: "กรุณาเข้าสู่ระบบก่อนสมัครเรียน",
      });
      return;
    }

    if (myEnrollment?.status === "pending") {
  setMsg({
    type: "warning",
    text: "คุณมีใบสมัครที่กำลังรอพิจารณาอยู่"
  });
  setSubmitting(false);
  return;
}
    if (!form.birth_date) {
      setMsg({
      type: "danger",
      text: "กรุณาเลือกวันเกิดก่อนสมัคร",
      });
    return;
}

    try {
      // ป้องกันสมัครซ้ำโดยตรวจเลขบัตรเด็ก
      try {
        const checkRes = await API.get(`/enrollments/check/${form.student_idcard}`);
        if (checkRes.data && checkRes.data.exists) {
          setMsg({ type: "danger", text: "เด็กคนนี้มีการสมัครแล้ว" });
          return;
        }
      } catch (err) {
        // ignore check errors (server may not expose endpoint)
      }

      // บังคับคำนวณอีกครั้งก่อนส่ง
      const level = calculateApplyLevel(form.birth_date);
      const fd = new FormData();

      /* สร้าง schema เดียว ไม่ใช้ ...form */
      const payload = {
        /* ===== เด็ก ===== */
        prefix: form.student_prefix,
        first_name: form.student_firstname,
        last_name: form.student_lastname,
        nickname: form.student_nickname,
        citizen_id: form.student_idcard,
        birth_date: form.birth_date,
        apply_level: level,
        weight: form.weight,
        height: form.height,
        ethnicity: form.ethnicity,
        nationality: form.nationality,
        religion: form.religion,
        blood_group: form.blood_group,
        vaccine: form.vaccine,
        congenital_disease: form.congenital_disease,
        drug_allergy: form.drug_allergy,
        food_allergy: form.food_allergy,
        self_help_ability: form.self_help_ability,
        illness_history: form.illness_history,
        genetic_disease: form.genetic_disease,
        additional_info: form.additional_info,
        emergency_phone: form.emergency_phone,
        total_siblings: form.total_siblings,
        male_siblings: form.male_siblings,
        female_siblings: form.female_siblings,
        child_order: form.child_order,
        child_behavior: form.child_behavior,
        previous_school: form.previous_school,

        /* ===== ที่อยู่เด็ก (ทะเบียนบ้าน) ===== */
        reg_house_no: form.reg_house_no,
        reg_moo: form.reg_moo,
        reg_road: form.reg_road,
        reg_tambon: form.reg_tambon,
        reg_amphur: form.reg_amphur,
        reg_province: form.reg_province,
        reg_postcode: form.reg_postcode,

        /* ===== ที่อยู่เด็ก (ปัจจุบัน) ===== */
        curr_house_no: form.curr_house_no,
        curr_moo: form.curr_moo,
        curr_road: form.curr_road,
        curr_tambon: form.curr_tambon,
        curr_amphur: form.curr_amphur,
        curr_province: form.curr_province,
        curr_postcode: form.curr_postcode,

        /* ===== มารดา ===== */
        mother_prefix: form.mother_prefix,
        mother_firstname: form.mother_firstname,
        mother_lastname: form.mother_lastname,
        mother_idcard: form.mother_idcard,
        mother_birthdate: form.mother_birthdate,
        mother_ethnicity: form.mother_ethnicity,
        mother_nationality: form.mother_nationality,
        mother_religion: form.mother_religion,
        mother_blood: form.mother_blood,
        mother_phone: form.mother_phone,
        mother_job: form.mother_job,
        mother_income: form.mother_income,
        mother_reg_house_no: form.mother_reg_house_no,
        mother_reg_moo: form.mother_reg_moo,
        mother_reg_road: form.mother_reg_road,
        mother_reg_tambon: form.mother_reg_tambon,
        mother_reg_amphur: form.mother_reg_amphur,
        mother_reg_province: form.mother_reg_province,
        mother_curr_house_no: form.mother_curr_house_no,
        mother_curr_moo: form.mother_curr_moo,
        mother_curr_tambon: form.mother_curr_tambon,
        mother_curr_amphur: form.mother_curr_amphur,
        mother_curr_province: form.mother_curr_province,
        mother_curr_road: form.mother_curr_road,
        /* ===== บิดา ===== */
        father_prefix: form.father_prefix,
        father_firstname: form.father_firstname,
        father_lastname: form.father_lastname,
        father_idcard: form.father_idcard,
        father_birthdate: form.father_birthdate,
        father_ethnicity: form.father_ethnicity,
        father_nationality: form.father_nationality,
        father_religion: form.father_religion,
        father_blood: form.father_blood,
        father_phone: form.father_phone,
        father_job: form.father_job,
        father_income: form.father_income,
        father_reg_house_no: form.father_reg_house_no,
        father_reg_moo: form.father_reg_moo,
        father_reg_road: form.father_reg_road,
        father_reg_tambon: form.father_reg_tambon,
        father_reg_amphur: form.father_reg_amphur,
        father_reg_province: form.father_reg_province,
        father_curr_house_no: form.father_curr_house_no,
        father_curr_moo: form.father_curr_moo,
        father_curr_tambon: form.father_curr_tambon,
        father_curr_amphur: form.father_curr_amphur,
        father_curr_province: form.father_curr_province,
        father_curr_road: form.father_curr_road,
        /* ===== ผู้ดูแล ===== */
        care_responsible: form.care_responsible,
        caregiver_prefix: form.caregiver_prefix,
        caregiver_firstname: form.caregiver_firstname,
        caregiver_lastname: form.caregiver_lastname,
        caregiver_phone: form.caregiver_phone,
        caregiver_job: form.caregiver_job,
        caregiver_income: form.caregiver_income,

        /* ===== ผู้รับส่ง ===== */
        sender_prefix: form.sender_prefix,
        sender_firstname: form.sender_firstname,
        sender_lastname: form.sender_lastname,
        sender_relation: form.sender_relation,
        sender_phone: form.sender_phone,
      };

      // payload constructed explicitly (no spread) to avoid key shadowing

      /* แนบ JSON */
      fd.append("payload", JSON.stringify(payload));

      /* แนบไฟล์ */
      Object.entries(files).forEach(([k, f]) => {
        if (f) fd.append(k, f);
      });

      await API.post("/enrollments", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMsg({ type: "success", text: "สมัครเรียนเรียบร้อย" });
      window.scrollTo({
      top: 0,
      behavior: "smooth"
      });
/* ⭐ reset checkbox PDPA */
setPdpa(false);
/* ⭐ reset file input */

      // reset form and uploaded files to avoid accidental duplicate submissions
      setForm(initial);
      setFiles({
        child_birth_certificate: null,
        child_house_reg: null,
        father_idcard_file: null,
        father_house_reg: null,
        mother_idcard_file: null,
        mother_house_reg: null,
      });
      if (childBirthRef.current) childBirthRef.current.value = "";
      if (childHouseRef.current) childHouseRef.current.value = "";
      if (fatherIdRef.current) fatherIdRef.current.value = "";
      if (fatherHouseRef.current) fatherHouseRef.current.value = "";
      if (motherIdRef.current) motherIdRef.current.value = "";
      if (motherHouseRef.current) motherHouseRef.current.value = "";
      setSameAddress(false);
      setMotherSameAddress(false);
      setFatherSameAddress(false);

      loadMyEnrollment();
    } catch {
      setMsg({
        type: "danger",
        text: "สมัครเรียนไม่สำเร็จ",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card mb-3">
    <div className="container my-5 enrollment-page" style={{ zIndex: 10 }}>
      <div ref={formTopRef}></div>
      <div className="enroll-header text-center mb-4">
  <h2 className="fw-bold text-success mb-2">
    ใบสมัครเรียน
  </h2>

  <div className="header-line"></div>

  <p className="mb-1 text-secondary">
    ศูนย์พัฒนาเด็กเล็กองค์การบริหารส่วนตำบลหนองน้ำแดง
  </p>
  <p className="text-secondary">
    สังกัดองค์การบริหารส่วนตำบลหนองน้ำแดง
  </p>
</div>

      {myEnrollment?.status === "pending" && (
  <div className="alert alert-warning">
    คุณมีใบสมัครที่กำลังรอพิจารณาอยู่
  </div>
)}

{myEnrollment?.status === "approved" && (
  <div className="alert alert-success">
    คุณมีเด็กที่ได้รับการอนุมัติแล้ว สามารถสมัครเด็กเพิ่มได้
  </div>
)}

{myEnrollment?.status === "rejected" && (
  <div className="alert alert-danger">
    ใบสมัครล่าสุดไม่ผ่านการพิจารณา
    {myEnrollment.note && (
      <div className="mt-2">
        เหตุผล: {myEnrollment.note}
      </div>
    )}
  </div>
)}
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <form onSubmit={(e) => e.preventDefault()} encType="multipart/form-data">
        {/* ================= ข้อมูลเด็ก ================= */}
        <div className="card mb-3">
          <div className="card-body">
            <h5>ข้อมูลเด็ก</h5>
            <div className="alert alert-secondary mb-2">
              ระบบจะจัดห้องให้อัตโนมัติหลังเจ้าหน้าที่อนุมัติใบสมัคร
            </div>

            <label>
              คำนำหน้า <span className="text-danger">*</span>
              {errors.student_prefix && (
                <span className="text-danger small ms-2">
                  {errors.student_prefix}
                </span>
              )}
            </label>
            <select
              className={`form-select mb-2 ${
                errors.student_prefix ? "is-invalid" : ""
              }`}
              name="student_prefix"
              value={form.student_prefix}
              onChange={onChange}
            >
              <option value="">-- เลือก --</option>
              <option value="เด็กชาย">เด็กชาย</option>
              <option value="เด็กหญิง">เด็กหญิง</option>
            </select>

            <label>
              ชื่อเด็ก <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.student_firstname ? "is-invalid" : ""
              }`}
              name="student_firstname"
              value={form.student_firstname}
              onChange={(e) => {
                const v = e.currentTarget.value.replace(/[^A-Za-zก-๙0-9]/g, "");
                setField("student_firstname", v);
              }}
              placeholder="ชื่อเด็ก"
            />
            <div className="invalid-feedback">{errors.student_firstname}</div>

            <label>
              นามสกุลเด็ก <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.student_lastname ? "is-invalid" : ""
              }`}
              name="student_lastname"
              value={form.student_lastname}
              onChange={(e) => {
                const v = e.currentTarget.value.replace(/[^A-Za-zก-๙0-9]/g, "");
                setField("student_lastname", v);
              }}
              placeholder="นามสกุลเด็ก"
            />
            <div className="invalid-feedback">{errors.student_lastname}</div>

            <label>
              ชื่อเล่น <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.student_nickname ? "is-invalid" : ""
              }`}
              name="student_nickname"
              value={form.student_nickname}
              onChange={(e) => {
                const v = e.currentTarget.value.replace(/[^A-Za-zก-๙0-9]/g, "");
                setField("student_nickname", v);
              }}
              placeholder="ชื่อเล่น"
            />
            <div className="invalid-feedback">{errors.student_nickname}</div>

            <label>
              เลขบัตรประชาชน <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.student_idcard ? "is-invalid" : ""
              }`}
              name="student_idcard"
              maxLength={13}
              value={form.student_idcard}
              onChange={(e) => {
                const v = e.currentTarget.value.replace(/\D/g, "");
                setField("student_idcard", v);
              }}
              placeholder="เลขบัตรประชาชน 13 หลัก"
            />
            <div className="invalid-feedback">{errors.student_idcard}</div>

            <label>
              วันเดือนปีเกิด{" "}
              <span className="text-danger"> *กรอกป็นปีคศ.เช่น 17/05/2022</span>
            </label>
            <input
              type="date"
              name="birth_date"
              className={`form-control mb-2 ${
                errors.birth_date ? "is-invalid" : ""
              }`}
              value={form.birth_date}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setField("birth_date", value);
                setField("apply_level", calculateApplyLevel(value));
              }}
              placeholder="วันเดือนปีเกิด"
            />
            {form.apply_level && (
              <div className="alert alert-info mt-2">
                ระบบประเมินระดับชั้นอัตโนมัติ: <b>{form.apply_level}</b>
              </div>
            )}
            <div className="invalid-feedback">{errors.birth_date}</div>

            <label className="form-label">น้ำหนัก</label>
            <input
              className={`form-control mb-2 ${
                errors.weight ? "is-invalid" : ""
              }`}
              name="weight"
              value={form.weight}
              onChange={(e) => {
                const v = e.currentTarget.value.replace(/\D/g, "");
                setField("weight", v);
              }}
              placeholder="น้ำหนัก"
            />
            <div className="invalid-feedback">{errors.weight}</div>

            <label className="form-label">ส่วนสูง</label>
            <input
              className={`form-control mb-2 ${
                errors.height ? "is-invalid" : ""
              }`}
              name="height"
              value={form.height}
              onChange={(e) => {
                const v = e.currentTarget.value.replace(/\D/g, "");
                setField("height", v);
              }}
              placeholder="ส่วนสูง"
            />
            <div className="invalid-feedback">{errors.height}</div>

            <label className="form-label">
              เชื้อชาติ <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.ethnicity ? "is-invalid" : ""
              }`}
              name="ethnicity"
              value={form.ethnicity || ""}
              onChange={onChange}
              placeholder="เชื้อชาติ"
            />
            <div className="invalid-feedback">{errors.ethnicity}</div>

            <label className="form-label">
              สัญชาติ <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.nationality ? "is-invalid" : ""
              }`}
              name="nationality"
              value={form.nationality || ""}
              onChange={onChange}
              placeholder="สัญชาติ"
            />
            <div className="invalid-feedback">{errors.nationality}</div>

            <label className="form-label">
              ศาสนา <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.religion ? "is-invalid" : ""
              }`}
              name="religion"
              value={form.religion || ""}
              onChange={onChange}
              placeholder="ศาสนา"
            />
            <div className="invalid-feedback">{errors.religion}</div>

            <label>
              หมู่เลือด <span className="text-danger">*</span>
            </label>
            <select
              className={`form-select mb-2 ${
                errors.blood_group ? "is-invalid" : ""
              }`}
              name="blood_group"
              value={form.blood_group}
              onChange={onChange}
            >
              <option value="">-- เลือก --</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
            </select>
            <div className="invalid-feedback">{errors.blood_group}</div>

            <label>
              มีพี่น้องทั้งหมด <span className="text-danger">*</span>
            </label>
            <div className="row mb-2">
              <div className="col-md-4">
                <label className="form-label small">ทั้งหมด</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={`form-control ${
                    errors.total_siblings ? "is-invalid" : ""
                  }`}
                  name="total_siblings"
                  value={form.total_siblings}
                  onChange={(e) => {
                    const v = e.currentTarget.value.replace(/\D/g, "");
                    setField("total_siblings", v);
                  }}
                  placeholder="ทั้งหมด"
                  min="0"
                />
                <div className="invalid-feedback">{errors.total_siblings}</div>
              </div>
              <div className="col-md-4">
                <label className="form-label small">เป็นชาย</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={`form-control ${
                    errors.male_siblings ? "is-invalid" : ""
                  }`}
                  name="male_siblings"
                  value={form.male_siblings}
                  onChange={(e) => {
                    const v = e.currentTarget.value.replace(/\D/g, "");
                    setField("male_siblings", v);
                  }}
                  placeholder="เป็นชาย"
                  min="0"
                />
                <div className="invalid-feedback">{errors.male_siblings}</div>
              </div>
              <div className="col-md-4">
                <label className="form-label small">เป็นหญิง</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={`form-control ${
                    errors.female_siblings ? "is-invalid" : ""
                  }`}
                  name="female_siblings"
                  value={form.female_siblings}
                  onChange={(e) => {
                    const v = e.currentTarget.value.replace(/\D/g, "");
                    setField("female_siblings", v);
                  }}
                  placeholder="เป็นหญิง"
                  min="0"
                />
                <div className="invalid-feedback">{errors.female_siblings}</div>
              </div>
            </div>

            <label>
              นักเรียนเป็นบุตรคนที่ <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              className={`form-control mb-2 ${
                errors.child_order ? "is-invalid" : ""
              }`}
              name="child_order"
              value={form.child_order}
              onChange={(e) => {
                const v = e.currentTarget.value.replace(/\D/g, "");
                setField("child_order", v);
              }}
              placeholder="เช่น 1"
              min="1"
            />
            <div className="invalid-feedback">{errors.child_order}</div>

            <label>
              อุปนิสัยของเด็ก 
            </label>
            <textarea
              className={`form-control mb-2 ${
                errors.child_behavior ? "is-invalid" : ""
              }`}
              name="child_behavior"
              value={form.child_behavior}
              onChange={onChange}
              placeholder="บรรยายอุปนิสัยของเด็ก เช่น อ่อนโยน ร่าเริง คล้ายคลึง"
            />
            <div className="invalid-feedback">{errors.child_behavior}</div>
            

            <label>
              ประวัติการได้รับอุบัติเหตุหรือเจ็บป่วยเมื่ออายุ
    
            </label>
            <textarea
              className={`form-control mb-2 ${
                errors.illness_history ? "is-invalid" : ""
              }`}
              name="illness_history"
              value={form.illness_history}
              onChange={onChange}
              placeholder="หากไม่มี ให้ระบุ 'ไม่มี'"
            />
            <div className="invalid-feedback">{errors.illness_history}</div>

            <label>
              โรคจากพันธุกรรมหรือความผิดปกติต่างๆ
            </label>
            <textarea
              className={`form-control mb-2 ${
                errors.genetic_disease ? "is-invalid" : ""
              }`}
              name="genetic_disease"
              value={form.genetic_disease}
              onChange={onChange}
              placeholder="หากไม่มี ให้ระบุ 'ไม่มี'"
            />
            <div className="invalid-feedback">{errors.genetic_disease}</div>

            <label>
              แพ้ยา 
            </label>
            <input
              className={`form-control mb-2 ${
                errors.drug_allergy ? "is-invalid" : ""
              }`}
              name="drug_allergy"
              value={form.drug_allergy}
              onChange={onChange}
              placeholder="ระบุชื่อยา หรือหากไม่มี ให้ระบุ 'ไม่แพ้ยา'"
            />
            <div className="invalid-feedback">{errors.drug_allergy}</div>

            
            <label>
              นักเรียนเคยเข้าโรงเรียนหรือสถานเลี้ยงเด็กมาก่อน
            </label>
            <input
              className={`form-control mb-2 ${
                errors.previous_school ? "is-invalid" : ""
              }`}
              name="previous_school"
              value={form.previous_school}
              onChange={onChange}
              placeholder="ชื่อโรงเรียนหรือสถานเลี้ยงเด็ก ถ้าไม่ ให้ระบุ 'ไม่เคย'"
            />
            <div className="invalid-feedback">{errors.previous_school}</div>

            <label>
              ข้อมูลอื่น ๆ ที่ควรแจ้งให้ศูนย์พัฒนาเด็กเล็ก ทราบ
            </label>
            <textarea
              className={`form-control mb-2 ${
                errors.additional_info ? "is-invalid" : ""
              }`}
              name="additional_info"
              value={form.additional_info}
              onChange={onChange}
              placeholder="ข้อมูลอื่นๆ ที่ควรแจ้ง หากไม่มีให้ระบุ 'ไม่มี'"
            />
            <div className="invalid-feedback">{errors.additional_info}</div>

            <label className="form-label">
              การได้รับวัคซีน<span className="text-danger">*</span>
            </label>
            <select
              className={`form-select mb-2 ${
                errors.vaccine ? "is-invalid" : ""
              }`}
              name="vaccine"
              value={form.vaccine}
              onChange={onChange}
            >
              <option value="">-- เลือก --</option>
              <option value="ได้รับวัคซีนแล้ว">ได้รับวัคซีนแล้ว</option>
              <option value="ยังไม่ได้รับวัคซีน">ยังไม่ได้รับวัคซีน</option>
            </select>
              <div className="invalid-feedback"> {errors.vaccine}</div>
            <label className="form-label">
              โรคประจำตัว 
            </label>
            <textarea
              className={`form-control mb-2 ${
                errors.congenital_disease ? "is-invalid" : ""
              }`}
              name="congenital_disease"
              value={form.congenital_disease}
              onChange={onChange}
              placeholder="หากไม่มีให้ระบุ 'ไม่มี'"
            />
            <div className="invalid-feedback">{errors.congenital_disease}</div>

            <label className="form-label">
              ความสามารถในการช่วยเหลือตนเอง 
            </label>
            <textarea
              className={`form-control mb-2 ${
                errors.self_help_ability ? "is-invalid" : ""
              }`}
              name="self_help_ability"
              value={form.self_help_ability}
              onChange={onChange}
              placeholder="อาบน้ำ ทำความสะอาด แต่งตัว "
            />
            <div className="invalid-feedback">{errors.self_help_ability}</div>

            <label>
              อาหารที่แพ้ 
            </label>
            <input
              className={`form-control mb-2 ${
                errors.food_allergy ? "is-invalid" : ""
              }`}
              name="food_allergy"
              value={form.food_allergy}
              onChange={onChange}
              placeholder="ถ้าไม่ ให้ระบุ 'ไม่มี'"
            />
            <div className="invalid-feedback">{errors.food_allergy}</div>
          </div>
        </div>

        {/* ================= ที่อยู่เด็ก ================= */}
        <div className="card mb-3">
          <div className="card-body">
            <h5>
              ที่อยู่เด็ก<span className="text-danger">*</span>
            </h5>

            <h6>
              ทะเบียนบ้าน<span className="text-danger">*</span>
            </h6>
            <input
              className={`form-control mb-2 ${
                errors.reg_house_no ? "is-invalid" : ""
              }`}
              name="reg_house_no"
              value={form.reg_house_no}
              onChange={onChange}
              placeholder="บ้านเลขที่ "
            />
            <div className="invalid-feedback">{errors.reg_house_no}</div>

            <label className="form-label">
              หมู่<span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.reg_moo ? "is-invalid" : ""
              }`}
              name="reg_moo"
              value={form.reg_moo}
              onChange={onChange}
              placeholder="หมู่ "
            />
            <div className="invalid-feedback">{errors.reg_moo}</div>
              <label>ถนน<span className="text-danger">*</span></label>
            <input
               className={`form-control mb-2 ${errors.reg_road ? "is-invalid" : ""}`}
              name="reg_road"
              value={form.reg_road}
              onChange={onChange}
              placeholder="ถนน"
            />
            <div className="invalid-feedback">{errors.reg_road}</div>  

            <label className="form-label">
              ตำบล<span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.reg_tambon ? "is-invalid" : ""
              }`}
              name="reg_tambon"
              value={form.reg_tambon}
              onChange={onChange}
              placeholder="ตำบล "
            />
            <div className="invalid-feedback">{errors.reg_tambon}</div>

            <label className="form-label">
              อำเภอ<span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.reg_amphur ? "is-invalid" : ""
              }`}
              name="reg_amphur"
              value={form.reg_amphur}
              onChange={onChange}
              placeholder="อำเภอ "
            />
            <div className="invalid-feedback">{errors.reg_amphur}</div>

            <label className="form-label">
              จังหวัด<span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.reg_province ? "is-invalid" : ""
              }`}
              name="reg_province"
              value={form.reg_province}
              onChange={onChange}
              placeholder="จังหวัด "
            />
            <div className="invalid-feedback">{errors.reg_province}</div>

              <label>รหัสไปรษณีย์<span className="text-danger">*</span></label>
            <input
               className={`form-control mb-2 ${errors.reg_postcode ? "is-invalid" : ""}`}
              name="reg_postcode"
              value={form.reg_postcode}
              onChange={onChange}
              placeholder="รหัสไปรษณีย์"
            />
            <div className="invalid-feedback">{errors.reg_postcode}</div>

            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                checked={sameAddress}
                onChange={(e) => {
                  const checked = e.currentTarget.checked;
                  setSameAddress(checked);
                  if (checked) {
                    setField("curr_house_no", form.reg_house_no);
                    setField("curr_moo", form.reg_moo);
                    setField("curr_road", form.reg_road);
                    setField("curr_tambon", form.reg_tambon);
                    setField("curr_amphur", form.reg_amphur);
                    setField("curr_province", form.reg_province);
                  } else {
                    setField("curr_house_no", "");
                    setField("curr_moo", "");
                    setField("curr_tambon", "");
                    setField("curr_amphur", "");
                    setField("curr_province", "");
                  }
                }}
              />
              <label className="form-check-label">
                ที่อยู่ปัจจุบันเหมือนทะเบียนบ้าน
              </label>
            </div>

            <h6>ที่อยู่ปัจจุบัน</h6>
            <label className="form-label">บ้านเลขที่<span className="text-danger">*</span></label>
            <input
              className={`form-control mb-2 ${
                errors.curr_house_no ? "is-invalid" : ""
              }`}
              name="curr_house_no"
              value={form.curr_house_no}
              onChange={onChange}
              placeholder="บ้านเลขที่ "
            />
            <div className="invalid-feedback">{errors.curr_house_no}</div>
            <label className="form-label">หมู่<span className="text-danger">*</span></label>
            <input
              className={`form-control mb-2 ${
                errors.curr_moo ? "is-invalid" : ""
              }`}
              name="curr_moo"
              value={form.curr_moo}
              onChange={onChange}
              placeholder="หมู่"
            />
            <div className="invalid-feedback">{errors.curr_moo}</div>

              <label>ถนน<span className="text-danger">*</span></label>
            <input
              className={`form-control mb-2 ${errors.curr_road ? "is-invalid" : ""}`}
              name="curr_road"
              value={form.curr_road}
              onChange={onChange}
              placeholder="ถนน"
            />
            <div className="invalid-feedback">{errors.curr_road}</div>

              <label className="form-label">ตำบล<span className="text-danger">*</span></label>
            <input
              className={`form-control mb-2 ${
                errors.curr_tambon ? "is-invalid" : ""
              }`}
              name="curr_tambon"
              value={form.curr_tambon}
              onChange={onChange}
              placeholder="ตำบล"
            />
            <div className="invalid-feedback">{errors.curr_tambon}</div>
            <label className="form-label">อำเภอ<span className="text-danger">*</span></label>
            <input
              className={`form-control mb-2 ${
                errors.curr_amphur ? "is-invalid" : ""
              }`}
              name="curr_amphur"
              value={form.curr_amphur}
              onChange={onChange}
              placeholder="อำเภอ"
            />
            <div className="invalid-feedback">{errors.curr_amphur}</div>
              <label className="form-label">จังหวัด<span className="text-danger">*</span></label>
            <input
              className={`form-control mb-2 ${
                errors.curr_province ? "is-invalid" : ""
              }`}
              name="curr_province"
              value={form.curr_province}
              onChange={onChange}
              placeholder="จังหวัด"
            />
            <div className="invalid-feedback">{errors.curr_province}</div>
              <label>รหัสไปรษณีย์<span className="text-danger">*</span></label>
            <input
              className={`form-control mb-2 ${errors.curr_postcode ? "is-invalid" : ""}`}
              name="curr_postcode"
              value={form.curr_postcode}
              onChange={onChange}
              placeholder="รหัสไปรษณีย์"
            />
            <div className="invalid-feedback">{errors.curr_postcode}</div>

            <label>
              เบอร์โทรศัพท์ฉุกเฉินที่สามารถติดต่อได้{" "}
              <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.emergency_phone ? "is-invalid" : ""
              }`}
              name="emergency_phone"
              maxLength={10}
              placeholder="กรุณากรอกเบอร์โทรศัพท์มือถือที่สามารถติดต่อได้ในกรณีฉุกเฉิน"
              value={form.emergency_phone}
              onChange={(e) => {
                const v = e.currentTarget.value.replace(/\D/g, "");
                setField("emergency_phone", v);
              }}
            />
            <div className="invalid-feedback">{errors.emergency_phone}</div>
          </div>
          
        </div>
       

        {/* ================= มารดา ================= */}
        <div className="card mb-3">
          <div className="card-body">
            <h5>ข้อมูลมารดา</h5>
            <label>
              คำนำหน้า<span className="text-danger">*</span>
              {errors.mother_prefix && (
                <span className="text-danger small ms-2">
                  {errors.mother_prefix}
                </span>
              )}
            </label>
            <select
              className={`form-select mb-2 ${
                errors.mother_prefix ? "is-invalid" : ""
              }`}
              name="mother_prefix"
              value={form.mother_prefix}
              onChange={onChange}
            >
              <option value="">คำนำหน้า</option>
              <option value="นาง">นาง</option>
              <option value="นางสาว">นางสาว</option>
            </select>

            <label>
              ชื่อ <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.mother_firstname ? "is-invalid" : ""
              }`}
              name="mother_firstname"
              value={form.mother_firstname}
              onChange={(e) => {
                const v = e.currentTarget.value.replace(/[^A-Za-zก-๙0-9]/g, "");
                setField("mother_firstname", v);
              }}
              placeholder="ชื่อมารดา"
            />
            <div className="invalid-feedback">{errors.mother_firstname}</div>

            <label>
              นามสกุล<span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.mother_lastname ? "is-invalid" : ""
              }`}
              name="mother_lastname"
              value={form.mother_lastname}
              onChange={(e) => {
                const v = e.currentTarget.value.replace(/[^A-Za-zก-๙0-9]/g, "");
                setField("mother_lastname", v);
              }}
              placeholder="นามสกุลมารดา"
            />
            <div className="invalid-feedback">{errors.mother_lastname}</div>

            <label>
              เลขบัตรประชาชน <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.mother_idcard ? "is-invalid" : ""
              }`}
              maxLength={13}
              name="mother_idcard"
              value={form.mother_idcard}
              onChange={(e) => {
                const v = e.currentTarget.value.replace(/\D/g, "");
                setField("mother_idcard", v);
              }}
              placeholder="เลขบัตรประชาชน"
            />
            <div className="invalid-feedback">{errors.mother_idcard}</div>

            <label>
              วันเดือนปีเกิด <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              className={`form-control mb-2 ${
                errors.mother_birthdate ? "is-invalid" : ""
              }`}
              name="mother_birthdate"
              value={form.mother_birthdate}
              onChange={onChange}
              placeholder="วันเดือนปีเกิด"
            />
            <div className="invalid-feedback">{errors.mother_birthdate}</div>

            <label>
              เชื้อชาติ <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.mother_ethnicity ? "is-invalid" : ""
              }`}
              name="mother_ethnicity"
              value={form.mother_ethnicity}
              onChange={onChange}
              placeholder="เชื้อชาติ"
            />
            <div className="invalid-feedback">{errors.mother_ethnicity}</div>

            <label>
              สัญชาติ <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.mother_nationality ? "is-invalid" : ""
              }`}
              name="mother_nationality"
              value={form.mother_nationality}
              onChange={onChange}
              placeholder="สัญชาติ"
            />
            <div className="invalid-feedback">{errors.mother_nationality}</div>

            <label>
              ศาสนา <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.mother_religion ? "is-invalid" : ""
              }`}
              name="mother_religion"
              value={form.mother_religion}
              onChange={onChange}
              placeholder="ศาสนา"
            />
            <div className="invalid-feedback">{errors.mother_religion}</div>

            <label>
              หมู่เลือด <span className="text-danger">*</span>
            </label>
            <select
              className={`form-select mb-2 ${
                errors.mother_blood ? "is-invalid" : ""
              }`}
              name="mother_blood"
              value={form.mother_blood}
              onChange={onChange}
            >
              <option value="">-- เลือก --</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
            </select>
            <div className="invalid-feedback">{errors.mother_blood}</div>

            <h6 className="mt-3">
              ที่อยู่ตามทะเบียนบ้าน (มารดา) <span className="text-danger">*</span>
            </h6>
            <label className="form-label">
              บ้านเลขที่<span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.mother_reg_house_no ? "is-invalid" : ""
              }`}
              name="mother_reg_house_no"
              value={form.mother_reg_house_no}
              onChange={onChange}
              placeholder="บ้านเลขที่ "
            />
            <div className="invalid-feedback">{errors.mother_reg_house_no}</div>

            <label className="form-label">
              หมู่<span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${errors.mother_reg_moo ? "is-invalid" : ""}`}
              name="mother_reg_moo"
              value={form.mother_reg_moo}
              onChange={onChange}
              placeholder="หมู่"
            />
            <div className="invalid-feedback">{errors.mother_reg_moo}</div>

              <label>ถนน<span className="text-danger">*</span></label>
              <input
                className={`form-control mb-2 ${errors.mother_reg_road ? "is-invalid" : ""}`}
                name="mother_reg_road"
                value={form.mother_reg_road}
                onChange={onChange}
                placeholder="ถนน"
              />
              <div className="invalid-feedback">{errors.mother_reg_road}</div>
            <label className="form-label">
              ตำบล<span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${errors.mother_reg_tambon ? "is-invalid" : ""}`}
              name="mother_reg_tambon"
              value={form.mother_reg_tambon}
              onChange={onChange}
              placeholder="ตำบล"
            />
            <div className="invalid-feedback">{errors.mother_reg_tambon}</div>

            <label className="form-label">
              อำเภอ<span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${errors.mother_reg_amphur ? "is-invalid" : ""}`}
              name="mother_reg_amphur"
              value={form.mother_reg_amphur}
              onChange={onChange}
              placeholder="อำเภอ"
            />
            <div className="invalid-feedback">{errors.mother_reg_amphur}</div>

            <label className="form-label">
              จังหวัด<span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${errors.mother_reg_province ? "is-invalid" : ""}`}
              name="mother_reg_province"
              value={form.mother_reg_province}
              onChange={onChange}
              placeholder="จังหวัด"
            />
            <div className="invalid-feedback">{errors.mother_reg_province}</div>

            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                checked={motherSameAddress}
                onChange={(e) => {
                  const checked = e.currentTarget.checked;
                  setMotherSameAddress(checked);
                  if (checked) {
                    setField("mother_curr_house_no", form.mother_reg_house_no);
                    setField("mother_curr_moo", form.mother_reg_moo);
                    setField("mother_curr_road", form.mother_reg_road);
                    setField("mother_curr_tambon", form.mother_reg_tambon);
                    setField("mother_curr_amphur", form.mother_reg_amphur);
                    setField("mother_curr_province", form.mother_reg_province);
                  } else {
                    setField("mother_curr_house_no", "");
                    setField("mother_curr_moo", "");
                    setField("mother_curr_road", "");
                    setField("mother_curr_tambon", "");
                    setField("mother_curr_amphur", "");
                    setField("mother_curr_province", "");
                  }
                }}
              />
              <label className="form-check-label">
                ที่อยู่ปัจจุบันเหมือนทะเบียนบ้าน
              </label>
            </div>

            <h6 className="mt-3">ที่อยู่ปัจจุบัน (มารดา)</h6>
            <label className="form-label">บ้านเลขที่<span className="text-danger">*</span></label>
            <input
              className={`form-control mb-2 ${errors.mother_curr_house_no ? "is-invalid" : ""}`}
              name="mother_curr_house_no"
              value={form.mother_curr_house_no}
              onChange={onChange}
              placeholder="บ้านเลขที่"
            />
            <div className="invalid-feedback">{errors.mother_curr_house_no}</div>

            <label className="form-label">หมู่<span className="text-danger">*</span></label>
            <input
              className={`form-control mb-2 ${errors.mother_curr_moo ? "is-invalid" : ""}`}
              name="mother_curr_moo"
              value={form.mother_curr_moo}
              onChange={onChange}
              placeholder="หมู่"
            />
            <div className="invalid-feedback">{errors.mother_curr_moo}</div>

            <label>ถนน<span className="text-danger">*</span></label>
            <input
               className={`form-control mb-2 ${errors.mother_curr_road ? "is-invalid" : ""}`}
              name="mother_curr_road"
              value={form.mother_curr_road}
              onChange={onChange}
              placeholder="ถนน"
            />
            <div className="invalid-feedback">{errors.mother_curr_road}</div>

            <label className="form-label">ตำบล<span className="text-danger">*</span></label>
            <input
              className={`form-control mb-2 ${errors.mother_curr_tambon ? "is-invalid" : ""}`}
              name="mother_curr_tambon"
              value={form.mother_curr_tambon}
              onChange={onChange}
              placeholder="ตำบล"
            />
            <div className="invalid-feedback">{errors.mother_curr_tambon}</div>

            <label className="form-label">อำเภอ<span className="text-danger">*</span></label>
            <input
              className={`form-control mb-2 ${errors.mother_curr_amphur ? "is-invalid" : ""}`}
              name="mother_curr_amphur"
              value={form.mother_curr_amphur}
              onChange={onChange}
              placeholder="อำเภอ"
            />
            <div className="invalid-feedback">{errors.mother_curr_amphur}</div>

            <label className="form-label">จังหวัด<span className="text-danger">*</span></label>
            <input
              className={`form-control mb-2 ${errors.mother_curr_province ? "is-invalid" : ""}`}
              name="mother_curr_province"
              value={form.mother_curr_province}
              onChange={onChange}
              placeholder="จังหวัด"
            />
            <div className="invalid-feedback">{errors.mother_curr_province}</div>
            <label>
              เบอร์โทรศัพท์ <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.mother_phone ? "is-invalid" : ""
              }`}
              name="mother_phone"
              maxLength={10}
              value={form.mother_phone}
              onChange={(e) => {
                const v = e.currentTarget.value.replace(/\D/g, "");
                setField("mother_phone", v);
              }}
              placeholder="เบอร์โทรศัพท์"
            />
            <div className="invalid-feedback">{errors.mother_phone}</div>

            <label>
              อาชีพ <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.mother_job ? "is-invalid" : ""
              }`}
              name="mother_job"
              value={form.mother_job}
              onChange={onChange}
              placeholder="อาชีพ"
            />
            <div className="invalid-feedback">{errors.mother_job}</div>

            <label className="form-label">
              รายได้ต่อเดือน<span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.mother_income ? "is-invalid" : ""
              }`}
              name="mother_income"
              value={form.mother_income}
              onChange={(e) => {
                const v = e.currentTarget.value.replace(/\D/g, "");
                setField("mother_income", v);
              }}
              placeholder="รายได้ต่อเดือน"
            />
            <div className="invalid-feedback">{errors.mother_income}</div>
          </div>
        </div>

        {/* ================= บิดา ================= */}
        <div className="card mb-3">
          <div className="card-body">
            <h5>ข้อมูลบิดา</h5>
            <label>
              คำนำหน้า<span className="text-danger">*</span>
            </label>
            <select
              className={`form-select mb-2 ${
                errors.father_prefix ? "is-invalid" : ""
              }`}
              name="father_prefix"
              value={form.father_prefix}
              onChange={onChange}
            >
              <option value="">คำนำหน้า</option>
              <option value="นาย">นาย</option>
            </select>
            <div className="invalid-feedback">{errors.father_prefix}</div>

            <label>
              ชื่อ <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.father_firstname ? "is-invalid" : ""
              }`}
              name="father_firstname"
              value={form.father_firstname}
              onChange={onChange}
              placeholder="ชื่อพ่อ"
            />
            <div className="invalid-feedback">{errors.father_firstname}</div>

            <label>
              นามสกุล<span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.father_lastname ? "is-invalid" : ""
              }`}
              name="father_lastname"
              value={form.father_lastname}
              onChange={onChange}
              placeholder="นามสกุลพ่อ"
            />
            <div className="invalid-feedback">{errors.father_lastname}</div>

            <label>
              เลขบัตรประชาชน <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.father_idcard ? "is-invalid" : ""
              }`}
              maxLength={13}
              name="father_idcard"
              value={form.father_idcard}
              onChange={(e) => {
                const v = e.currentTarget.value.replace(/\D/g, "");
                setField("father_idcard", v);
              }}
              placeholder="เลขบัตรประชาชน"
            />
            <div className="invalid-feedback">{errors.father_idcard}</div>

            <label>
              วันเดือนปีเกิด <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              className={`form-control mb-2 ${
                errors.father_birthdate ? "is-invalid" : ""
              }`}
              name="father_birthdate"
              value={form.father_birthdate}
              onChange={onChange}
              placeholder="วันเดือนปีเกิด"
            />
            <div className="invalid-feedback">{errors.father_birthdate}</div>

            <label>
              เชื้อชาติ <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.father_ethnicity ? "is-invalid" : ""
              }`}
              name="father_ethnicity"
              value={form.father_ethnicity}
              onChange={onChange}
              placeholder="เชื้อชาติ"
            />
            <div className="invalid-feedback">{errors.father_ethnicity}</div>

            <label>
              สัญชาติ <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.father_nationality ? "is-invalid" : ""
              }`}
              name="father_nationality"
              value={form.father_nationality}
              onChange={onChange}
              placeholder="สัญชาติ"
            />
            <div className="invalid-feedback">{errors.father_nationality}</div>

            <label>
              ศาสนา <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.father_religion ? "is-invalid" : ""
              }`}
              name="father_religion"
              value={form.father_religion}
              onChange={onChange}
              placeholder="ศาสนา"
            />
            <div className="invalid-feedback">{errors.father_religion}</div>

            <label>
              หมู่เลือด <span className="text-danger">*</span>
            </label>
            <select
              className={`form-select mb-2 ${
                errors.father_blood ? "is-invalid" : ""
              }`}
              name="father_blood"
              value={form.father_blood}
              onChange={onChange}
            >
              <option value="">หมู่เลือด</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
            </select>
            <div className="invalid-feedback">{errors.father_blood}</div>

            <h6 className="mt-3">
              ที่อยู่ตามทะเบียนบ้าน (บิดา)<span className="text-danger">*</span>
            </h6>
            <label className="form-label">
              บ้านเลขที่<span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.father_reg_house_no ? "is-invalid" : ""
              }`}
              name="father_reg_house_no"
              value={form.father_reg_house_no}
              onChange={onChange}
              placeholder="บ้านเลขที่ *"
            />
            <div className="invalid-feedback">{errors.father_reg_house_no}</div>

            <label className="form-label">
              หมู่<span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.father_reg_moo ? "is-invalid" : ""
              }`}
              name="father_reg_moo"
              value={form.father_reg_moo}
              onChange={onChange}
              placeholder="หมู่ *"
            />
            <div className="invalid-feedback">{errors.father_reg_moo}</div>

              <label>ถนน<span className="text-danger">*</span></label>
            <input
               className={`form-control mb-2 ${errors.father_reg_road ? "is-invalid" : ""}`}
              name="father_reg_road"
              value={form.father_reg_road}
              onChange={onChange}
              placeholder="ถนน"
            />
            <div className="invalid-feedback">{errors.father_reg_road}</div>

            <label className="form-label">
              ตำบล<span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.father_reg_tambon ? "is-invalid" : ""
              }`}
              name="father_reg_tambon"
              value={form.father_reg_tambon}
              onChange={onChange}
              placeholder="ตำบล *"
            />
            <div className="invalid-feedback">{errors.father_reg_tambon}</div>

            <label className="form-label">
              อำเภอ<span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.father_reg_amphur ? "is-invalid" : ""
              }`}
              name="father_reg_amphur"
              value={form.father_reg_amphur}
              onChange={onChange}
              placeholder="อำเภอ *"
            />
            <div className="invalid-feedback">{errors.father_reg_amphur}</div>

            <label className="form-label">
              จังหวัด<span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.father_reg_province ? "is-invalid" : ""
              }`}
              name="father_reg_province"
              value={form.father_reg_province}
              onChange={onChange}
              placeholder="จังหวัด *"
            />
            <div className="invalid-feedback">{errors.father_reg_province}</div>

            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                checked={fatherSameAddress}
                onChange={(e) => {
                  const checked = e.currentTarget.checked;
                  setFatherSameAddress(checked);
                  if (checked) {
                    setField("father_curr_house_no", form.father_reg_house_no);
                    setField("father_curr_moo", form.father_reg_moo);
                    setField("father_curr_road", form.father_reg_road);
                    setField("father_curr_tambon", form.father_reg_tambon);
                    setField("father_curr_amphur", form.father_reg_amphur);
                    setField("father_curr_province", form.father_reg_province);
                  } else {
                    setField("father_curr_house_no", "");
                    setField("father_curr_moo", "");
                    setField("father_curr_road", "");
                    setField("father_curr_tambon", "");
                    setField("father_curr_amphur", "");
                    setField("father_curr_province", "");
                  }
                }}
              />
              <label className="form-check-label">
                ที่อยู่ปัจจุบันเหมือนทะเบียนบ้าน
              </label>
            </div>

            <h6 className="mt-3">ที่อยู่ปัจจุบัน (บิดา)</h6>
            <label className="form-label">บ้านเลขที่<span className="text-danger">*</span></label>
            <input
              className={`form-control mb-2 ${errors.father_curr_house_no ? "is-invalid" : ""}`}
              name="father_curr_house_no"
              value={form.father_curr_house_no}
              onChange={onChange}
              placeholder="บ้านเลขที่"
            />
            <div className="invalid-feedback">{errors.father_curr_house_no}</div>
            <label className="form-label">หมู่<span className="text-danger">*</span></label>
            <input
              className={`form-control mb-2 ${errors.father_curr_moo ? "is-invalid" : ""}`}
              name="father_curr_moo"
              value={form.father_curr_moo}
              onChange={onChange}
              placeholder="หมู่"
            />
              <div className="invalid-feedback">{errors.father_curr_moo}</div>
                <label>ถนน<span className="text-danger">*</span></label>
                <input
                  className={`form-control mb-2 ${errors.father_curr_road ? "is-invalid" : ""}`}
                  name="father_curr_road"
                  value={form.father_curr_road}
                  onChange={onChange}
                  placeholder="ถนน"
                />
                <div className="invalid-feedback">{errors.father_curr_road}</div>

            <label className="form-label">ตำบล<span className="text-danger">*</span></label>
            <input
              className={`form-control mb-2 ${errors.father_curr_tambon ? "is-invalid" : ""}`}
              name="father_curr_tambon"
              value={form.father_curr_tambon}
              onChange={onChange}
              placeholder="ตำบล"
            />
            <div className="invalid-feedback">{errors.father_curr_tambon}</div>

            <label className="form-label">อำเภอ<span className="text-danger">*</span></label>
            <input
              className={`form-control mb-2 ${errors.father_curr_amphur ? "is-invalid" : ""}`}
              name="father_curr_amphur"
              value={form.father_curr_amphur}
              onChange={onChange}
              placeholder="อำเภอ"
            />
            <div className="invalid-feedback">{errors.father_curr_amphur}</div>
            <label className="form-label">จังหวัด<span className="text-danger">*</span></label>
            <input
              className={`form-control mb-2 ${errors.father_curr_province ? "is-invalid" : ""}`}
              name="father_curr_province"
              value={form.father_curr_province}
              onChange={onChange}
              placeholder="จังหวัด"
            />
            <div className="invalid-feedback">{errors.father_curr_province}</div>
            <label>
              เบอร์โทรศัพท์ <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.father_phone ? "is-invalid" : ""
              }`}
              name="father_phone"
              maxLength={10}
              value={form.father_phone}
              onChange={(e) => {
                const v = e.currentTarget.value.replace(/\D/g, "");
                setField("father_phone", v);
              }}
              placeholder="โทรศัพท์"
            />
            <div className="invalid-feedback">{errors.father_phone}</div>


            <label>
              อาชีพ <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.father_job ? "is-invalid" : ""
              }`}
              name="father_job"
              value={form.father_job}
              onChange={onChange}
              placeholder="อาชีพ"
            />
            <div className="invalid-feedback">{errors.father_job}</div>

            <label className="form-label">
              รายได้ต่อเดือน<span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.father_income ? "is-invalid" : ""
              }`}
              name="father_income"
              value={form.father_income}
              onChange={(e) => {
                const v = e.currentTarget.value.replace(/\D/g, "");
                setField("father_income", v);
              }}
              placeholder="รายได้ต่อเดือน"
            />
            <div className="invalid-feedback">{errors.father_income}</div>
          </div>
        </div>

        {/* ================= ผู้ดูแล / ผู้ปกครอง ================= */}
        <div className="card mb-3">
          <div className="card-body">
            <h5>
              ปัจจุบันเด็กอยู่ในความดูแลอุปการะรับผิดชอบของ
              <span className="text-danger">*</span>
            </h5>
            <label>
              เด็กอยู่ในควาดูแลของ <span className="text-danger">*</span>
            </label>
            <select
              className={`form-select mb-2 ${
                errors.care_responsible ? "is-invalid" : ""
              }`}
              name="care_responsible"
              value={form.care_responsible}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setField("care_responsible", value);
                if (value !== "ญาติ" && value !== "อื่น ๆ") {
                  setField("caregiver_prefix", "");
                  setField("caregiver_firstname", "");
                  setField("caregiver_lastname", "");
                  setField("caregiver_job", "");
                  setField("caregiver_income", "");
                  setField("caregiver_phone", "");
                }
              }}
            >
              <option value="">-- เลือก --</option>
              <option value="บิดา">บิดา</option>
              <option value="มารดา">มารดา</option>
              <option value="บิดาและมารดา">บิดาและมารดา</option>
              <option value="ญาติ">ญาติ</option>
            </select>
            <div className="invalid-feedback">{errors.care_responsible}</div>

            {/* ข้อมูลผู้อุปการะ */}
            <label className="form-label">คำนำหน้าผู้อุปการะ</label>
            <select
              className={`form-select mb-2 ${
                errors.caregiver_prefix ? "is-invalid" : ""
              }`}
              name="caregiver_prefix"
              value={form.caregiver_prefix}
              onChange={onChange}
              disabled={!needCaregiver}
            >
              <option value="">คำนำหน้า</option>
              <option value="นาย">นาย</option>
              <option value="นาง">นาง</option>
              <option value="นางสาว">นางสาว</option>
            </select>
            <div className="invalid-feedback">{errors.caregiver_prefix}</div>

            {/* ชื่อ */}
            <label className="form-label">ชื่อผู้อุปการะ</label>
            <input
              className={`form-control mb-2 ${
                errors.caregiver_firstname ? "is-invalid" : ""
              }`}
              name="caregiver_firstname"
              value={form.caregiver_firstname}
              onChange={onChange}
              placeholder="ชื่อผู้อุปการะ"
              disabled={!needCaregiver}
            />
            <div className="invalid-feedback">{errors.caregiver_firstname}</div>

            {/* นามสกุล */}
            <label className="form-label">นามสกุลผู้อุปการะ</label>
            <input
              className={`form-control mb-2 ${
                errors.caregiver_lastname ? "is-invalid" : ""
              }`}
              name="caregiver_lastname"
              value={form.caregiver_lastname}
              onChange={onChange}
              placeholder="นามสกุลผู้อุปการะ"
              disabled={!needCaregiver}
            />
            <div className="invalid-feedback">{errors.caregiver_lastname}</div>

            {/* อาชีพ */}
            <label className="form-label">อาชีพผู้อุปการะ</label>
            <input
              className={`form-control mb-2 ${
                errors.caregiver_job ? "is-invalid" : ""
              }`}
              name="caregiver_job"
              value={form.caregiver_job}
              onChange={onChange}
              placeholder="อาชีพผู้อุปการะ"
              disabled={!needCaregiver}
            />
            <div className="invalid-feedback">{errors.caregiver_job}</div>

            {/* รายได้ */}
            <label className="form-label">รายได้ผู้อุปการะต่อเดือน</label>
            <input
              className={`form-control mb-2 ${
                errors.caregiver_income ? "is-invalid" : ""
              }`}
              name="caregiver_income"
              value={form.caregiver_income}
              onChange={(e) => {
                const v = e.currentTarget.value.replace(/\D/g, "");
                setField("caregiver_income", v);
              }}
              placeholder="รายได้ต่อเดือน"
              disabled={!needCaregiver}
            />
            <div className="invalid-feedback">{errors.caregiver_income}</div>

            {/* โทรศัพท์ */}
            <label className="form-label">เบอร์โทรศัพท์ผู้อุปการะ</label>
            <input
              className={`form-control ${
                errors.caregiver_phone ? "is-invalid" : ""
              }`}
              name="caregiver_phone"
              maxLength={10}
              value={form.caregiver_phone}
              onChange={(e) => {
                const v = e.currentTarget.value.replace(/\D/g, "").slice(0, 10);
                setField("caregiver_phone", v);
              }}
              placeholder="หมายเลขโทรศัพท์"
              disabled={!needCaregiver}
            />
            <div className="invalid-feedback">{errors.caregiver_phone}</div>
          </div>
        </div>

        {/* ================= ผู้รับส่ง ================= */}
        <div className="card mb-3">
          <div className="card-body">
            <h5>ผู้รับส่งเด็ก</h5>
            <label>
              คำนำหน้า<span className="text-danger">*</span>
            </label>
            <select
              className={`form-select mb-2 ${
                errors.sender_prefix ? "is-invalid" : ""
              }`}
              name="sender_prefix"
              value={form.sender_prefix}
              onChange={onChange}
            >
              <option value="">คำนำหน้า</option>
              <option value="นาย">นาย</option>
              <option value="นาง">นาง</option>
              <option value="นางสาว">นางสาว</option>
            </select>
            <div className="invalid-feedback">{errors.sender_prefix}</div>

            <label>
              ชื่อ <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.sender_firstname ? "is-invalid" : ""
              }`}
              name="sender_firstname"
              value={form.sender_firstname}
              onChange={onChange}
              placeholder="ชื่อ"
            />
            <div className="invalid-feedback">{errors.sender_firstname}</div>

            <label>
              นามสกุล <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.sender_lastname ? "is-invalid" : ""
              }`}
              name="sender_lastname"
              value={form.sender_lastname}
              onChange={onChange}
              placeholder="นามสกุล"
            />
            <div className="invalid-feedback">{errors.sender_lastname}</div>

            <label>
              ความสัมพันธ์ <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control mb-2 ${
                errors.sender_relation ? "is-invalid" : ""
              }`}
              name="sender_relation"
              value={form.sender_relation}
              onChange={onChange}
              placeholder="ความสัมพันธ์"
            />
            <div className="invalid-feedback">{errors.sender_relation}</div>

            <label>
              เบอร์โทรศัพท์ <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control ${
                errors.sender_phone ? "is-invalid" : ""
              }`}
              name="sender_phone"
              maxLength={10}
              value={form.sender_phone}
              onChange={(e) => {
  const v = e.currentTarget.value.replace(/\D/g, "");
  setField("sender_phone", v);
}}
              placeholder="เบอร์โทรศัพท์"
            />
            <div className="invalid-feedback">{errors.sender_phone}</div>
          </div>
        </div>

        {/* ================= เอกสารแนบ ================= */}
        <div className="card mb-3">
          <div className="card-body">
            <h5>เอกสารประกอบการสมัคร</h5>
            <label>
              สำเนาสูติบัตรเด็ก <span className="text-danger">*</span>
            </label>
            <input
              type="file"
              className={`form-control mb-2 ${
                errors.child_birth_certificate ? "is-invalid" : ""
              }`}
              name="child_birth_certificate"
              ref={childBirthRef}
              onChange={onFileChange}
            />
            <div className="invalid-feedback">
              {errors.child_birth_certificate}
            </div>

            <label className="form-label">
              สำเนาทะเบียนบ้านเด็ก<span className="text-danger">*</span>
            </label>
            <input
              type="file"
              className={`form-control mb-2 ${
                errors.child_house_reg ? "is-invalid" : ""
              }`}
              name="child_house_reg"
              ref={childHouseRef}
              onChange={onFileChange}
            />
            <div className="invalid-feedback">{errors.child_house_reg}</div>

            <label className="form-label">
              สำเนาบัตรประชาชนบิดา<span className="text-danger">*</span>
            </label>
            <input
              type="file"
              className={`form-control mb-2 ${
                errors.father_idcard_file ? "is-invalid" : ""
              }`}
              name="father_idcard_file"
              ref={fatherIdRef}
              onChange={onFileChange}
            />
            <div className="invalid-feedback">{errors.father_idcard_file}</div>

            <label className="form-label">
              สำเนาทะเบียนบ้านบิดา<span className="text-danger">*</span>
            </label>
            <input
              type="file"
              className={`form-control mb-2 ${
                errors.father_house_reg ? "is-invalid" : ""
              }`}
              name="father_house_reg"
              ref={fatherHouseRef}
              onChange={onFileChange}
            />
            <div className="invalid-feedback">{errors.father_house_reg}</div>

            <label className="form-label">
              สำเนาบัตรประชาชนมารดา<span className="text-danger">*</span>
            </label>
            <input
              type="file"
              className={`form-control mb-2 ${
                errors.mother_idcard_file ? "is-invalid" : ""
              }`}
              name="mother_idcard_file"
              ref={motherIdRef}
              onChange={onFileChange}
            />
            <div className="invalid-feedback">{errors.mother_idcard_file}</div>

            <label className="form-label">
              สำเนาทะเบียนบ้านมารดา<span className="text-danger">*</span>
            </label>
            <input
              type="file"
              className={`form-control mb-2 ${
                errors.mother_house_reg ? "is-invalid" : ""
              }`}
              name="mother_house_reg"
              ref={motherHouseRef}
              onChange={onFileChange}
            />
            <div className="invalid-feedback">{errors.mother_house_reg}</div>

            <div className="text-muted small">
              รองรับเฉพาะไฟล์ PDF / JPG / PNG ขนาดไม่เกิน 10MB
            </div>
          </div>
        </div>
         <div className="pdpa-box mt-4 mb-4">
  <div className="form-check">
    <input
      className="form-check-input"
      type="checkbox"
      checked={pdpa}
      onChange={(e)=>setPdpa(e.target.checked)}
    />

    <label className="form-check-label">
      ข้าพเจ้ายินยอมให้ศูนย์พัฒนาเด็กเล็กเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคล
      เพื่อใช้ในการสมัครเรียนและการดูแลเด็ก
      ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA)
    </label>
  </div>
</div>

<div className="text-center mb-5">
  <button
    type="button"
    className="btn btn-success btn-lg px-5 shadow-sm"
    onClick={handleSubmit}
    disabled={submitting}
  >
    {submitting ? "กำลังส่ง..." : "สมัครเรียน"}
  </button>
</div>
      </form>
    </div>
    </div>
  );
}
