import React, { useEffect, useState } from "react";
import API from "../api/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "../styles/measurements.css";

/* ================= helper ================= */
function thaiDate(d) {
  if (!d) return "-";
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2, "0")}/${
    String(date.getMonth() + 1).padStart(2, "0")
  }/${date.getFullYear() + 543}`;
}

function todayThai() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear() + 543;
  return `${day}/${month}/${year}`;
}


function thaiMonthYear(d) {
  const date = new Date(d);
  const months = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
  ];
  return `${months[date.getMonth()]} ${date.getFullYear() + 543}`;
}

/* ================= component ================= */
export default function MeasurementsPage() {
  const [rows, setRows] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [checkinPage, setCheckinPage] = useState(1);
  const rowsPerPage = 10;
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [teacherId, setTeacherId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
const [exportYear, setExportYear] = useState(new Date().getFullYear());

 useEffect(() => {
  init();
}, []);

useEffect(() => {
  if (teacherId) {
    loadToday(teacherId);
  }
}, [teacherId, exportMonth, exportYear]);

async function init() {
  try {
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (!user || user.role !== "teacher") {
      setMsg({ type: "danger", text: "หน้านี้สำหรับครูเท่านั้น" });
      return;
    }

    /* ⭐ ดึง teacher_id จาก backend เหมือนหน้า checkin */
    const res = await API.get("/measurements/me");

    const tId = res.data.teacher_id;

    setTeacherId(tId);

    loadToday(tId);
  
  } catch (err) {
    console.error(err);
    setMsg({ type: "danger", text: "โหลดข้อมูลครูไม่สำเร็จ" });
  }
}

  async function loadToday(tid) {
  const res = await API.get("/measurements/today", {
    params: {
      teacher_id: tid,
      month: exportMonth,
      year: exportYear
    }
  });

  setRows(res.data.rows || []);
}

  async function loadHistory(tid) {
  const res = await API.get("/measurements/history", {
    params: { teacher_id: tid }
  });
  setHistory(res.data.rows || []);
}
  async function handleReload() {

  setShowHistory(false);

  setHistory([]);

  setHistoryPage(1);

  setCheckinPage(1);

  await loadToday(teacherId);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}

  function changeVal(child_id, key, value) {
    setRows(prev =>
      prev.map(r =>
        r.child_id === child_id
          ? {
              ...r,
              measurement: {
                ...(r.measurement || {}),
                [key]: value
              }
            }
          : r
      )
    );
  }

  async function saveAll() {

  if (!teacherId) {
    alert("ไม่พบ teacher id");
    return;
  }

  const items = rows.map(r => ({
    child_id: r.child_id,
    measurement_date: date,
    weight: r.measurement?.weight || null,
    height: r.measurement?.height || null,
    teacher_id: teacherId
  }));

  await API.post("/measurements", { items });

  setMsg({ type: "success", text: "บันทึกข้อมูลเรียบร้อย" });

  loadHistory(teacherId);
}
  /* ================= Export Excel ================= */
 function exportExcel() {
  if (!history.length) {
    alert("ไม่มีข้อมูล");
    return;
  }

  const months = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
  ];

  const shortMonths = [
    "ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.",
    "ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."
  ];

const month = exportMonth - 1;
const year = exportYear;

  const monthHistory = history.filter(h => {
    const d = new Date(h.measurement_date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const header = [
    [`รายงานบันทึกน้ำหนักและส่วนสูง ประจำเดือน ${months[month]} ${year + 543}`],
    [],
    ["วันที่", "ชื่อ", "น้ำหนัก", "ส่วนสูง", "BMI"]
  ];

  const body = monthHistory.map((h, i) => {
    const d = new Date(h.measurement_date);

    const day = d.getDate();
    const monthShort = shortMonths[d.getMonth()];

    const rowNumber = i + 4;

    return [
      `${day}-${monthShort}`,
      `${h.prefix}${h.first_name} ${h.last_name}`,
      h.weight || "",
      h.height || "",
      {
  t: "n",
  f: `IF(AND(C${rowNumber}<>\"\",D${rowNumber}<>\"\"),ROUND(C${rowNumber}/((D${rowNumber}/100)*(D${rowNumber}/100)),2),\"\")`
}
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([...header, ...body]);

  ws["!merges"] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: 4 }
    }
  ];

  ws["!cols"] = [
    { wch: 12 },
    { wch: 30 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "รายงานน้ำหนัก");

  XLSX.writeFile(
    wb,
    `รายงานบันทึกน้ำหนักส่วนสูง_${months[month]}_${year + 543}.xlsx`
  );
}
  const historyLastRow = historyPage * rowsPerPage;
const historyFirstRow = historyLastRow - rowsPerPage;

const currentHistory = history.slice(
  historyFirstRow,
  historyLastRow
);

const historyTotalPages = Math.ceil(
  history.length / rowsPerPage
);

const checkinLastRow = checkinPage * rowsPerPage;
const checkinFirstRow = checkinLastRow - rowsPerPage;

const currentCheckins = rows.slice(
  checkinFirstRow,
  checkinLastRow
);

const checkinTotalPages = Math.ceil(
  rows.length / rowsPerPage
);
  /* ================= UI ================= */
 return (
  <div className="container my-4">
    {/* ===== หัวข้อ ===== */}
    <h3 className="mb-3 fw-bold text-success section-title">
      บันทึกน้ำหนัก-ส่วนสูง (วันที่ {todayThai()})
    </h3>
    {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
    {/* ===== ปุ่มอยู่ฝั่งขวา เหมือนหน้าดื่มนม ===== */}
<div className="row mb-3 align-items-end">
  <div className="col-md-3">
    <label className="form-label">เดือน</label>
    <select
      className="form-select"
      value={exportMonth}
      onChange={(e) => setExportMonth(Number(e.target.value))}
    >
      {[
        "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
        "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
      ].map((m, i) => (
        <option key={i} value={i + 1}>
          {m}
        </option>
      ))}
    </select>
  </div>

  <div className="col-md-2">
    <label className="form-label">ปี</label>
    <select
      className="form-select"
      value={exportYear}
      onChange={(e) => setExportYear(Number(e.target.value))}
    >
      {[2568, 2569, 2570].map((y) => (
        <option key={y} value={y - 543}>
          {y}
        </option>
      ))}
    </select>
  </div>
 <div className="col-12 col-md-7 mt-2 mt-md-0">
    <div className="d-flex flex-wrap gap-2 justify-content-start justify-content-md-end">

  <button
    type="button"
    className="btn btn-outline-secondary"
    onClick={handleReload}
  >
    รีโหลด
  </button>

  <button
    type="button"
    className="btn btn-primary"
    onClick={async () => {

      await loadHistory(teacherId);

      setHistoryPage(1);

      setShowHistory(true);

    }}
  >
    ค้นหาประวัติ
  </button>

  <button
    type="button"
    className="btn btn-primary"
    onClick={saveAll}
  >
    บันทึกทั้งหมด
  </button>

  <button
    type="button"
    className="btn btn-success"
    onClick={exportExcel}
  >
    Export Microsoft Excel
  </button>

</div>
  </div>
</div>
{showHistory && (
  <>
      <h5 className="mb-3 fw-bold text-success section-title">
        ประวัติการบันทึกน้ำหนัก-ส่วนสูง
      </h5>
      <div className="table-scroll">
      <table
  className="table table-bordered table-sm align-middle"
  style={{ fontSize: "14px" }}
>
        <thead>
          <tr>
            <th style={{ width: 60 }}>ลำดับ</th>
            <th style={{ width: 120 }}>วันที่</th>
            <th style={{ width: 200 }}>ชื่อ-นามสกุล</th>
            <th style={{ width: 120 }}>น้ำหนัก</th>
            <th style={{ width: 120 }}>ส่วนสูง</th>
          </tr>
        </thead>
        <tbody>
          {currentHistory.map((h, i) => (
            <tr key={i}>
              <td>{historyFirstRow +i + 1}</td>
              <td>{thaiDate(h.measurement_date)}</td>
              <td className="text-start ps-3">
  {h.prefix}{h.first_name} {h.last_name}
</td>
              <td>{h.weight}</td>
              <td>{h.height}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <div className="d-flex justify-content-center align-items-center gap-2 mt-3 mb-3 flex-wrap">

  <button
    className="btn btn-outline-success btn-sm"
    disabled={historyPage === 1}
    onClick={() => setHistoryPage(historyPage - 1)}
  >
    ก่อนหน้า
  </button>

  <span className="fw-bold">
    หน้า {historyPage} / {historyTotalPages || 1}
  </span>

  <button
    className="btn btn-outline-success btn-sm"
    disabled={
      historyPage === historyTotalPages ||
      historyTotalPages === 0
    }
    onClick={() => setHistoryPage(historyPage + 1)}
  >
    ถัดไป
  </button>

</div>
        </>
)}
      {/* ตารางบันทึก */}
<div className="measurements-table">
  <table
  className="table table-bordered table-sm align-middle mb-3"
  style={{ fontSize: "14px" }}
>
    <thead>
      <tr>
        <th style={{ width: 60 }}>ลำดับ</th>
<th style={{ width: 200 }}>ชื่อ-นามสกุล</th>
<th style={{ width: 120 }}>ชื่อเล่น</th>
<th style={{ width: 140 }}>น้ำหนัก</th>
<th style={{ width: 140 }}>ส่วนสูง</th>
      </tr>
    </thead>
    <tbody>
      {currentCheckins.map((r, i) => (
        <tr key={r.child_id}>
          <td>{checkinFirstRow + i + 1}</td>
          <td className="text-start ps-3">
  {r.name}
</td>
          <td>{r.nickname || "-"}</td>
          <td>
            <input
  type="number"
  min="0"
  step="0.01"
  className="form-control-sm"
  value={r.measurement?.weight ?? ""}
  onChange={e =>
    changeVal(
      r.child_id,
      "weight",
      e.target.value === ""
        ? ""
        : Math.max(0, Number(e.target.value))
    )
  }
/>
          </td>
          <td>
            <input
  type="number"
  min="0"
  step="0.01"
  className="form-control-sm"
  value={r.measurement?.height ?? ""}
  onChange={e =>
    changeVal(
      r.child_id,
      "height",
      e.target.value === ""
        ? ""
        : Math.max(0, Number(e.target.value))
    )
  }
/>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  <div className="d-flex justify-content-center align-items-center gap-2 mt-3 mb-3 flex-wrap">

  <button
    className="btn btn-outline-success btn-sm"
    disabled={checkinPage === 1}
    onClick={() => setCheckinPage(checkinPage - 1)}
  >
    ก่อนหน้า
  </button>

  <span className="fw-bold">
    หน้า {checkinPage} / {checkinTotalPages || 1}
  </span>

  <button
    className="btn btn-outline-success btn-sm"
    disabled={
      checkinPage === checkinTotalPages ||
      checkinTotalPages === 0
    }
    onClick={() => setCheckinPage(checkinPage + 1)}
  >
    ถัดไป
  </button>

</div>
</div>
    </div>
  );
}
