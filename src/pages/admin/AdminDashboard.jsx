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
  const rowsPerPage = 10;
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  // ✅ ปีเริ่มต้นเป็น พ.ศ. ปัจจุบัน
  const [year, setYear] = useState(new Date().getFullYear() + 543);

  const [selectedChild, setSelectedChild] = useState(null);

  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  ];

  // สถานะ → emoji/ข้อความที่อ่านง่าย (ปรับตามค่าจริงในฐานข้อมูลของคุณ)
  const statusLabel = (val) => {
    if (val === null || val === undefined || val === "") return "-";
    if (val === "present" || val === "มา")    return "✅";
    if (val === "absent"  || val === "ขาด")   return "❌";
    if (val === "late"    || val === "สาย")   return "⏰";
    if (val === "yes"     || val === "ดื่ม")   return "✅";
    if (val === "no"      || val === "ไม่ดื่ม") return "❌";
    return val; // แสดงค่าดิบถ้าไม่ตรงกับ case ใด
  };

  async function loadDashboard() {
    try {
      const dev = await API.get("/admin/dashboard/development-summary");
      setRooms(dev.data);

      const child = await API.get("/admin/dashboard/children-count");
      setChildrenCount(child.data);

      setSearchResults([]);
      setKeyword("");
      setSelectedChild(null);
    } catch (err) {
      console.error("LOAD ERROR =", err);
    }
  }

  function handleReload() {
    setSearchResults([]);
    setKeyword("");
    setSelectedChild(null);
    loadDashboard();
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    if (!keyword.trim()) return;
    try {
      const res = await API.get("/admin/dashboard/search-child", {
        params: { q: keyword, month, year },
      });
      setSearchResults(res.data);
      setCurrentPage(1);
      setSelectedChild(null);
    } catch (err) {
      console.error("SEARCH ERROR =", err);
    }
  }

  const indexOfLastRow  = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows     = searchResults.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages      = Math.ceil(searchResults.length / rowsPerPage);

  // จำนวนวันในเดือนที่เลือก (แปลงปีเป็น ค.ศ. ก่อนส่งให้ Date)
  const ceYear     = year > 2500 ? year - 543 : year;
  const daysInMonth = new Date(ceYear, month, 0).getDate();
  const daysArray   = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div>
      <h5 className="mb-4 fw-bold text-success section-title">แดชบอร์ด</h5>

      {/* 🔍 SEARCH */}
      <form onSubmit={handleSearch} className="mb-4 d-flex justify-content-end">
        <div className="d-flex flex-wrap gap-2 dashboard-filters">
          <input
            type="text"
            className="form-control"
            placeholder="ค้นหาเด็ก / ห้องเรียน"
            style={{ width: "280px" }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <select
            className="form-select"
            style={{ width: "130px" }}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {thaiMonths[i]}
              </option>
            ))}
          </select>

          {/* ✅ ปีแสดงเป็น พ.ศ. */}
          <select
            className="form-select"
            style={{ width: "110px" }}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2566, 2567, 2568, 2569, 2570].map((y) => (
              <option key={y} value={y}>{y}</option>
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

      {/* 📊 ผลการค้นหาหลัก */}
      {searchResults.length > 0 && !selectedChild && (
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h6 className="fw-bold mb-3 text-secondary">
              ผลการค้นหาข้อมูลนักเรียน ({searchResults.length} คน)
            </h6>
            <table
              className="table table-hover table-bordered align-middle text-center"
              style={{ fontSize: "14px" }}
            >
              <thead className="table-light">
                <tr>
                  <th style={{ width: "80px" }}>ลำดับ</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>ห้องเรียน</th>
                  <th style={{ width: "150px" }}>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((c, i) => (
                  <tr key={c.child_id}>
                    <td>{indexOfFirstRow + i + 1}</td>
                    <td className="text-start ps-4">
                      {c.prefix || ""}{c.first_name} {c.last_name}
                    </td>
                    <td>{c.classroom_name || "-"}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm px-3"
                        onClick={() => setSelectedChild(c)}
                      >
                        รายละเอียด
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="d-flex justify-content-center align-items-center gap-2 mt-3 flex-wrap">
              <button
                className="btn btn-outline-success btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                ก่อนหน้า
              </button>
              <span className="fw-bold text-muted" style={{ fontSize: "14px" }}>
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

      {/* 🔍 หน้ารายละเอียดรายเดือน */}
      {selectedChild && (
        <div className="card mb-4 border-success shadow-sm">
          <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold">
              ประวัติรายเดือนประจำเดือน {thaiMonths[month - 1]} {year} :{" "}
              {selectedChild.prefix || ""}{selectedChild.first_name} {selectedChild.last_name}{" "}
              ({selectedChild.classroom_name || "-"})
            </h6>
            <button
              type="button"
              className="btn btn-light btn-sm fw-bold"
              onClick={() => setSelectedChild(null)}
            >
              ย้อนกลับ
            </button>
          </div>

          <div className="card-body">
            <div className="table-responsive">
              <table
                className="table table-bordered table-sm align-middle text-center"
                style={{ fontSize: "13px", minWidth: "1200px" }}
              >
                <thead className="table-light fw-bold">
                  <tr>
                    <th style={{ width: "160px" }} className="align-middle">
                      หัวข้อ / วันที่
                    </th>
                    {daysArray.map((day) => (
                      <th key={day} style={{ minWidth: "36px" }}>{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* 1. เช็คชื่อ */}
                  <tr>
                    <td className="text-start fw-bold ps-2 table-light">เช็คชื่อ</td>
                    {daysArray.map((day) => (
                      <td key={day}>
                        {statusLabel(selectedChild.dailyData?.attendance?.[day])}
                      </td>
                    ))}
                  </tr>

                  {/* 2. ดื่มนม */}
                  <tr>
                    <td className="text-start fw-bold ps-2 table-light">ดื่มนม</td>
                    {daysArray.map((day) => (
                      <td key={day}>
                        {statusLabel(selectedChild.dailyData?.milk?.[day])}
                      </td>
                    ))}
                  </tr>

                  {/* 3. รับประทานอาหาร */}
                  <tr>
                    <td className="text-start fw-bold ps-2 table-light">รับประทานอาหาร</td>
                    {daysArray.map((day) => (
                      <td key={day}>
                        {statusLabel(selectedChild.dailyData?.lunch?.[day])}
                      </td>
                    ))}
                  </tr>

                  {/* 4. แปรงฟัน */}
                  <tr>
                    <td className="text-start fw-bold ps-2 table-light">แปรงฟัน</td>
                    {daysArray.map((day) => (
                      <td key={day}>
                        {statusLabel(selectedChild.dailyData?.toothbrush?.[day])}
                      </td>
                    ))}
                  </tr>

                  {/* 5. สุขภาพ */}
                  <tr>
                    <td className="text-start fw-bold ps-2 table-light">สุขภาพ</td>
                    {daysArray.map((day) => (
                      <td key={day}>
                        {selectedChild.dailyData?.health?.[day] || "-"}
                      </td>
                    ))}
                  </tr>

                  {/* 6. น้ำหนัก */}
                  <tr>
                    <td className="text-start fw-bold ps-2 table-light">น้ำหนัก (กก.)</td>
                    {daysArray.map((day) => (
                      <td key={day}>
                        {selectedChild.dailyData?.measurements?.[day]?.weight ?? "-"}
                      </td>
                    ))}
                  </tr>

                  {/* 7. ส่วนสูง */}
                  <tr>
                    <td className="text-start fw-bold ps-2 table-light">ส่วนสูง (ซม.)</td>
                    {daysArray.map((day) => (
                      <td key={day}>
                        {selectedChild.dailyData?.measurements?.[day]?.height ?? "-"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted small mt-2 mb-0">
              * หมายเหตุ: ✅ = มา/ดื่ม/ทำ &nbsp;|&nbsp; ❌ = ขาด/ไม่ดื่ม/ไม่ทำ &nbsp;|&nbsp; - = ไม่มีข้อมูล
            </p>
          </div>
        </div>
      )}

      {/* 📉 กราฟสรุปผลต่างๆ */}
      <div className="row g-4">
        <div className="col-12 col-xl-6 d-flex">
          <div className="w-100">
            <ChildrenCountChart data={childrenCount} />
          </div>
        </div>

        <div className="col-12 col-xl-6 d-flex">
          <div className="w-100">
            <AttendanceSummaryUnder3Chart />
          </div>
        </div>

        <div className="col-12 col-xl-6 d-flex">
          <div className="w-100">
            <AttendanceSummary3YearsChart />
          </div>
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