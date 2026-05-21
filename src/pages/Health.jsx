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
  return "-";
}

function healthSummary(value) {
  if (!value) return "-";

  const statuses = [
    value.hair_condition,
    value.oral_cavity,
    value.fingernail,
    value.toenail
  ].filter(Boolean);

  if (statuses.length === 0) return "-";

  const counts = statuses.reduce((acc, status) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  if ((counts["ดี"] || 0) > 2) return "ดี";
  if ((counts["ปานกลาง"] || 0) >= 2) return "ปานกลาง";
  if ((counts["ปรับปรุง"] || 0) >= 2) return "ปรับปรุง";

  return statuses[0] || "-";
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
        h.note || "-",
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }
    ];

    ws["!cols"] = [
      { wch: 14 }, { wch: 30 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "สุขภาพ");

    XLSX.writeFile(wb, `รายงานบันทึกสุขภาพ_${thaiMonths[month]}_${year + 543}.xlsx`);
  }

  /* ================= จัดการคอลัมน์ประวัติแบบ 12 เดือน ================= */
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
    const d = new Date(h.evaluation_date);
    return d.getFullYear() === exportYear;
  });

  const historyStudentMap = new Map();

  rows.forEach((r) => {
    historyStudentMap.set(r.name, {
      name: r.name,
      monthsValues: {} 
    });
  });

  yearlyHistory.forEach((h) => {
    const d = new Date(h.evaluation_date);
    const monthIdx = d.getMonth();
    const name = `${h.prefix || ""}${h.first_name} ${h.last_name}`;

    if (!historyStudentMap.has(name)) {
      historyStudentMap.set(name, {
        name,
        monthsValues: {}
      });
    }

    // 🔴 ปรับปรุง: เก็บค่า object สุขภาพ พร้อมทั้งดึงเลขวันที่บันทึก (Date) แนบไปด้วย
    historyStudentMap.get(name).monthsValues[monthIdx] = {
      raw_data: {
        hair_condition: h.hair_condition,
        oral_cavity: h.oral_cavity,
        fingernail: h.fingernail,
        toenail: h.toenail
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
      <div className="col-md-12">
        <h3 className="mb-3 fw-bold text-success section-title">
          บันทึกสุขภาพ (วันที่ {todayThai()})
        </h3>
        {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
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
              <button type="button" className="btn btn-outline-secondary" onClick={handleReload}>
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
              <button type="button" className="btn btn-primary" onClick={saveAll}>
                บันทึกทั้งหมด
              </button>
              <button type="button" className="btn btn-primary me-2" onClick={exportExcel}>
                Export Microsoft Excel
              </button>
            </div>
          </div>
        </div>

        {showHistory && (
          <>
            <h5 className="mb-3 fw-bold text-success section-title">
              ประวัติการบันทึกสุขภาพรายเดือน (ปี พ.ศ. {exportYear + 543})
            </h5>

            <div className="health-table-wrapper">
              <table
                className="table table-bordered align-middle text-center"
                style={{
                  tableLayout: "fixed",
                  minWidth: `${260 + monthColumns.length * 100}px`,
                  width: "max-content"
                }}
              >
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "60px" }}>ลำดับ</th>
                    <th style={{ width: "200px" }}>ชื่อ-นามสกุล</th>
                    {monthColumns.map((m) => (
                      <th key={m.monthIndex} style={{ width: "100px" }}>
                        {m.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {currentHistory.map((h, i) => (
                    <tr key={i}>
                      <td>{historyFirstRow + i + 1}</td>
                      <td style={{ textAlign: "left", paddingLeft: "16px", width: "220px" }}>
                        {h.name}
                      </td>
                      {monthColumns.map((m) => {
                        // 🔴 ปรับปรุง: ดึงข้อมูลสุขภาพและวันที่ออกมา Render ลง Cell ตาราง
                        const monthData = h.monthsValues[m.monthIndex];
                        const summaryText = monthData ? healthSummary(monthData.raw_data) : "-";
                        const dayNum = monthData ? monthData.recordDay : null;

                        return (
                          <td key={m.monthIndex}>
                            {monthData ? (
                              <div>
                                <span className="fw-bold">{summaryText}</span>
                                <div className="text-muted small" style={{ fontSize: "10px", marginTop: "2px" }}>
                                  (ว. {dayNum})
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
                  แสดง {historyFirstRow + 1}-
                  {Math.min(historyLastRow, historyStudentRows.length)} จาก {historyStudentRows.length} รายการ
                </div>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${historyPage === 1 ? "disabled" : ""}`}>
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => setHistoryPage((page) => Math.max(1, page - 1))}
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
                          <li className={`page-item ${historyPage === page ? "active" : ""}`}>
                            <button type="button" className="page-link" onClick={() => setHistoryPage(page)}>
                              {page}
                            </button>
                          </li>
                        </React.Fragment>
                      );
                    })}
                    <li className={`page-item ${historyPage === historyTotalPages ? "disabled" : ""}`}>
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => setHistoryPage((page) => Math.min(historyTotalPages, page + 1))}
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

        {/* ตารางวันนี้ */}
        <div className="health-table-wrapper mt-4">
          <table className="table table-bordered align-middle text-center">
            <thead className="table-light">
              <tr>
                <th style={{ width: "60px" }}>ลำดับ</th>
                <th style={{ width: "220px" }}>ชื่อ</th>
                <th style={{ width: "140px" }}>ชื่อเล่น</th>
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
                  <td className="text-start ps-3">{r.name}</td>
                  <td className="text-start ps-3">{r.nickname || "-"}</td>
                  {["hair_condition", "oral_cavity", "fingernail", "toenail"].map((f) => (
                    <td key={f}>
                      <select
                        key={`${r.child_id}-${f}-${r.evaluation[f]}`}
                        className="form-select form-select-sm"
                        value={r.evaluation[f]}
                        onChange={(e) => onChangeField(r.child_id, f, e.target.value)}
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
                      placeholder="-"
                      value={r.evaluation.note}
                      onChange={(e) => onChangeField(r.child_id, "note", e.target.value)}
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
                    const showGap = prevPage && page - prevPage > 1;
                    return (
                      <React.Fragment key={page}>
                        {showGap && (
                          <li className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        )}
                        <li className={`page-item ${checkinPage === page ? "active" : ""}`}>
                          <button type="button" className="page-link" onClick={() => setCheckinPage(page)}>
                            {page}
                          </button>
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
    </div>
  );
}