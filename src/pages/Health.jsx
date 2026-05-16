import React, { useEffect, useState } from "react";
import API from "../api/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import "../styles/health.css";

const OPTIONS = ["ดี", "ปานกลาง", "ปรับปรุง"];

/* ================= helper ================= */

function formatThaiDate(d) {
  if (!d) return "-";
  const date = new Date(d);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear() + 543;
  return `${day}/${month}/${year}`;
}

function todayThai() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear() + 543;
  return `${day}/${month}/${year}`;
}

function healthToNumber(v) {
  if (v === "ดี") return 3;
  if (v === "ปานกลาง") return 2;
  if (v === "ปรับปรุง") return 1;
  return "";
}

/* ================= component ================= */

export default function HealthPage() {
  const [teacherId, setTeacherId] = useState(null);
  const [rows, setRows] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [checkinPage, setCheckinPage] = useState(1);
  const rowsPerPage = 10;
  const [msg, setMsg] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());

  /* ===== load ===== */

  useEffect(() => {
  init();
}, []);

async function init() {
  try {
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (!user || user.role !== "teacher") {
      setMsg({ type: "danger", text: "หน้านี้สำหรับครูเท่านั้น" });
      return;
    }

    const res = await API.get("/health/me");

    const tId = res.data.teacher_id;

    setTeacherId(tId);

    loadToday(tId);
    

  } catch (err) {
    console.error(err);
    setMsg({ type: "danger", text: "โหลดข้อมูลครูไม่สำเร็จ" });
  }
}

  async function loadToday(teacher_id) {
    const res = await API.get("/health/today", {
      params: { teacher_id },
    });

    // 🔴 สำคัญมาก: ต้องเติมค่า default ไม่งั้นมือถือ select จะเด้ง
    const prepared = (res.data.rows || []).map((r) => ({
  ...r,
  evaluation: {
    hair_condition: "ดี",
    oral_cavity: "ดี",
    fingernail: "ดี",
    toenail: "ดี",
    note: "",
  },
}));

    setRows(prepared);
  }

  async function loadHistory(teacher_id) {
    const res = await API.get("/health/history", {
      params: { teacher_id },
    });
    setHistory(res.data.rows || []);
  }
  async function handleReload() {

  const currentDate = new Date();

  setExportMonth(currentDate.getMonth() + 1);

  setExportYear(currentDate.getFullYear());

  setShowHistory(false);

  setHistory([]);

  setHistoryPage(1);

  setCheckinPage(1);

  await loadToday(teacherId);

  setMsg({
    type: "success",
    text: "รีโหลดข้อมูลเรียบร้อย"
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}

  /* ===== edit ===== */

  function onChangeField(child_id, field, value) {
    setRows((prev) =>
      prev.map((r) =>
        r.child_id === child_id
          ? {
              ...r,
              evaluation: {
                ...r.evaluation,
                [field]: value,
              },
            }
          : r
      )
    );
  }

  /* ===== save ===== */

  async function saveAll() {
    setIsSaving(true);
    try {
      const items = rows.map((r) => ({
  child_id: r.child_id,
  hair_condition: r.evaluation.hair_condition,
  oral_cavity: r.evaluation.oral_cavity,
  fingernail: r.evaluation.fingernail,
  toenail: r.evaluation.toenail,
  note: r.evaluation.note || null,
  created_by: teacherId,
}));

await API.post("/health", { items });

setRows((prev) =>
  prev.map((r) => ({
    ...r,
    evaluation: {
      ...r.evaluation,
      hair_condition: "ดี",
      oral_cavity: "ดี",
      fingernail: "ดี",
      toenail: "ดี",
      note: "",
    },
  }))
);



loadHistory(teacherId);

setMsg({ type: "success", text: "บันทึกสุขภาพเรียบร้อย" });
    } catch {
      setMsg({ type: "danger", text: "บันทึกไม่สำเร็จ" });
    } finally {
      setIsSaving(false);
    }
  }

  /* ================= EXPORT EXCEL ================= */
function exportExcel() {
  if (!history.length) return;

  const month = exportMonth - 1;
  const year = exportYear;

  const thaiMonths = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
  ];

  const title = `รายงานสุขภาพ ประจำเดือน ${thaiMonths[month]} ${year + 543}`;
  const subtitle = "ศูนย์พัฒนาเด็ก อบต.หนองน้ำแดง สังกัดองค์การบริหารส่วนตำบลหนองน้ำแดง";
  const data = [
    [title],
    [subtitle],
    ["วันที่", "ชื่อ", "ผม", "ช่องปาก", "เล็บมือ", "เล็บเท้า", "หมายเหตุ"]
  ];
  const monthHistory = history.filter((h) => {
  const d = new Date(h.evaluation_date);
  return d.getMonth() === month && d.getFullYear() === year;
});

  monthHistory.forEach((h) => {
    data.push([
      formatThaiDate(h.evaluation_date),
      `${h.prefix}${h.first_name} ${h.last_name}`,
      healthToNumber(h.hair_condition),
      healthToNumber(h.oral_cavity),
      healthToNumber(h.fingernail),
      healthToNumber(h.toenail),
      h.note || "",
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);

  ws["!merges"] = [
  {
    s: { r: 0, c: 0 },
    e: { r: 0, c: 6 }
  },
  {
    s: { r: 1, c: 0 },
    e: { r: 1, c: 6 }
  }
];

  ws["!cols"] = [
    { wch: 14 },
    { wch: 30 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 20 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "สุขภาพ");


XLSX.writeFile(
  wb,
  `รายงานบันทึกสุขภาพ_${thaiMonths[month]}_${year + 543}.xlsx`
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
    <div className="col-md-12">
      <h3 className="mb-3 fw-bold text-success section-title">
        บันทึกสุขภาพ (วันที่ {todayThai()})
      </h3>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
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

      

      {/* 🔴 ตารางวันนี้ (เลื่อนซ้ายขวาได้) */}
      <div className="health-table-wrapper">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th style={{ width: "60px" }}>ลำดับ</th>
              <th style={{ width: "220px" }}>ชื่อ</th>
              <th style={{ width: "120px" }}>ผม</th>
              <th style={{ width: "120px" }}>ช่องปาก</th>
              <th style={{ width: "120px" }}>เล็บมือ</th>
              <th style={{ width: "120px" }}>เล็บเท้า</th>
              <th style={{ width: "180px" }}>หมายเหตุ</th>
            </tr>
          </thead>

          <tbody>
            {currentCheckins.map((r, i) => (
              <tr key={r.child_id}>
                <td>{checkinFirstRow + i + 1}</td>
                <td style={{ textAlign: "left", paddingLeft: "16px", width: "220px" }}>
                {r.name}
                </td>

                {[
                  
                    "hair_condition",
                    "oral_cavity",
                    "fingernail",
                    "toenail",
                  
                ].map((f) => (
                  <td key={f}>
                    <select
  key={`${r.child_id}-${f}-${r.evaluation[f]}`}
  className="form-select form-select-sm"
  value={r.evaluation[f]}
  onChange={(e) =>
    onChangeField(r.child_id, f, e.target.value)
  }
>
                      {OPTIONS.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>
                  </td>
                ))}

                <td>
                  <input
                    className="form-control form-control-sm"
                    value={r.evaluation.note}
                    onChange={(e) =>
                      onChangeField(r.child_id, "note", e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="d-flex justify-content-center align-items-center gap-2 mt-3 mb-3 flex-wrap">

  <button
    type="button"
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
    type="button"
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

      <hr />
{showHistory && (
  <>
      {/* 🔴 ประวัติ */}
      <h5 className="mb-3 fw-bold text-success section-title">
        ประวัติการบันทึกสุขภาพ
      </h5>

      <div className="health-table-wrapper">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th style={{ width: "60px" }}>ลำดับ</th>
              <th style={{ width: "120px" }}>วันที่</th>
              <th style={{ width: "220px" }}>ชื่อ-นามสกุล</th>
              <th style={{ width: "120px" }}>ผม</th>
              <th style={{ width: "120px" }}>ช่องปาก</th>
              <th style={{ width: "120px" }}>เล็บมือ</th>
              <th style={{ width: "120px" }}>เล็บเท้า</th>
              <th style={{ width: "180px" }}>หมายเหตุ</th>
            </tr>
          </thead>

          <tbody>
            {currentHistory.map((h, i) => (
              <tr key={i}>
                <td>{historyFirstRow + i + 1}</td>
                <td style={{ width: "120px" }}>
  {formatThaiDate(h.evaluation_date)}
</td>

<td style={{ textAlign: "left", paddingLeft: "16px", width: "220px" }}>
  {h.prefix}{h.first_name} {h.last_name}
</td>
                <td>{h.hair_condition}</td>
                <td>{h.oral_cavity}</td>
                <td>{h.fingernail}</td>
                <td>{h.toenail}</td>
                <td>{h.note || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-center align-items-center gap-2 mt-3 mb-3 flex-wrap">

  <button
    type="button"
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
    type="button"
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
            </div>
            </div>
  );
}
