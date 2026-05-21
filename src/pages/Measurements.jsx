import React, { useEffect, useState } from "react";
import API from "../api/api";
import * as XLSX from "xlsx";
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

function measurementDisplay(value) {
  // หากไม่มีข้อมูลในเดือนนั้นๆ หรือโครงสร้างข้างในว่างเปล่า ให้แสดงเครื่องหมายขีด
  if (!value || 
      ((value.weight === null || value.weight === undefined || value.weight === "") && 
       (value.height === null || value.height === undefined || value.height === ""))) {
    return "-";
  }

  const parts = [];
  if (value.weight !== null && value.weight !== undefined && value.weight !== "") {
    parts.push(`${value.weight} กก.`);
  }
  if (value.height !== null && value.height !== undefined && value.height !== "") {
    parts.push(`${value.height} ซม.`);
  }
  return parts.length > 0 ? parts.join(" / ") : "-";
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
      const res = await API.get("/measurements/me");
      const tId = res.data.teacher_id;
      setTeacherId(tId);
      loadToday(tId);
      loadHistory(tId); 
    } catch (err) {
      console.error(err);
      setMsg({ type: "danger", text: "โหลดข้อมูลครูไม่สำเร็จ" });
    }
  }

  async function loadToday(tid) {
    try {
      const res = await API.get("/measurements/today", {
        params: { teacher_id: tid, month: exportMonth, year: exportYear }
      });
      setRows(res.data.rows || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadHistory(tid) {
    try {
      const res = await API.get("/measurements/history", {
        params: { teacher_id: tid }
      });
      setHistory(res.data.rows || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleReload() {
    const currentDate = new Date();
    setExportMonth(currentDate.getMonth() + 1);
    setExportYear(currentDate.getFullYear());
    setShowHistory(false);
    setHistoryPage(1);
    setCheckinPage(1);
    await loadToday(teacherId);
    await loadHistory(teacherId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function changeVal(child_id, key, value) {
    setRows(prev =>
      prev.map(r =>
        r.child_id === child_id
          ? {
              ...r,
              measurement: { ...(r.measurement || {}), [key]: value }
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
    try {
      const items = rows.map(r => ({
        child_id: r.child_id,
        measurement_date: date,
        weight: r.measurement?.weight || null,
        height: r.measurement?.height || null,
        teacher_id: teacherId
      }));

      await API.post("/measurements", { items });
      setMsg({ type: "success", text: "บันทึกข้อมูลเรียบร้อย" });
      
      await loadToday(teacherId);
      await loadHistory(teacherId);
    } catch (err) {
      console.error(err);
      setMsg({ type: "danger", text: "บันทึกข้อมูลไม่สำเร็จ" });
    }
  }

  const monthlyHistory = history.filter((h) => {
    const dateStr = h.measurement_date.split('T')[0];
    const d = new Date(dateStr);
    return d.getMonth() === exportMonth - 1 && d.getFullYear() === exportYear;
  });

  /* ================= Export Excel ================= */
  function exportExcel() {
    if (!monthlyHistory.length) {
      alert("ไม่มีข้อมูลของเดือนที่เลือกเพื่อออกรายงาน");
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

    const monthName = months[exportMonth - 1];
    const header = [
      [`รายงานบันทึกน้ำหนักและส่วนสูง ประจำเดือน ${monthName} ${exportYear + 543}`],
      [],
      ["วันที่", "ชื่อ", "น้ำหนัก (กก.)", "ส่วนสูง (ซม.)", "BMI"]
    ];

    const body = monthlyHistory.map((h, i) => {
      const dateStr = h.measurement_date.split('T')[0];
      const d = new Date(dateStr);
      const day = d.getDate();
      const monthShort = shortMonths[d.getMonth()];
      const rowNumber = i + 4;

      return [
        `${day}-${monthShort}`,
        `${h.prefix || ""}${h.first_name} ${h.last_name}`,
        h.weight ? Number(h.weight) : "",
        h.height ? Number(h.height) : "",
        {
          t: "n",
          f: `IF(AND(C${rowNumber}<>"",D${rowNumber}<>""),ROUND(C${rowNumber}/((D${rowNumber}/100)*(D${rowNumber}/100)),2),"")`
        }
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([...header, ...body]);
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
    ws["!cols"] = [{ wch: 12 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "รายงานน้ำหนัก");
    XLSX.writeFile(wb, `รายงานบันทึกน้ำหนักส่วนสูง_${monthName}_${exportYear + 543}.xlsx`);
  }

  /* ================= จัดการประวัติแบบ 12 เดือน ================= */
  const dateHeaderMonths = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];

  const shortYearThai = String(exportYear + 543).slice(-2);
  const monthColumns = dateHeaderMonths.map((m, index) => ({
    monthIndex: index, 
    label: `${m} ${shortYearThai}`
  }));

  const yearlyHistory = history.filter((h) => {
    const dateStr = h.measurement_date.split('T')[0];
    const d = new Date(dateStr);
    return d.getFullYear() === exportYear;
  });

  const historyStudentMap = new Map();
  rows.forEach((r) => {
    historyStudentMap.set(r.name, { name: r.name, monthsValues: {} });
  });

  yearlyHistory.forEach((h) => {
    const dateStr = h.measurement_date.split('T')[0];
    const d = new Date(dateStr);
    const monthIdx = d.getMonth(); 
    const name = `${h.prefix || ""}${h.first_name} ${h.last_name}`;

    if (!historyStudentMap.has(name)) {
      historyStudentMap.set(name, { name, monthsValues: {} });
    }

    // 🔴 ปรับปรุง: เก็บสัดส่วนร่างกายเป็นตัวเลข พร้อมทั้งดึงเลขวันที่ (Date) แนบไปด้วยกัน
    historyStudentMap.get(name).monthsValues[monthIdx] = {
      record: {
        weight: h.weight ? parseFloat(h.weight) : "",
        height: h.height ? parseFloat(h.height) : ""
      },
      recordDay: d.getDate() // ดึงเฉพาะตัวเลขวันที่ (1 - 31)
    };
  });

  const historyStudentRows = Array.from(historyStudentMap.values());
  const historyLastRow = historyPage * rowsPerPage;
  const historyFirstRow = historyLastRow - rowsPerPage;
  const currentHistory = historyStudentRows.slice(historyFirstRow, historyLastRow);
  const historyTotalPages = Math.ceil(historyStudentRows.length / rowsPerPage);

  const checkinLastRow = checkinPage * rowsPerPage;
  const checkinFirstRow = checkinLastRow - rowsPerPage;
  const currentCheckins = rows.slice(checkinFirstRow, checkinLastRow);
  const checkinTotalPages = Math.ceil(rows.length / rowsPerPage);

  const historyPageNumbers = Array.from({ length: historyTotalPages }, (_, i) => i + 1)
    .filter(page => page === 1 || page === historyTotalPages || Math.abs(page - historyPage) <= 2);

  const checkinPageNumbers = Array.from({ length: checkinTotalPages }, (_, i) => i + 1)
    .filter(page => page === 1 || page === checkinTotalPages || Math.abs(page - checkinPage) <= 2);

  return (
    <div className="container my-4">
      {/* ===== หัวข้อ ===== */}
      <h3 className="mb-3 fw-bold text-success section-title">
        บันทึกน้ำหนัก-ส่วนสูง (วันที่ {todayThai()})
      </h3>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      
      {/* ===== ตัวเลือกเดือน/ปี และ ปุ่มจัดการ ===== */}
      <div className="row mb-3 align-items-end">
        <div className="col-md-3">
          <label className="form-label">เดือนบันทึกปัจจุบัน</label>
          <select
            className="form-select"
            value={exportMonth}
            onChange={(e) => setExportMonth(Number(e.target.value))}
          >
            {[
              "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
              "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
            ].map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
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
              <option key={y} value={y - 543}>{y}</option>
            ))}
          </select>
        </div>
        
        <div className="col-12 col-md-7 mt-2 mt-md-0">
          <div className="d-flex flex-wrap gap-2 justify-content-start justify-content-md-end">
            <button type="button" className="btn btn-outline-secondary" onClick={handleReload}>
              รีโหลด
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setHistoryPage(1);
                setShowHistory(true);
              }}
            >
              ค้นหาประวัติ
            </button>
            <button type="button" className="btn btn-primary" onClick={saveAll}>
              บันทึกทั้งหมด
            </button>
            <button type="button" className="btn btn-success me-2" onClick={exportExcel}>
              Export Microsoft Excel
            </button>
          </div>
        </div>
      </div>

      {showHistory && (
        <>
          <h5 className="mb-3 fw-bold text-success section-title">
            ประวัติการบันทึกน้ำหนัก-ส่วนสูงรายเดือน (ปี พ.ศ. {exportYear + 543})
          </h5>
          <div className="table-scroll">
            <table
              className="table table-bordered table-sm align-middle text-center"
              style={{
                fontSize: "14px",
                tableLayout: "fixed",
                minWidth: `${260 + monthColumns.length * 120}px`,
                width: "max-content"
              }}
            >
              <thead>
                <tr>
                  <th rowSpan="2" style={{ width: "60px" }}>ลำดับ</th>
                  <th rowSpan="2" style={{ width: "200px" }}>ชื่อ-นามสกุล</th>
                  <th colSpan={monthColumns.length}>เดือนที่บันทึก</th>
                </tr>
                <tr>
                  {monthColumns.map((m) => (
                    <th key={m.monthIndex} style={{ width: "120px" }}>{m.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentHistory.map((h, i) => (
                  <tr key={i}>
                    <td>{historyFirstRow + i + 1}</td>
                    <td className="text-start ps-3" style={{ width: "220px" }}>{h.name}</td>
                    {monthColumns.map((m) => {
                      // 🔴 ปรับปรุง: ดึงน้ำหนัก ส่วนสูง และตัวเลขวันที่มา Render แสดงผลพร้อมกัน
                      const monthData = h.monthsValues[m.monthIndex];
                      const displayStr = monthData ? measurementDisplay(monthData.record) : "-";
                      const dayNum = monthData ? monthData.recordDay : null;

                      return (
                        <td key={m.monthIndex} style={{ padding: "6px 2px" }}>
                          {monthData && displayStr !== "-" ? (
                            <div>
                              <div style={{ whiteSpace: "nowrap" }}>{displayStr}</div>
                              <div className="text-muted small" style={{ fontSize: "10px", marginTop: "2px" }}>
                                (วันที่ {dayNum})
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {historyStudentRows.length > rowsPerPage && (
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3 mb-3">
              <div className="text-muted small">
                แสดง {historyFirstRow + 1}-{Math.min(historyLastRow, historyStudentRows.length)} จาก {historyStudentRows.length} รายการ
              </div>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${historyPage === 1 ? "disabled" : ""}`}>
                    <button type="button" className="page-link" onClick={() => setHistoryPage((page) => Math.max(1, page - 1))}>
                      ก่อนหน้า
                    </button>
                  </li>
                  {historyPageNumbers.map((page, index) => {
                    const prevPage = historyPageNumbers[index - 1];
                    return (
                      <React.Fragment key={page}>
                        {prevPage && page - prevPage > 1 && (
                          <li className="page-item disabled"><span className="page-link">...</span></li>
                        )}
                        <li className={`page-item ${historyPage === page ? "active" : ""}`}>
                          <button type="button" className="page-link" onClick={() => setHistoryPage(page)}>{page}</button>
                        </li>
                      </React.Fragment>
                    );
                  })}
                  <li className={`page-item ${historyPage === historyTotalPages ? "disabled" : ""}`}>
                    <button type="button" className="page-link" onClick={() => setHistoryPage((page) => Math.min(historyTotalPages, page + 1))}>
                      ถัดไป
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}

      {/* ตารางบันทึกปัจจุบัน */}
      <div className="measurements-table mt-4">
        <table className="table table-bordered table-sm align-middle mb-3 text-center" style={{ fontSize: "14px" }}>
          <thead className="table-light">
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
                <td className="text-start ps-3">{r.name}</td>
                <td className="text-start ps-3">{r.nickname || "-"}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control form-control-sm"
                    placeholder="-"
                    value={r.measurement?.weight ?? ""}
                    onChange={e => changeVal(r.child_id, "weight", e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control form-control-sm"
                    placeholder="-"
                    value={r.measurement?.height ?? ""}
                    onChange={e => changeVal(r.child_id, "height", e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length > rowsPerPage && (
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3 mb-3">
            <div className="text-muted small">
              แสดง {checkinFirstRow + 1}-{Math.min(checkinLastRow, rows.length)} จาก {rows.length} รายการ
            </div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${checkinPage === 1 ? "disabled" : ""}`}>
                  <button type="button" className="page-link" onClick={() => setCheckinPage((page) => Math.max(1, page - 1))}>
                    ก่อนหน้า
                  </button>
                </li>
                {checkinPageNumbers.map((page, index) => {
                  const prevPage = checkinPageNumbers[index - 1];
                  return (
                    <React.Fragment key={page}>
                      {prevPage && page - prevPage > 1 && (
                        <li className="page-item disabled"><span className="page-link">...</span></li>
                      )}
                      <li className={`page-item ${checkinPage === page ? "active" : ""}`}>
                        <button type="button" className="page-link" onClick={() => setCheckinPage(page)}>{page}</button>
                      </li>
                    </React.Fragment>
                  );
                })}
                <li className={`page-item ${checkinPage === checkinTotalPages ? "disabled" : ""}`}>
                  <button type="button" className="page-link" onClick={() => setCheckinPage((page) => Math.min(checkinTotalPages, page + 1))}>
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