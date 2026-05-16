import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import { PDFDocument, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

const FILE_BASE = import.meta.env.VITE_API_URL.replace("/api", "");

function fileUrl(file) {
  if (!file) return "";
  if (typeof file === "object" && file.path) return FILE_BASE + file.path;
  if (typeof file === "string") return FILE_BASE + file.replace(/\\/g, "/");
  return "";
}

function formatThaiDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function DetailItem({ label, children }) {
  return (
    <p>
      <b>{label}:</b> {children || "-"}
    </p>
  );
}

const thaiMonths = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

function parseLocalDate(value) {
  if (!value) return null;
  const [datePart] = String(value).split("T");
  const [year, month, day] = datePart.split("-").map(Number);

  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function calculateAgeParts(birthDate, asOf = new Date()) {
  const birth = parseLocalDate(birthDate);
  if (!birth) return { years: "-", months: "-" };

  let years = asOf.getFullYear() - birth.getFullYear();
  let months = asOf.getMonth() - birth.getMonth();

  if (asOf.getDate() < birth.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
  };
}

export default function AdminEnrollmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    try {
      const res = await API.get(`/enrollments/${id}`);
      setRow(res.data);
    } catch {
      alert("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function approve() {
  if (!window.confirm("ยืนยันอนุมัติใบสมัครนี้?")) return;

  try {
    await API.put(`/enrollments/${id}/approve`);
    alert("อนุมัติเรียบร้อย");
    navigate("/admin/enrollments");
  } catch (err) {
    alert(err?.response?.data?.error || "เกิดข้อผิดพลาด");
  }
}

  async function reject() {
  const note = window.prompt("กรุณาระบุเหตุผลที่ไม่อนุมัติ");

  if (!note || !note.trim()) {
    alert("กรุณากรอกเหตุผล");
    return;
  }

  try {
    await API.put(`/enrollments/${id}/reject`, {
      note
    });

    alert("ไม่อนุมัติใบสมัครเรียบร้อย");
    navigate("/admin/enrollments");
  } catch (err) {
    alert(err?.response?.data?.error || "เกิดข้อผิดพลาด");
  }
}

  async function handleGeneratePDF() {
    if (!row) {
  alert("ข้อมูลยังโหลดไม่เสร็จ");
  return;
}
  const data =
    typeof row.extra_json === "string"
      ? JSON.parse(row.extra_json)
      : row.extra_json || {};

  const existingPdfBytes = await fetch("/ใบสมัครเรียนปี69.pdf")
  
    .then(res => res.arrayBuffer());

  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  pdfDoc.registerFontkit(fontkit);

  const fontBytes = await fetch("/fonts/THSarabunNew.ttf")
  .then(res => res.arrayBuffer());

  const font = await pdfDoc.embedFont(fontBytes);

const page = pdfDoc.getPages()[0]
const size = 14
/* ===== ชื่อเด็ก ===== */
page.drawText(`${data.prefix || ""}${data.first_name || ""} ${data.last_name || ""}`, {
  x: 200,
  y: 710,
  size,
  font
})

/* เชื้อชาติ */
page.drawText(`${data.ethnicity || "-"}`, {
  x: 410,
  y: 710,
  size,
  font
})

/* สัญชาติ */
page.drawText(`${data.nationality || "-"}`, {
  x: 490,
  y: 710,
  size,
  font
})

/* วันเกิด */
let bd = parseLocalDate(data.birth_date)
const childAge = calculateAgeParts(data.birth_date)

page.drawText(`${bd ? bd.getDate() : "-"}`, { x: 148, y: 690, size, font })
page.drawText(`${bd ? thaiMonths[bd.getMonth()] : "-"}`, { x: 230, y: 690, size, font })
page.drawText(`${bd ? bd.getFullYear()+543 : "-"}`, { x: 330, y: 690, size, font })
page.drawText(`${childAge.years}`, { x: 455, y: 690, size, font })
page.drawText(`${childAge.months}`, { x: 560, y: 690, size, font })
/* ===== โรคประจำตัว ===== */
page.drawText(`${data.congenital_disease || "-"}`, {
  x: 210,
  y: 672,
  size,
  font
})

/* กรุ๊ปเลือด */
page.drawText(`${data.blood_group || "-"}`, {
  x: 340,
  y: 672,
  size,
  font
})

/* ทะเบียนบ้าน */
page.drawText(`${data.reg_house_no || "-"}`, { x: 280, y: 655, size, font })
page.drawText(`${data.reg_moo || "-"}`, { x: 349, y: 655, size, font })
page.drawText(`${data.reg_tambon || "-"}`, { x: 160, y: 636, size, font })
page.drawText(`${data.reg_amphur || "-"}`, { x: 310, y: 636, size, font })
page.drawText(`${data.reg_province || "-"}`, { x: 440, y: 636, size, font })
page.drawText(`${data.reg_road || "-"}`, {
  x: 410,
  y: 655,
  size,
  font
})
/* ที่อยู่ปัจจุบัน */
page.drawText(`${data.curr_house_no || "-"}`, { x: 210, y: 618, size, font })
page.drawText(`${data.curr_moo || "-"}`, { x: 272, y: 618, size, font })
page.drawText(`${data.curr_tambon || "-"}`, { x: 330, y: 618, size, font })
page.drawText(`${data.curr_amphur || "-"}`, { x: 440, y: 618, size, font })
page.drawText(`${data.curr_province || "-"}`, { x: 150, y: 600, size, font })
page.drawText(`${data.curr_postcode || "-"}`, {
  x: 330,
  y: 600,
  size,
  font
})
page.drawText(`${data.emergency_phone || "-"}`, {
  x: 430,
  y: 600,
  size,
  font
})
/* ===== บิดา ===== */
page.drawText(
  `${data.father_prefix || ""}${data.father_firstname || ""} ${data.father_lastname || ""}`,
  { x: 200, y: 582, size, font }
)

/* อาชีพ */
page.drawText(`${data.father_job || "-"}`, {
  x: 400,
  y: 582,
  size,
  font
})

/* ===== มารดา ===== */
page.drawText(
  `${data.mother_prefix || ""}${data.mother_firstname || ""} ${data.mother_lastname || ""}`,
  { x: 200, y: 564, size, font }
)

page.drawText(`${data.mother_job || "-"}`, {
  x: 400,
  y: 564,
  size,
  font
})

page.drawText(
  `${data.father_job || "-"} / ${data.mother_job || "-"}`,
  {
    x: 275,
    y: 475,
    size,
    font
  }
)

const income =
  (Number(data.father_income || 0) + Number(data.mother_income || 0)) || "-"

page.drawText(String(income), {
  x: 440,
  y: 475,
  size,
  font
})

page.drawText(
  `${data.mother_prefix || ""}${data.mother_firstname || ""} ${data.mother_lastname || ""}`,
  {
    x: 200,
    y: 455,
    size,
    font
  }
)

page.drawText(
  `${data.sender_relation || "-"}`,
  {
    x: 430,
    y: 455,
    size,
    font
  }
)


page.drawText(`${data.sender_firstname || ""}`, {
  x: 260,
  y: 438,
  size,
  font
})

page.drawText(`${data.sender_lastname || ""}`, {
  x: 440,
  y: 438,
  size,
  font
})

page.drawText(
  `${data.sender_relation || "-"}`,
  {
    x: 200,
    y: 418,
    size,
    font
  }
)

page.drawText(
  `${data.sender_phone || "-"}`,
  {
    x: 425,
    y: 418,
    size,
    font
  }
)

const page2 = pdfDoc.getPages()[1]

const { width: w2, height: h2 } = page2.getSize()

page2.drawText(
  `${data.mother_firstname || ""} ${data.mother_lastname || ""}`,
  {
    x: 220,
    y: 717,
    size,
    font
  }
)

const mbd = data.mother_birthdate ? new Date(data.mother_birthdate) : null
const age =
  mbd ? new Date().getFullYear() - mbd.getFullYear() : ""

page2.drawText(String(age), {
  x: 455,
  y: 717,
  size,
  font
})

page2.drawText(`${data.mother_job || ""}`, {
  x: 120,
  y: 700,
  size,
  font
})

page2.drawText(`${data.mother_income || ""}`, {
  x: 238,
  y: 700,
  size,
  font
})

page2.drawText(`${data.curr_house_no || ""}`, {
  x: 435,
  y: 700,
  size,
  font
})

page2.drawText(`${data.curr_moo || ""}`, {
  x: 484,
  y: 700,
  size,
  font
})

/* ===== ถนน ===== */
page2.drawText(`${data.curr_road || "-"}`, {
  x: 175,
  y: 680,
  size,
  font
})

/* ===== ตำบล ===== */
page2.drawText(`${data.curr_tambon || "-"}`, {
  x: 285,
  y: 680,
  size,
  font
})

/* ===== อำเภอ ===== */
page2.drawText(`${data.curr_amphur || "-"}`, {
  x: 440,
  y: 680,
  size,
  font
})

/* ===== จังหวัด ===== */
page2.drawText(`${data.curr_province || "-"}`, {
  x: 150,
  y: 662,
  size,
  font
})

/* ===== โทรศัพท์ผู้ปกครอง ===== */
page2.drawText(`${data.sender_phone || "-"}`, {
  x: 320,
  y: 662,
  size,
  font
})


page2.drawText(
  `${data.first_name || ""} ${data.last_name || ""}`,
  {
    x: 200,
    y: 645,
    size,
    font
  }
)

page2.drawText(`${data.curr_house_no || "-"}`, {
  x: 355,
  y: 518,
  size,
  font
})

page2.drawText(`${data.sender_phone || "-"}`, {
  x: 440,
  y: 518,
  size,
  font
})

page2.drawText(
  `${data.first_name || ""} ${data.last_name || ""}`,
  {
    x: 200,
    y: 464,
    size,
    font
  }
)

page2.drawText(
  `${data.sender_firstname || ""}`,
  {
    x: 200,
    y: 345,
    size,
    font
  }
)

page2.drawText(
  `${data.sender_lastname || ""}`,
  {
    x: 400,
    y: 345,
    size,
    font
  }
)

page2.drawText(
  `${data.sender_relation || "-"}`,
  {
    x: 170,
    y: 326,
    size,
    font
  }
)

page2.drawText(
  `${data.sender_firstname || ""} ${data.sender_lastname || ""}`,
  {
    x: 170,
    y: 308,
    size,
    font
  }
)

const page3 = pdfDoc.getPages()[2]
const { width: w3, height: h3 } = page3.getSize()

/* ===== หน้า 3 : บรรทัดชื่อเด็ก ===== */

page3.drawText(
  `${data.first_name || "-"}`,
  {
    x: 200,
    y: 632,
    size,
    font
  }
)

page3.drawText(
  `${data.last_name || "-"}`,
  {
    x: 380,
    y: 632,
    size,
    font
  }
)

page3.drawText(
  `${data.nickname || "-"}`,
  {
    x: 500,
    y: 632,
    size,
    font
  }
)

let bd3 = parseLocalDate(data.birth_date)

page3.drawText(`${bd3 ? bd3.getDate() : "-"}`, { x: 120, y: 611, size, font })
page3.drawText(`${bd3 ? thaiMonths[bd3.getMonth()] : "-"}`, { x: 220, y: 611, size, font })
page3.drawText(`${bd3 ? bd3.getFullYear()+543 : "-"}`, { x: 360, y: 611, size, font })

page3.drawText(`${data.father_firstname || "-"}`, {
  x: 120,
  y: 590,
  size,
  font
})

page3.drawText(`${data.father_lastname || "-"}`, {
  x: 360,
  y: 590,
  size,
  font
})

page3.drawText(`${data.father_job || "-"}`, {
  x: 480,
  y: 590,
  size,
  font
})

page3.drawText(`${data.father_income || "-"}`, {
  x: 120,
  y: 570,
  size,
  font
})

page3.drawText(`${data.mother_firstname || "-"}`, {
  x: 160,
  y: 548,
  size,
  font
})

page3.drawText(`${data.mother_lastname || "-"}`, {
  x: 360,
  y: 548,
  size,
  font
})

page3.drawText(`${data.mother_job || "-"}`, {
  x: 485,
  y: 548,
  size,
  font
})

page3.drawText(`${data.mother_income || "-"}`, {
  x: 120,
  y: 528,
  size,
  font
})

page3.drawText(`${data.curr_house_no || "-"}`, { x: 210, y: 507, size, font })
page3.drawText(`${data.curr_moo || "-"}`, { x: 290, y: 507, size, font })
page3.drawText(`${data.curr_road || "-"}`, { x: 440, y: 507, size, font })
page3.drawText(`${data.curr_tambon || "-"}`, { x: 120, y: 485, size, font })
page3.drawText(`${data.curr_amphur || "-"}`, { x: 270, y: 485, size, font })
page3.drawText(`${data.curr_province || "-"}`, { x: 440, y: 485, size, font })

page3.drawText(`${data.emergency_phone || "-"}`, {
  x: 248,
  y: 465,
  size,
  font
})

page3.drawText(`${data.total_siblings || "-"}`, { x: 150, y: 445, size, font })
page3.drawText(`${data.male_siblings || "-"}`, { x: 255, y: 445, size, font })
page3.drawText(`${data.female_siblings || "-"}`, { x: 360, y: 445, size, font })
page3.drawText(`${data.child_order || "-"}`, { x: 525, y: 445, size, font })

page3.drawText(`${data.birth_weight || "-"}`, {
  x: 120,
  y: 425,
  size,
  font
})

page3.drawText(`${data.birth_height || "-"}`, {
  x: 250,
  y: 425,
  size,
  font
})

page3.drawText(`${data.child_behavior || "-"}`, {
  x: 200,
  y: 402,
  size,
  font
})

page3.drawText(`${data.illness_history || "-"}`, {
  x: 260,
  y: 382,
  size,
  font
})

page3.drawText(`${data.congenital_disease || "-"}`, {
  x: 170,
  y: 362,
  size,
  font
})

page3.drawText(`${data.congenital_disease || "-"}`, {
  x: 180,
  y: 320,
  size,
  font
})

page3.drawText(`${data.genetic_disease || "-"}`, {
  x: 430,
  y: 320,
  size,
  font
})

page3.drawText(`${data.vaccine || "-"}`, {
  x: 230,
  y: 300,
  size,
  font
})

page3.drawText(`${data.blood_group || "-"}`, {
  x: 490,
  y: 300,
  size,
  font
})

page3.drawText(`${data.self_help_ability || "-"}`, {
  x: 330,
  y: 280,
  size,
  font
})

page3.drawText(`${data.previous_school || "-"}`, {
  x: 480,
  y: 260,
  size,
  font
})

page3.drawText(`${data.additional_info || "-"}`, {
  x: 480,
  y: 240,
  size,
  font
})



  const pdfBytes = await pdfDoc.save();

  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "ใบสมัคร.pdf";
  link.click();
}

  function handlePrint() {
    const printContents = printRef.current.innerHTML;
    const win = window.open("", "", "width=900,height=700");

    win.document.write(`
      <html>
        <head>
          <title>ใบสมัคร</title>
          <style>
            body{font-family:sans-serif;padding:20px}
            .card{border:1px solid #000;margin-bottom:10px}
            .card-header{font-weight:bold;padding:6px;border-bottom:1px solid #000}
            .card-body{padding:6px}
            p{margin:3px 0}
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);

    win.document.close();
    win.focus();
    win.print();
  }

  if (loading) return <div className="container mt-4">กำลังโหลด...</div>;
  if (!row) return <div className="container mt-4">ไม่พบข้อมูล</div>;

  const data =
    typeof row.extra_json === "string"
      ? JSON.parse(row.extra_json)
      : row.extra_json || {};

  const files =
    typeof row.files_json === "string"
      ? JSON.parse(row.files_json)
      : row.files_json || {};

  return (
    <div className="container my-4">

      <button className="btn btn-outline-secondary mb-3 me-2" onClick={() => navigate(-1)}>
        ← ย้อนกลับ
      </button>

      <button className="btn btn-primary mb-3" onClick={handleGeneratePDF}>
        🖨️ พิมพ์ใบสมัคร PDF
      </button>

      {/* ⭐ ครอบทั้งหมด */}
      <div ref={printRef}>

      <h3 className="mb-3">รายละเอียดใบสมัคร</h3>

      {/* เด็ก */}
      <div className="card mb-3">
        <div className="card-header">ข้อมูลเด็ก</div>
        <div className="card-body">
          <DetailItem label="ชื่อ">{data.prefix}{data.first_name} {data.last_name}</DetailItem>
          <DetailItem label="ชื่อเล่น">{data.nickname}</DetailItem>
          <DetailItem label="เลขบัตร">{data.citizen_id}</DetailItem>
          <DetailItem label="วันเกิด">{formatThaiDate(data.birth_date)}</DetailItem>
          <DetailItem label="ระดับ">{data.apply_level}</DetailItem>
          <DetailItem label="น้ำหนัก">{data.birth_weight} กก.</DetailItem>
          <DetailItem label="ส่วนสูง">{data.birth_height} ซม.</DetailItem>
          <DetailItem label="กรุ๊ปเลือด">{data.blood_group}</DetailItem>
          <DetailItem label="ศาสนา">{data.religion}</DetailItem>
          <DetailItem label="เชื้อชาติ">{data.ethnicity}</DetailItem>
          <DetailItem label="สัญชาติ">{data.nationality}</DetailItem>
          <DetailItem label="วัคซีน">{data.vaccine}</DetailItem>
          <DetailItem label="โรคประจำตัว">{data.congenital_disease}</DetailItem>
          <DetailItem label="ประวัติป่วย">{data.illness_history}</DetailItem>
          <DetailItem label="โรคพันธุกรรม">{data.genetic_disease}</DetailItem>
          <DetailItem label="แพ้อาหาร">{data.food_allergy}</DetailItem>
          <DetailItem label="แพ้ยา">{data.drug_allergy}</DetailItem>
          <DetailItem label="พฤติกรรม">{data.child_behavior}</DetailItem>
          <DetailItem label="ช่วยเหลือตัวเอง">{data.self_help_ability}</DetailItem>
          <DetailItem label="ลำดับบุตร">{data.child_order}</DetailItem>
          <DetailItem label="จำนวนพี่น้อง">{data.total_siblings}</DetailItem>
          <DetailItem label="มีพี่ชายหรือน้องชาย">{data.male_siblings}</DetailItem>
          <DetailItem label="มีพี่สาวหรือน้องสาว">{data.female_siblings}</DetailItem>
          <DetailItem label="เคยเรียนที่">{data.previous_school}</DetailItem>
          <DetailItem label="ข้อมูลเพิ่มเติม">{data.additional_info}</DetailItem>
          <DetailItem label="เบอร์ฉุกเฉิน">{data.emergency_phone}</DetailItem>
          <DetailItem label="อยู่ในการดูแลของ">{data.care_responsible}</DetailItem>
          <DetailItem label="ผู้ดูแลเพิ่มเติม">{data.caregiver_prefix} {data.caregiver_firstname} {data.caregiver_lastname}</DetailItem>
          <DetailItem label="อาชีพผู้ดูแล">{data.caregiver_job}</DetailItem>
          <DetailItem label="รายได้ผู้ดูแล">{data.caregiver_income}</DetailItem>
          <DetailItem label="โทรผู้ดูแล">{data.caregiver_phone}</DetailItem>
        </div>
      </div>

      {/* ที่อยู่เด็ก */}
      <div className="card mb-3">
        <div className="card-header">ที่อยู่เด็ก (ทะเบียนบ้าน)</div>
        <div className="card-body">
          {data.reg_house_no} ถนน {data.reg_road} หมู่ {data.reg_moo} ต.{data.reg_tambon} อ.{data.reg_amphur} จ.{data.reg_province} {data.reg_postcode}
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">ที่อยู่เด็ก (ปัจจุบัน)</div>
        <div className="card-body">
          {data.curr_house_no} ถนน {data.curr_road} หมู่ {data.curr_moo} ต.{data.curr_tambon} อ.{data.curr_amphur} จ.{data.curr_province} {data.curr_postcode}
        </div>
      </div>

      {/* พ่อ */}
      <div className="card mb-3">
        <div className="card-header">ข้อมูลบิดา</div>
        <div className="card-body">
          <DetailItem label="ชื่อ">{data.father_prefix}{data.father_firstname} {data.father_lastname}</DetailItem>
          <DetailItem label="กรุ๊ปเลือด">{data.father_blood}</DetailItem>
          <DetailItem label="ศาสนา">{data.father_religion}</DetailItem>
          <DetailItem label="เชื้อชาติ">{data.father_ethnicity}</DetailItem>
          <DetailItem label="สัญชาติ">{data.father_nationality}</DetailItem>
          <DetailItem label="อาชีพ">{data.father_job}</DetailItem>
          <DetailItem label="รายได้">{data.father_income}</DetailItem>
          <DetailItem label="โทร">{data.father_phone}</DetailItem>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">ที่อยู่บิดา (ทะเบียนบ้าน)</div>
        <div className="card-body">
          {data.father_reg_house_no} ถนน {data.father_reg_road} หมู่ {data.father_reg_moo} ต.{data.father_reg_tambon} อ.{data.father_reg_amphur} จ.{data.father_reg_province} {data.father_reg_postcode}
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">ที่อยู่บิดา (ปัจจุบัน)</div>
        <div className="card-body">
          {data.father_curr_house_no} ถนน {data.father_curr_road} หมู่ {data.father_curr_moo} ต.{data.father_curr_tambon} อ.{data.father_curr_amphur} จ.{data.father_curr_province} {data.father_curr_postcode}
        </div>
      </div>

      {/* แม่ */}
      <div className="card mb-3">
        <div className="card-header">ข้อมูลมารดา</div>
        <div className="card-body">
          <DetailItem label="ชื่อ">{data.mother_prefix}{data.mother_firstname} {data.mother_lastname}</DetailItem>
          <DetailItem label="กรุ๊ปเลือด">{data.mother_blood}</DetailItem>
          <DetailItem label="ศาสนา">{data.mother_religion}</DetailItem>
          <DetailItem label="เชื้อชาติ">{data.mother_ethnicity}</DetailItem>
          <DetailItem label="สัญชาติ">{data.mother_nationality}</DetailItem>
          <DetailItem label="อาชีพ">{data.mother_job}</DetailItem>
          <DetailItem label="รายได้">{data.mother_income}</DetailItem>
          <DetailItem label="โทร">{data.mother_phone}</DetailItem>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">ที่อยู่มารดา (ทะเบียนบ้าน)</div>
        <div className="card-body">
          {data.mother_reg_house_no} ถนน {data.mother_reg_road} หมู่ {data.mother_reg_moo} ต.{data.mother_reg_tambon} อ.{data.mother_reg_amphur} จ.{data.mother_reg_province} {data.mother_reg_postcode}
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">ที่อยู่มารดา (ปัจจุบัน)</div>
        <div className="card-body">
          {data.mother_curr_house_no} ถนน {data.mother_curr_road} หมู่ {data.mother_curr_moo} ต.{data.mother_curr_tambon} อ.{data.mother_curr_amphur} จ.{data.mother_curr_province} {data.mother_curr_postcode}
        </div>
      </div>

      {/* ผู้รับส่ง */}
      <div className="card mb-3">
        <div className="card-header">ข้อมูลผู้รับ-ส่ง</div>
        <div className="card-body">
          <DetailItem label="ชื่อ">{data.sender_prefix}{data.sender_firstname} {data.sender_lastname}</DetailItem>
          <DetailItem label="ความสัมพันธ์">{data.sender_relation}</DetailItem>
          <DetailItem label="โทร">{data.sender_phone}</DetailItem>
        </div>
      </div>
  </div>
      {/* เอกสาร */}
      <div className="card mb-3">
        <div className="card-header">เอกสารแนบ</div>
        <div className="card-body">
          <ul>
            {Object.entries(files).map(([k, v]) => (
              <li key={k}>
                {k} : <a href={fileUrl(v)} target="_blank" rel="noreferrer">ดูไฟล์</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <b>สถานะ:</b> {row.status}
          <br />
          <button className="btn btn-outline-success mt-2" onClick={approve}>
            อนุมัติ
          </button>
          <button className="btn btn-outline-danger mt-2 ms-2" onClick={reject}>
            ไม่อนุมัติ
          </button>
        </div>
      </div>

    </div>
  );
}
