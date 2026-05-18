import React, { useEffect, useState } from "react";
import API from "../api/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "../styles/checkin.css";

/* ===== helper ===== */
function formatThaiDate(d) {
  if (!d) return "-";
  const date = new Date(d);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear() + 543;
  return `${day}/${month}/${year}`;
}

export default function CheckinPage() {
  const [rows, setRows] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [date, setDate] = useState("");
  const [teacherId, setTeacherId] = useState(null);
  const [msg, setMsg] = useState(null);

  const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());

  const [keyword, setKeyword] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [checkinPage, setCheckinPage] = useState(1);

  const rowsPerPage = 10;
  const thaiDate = formatThaiDate(date);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const res = await API.get("/checkins/me");
    const tid = res.data.teacher_id;

    setTeacherId(tid);
    loadToday(tid);
  }

  async function loadToday(tid) {
    const res = await API.get("/checkins/today", {
      params: { teacher_id: tid }
    });
    setRows(res.data.rows || []);
    setFilteredRows(res.data.rows || []);
    setDate(res.data.date);
  }

  async function loadHistory(tid) {
    const res = await API.get("/checkins/monthly", {
      params: {
        teacher_id: tid,
        month: exportMonth,
        year: exportYear
      }
    });
    setHistory(res.data.rows || []);
  }

  function handleSearch(e) {
    e.preventDefault();
    const k = keyword.toLowerCase();
    const today = new Date().toISOString().slice(0, 10);

    const result = rows.map((r) => {
      const h = history.find(
        (x) =>
          x.first_name + " " + x.last_name === r.name.replace(/^(เด็กชาย|เด็กหญิง)/, "").trim() &&
          new Date(x.record_date).toISOString().slice(0, 10) === today
      );

      return {
        ...r,
        checkedToday: !!h,
        realStatus: h?.status || "ยังไม่เช็ค"
      };
    }).filter((r) =>
      (r.name || "").toLowerCase().includes(k) ||
      (r.nickname || "").toLowerCase().includes(k)
    );

    setFilteredRows(result);
  }

  async function handleReload() {
    setKeyword("");
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

  function mark(id, status) {
    setRows(r => r.map(x => (x.child_id === id ? { ...x, status } : x)));
    setFilteredRows(r => r.map(x => (x.child_id === id ? { ...x, status } : x)));
  }

  function setNote(id, note) {
    setRows(r => r.map(x => (x.child_id === id ? { ...x, note } : x)));
    setFilteredRows(r => r.map(x => (x.child_id === id ? { ...x, note } : x)));
  }

  async function saveAll() {
    for (const r of rows) {
      await API.post("/checkins", {
        child_id: r.child_id,
        status: r.status,
        note: r.note,
        teacher_id: teacherId
      });
    }
    loadHistory(teacherId);
    setMsg({ type: "success", text: "บันทึกเรียบร้อย" });
  }

  /* ================= EXPORT ================= */
  function exportExcel() {
    if (!history.length) {
      alert("ไม่มีข้อมูล");
      return;
    }

    const thaiMonths = [
      "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
      "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
    ];

    const shortMonths = [
      "ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.",
      "ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."
    ];

    const month = exportMonth - 1;
    const year = exportYear;
    const days = new Date(year, month + 1, 0).getDate();

    const map = {};
    history.forEach(h => {
      const d = new Date(h.record_date);
      if (d.getMonth() !== month || d.getFullYear() !== year) return;
      const name = `${h.first_name} ${h.last_name}`;
      const day = d.getDate();
      if (!map[name]) {
        map[name] = {};
      }
      map[name][day] = h.status;
    });

    const header = [
      "ลำดับ",
      "ชื่อ-นามสกุล",
      ...Array.from({ length: days }, (_, i) => `${i + 1}${shortMonths[month]}`),
      "มา",
      "ขาด",
      "ลา"
    ];

    const title = `บันทึกการเช็คการมาเรียนประจำเดือน ${thaiMonths[month]} พ.ศ. ${year + 543}`;
    const center = "ศูนย์พัฒนาเด็ก อบต.หนองน้ำแดง สังกัดองค์การบริหารส่วนตำบลหนองน้ำแดง";

    const aoa = [
      [title],
      [center],
      [],
      header
    ];

    let index = 1;
    Object.keys(map).forEach(name => {
      const rowExcel = aoa.length + 1;
      const cells = [];

      for (let d = 1; d <= days; d++) {
        const st = map[name][d];
        if (st === "มา") cells.push("✓");
        else if (st === "ขาด") cells.push("ข");
        else if (st === "ลา") cells.push("ล");
        else cells.push("");
      }

      const startCol = 2;
      const endCol = startCol + days - 1;
      const startLetter = XLSX.utils.encode_col(startCol);
      const endLetter = XLSX.utils.encode_col(endCol);

      aoa.push([
        index++,
        name,
        ...cells,
        { t: "n", f: `COUNTIF(${startLetter}${rowExcel}:${endLetter}${rowExcel},"✓")` },
        { t: "n", f: `COUNTIF(${startLetter}${rowExcel}:${endLetter}${rowExcel},"ข")` },
        { t: "n", f: `COUNTIF(${startLetter}${rowExcel}:${endLetter}${rowExcel},"ล")` }
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: header.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: header.length - 1 } }
    ];

    ws["!cols"] = [
      { wch: 8 },
      { wch: 30 },
      ...Array.from({ length: days }, () => ({ wch: 5 })),
      { wch: 6 },
      { wch: 6 },
      { wch: 6 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "รายงานเช็คชื่อ");
    XLSX.writeFile(wb, `รายงานเช็คชื่อ_${thaiMonths[month]}_${year + 543}.xlsx`);
  }

  const historyLastRow = historyPage * rowsPerPage;
  const historyFirstRow = historyLastRow - rowsPerPage;

  const groupedHistory = Object.entries(
    history.reduce((acc, h) => {
      const name = `${h.prefix || ""}${h.first_name} ${h.last_name}`;
      const day = new Date(h.record_date).getDate();
      if (!acc[name]) {
        acc[name] = {};
      }
      acc[name][day] = h.status;
      return acc;
    }, {})
  );

  const currentHistory = groupedHistory.slice(historyFirstRow, historyLastRow);

  const checkinLastRow = checkinPage * rowsPerPage;
  const checkinFirstRow = checkinLastRow - rowsPerPage;
  const currentCheckins = filteredRows.slice(checkinFirstRow, checkinLastRow);

  const checkinTotalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const historyTotalPages = Math.ceil(groupedHistory.length / rowsPerPage);

  const historyPageNumbers = Array.from({ length: historyTotalPages }, (_, i) => i + 1)
    .filter((page) => page === 1 || page === historyTotalPages || Math.abs(page - historyPage) <= 2);

  const checkinPageNumbers = Array.from({ length: checkinTotalPages }, (_, i) => i + 1)
    .filter((page) => page === 1 || page === checkinTotalPages || Math.abs(page - checkinPage) <= 2);

  return (
    <div className="container-fluid px-4 my-4">
      {/* ===== หัวข้อหลัก ===== */}
      <h3 className="mb-3 fw-bold text-success section-title">
        บันทึกการเช็คชื่อ (วันที่ {thaiDate})
      </h3>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
  
      {/* ===== เมนูค้นหา คลุมด้วยสไตล์แบบการ์ดสวยงาม ===== */}
      <div className="card shadow-sm p-3 mb-4 bg-white rounded border-0">
        <div className="row align-items-end">
          <div className="col-md-3">
            <label className="form-label fw-bold text-secondary">เดือน</label>
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
            <label className="form-label fw-bold text-secondary">ปี</label>
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

          <div className="col-12 col-md-7 mt-3 mt-md-0">
            <div className="d-flex flex-wrap gap-2 justify-content-start justify-content-md-end">
              <button type="button" className="btn btn-outline-secondary px-3" onClick={handleReload}>
                รีโหลด
              </button>
              <button className="btn btn-success px-3" onClick={async () => {
                await loadHistory(teacherId);
                setHistoryPage(1);
                setShowHistory(true);
              }}>
                ค้นหาประวัติ
              </button>
              <button className="btn btn-primary px-3" onClick={saveAll}>
                บันทึกทั้งหมด
              </button>
              <button className="btn btn-outline-primary px-3" onClick={exportExcel}>
                Export Microsoft Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ส่วนตารางประวัติเช็คชื่อรายเดือน (ที่มี 31 วัน) ===== */}
      {showHistory && (
        <div className="card shadow-sm p-3 mb-4 bg-white rounded border-0">
          <h4 className="mb-3 fw-bold text-success section-title">
            ประวัติการเช็คชื่อรายเดือน
          </h4>

          {/* จุดสำคัญ: ใช้ wrapper บังคับ Scrollbar แนวนอนภายในกรอบการ์ด ไม่ให้ทะลุออกจอหลัก */}
          <div className="checkin-table-wrapper border rounded overflow-auto w-100">
            <table className="table table-bordered align-middle mb-0 text-center" style={{ minWidth: "1600px" }}>
              <thead className="table-success text-dark">
                <tr>
                  <th rowSpan="2" className="align-middle">ลำดับ</th>
                  <th rowSpan="2" className="align-middle text-start ps-3" style={{ minWidth: "220px" }}>ชื่อ-นามสกุล</th>
                  <th colSpan={new Date(exportYear, exportMonth, 0).getDate()} className="py-2 text-end pe-3 small text-muted fw-normal">
                    วันที่เช็คชื่อ
                  </th>
                  <th rowSpan="2" className="align-middle">มา</th>
                  <th rowSpan="2" className="align-middle">ขาด</th>
                  <th rowSpan="2" className="align-middle">ลา</th>
                </tr>
                <tr>
                  {Array.from({ length: new Date(exportYear, exportMonth, 0).getDate() }, (_, i) => {
                    const shortMonths = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
                    return (
                      <th key={i} className="fw-normal small py-1" style={{ minWidth: "45px" }}>
                        {i + 1}<br/><span className="text-muted" style={{ fontSize: "10px" }}>{shortMonths[exportMonth - 1]}</span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {currentHistory.map(([name, records], i) => {
                  let present = 0;
                  let absent = 0;
                  let leave = 0;

                  return (
                    <tr key={i}>
                      <td>{historyFirstRow + i + 1}</td>
                      <td className="text-start ps-3 fw-medium" style={{ minWidth: "220px", whiteSpace: "nowrap" }}>
                        {name}
                      </td>
                      {Array.from({ length: new Date(exportYear, exportMonth, 0).getDate() }, (_, dayIndex) => {
                        const day = dayIndex + 1;
                        const status = records[day];

                        if (status === "มา") present++;
                        else if (status === "ขาด") absent++;
                        else if (status === "ลา") leave++;

                        return (
                          <td key={day} className="px-1">
                            {status === "มา" ? <span className="text-success fw-bold">✓</span> : 
                             status === "ขาด" ? <span className="text-danger fw-bold">ข</span> : 
                             status === "ลา" ? <span className="text-warning fw-bold">ล</span> : "-"}
                          </td>
                        );
                      })}
                      <td className="text-success fw-bold">{present}</td>
                      <td className="text-danger fw-bold">{absent}</td>
                      <td className="text-warning fw-bold">{leave}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination ของประวัติ */}
          {groupedHistory.length > rowsPerPage && (
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
              <div className="text-muted small">
                แสดง {historyFirstRow + 1}-{Math.min(historyLastRow, groupedHistory.length)} จาก {groupedHistory.length} รายการ
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
                    const showGap = prevPage && page - prevPage > 1;
                    return (
                      <React.Fragment key={page}>
                        {showGap && <li className="page-item disabled"><span className="page-link">...</span></li>}
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
        </div>
      )}

      {/* ===== ส่วนตารางรายชื่อนักเรียนวันนี้ (ตารางล่าง) ===== */}
      <div className="card shadow-sm p-3 bg-white rounded border-0">
        <h4 className="mb-3 fw-bold text-secondary section-title">
          รายชื่อนักเรียนวันนี้
        </h4>
        <div className="table-responsive border rounded">
          <table className="table table-bordered table-hover align-middle mb-0 text-center">
            <thead className="table-light">
              <tr>
                <th style={{ width: "60px" }}>ลำดับ</th>
                <th style={{ width: "200px" }} className="text-start ps-3">ชื่อ-นามสกุล</th>
                <th style={{ width: "120px" }} className="text-start ps-3">ชื่อเล่น</th>
                <th style={{ width: "160px" }}>สถานะ</th>
                <th style={{ width: "250px" }}>หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {currentCheckins.map((r, i) => (
                <tr key={r.child_id}>
                  <td>{checkinFirstRow + i + 1}</td>
                  <td className="text-start ps-3">{r.name}</td>
                  <td className="text-start ps-3">{r.nickname}</td>
                  <td>
                    <select className="form-select form-select-sm text-center mx-auto" style={{ maxWidth: "110px" }} value={r.status} onChange={(e) => mark(r.child_id, e.target.value)}>
                      <option value="มา">มา</option>
                      <option value="ขาด">ขาด</option>
                      <option value="ลา">ลา</option>
                    </select>
                  </td>
                  <td>
                    <input className="form-control form-control-sm" value={r.note || ""} onChange={(e) => setNote(r.child_id, e.target.value)} placeholder="ระบุหมายเหตุ (ถ้ามี)"/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination ของตารางเช็คชื่อวันนี้ */}
        {filteredRows.length > rowsPerPage && (
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
            <div className="text-muted small">
              แสดง {checkinFirstRow + 1}-{Math.min(checkinLastRow, filteredRows.length)} จาก {filteredRows.length} รายการ
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
                      {showGap && <li className="page-item disabled"><span className="page-link">...</span></li>}
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