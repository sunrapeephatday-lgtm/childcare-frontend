import React, { useEffect, useState } from "react";
import API from "../api/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "../styles/LunchEating.css";

function thaiDate(d) {
  const date = new Date(d);
  return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()+543}`;
}

const thaiMonths = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
];

export default function LunchEating() {

  const [teacherId,setTeacherId] = useState(null);
  const [date,setDate] = useState(new Date().toISOString().slice(0,10));
  const [rows,setRows] = useState([]);
  const [history,setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const [historyPage, setHistoryPage] = useState(1);

  const [checkinPage, setCheckinPage] = useState(1);

  const rowsPerPage = 10;
  const [msg,setMsg] = useState(null);
  const [saving,setSaving] = useState(false);
  const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
const [exportYear, setExportYear] = useState(new Date().getFullYear());

  /* ===== โหลด teacher จาก token ===== */
  useEffect(()=>{
    initTeacher();
  },[]);

  async function initTeacher(){
    try{
      const user = JSON.parse(sessionStorage.getItem("user"));

      if(!user || user.role !== "teacher"){
        setMsg({ type:"danger", text:"หน้านี้สำหรับครูเท่านั้น" });
        return;
      }

      const res = await API.get("/lunch-eating/me");

      setTeacherId(res.data.teacher_id);

    }catch(err){
      console.error(err);
      setMsg({ type:"danger", text:"โหลดข้อมูลครูไม่สำเร็จ" });
    }
  }

  /* ===== โหลดข้อมูล ===== */
  useEffect(()=>{
    if(teacherId){
      loadToday();
    }
  },[teacherId,date]);

  async function loadToday(){
    const res = await API.get("/lunch-eating/today",{
      params:{ teacher_id: teacherId, date }
    });
    setRows(res.data.rows || []);
  }

  async function loadHistory(){
    const res = await API.get("/lunch-eating/history",{
      params:{ teacher_id: teacherId }
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

  await loadToday();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}

  function updateStatus(child_id,status){
    setRows(r=>r.map(x=>x.child_id===child_id?{...x,status}:x));
  }

  function updateNote(child_id,note){
    setRows(r=>r.map(x=>x.child_id===child_id?{...x,note}:x));
  }

  async function saveAll(){

    if(!teacherId){
      alert("ไม่พบ teacher id");
      return;
    }

    setSaving(true);

    await API.post("/lunch-eating/save",{
      teacher_id: teacherId,
      date,
      items: rows.map(r=>({
        child_id:r.child_id,
        log_id:r.log_id,
        status:r.status,
        note:r.note || null
      }))
    });

    setSaving(false);
    setMsg({ type:"success", text:"บันทึกเรียบร้อย" });

    loadHistory();
  }

  /* ===== EXPORT EXCEL ===== */
function exportExcelMonthly() {
  if (!history.length) return;

  const month = exportMonth - 1;
const year = exportYear;
const days = new Date(year, month + 1, 0).getDate();

  const shortMonths = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];

  const title =
    `บันทึกการรับประทานอาหารประจำเดือน ${thaiMonths[month]} พ.ศ. ${year + 543}`;

  const center =
    "ศูนย์พัฒนาเด็ก อบต.หนองน้ำแดง สังกัดองค์การบริหารส่วนตำบลหนองน้ำแดง";

  const map = {};

  history.forEach((h) => {
    const d = new Date(h.record_date);

    if (d.getMonth() !== month || d.getFullYear() !== year) return;

    const name = `${h.prefix}${h.first_name} ${h.last_name}`;
    const day = d.getDate();

    if (!map[name]) {
      map[name] = Array(days).fill("");
    }

    if (h.status === "รับประทาน") {
      map[name][day - 1] = "✓";
    } else if (h.status === "ยังไม่รับประทาน") {
      map[name][day - 1] = "X";
    } else if (h.status === "ไม่มา") {
      map[name][day - 1] = "-";
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
  XLSX.utils.book_append_sheet(wb, ws, "รายงานการรับประทานอาหาร");

  XLSX.writeFile(
    wb,
    `รายงานการรับประทานอาหาร_${thaiMonths[month]}_${year + 543}.xlsx`
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
        บันทึกการรับประทานอาหารกลางวัน
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

      await loadHistory();

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
    disabled={saving}
  >
    {saving ? "กำลังบันทึก..." : "บันทึกทั้งหมด"}
  </button>

  <button
    type="button"
    className="btn btn-primary me-2"
    onClick={exportExcelMonthly}
  >
    Export Microsoft Excel
  </button>

</div>
  </div>
</div>
{showHistory && (
  <>
      <h5 className="mb-3 fw-bold text-success section-title">
        ประวัติการรับประทานอาหาร
      </h5>

      <div className="table-scroll">
        <table
  className="table table-bordered"
  style={{ tableLayout: "fixed", width: "100%" }}
>
  <thead>
    <tr>
      <th style={{ width: "60px" }}>ลำดับ</th>
      <th style={{ width: "120px" }}>วันที่</th>
      <th style={{ width: "160px" }}>ชื่อ</th>
      <th style={{ width: "180px" }}>สถานะ</th>
      <th style={{ width: "220px" }}>หมายเหตุ</th>
    </tr>
  </thead>
          <tbody>
            {currentHistory.map((h,i)=>(
              <tr key={i}>
                <td>{historyFirstRow + i + 1}</td>
                <td>{thaiDate(h.record_date)}</td>
                <td style={{ textAlign: "left", paddingLeft: "16px", width: "160px" }}>
  {h.prefix}{h.first_name} {h.last_name}
</td>
                <td>{h.status}</td>
                <td>{h.note || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {history.length > rowsPerPage && (
  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3 mb-3">

    <div className="text-muted small">
      แสดง {historyFirstRow + 1}-
      {Math.min(historyLastRow, history.length)}
      {" "}จาก {history.length} รายการ
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
      <div className="table-scroll">
        <table
  className="table table-bordered"
  style={{ tableLayout: "fixed", width: "100%" }}
>
  <thead>
    <tr>
      <th style={{ width: "60px" }}>ลำดับ</th>
      <th style={{ width: "160px" }}>ชื่อ</th>
      <th style={{ width: "120px" }}>ชื่อเล่น</th>
      <th style={{ width: "180px" }}>สถานะ</th>
      <th style={{ width: "220px" }}>หมายเหตุ</th>
    </tr>
  </thead>
          <tbody>
            {currentCheckins.map((r,i)=>(
              <tr key={r.child_id}>
                <td>{checkinFirstRow + i + 1}</td>
                <td style={{ textAlign: "left", paddingLeft: "16px", width: "160px" }}>
  {r.name}
</td>
                <td style={{ textAlign: "left", paddingLeft: "16px", width: "120px" }}>
  {r.nickname}
</td>
                <td>
                  <select
                    className="form-select-sm"
                    value={r.status}
                    onChange={e=>updateStatus(r.child_id,e.target.value)}
                  >
                    <option value="รับประทาน">รับประทาน</option>
                    <option value="ยังไม่รับประทาน">ยังไม่รับประทาน</option>

                  </select>
                </td>
                <td>
                  <input
                    className="form-control-sm"
                    value={r.note || ""}
                    onChange={e=>updateNote(r.child_id,e.target.value)}
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