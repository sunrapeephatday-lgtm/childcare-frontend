// src/pages/admin/AdminDashboard.jsx

import React, { useEffect, useState } from "react";
import API from "../../api/api";

import ChildrenCountChart from "../../components/charts/ChildrenCountChart";
import AttendanceSummaryUnder3Chart from "../../components/charts/AttendanceSummaryUnder3Chart";
import AttendanceSummary3YearsChart from "../../components/charts/AttendanceSummary3YearsChart";
import MilkSummaryUnder3Chart from "../../components/charts/MilkSummaryUnder3Chart";
import MilkSummary3YearsChart from "../../components/charts/MilkSummary3YearsChart";
import LunchSummaryUnder3Chart from "../../components/charts/LunchSummaryUnder3Chart";
import LunchSummary3YearsChart from "../../components/charts/LunchSummary3YearsChart";
import ToothbrushSummaryUnder3Chart from "../../components/charts/ToothbrushSummaryUnder3Chart";
import ToothbrushSummary3YearsChart from "../../components/charts/ToothbrushSummary3YearsChart";
import HealthSummaryUnder3Chart from "../../components/charts/HealthSummaryUnder3Chart";
import HealthSummary3YearsChart from "../../components/charts/HealthSummary3YearsChart";

export default function AdminDashboard() {
  const [rooms, setRooms] = useState([]);
  const [childrenCount, setChildrenCount] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear() + 543);

  const [selectedChild, setSelectedChild] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [activeTab, setActiveTab] = useState("daily"); 

  const rowsPerPage = 10;

  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  const dateHeaderMonths = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];

  async function loadDashboard() {
    try {
      const dev = await API.get("/admin/dashboard/development-summary");
      setRooms(dev.data);

      const child = await API.get("/admin/dashboard/children-count");
      setChildrenCount(child.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function handleReload() {
    setKeyword("");
    setSearchResults([]);
    setCurrentPage(1);
    setShowDetail(false);
    setDetailData(null);
    setSelectedChild(null);
  }

  async function handleSearch(e) {
    e.preventDefault();
    try {
      const res = await API.get("/admin/dashboard/search-child", {
        params: { q: keyword }
      });
      setSearchResults(res.data);
      setCurrentPage(1);
      setShowDetail(false);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleViewDetail(child) {
    try {
      const res = await API.get(`/admin/dashboard/child-month-detail/${child.child_id}`, {
        params: {
          month,
          year: year - 543
        }
      });
      setSelectedChild(child);
      setDetailData(res.data);
      setActiveTab("daily"); 
      setShowDetail(true);
    } catch (err) {
      console.error(err);
    }
  }

  // คำนวณ Pagination สำหรับตารางค้นหาเด็ก (searchResults)
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = searchResults.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(searchResults.length / rowsPerPage);

  // สไตล์การสร้างเลขหน้าแบบ Checkin (แสดงหัว-ท้าย และช่วงใกล้เคียง)
  const searchPageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2
  );

  const totalDays = getDaysInMonth(month, year - 543);
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  const shortYearThai = String(year).slice(-2);
  const monthColumns = dateHeaderMonths.map((m, index) => ({
    monthIndex: index,
    label: `${m} ${shortYearThai}`
  }));

  return (
    <div className="container-fluid my-4">
      {/* TITLE */}
      <h5 className="mb-4 fw-bold text-success section-title">
        แดชบอร์ด
      </h5>

      {/* SEARCH */}
      <form onSubmit={handleSearch} className="mb-4 d-flex justify-content-end">
        <div className="d-flex flex-wrap gap-2 dashboard-filters">
          <input
            type="text"
            className="form-control"
            placeholder="ค้นหาเด็ก / ห้องเรียน"
            style={{ width: "320px" }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <select
            className="form-select"
            style={{ width: "140px" }}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {thaiMonths.map((m, i) => (
              <option key={i + 1} value={i + 1}>
                {m}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: "120px" }}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2567, 2568, 2569].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button className="btn btn-success">ค้นหา</button>

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleReload}
          >
            รีโหลด
          </button>
        </div>
      </form>

      {/* SEARCH RESULT */}
      {searchResults.length > 0 && !showDetail && (
        <div className="card mb-4 border-success shadow-sm">
          <div className="card-body">
            <h6 className="fw-bold mb-3 text-success">ผลการค้นหา</h6>

            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-success">
                  <tr>
                    <th>ชื่อ-นามสกุล</th>
                    <th>ห้องเรียน</th>
                    <th width="150">รายละเอียด</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((c) => (
                    <tr key={c.child_id}>
                      <td className="ps-3 text-start">
                        {c.prefix}{c.first_name} {c.last_name}
                      </td>
                      <td className="ps-3 text-start">
                        {c.classroom_name}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleViewDetail(c)}
                        >
                          รายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 🔴 ปรับเมนูแบ่งหน้าของผลการค้นหาเด็กให้เหมือนหน้า Checkin 🔴 */}
            {searchResults.length > rowsPerPage && (
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3 mb-1">
                <div className="text-muted small">
                  แสดง {indexOfFirstRow + 1}-{Math.min(indexOfLastRow, searchResults.length)} จาก {searchResults.length} รายการ
                </div>

                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      >
                        ก่อนหน้า
                      </button>
                    </li>

                    {searchPageNumbers.map((page, index) => {
                      const prevPage = searchPageNumbers[index - 1];
                      return (
                        <React.Fragment key={page}>
                          {prevPage && page - prevPage > 1 && (
                            <li className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          )}
                          <li className={`page-item ${currentPage === page ? "active" : ""}`}>
                            <button
                              type="button"
                              className="page-link"
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </button>
                          </li>
                        </React.Fragment>
                      );
                    })}

                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
      )}

      {/* ===================== DETAIL SECTION ===================== */}
      {showDetail && detailData && (
        <div className="card mb-4 border-success shadow-sm">
          {/* HEADER */}
          <div className="card-header bg-success text-white d-flex justify-content-between align-items-center py-2 px-3">
            <h5 className="fw-bold mb-0 text-white" style={{ fontSize: "16px" }}>
              ประวัติกิจกรรมประจำปี พ.ศ. {year} : {selectedChild?.prefix}{selectedChild?.first_name} {selectedChild?.last_name} ({selectedChild?.classroom_name})
            </h5>
            <button
              className="btn btn-light btn-sm fw-bold text-success"
              onClick={() => setShowDetail(false)}
            >
              ย้อนกลับ
            </button>
          </div>

          {/* SELECTION TABS MENU */}
          <div className="card-body bg-light border-bottom py-2 px-3">
            <ul className="nav nav-pills gap-2">
              <li className="nav-item">
                <button
                  className={`nav-link btn-sm py-1 px-3 fw-bold ${activeTab === "daily" ? "active bg-success" : "text-success"}`}
                  onClick={() => setActiveTab("daily")}
                >
                  ประวัติรายวัน (ประจำเดือน {thaiMonths[month - 1]})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn-sm py-1 px-3 fw-bold ${activeTab === "monthly" ? "active bg-success" : "text-success"}`}
                  onClick={() => setActiveTab("monthly")}
                >
                  ประวัติรายเดือน (ภาพรวมทั้งปี)
                </button>
              </li>
            </ul>
          </div>

          {/* TABLE */}
          <div className="card-body p-0">
            <div className="milk-table-wrapper">
              <table
                className="table table-bordered mb-0 text-center align-middle"
                style={{
                  tableLayout: "fixed",
                  minWidth: activeTab === "daily" ? `${200 + daysArray.length * 86}px` : `${200 + monthColumns.length * 120}px`,
                  width: "max-content"
                }}
              >
                {/* HEAD SWITCHING */}
                {activeTab === "daily" ? (
                  <thead className="table-success align-middle">
                    <tr>
                      <th rowSpan="2" style={{ width: "200px" }}>หัวข้อประเมิน</th>
                      <th colSpan={daysArray.length}>วันที่บันทึกข้อมูล (รายวัน)</th>
                    </tr>
                    <tr>
                      {daysArray.map((day) => (
                        <th key={day} style={{ width: "86px", fontWeight: "normal", fontSize: "13px" }}>
                          {day} {dateHeaderMonths[month - 1]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                ) : (
                  <thead className="table-success align-middle">
                    <tr>
                      <th rowSpan="2" style={{ width: "200px" }}>หัวข้อประเมิน</th>
                      <th colSpan={monthColumns.length}>เดือนที่ทำการบันทึก (รายเดือน)</th>
                    </tr>
                    <tr>
                      {monthColumns.map((m) => (
                        <th key={m.monthIndex} style={{ width: "120px", fontWeight: "normal" }}>
                          {m.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}

                {/* BODY SWITCHING */}
                <tbody>
                  {activeTab === "daily" ? (
                    <>
                      <MonthlyDataRow
                        title="เช็คชื่อ"
                        data={detailData.attendance}
                        dateKey="record_date"
                        valueKey="status"
                        month={month}
                        year={year}
                      />
                      <MonthlyDataRow
                        title="ดื่มนม"
                        data={detailData.milk}
                        dateKey="record_date"
                        valueKey="status"
                        month={month}
                        year={year}
                      />
                      <MonthlyDataRow
                        title="รับประทานอาหาร"
                        data={detailData.lunch}
                        dateKey="record_date"
                        valueKey="status"
                        month={month}
                        year={year}
                      />
                      <MonthlyDataRow
                        title="แปรงฟัน"
                        data={detailData.toothbrush}
                        dateKey="record_date"
                        valueKey="status"
                        month={month}
                        year={year}
                      />
                    </>
                  ) : (
                    <>
                      <YearlyHealthDataRow
                        title="สุขภาพ"
                        data={detailData.health}
                        monthColumns={monthColumns}
                      />
                      <YearlyMeasurementRow
                        title="น้ำหนัก/ส่วนสูง"
                        data={detailData.measurements}
                        monthColumns={monthColumns}
                      />
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CHART */}
      <div className="row g-4">
        <div className="col-12 col-xl-6">
          <ChildrenCountChart data={childrenCount} />
        </div>
        <div className="col-12 col-xl-6">
          <AttendanceSummaryUnder3Chart />
        </div>
        <div className="col-12 col-xl-6">
          <AttendanceSummary3YearsChart />
        </div>
        <div className="col-12 col-lg-6">
          <MilkSummaryUnder3Chart />
        </div>
        <div className="col-12 col-lg-6">
          <MilkSummary3YearsChart />
        </div>
        <div className="col-12 col-lg-6">
          <LunchSummaryUnder3Chart />
        </div>
        <div className="col-12 col-lg-6">
          <LunchSummary3YearsChart />
        </div>
        <div className="col-12 col-lg-6">
          <ToothbrushSummaryUnder3Chart />
        </div>
        <div className="col-12 col-lg-6">
          <ToothbrushSummary3YearsChart />
        </div>
        <div className="col-12 col-lg-6">
          <HealthSummaryUnder3Chart />
        </div>
        <div className="col-12 col-lg-6">
          <HealthSummary3YearsChart />
        </div>
      </div>
    </div>
  );
}

/* ==================================================
   HELPER
================================================== */
function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

function displaySymbol(title, value, allData = []) {
  if (!value || value === "-") return "-";

  const strValue = String(value).trim();

  if (title === "เช็คชื่อ") {
    if (strValue === "มา") return "✓";
    if (strValue === "ลา") return "ล";
    if (strValue === "ขาด") return "ข";
    return strValue;
  }

  if (title === "สุขภาพ") {
    if (typeof value === "object") {
      const statuses = [value.hair_condition, value.oral_cavity, value.fingernail, value.toenail].filter(Boolean);
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
    return strValue;
  }

  if (
    strValue === "ดื่ม" || 
    strValue === "รับประทาน" || 
    strValue === "แปรงฟันแล้ว" || 
    strValue === "ปฏิบัติ" || 
    strValue === "ปกติ" ||
    strValue === "✓"
  ) {
    return "✓";
  }

  if (strValue === "ไม่ดื่ม" || strValue === "ไม่ปฏิบัติ" || strValue === "ผิดปกติ" || strValue === "✕") {
    return "✕";
  }

  return strValue;
}

/* ==================================================
   MONTHLY DATA ROW (สำหรับแท็บรายวันทั่วไป)
================================================== */
function MonthlyDataRow({ title, data, dateKey, valueKey, month, year }) {
  const totalDays = getDaysInMonth(month, year - 543);

  return (
    <tr>
      <td className="text-start fw-bold ps-3 table-light" style={{ width: "200px" }}>
        {title}
      </td>
      {Array.from({ length: totalDays }).map((_, index) => {
        const day = index + 1;
        const found = data?.find((item) => {
          const itemDate = new Date(item[dateKey]);
          return itemDate.getDate() === day;
        });

        const rawValue = found ? found[valueKey] : "-";

        return (
          <td key={day} style={{ width: "86px" }}>
            {displaySymbol(title, rawValue, data)}
          </td>
        );
      })}
    </tr>
  );
}

/* ==================================================
   🔴 YEARLY HEALTH DATA ROW (สรุปสุขภาพราย 12 เดือน + วันที่บันทึก)
================================================== */
function YearlyHealthDataRow({ title, data, monthColumns }) {
  return (
    <tr>
      <td className="text-start fw-bold ps-3 table-light" style={{ width: "200px" }}>
        {title}
      </td>
      {monthColumns.map((m) => {
        const matchInMonth = data?.filter((item) => {
          const d = new Date(item.evaluation_date);
          return d.getMonth() === m.monthIndex;
        });

        const latestRecord = matchInMonth && matchInMonth.length > 0 ? matchInMonth[0] : null;
        const recordDay = latestRecord ? new Date(latestRecord.evaluation_date).getDate() : null;

        return (
          <td key={m.monthIndex} style={{ width: "120px" }}>
            {latestRecord ? (
              <div>
                <span className="fw-bold">{displaySymbol(title, latestRecord, data)}</span>
                <div className="text-muted" style={{ fontSize: "10px", marginTop: "2px" }}>(ว. {recordDay})</div>
              </div>
            ) : (
              "-"
            )}
          </td>
        );
      })}
    </tr>
  );
}

/* ==================================================
   🔴 YEARLY MEASUREMENT ROW (สรุปน้ำหนัก/ส่วนสูงราย 12 เดือน + วันที่บันทึก)
================================================== */
function YearlyMeasurementRow({ title, data, monthColumns }) {
  return (
    <tr>
      <td className="text-start fw-bold ps-3 table-light" style={{ width: "200px" }}>
        {title}
      </td>
      {monthColumns.map((m) => {
        const matchInMonth = data?.filter((item) => {
          const d = new Date(item.measurement_date);
          return d.getMonth() === m.monthIndex;
        });

        const latestRecord = matchInMonth && matchInMonth.length > 0 ? matchInMonth[0] : null;
        const recordDay = latestRecord ? new Date(latestRecord.measurement_date).getDate() : null;

        return (
          <td key={m.monthIndex} style={{ width: "120px", fontSize: "12px", padding: "6px 2px" }}>
            {latestRecord && (latestRecord.weight || latestRecord.height) ? (
              <div>
                <div style={{ whiteSpace: "nowrap" }}>
                  {latestRecord.weight ? parseFloat(latestRecord.weight) + " กก." : "-"} / {latestRecord.height ? parseFloat(latestRecord.height) + " ซม." : "-"}
                </div>
                <div className="text-muted" style={{ fontSize: "10px", marginTop: "2px" }}>(วันที่ {recordDay})</div>
              </div>
            ) : (
              "-"
            )}
          </td>
        );
      })}
    </tr>
  );
}