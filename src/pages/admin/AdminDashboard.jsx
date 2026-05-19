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
  
  // เปลี่ยนจาก showModal เป็นระบบเปิดปิดหน้าแสดงรายละเอียดบน Dashboard
  const [showDetail, setShowDetail] = useState(false);

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
      setShowDetail(false); // ค้นหาใหม่ให้ปิดหน้ารายละเอียดเก่าก่อน
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
      setShowDetail(true); // เปิดการแสดงผลตารางรายละเอียดในหน้าจอหลัก
    } catch (err) {
      console.error(err);
    }
  }

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = searchResults.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(searchResults.length / rowsPerPage);

  const totalDays = getDaysInMonth(month, year - 543);
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div>
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

      {/* SEARCH RESULT (โชว์เมื่อมีผลลัพธ์และไม่ได้เปิดดูรายละเอียดอยู่) */}
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

            {/* PAGINATION */}
            <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
              <button
                className="btn btn-outline-success btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                ก่อนหน้า
              </button>

              <span className="fw-bold">
                หน้า {currentPage} / {totalPages || 1}
              </span>

              <button
                className="btn btn-outline-success btn-sm"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                ถัดไป
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== DETAIL IN-LINE SECTION (แสดงแทนกล่องค้นหาแบบหน้า MilkPage) ===================== */}
      {showDetail && detailData && (
        <div className="card mb-4 border-success shadow-sm">
          {/* HEADER */}
          <div className="card-header bg-success text-white d-flex justify-content-between align-items-center py-2 px-3">
            <h5 className="fw-bold mb-0 text-white">
              ประวัติกิจกรรมรายเดือนประจำเดือน {thaiMonths[month - 1]} {year} : {selectedChild?.prefix}{selectedChild?.first_name} {selectedChild?.last_name} ({selectedChild?.classroom_name})
            </h5>
            <button
              className="btn btn-light btn-sm fw-bold text-success"
              onClick={() => setShowDetail(false)}
            >
              ย้อนกลับ
            </button>
          </div>

          {/* TABLE */}
          <div className="card-body p-0">
            <div className="milk-table-wrapper">
              <table
                className="table table-bordered mb-0 text-center"
                style={{
                  tableLayout: "fixed",
                  minWidth: `${200 + daysArray.length * 86}px`,
                  width: "max-content"
                }}
              >
                {/* THEAD */}
                <thead className="table-success align-middle">
                  <tr>
                    <th rowSpan="2" style={{ width: "200px", verticalAlign: "middle" }}>
                      หัวข้อ
                    </th>
                    <th colSpan={daysArray.length}>วันที่บันทึก</th>
                  </tr>
                  <tr>
                    {daysArray.map((day) => (
                      <th key={day} style={{ width: "86px", fontWeight: "normal", fontSize: "13px" }}>
                        {day}{dateHeaderMonths[month - 1]}{String(year).slice(-2)}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* TBODY */}
                <tbody className="align-middle">
                  {/* เช็คชื่อ */}
                  <MonthlyDataRow
                    title="เช็คชื่อ"
                    data={detailData.attendance}
                    dateKey="record_date"
                    valueKey="status"
                    month={month}
                    year={year}
                  />

                  {/* ดื่มนม */}
                  <MonthlyDataRow
                    title="ดื่มนม"
                    data={detailData.milk}
                    dateKey="record_date"
                    valueKey="status"
                    month={month}
                    year={year}
                  />

                  {/* รับประทานอาหาร */}
                  <MonthlyDataRow
                    title="รับประทานอาหาร"
                    data={detailData.lunch}
                    dateKey="record_date"
                    valueKey="status"
                    month={month}
                    year={year}
                  />

                  {/* แปรงฟัน */}
                  <MonthlyDataRow
                    title="แปรงฟัน"
                    data={detailData.toothbrush}
                    dateKey="record_date"
                    valueKey="status"
                    month={month}
                    year={year}
                  />

                  {/* สุขภาพ */}
                  <MonthlyDataRow
                    title="สุขภาพ"
                    data={detailData.health}
                    dateKey="evaluation_date"
                    valueKey="note"
                    month={month}
                    year={year}
                  />

                  {/* น้ำหนัก/ส่วนสูง */}
                  <MeasurementRow
                    title="น้ำหนัก/ส่วนสูง"
                    data={detailData.measurements}
                    month={month}
                    year={year}
                  />
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

function displaySymbol(title, value) {
  if (!value || value === "-") return "-";
  
  if (value === "ดื่ม" || value === "มา" || value === "ปฏิบัติ" || value === "ปกติ") return "✓";
  if (value === "ไม่ดื่ม" || value === "ขาด" || value === "ไม่ปฏิบัติ" || value === "ผิดปกติ") return "✕";
  
  return value; 
}

/* ==================================================
   MONTHLY DATA ROW
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
            {displaySymbol(title, rawValue)}
          </td>
        );
      })}
    </tr>
  );
}

/* ==================================================
   MEASUREMENT ROW
================================================== */
function MeasurementRow({ title, data, month, year }) {
  const totalDays = getDaysInMonth(month, year - 543);

  return (
    <tr>
      <td className="text-start fw-bold ps-3 table-light" style={{ width: "200px" }}>
        {title}
      </td>
      {Array.from({ length: totalDays }).map((_, index) => {
        const day = index + 1;
        const found = data?.find((item) => {
          const itemDate = new Date(item.measurement_date);
          return itemDate.getDate() === day;
        });

        return (
          <td key={day} style={{ width: "86px", fontSize: "12px" }}>
            {found
              ? `${found.weight ?? "-"} / ${found.height ?? "-"}`
              : "-"}
          </td>
        );
      })}
    </tr>
  );
}