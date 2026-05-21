import React, { useEffect, useState } from "react";
import API from "../api/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "../styles/Milk.css";

/* ===== helper ===== */
const thaiMonths = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
];

function colLetter(n) {
  let s = "";
  while (n >= 0) {
    s = String.fromCharCode((n % 26) + 65) + s;
    n = Math.floor(n / 26) - 1;
  }
  return s;
}

function todayThai() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear() + 543;
  return `${day}/${month}/${year}`;
}


export default function MilkPage() {
  const [teacherId, setTeacherId] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const [historyPage, setHistoryPage] = useState(1);

  const [checkinPage, setCheckinPage] = useState(1);

  const rowsPerPage = 10;
  const [msg, setMsg] = useState(null);
  const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());

  useEffect(() => {
  init();
}, []);

async function init() {
  const res = await API.get("/milk/me");
  const tid = res.data.teacher_id;

  setTeacherId(tid);

  loadToday(tid);
  
}

  async function loadToday(tid = teacherId) {
  if (!tid) return;

  const res = await API.get("/milk/today", {
    params: { teacher_id: tid, date }
  });

  setRows(res.data.rows || []);
}

async function loadHistory(tid = teacherId) {
  if (!tid) return;

  const res = await API.get("/milk/history", {
    params: { teacher_id: tid }
  });

  setHistory(res.data.rows || []);
}
async function handleReload() {

  setMsg(null);

  const currentDate = new Date();

  setExportMonth(currentDate.getMonth() + 1);

  setExportYear(currentDate.getFullYear());

  setShowHistory(false);

  setHistory([]);

  setHistoryPage(1);

  setCheckinPage(1);

  if (teacherId) {
    await loadToday(teacherId);
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}

  async function saveAll() {
    await API.post("/milk/save", {
      teacher_id: teacherId,
      date,
      items: rows.map(r => ({
        child_id: r.child_id,
        status: r.status,
        note: r.note
      }))
    });
    setMsg({ type: "success", text: "บันทึกเรียบร้อย" });

    setTimeout(() => {
      setMsg(null);
    }, 2000);

    loadHistory();
  }

  /* ===== EXPORT EXCEL รายเดือน ===== */
 function exportExcel() {
  if (!history.length) return;

 const month = exportMonth - 1;
const year = exportYear;
const days = new Date(year, month + 1, 0).getDate();

  const shortMonths = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];

  const title =
    `บันทึกการดื่มนมประจำเดือน ${thaiMonths[month]} พ.ศ. ${year + 543}`;

  const center =
    "ศูนย์พัฒนาเด็ก อบต.หนองน้ำแดง สังกัดองค์การบริหารส่วนตำบลหนองน้ำแดง";

  const map = {};

  history.forEach((h) => {
    const d = new Date(h.record_date);

    if (d.getMonth() !== month || d.getFullYear() !== year) return;

    const name = `${h.prefix}${h.first_name} ${h.last_name}`;
    const day = d.getDate();

    if (!map[name]) {
      map[name] = Array(days).fill("-");
    }

    if (h.status === "ดื่ม") {
      map[name][day - 1] = "✓";
    } else if (h.status === "ไม่ดื่ม") {
      map[name][day - 1] = "X";
    }
  });

  const header = ["ลำดับ", "ชื่อ-นามสกุล"];

  for (let d = 1; d <= days; d++) {
    header.push(`${d}${shortMonths[month]}`);
  }

  header.push("รวม");
  header.push("หมายเหตุ");

  const aoa = [
    [title],
    [center],
    header
  ];

  Object.entries(map).forEach(([name, arr], index) => {
    const excelRow = index + 4;

    aoa.push([
      index + 1,
      name,
      ...arr,
      {
  t: "n",
  f: `COUNTIF(C${excelRow}:${XLSX.utils.encode_col(days + 1)}${excelRow},"✓")`
}
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  ws["!merges"] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: days + 3 }
    },
    {
      s: { r: 1, c: 0 },
      e: { r: 1, c: days + 3 }
    }
  ];

  ws["!cols"] = [
    { wch: 8 },
    { wch: 30 },
    ...Array(days).fill({ wch: 7 }),
    { wch: 10 },
    { wch: 20 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "รายงานการดื่มนม");

  XLSX.writeFile(
    wb,
    `รายงานการดื่มนม_${thaiMonths[month]}_${year + 543}.xlsx`
  );
}

const dateHeaderMonths = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

const daysInSelectedMonth = new Date(exportYear, exportMonth, 0).getDate();

const monthDateColumns = Array.from(
  { length: daysInSelectedMonth },
  (_, index) => ({
    day: index + 1,
    label: `${index + 1}${dateHeaderMonths[exportMonth - 1]}${String(exportYear + 543).slice(-2)}`
  })
);

function milkSymbol(status) {
  if (status === "ดื่ม") return "✓";
  if (status === "ไม่ดื่ม") return "✕";
  return "-";
}

const monthlyHistory = history.filter((h) => {
  const d = new Date(h.record_date);
  return d.getMonth() === exportMonth - 1 && d.getFullYear() === exportYear;
});

const historyStudentMap = new Map();

rows.forEach((r) => {
  historyStudentMap.set(r.name, {
    name: r.name,
    statuses: {}
  });
});

monthlyHistory.forEach((h) => {
  const d = new Date(h.record_date);
  const name = `${h.prefix || ""}${h.first_name} ${h.last_name}`;

  if (!historyStudentMap.has(name)) {
    historyStudentMap.set(name, {
      name,
      statuses: {}
    });
  }

  historyStudentMap.get(name).statuses[d.getDate()] = h.status;
});

const historyStudentRows = Array.from(historyStudentMap.values()).map((student) => {
  const statuses = Object.values(student.statuses);

  return {
    ...student,
    drinkCount: statuses.filter((status) => status === "ดื่ม").length,
    notDrinkCount: statuses.filter((status) => status === "ไม่ดื่ม").length
  };
});

const historyLastRow = historyPage * rowsPerPage;

const historyFirstRow = historyLastRow - rowsPerPage;

const currentHistory = historyStudentRows.slice(
  historyFirstRow,
  historyLastRow
);

const historyTotalPages = Math.ceil(
  historyStudentRows.length / rowsPerPage
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

const historyPageNumbers = Array.from(
  { length: historyTotalPages },
  (_, i) => i + 1
).filter(
  (page) =>
    page === 1 ||
    page === historyTotalPages ||
    Math.abs(page - historyPage) <= 2
);

const checkinPageNumbers = Array.from(
  { length: checkinTotalPages },
  (_, i) => i + 1
).filter(
  (page) =>
    page === 1 ||
    page === checkinTotalPages ||
    Math.abs(page - checkinPage) <= 2
);
  return (
    <div className="container my-4">
      <h3 className="mb-3 fw-bold text-success section-title">
        บันทึกการดื่มนม (วันที่ {todayThai()})
      </h3>

      {msg && <div className="alert alert-success">{msg.text}</div>}

      <div className="row mb-4 align-items-end">
  <div className="col-md-3">
    <label className="form-label">เดือน</label>
    <select
      className="form-select"
      value={exportMonth}
      onChange={(e) => setExportMonth(Number(e.target.value))}
    >
      {thaiMonths.map((m, i) => (
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
    className="btn btn-primary me-2"
    onClick={exportExcel}
  >
    Export Microsoft Excel
  </button>

</div>
  </div>
</div>
{showHistory && (
  <>
      <h5 className="mt-4 fw-bold text-success section-title">
        ประวัติการดื่มนม
      </h5>
      <div className="milk-table-wrapper">
      <table
        className="table table-bordered"
        style={{
          tableLayout: "fixed",
          minWidth: `${420 + monthDateColumns.length * 86}px`,
          width: "max-content"
        }}
      >
  <thead>
    <tr>
      <th rowSpan="2" style={{ width: "60px" }}>ลำดับ</th>
      <th rowSpan="2" style={{ width: "200px" }}>ชื่อ-นามสกุล</th>
      <th colSpan={monthDateColumns.length}>วันที่</th>
      <th rowSpan="2" style={{ width: "80px" }}>ดื่ม</th>
      <th rowSpan="2" style={{ width: "80px" }}>ไม่ดื่ม</th>
    </tr>
    <tr>
      {monthDateColumns.map((d) => (
        <th key={d.day} style={{ width: "86px" }}>
          {d.label}
        </th>
      ))}
    </tr>
  </thead>
        <tbody>
          {currentHistory.map((h,i)=>(
            <tr key={i}>
              <td>{historyFirstRow + i + 1}</td>
              <td style={{ textAlign: "left", paddingLeft: "16px", width: "160px" }}>
  {h.name}
</td>
              {monthDateColumns.map((d) => (
                <td key={d.day}>{milkSymbol(h.statuses[d.day])}</td>
              ))}
              <td>{h.drinkCount}</td>
              <td>{h.notDrinkCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {historyStudentRows.length > rowsPerPage && (
  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3 mb-3">

    <div className="text-muted small">
      แสดง {historyFirstRow + 1}-
      {Math.min(historyLastRow, historyStudentRows.length)}
      {" "}จาก {historyStudentRows.length} รายการ
    </div>

    <nav>
      <ul className="pagination pagination-sm mb-0">

        <li className={`page-item ${historyPage === 1 ? "disabled" : ""}`}>
          <button
            type="button"
            className="page-link"
            onClick={() =>
              setHistoryPage((page) => Math.max(1, page - 1))
            }
          >
            ก่อนหน้า
          </button>
        </li>

        {historyPageNumbers.map((page, index) => {
          const prevPage = historyPageNumbers[index - 1];
          const showGap = prevPage && page - prevPage > 1;

          return (
            <React.Fragment key={page}>

              {showGap && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}

              <li
                className={`page-item ${
                  historyPage === page ? "active" : ""
                }`}
              >
                <button
                  type="button"
                  className="page-link"
                  onClick={() => setHistoryPage(page)}
                >
                  {page}
                </button>
              </li>

            </React.Fragment>
          );
        })}

        <li
          className={`page-item ${
            historyPage === historyTotalPages ? "disabled" : ""
          }`}
        >
          <button
            type="button"
            className="page-link"
            onClick={() =>
              setHistoryPage((page) =>
                Math.min(historyTotalPages, page + 1)
              )
            }
          >
            ถัดไป
          </button>
        </li>

      </ul>
    </nav>
  </div>
)}
  </>
)}
      <div className="milk-table-wrapper">
       <table className="table table-bordered" style={{ tableLayout: "fixed", width: "100%" }}>
  <thead>
    <tr>
      <th style={{ width: "60px" }}>ลำดับ</th>
      <th style={{ width: "120px" }}>ชื่อ-นามสกุล</th>
      <th style={{ width: "120px" }}>ชื่อเล่น</th>
      <th style={{ width: "140px" }}>สถานะ</th>
      <th style={{ width: "140px" }}>หมายเหตุ</th>
    </tr>
  </thead>
        <tbody>
          {currentCheckins.map((r,i)=>(
            <tr key={r.child_id}>
              <td>{checkinFirstRow + i + 1}</td>
              <td style={{ textAlign: "left", paddingLeft: "16px", width: "160px" }}>
  {r.name}
</td>
              <td style={{ textAlign: "left", paddingLeft: "16px" }}>{r.nickname}</td>
              <td>
                <select
                  className="form-select-sm"
                  value={r.status}
                  onChange={e =>
                    setRows(rs => rs.map(x =>
                      x.child_id === r.child_id ? { ...x, status: e.target.value } : x
                    ))
                  }
                >
                  <option value="ดื่ม">ดื่ม</option>
                  <option value="ไม่ดื่ม">ไม่ดื่ม</option>
                </select>
              </td>
              <td>
                <input
                  className="form-control-sm"
                  placeholder="-"
                  value={r.note || ""}
                  onChange={e =>
                    setRows(rs => rs.map(x =>
                      x.child_id === r.child_id ? { ...x, note: e.target.value } : x
                    ))
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    {rows.length > rowsPerPage && (
  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3 mb-3">

    <div className="text-muted small">
      แสดง {checkinFirstRow + 1}-
      {Math.min(checkinLastRow, rows.length)}
      {" "}จาก {rows.length} รายการ
    </div>

    <nav>
      <ul className="pagination pagination-sm mb-0">

        <li className={`page-item ${checkinPage === 1 ? "disabled" : ""}`}>
          <button
            type="button"
            className="page-link"
            onClick={() =>
              setCheckinPage((page) => Math.max(1, page - 1))
            }
          >
            ก่อนหน้า
          </button>
        </li>

        {checkinPageNumbers.map((page, index) => {
          const prevPage = checkinPageNumbers[index - 1];
          const showGap = prevPage && page - prevPage > 1;

          return (
            <React.Fragment key={page}>

              {showGap && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}

              <li
                className={`page-item ${
                  checkinPage === page ? "active" : ""
                }`}
              >
                <button
                  type="button"
                  className="page-link"
                  onClick={() => setCheckinPage(page)}
                >
                  {page}
                </button>
              </li>

            </React.Fragment>
          );
        })}

        <li
          className={`page-item ${
            checkinPage === checkinTotalPages ? "disabled" : ""
          }`}
        >
          <button
            type="button"
            className="page-link"
            onClick={() =>
              setCheckinPage((page) =>
                Math.min(checkinTotalPages, page + 1)
              )
            }
          >
            ถัดไป
          </button>
        </li>

      </ul>
    </nav>
  </div>
)}
  </div>
    </div>
  );
}
