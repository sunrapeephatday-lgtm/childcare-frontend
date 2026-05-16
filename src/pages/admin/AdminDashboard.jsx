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
  const [year, setYear] = useState(new Date().getFullYear());
  const thaiMonths = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม"
  ];

  async function loadDashboard() {
    try {
      const dev = await API.get("/admin/dashboard/development-summary");
      setRooms(dev.data);

      const child = await API.get("/admin/dashboard/children-count");
      setChildrenCount(child.data);

      setSearchResults([]);
      setKeyword("");
    } catch (err) {
      console.error("LOAD ERROR =", err);
    }
  }

  function handleReload() {
    setSearchResults([]);
    setKeyword("");
    loadDashboard();
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleSearch(e) {
    e.preventDefault();

    try {
      const res = await API.get("/admin/dashboard/search-child", {
        params: {
          q: keyword,
          month,
          year
        }
      });

      setSearchResults(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error("SEARCH ERROR =", err);
    }
  }
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;

    const currentRows = searchResults.slice(
      indexOfFirstRow,
       indexOfLastRow
    );

const totalPages = Math.ceil(searchResults.length / rowsPerPage);
  return (
    <div>
      <h5 className="mb-4 fw-bold text-success section-title ">
        แดชบอร์ด
      </h5>

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
            style={{ width: "100px" }}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {thaiMonths[i]}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: "110px" }}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            {[2567, 2568, 2569].map((y) => (
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

      {searchResults.length > 0 && (
        <div className="card mb-4">
          <div className="card-body">
            <h6>ผลการค้นหา</h6>

            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ชื่อ</th>
                  <th>ห้อง</th>
                  <th>เช็คชื่อ</th>
                  <th>นม</th>
                  <th>อาหาร</th>
                  <th>แปรงฟัน</th>
                  <th>สุขภาพ</th>
                  <th>น้ำหนัก</th>
                  <th>ส่วนสูง</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((c) => (
                  <tr key={c.child_id}>
                    <td className="text-start ps-3">
                      {c.prefix}{c.first_name} {c.last_name}
                    </td>
                    <td className="text-start ps-3">{c.classroom_name}</td>

                    <td>{c.attendance || "-"}</td>
                    <td>{c.milk || "-"}</td>
                    <td>{c.lunch || "-"}</td>
                    <td>{c.toothbrush || "-"}</td>
                    <td>{c.health_note || "-"}</td>
                    <td>{c.weight || "-"}</td>
                    <td>{c.height || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="d-flex justify-content-center align-items-center gap-2 mt-3 flex-wrap">

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

      <div className="row g-4">
  {/* ===== แถวบน ===== */}
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

  {/* ===== แถวถัดมา ===== */}
  <div className="col-12 col-xl-6 d-flex">
  <div className="w-100">
    <AttendanceSummary3YearsChart />
  </div>
</div>

  {/* ===== กราฟอื่น ๆ ===== */}
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
