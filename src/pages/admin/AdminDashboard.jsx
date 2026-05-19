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

  const [month, setMonth] = useState(
    new Date().getMonth() + 1
  );

  const [year, setYear] = useState(
    new Date().getFullYear()
  );

  const [selectedChild, setSelectedChild] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const rowsPerPage = 10;

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

      const dev = await API.get(
        "/admin/dashboard/development-summary"
      );

      setRooms(dev.data);

      const child = await API.get(
        "/admin/dashboard/children-count"
      );

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
  }

  async function handleSearch(e) {
    e.preventDefault();

    try {

      const res = await API.get(
        "/admin/dashboard/search-child",
        {
          params: {
            q: keyword
          }
        }
      );

      setSearchResults(res.data);
      setCurrentPage(1);

    } catch (err) {
      console.error(err);
    }
  }

  async function handleViewDetail(child) {
    try {

      const res = await API.get(
        `/admin/dashboard/child-month-detail/${child.child_id}`,
        {
          params: {
            month,
            year
          }
        }
      );

      setSelectedChild(child);
      setDetailData(res.data);
      setShowModal(true);

    } catch (err) {
      console.error(err);
    }
  }

  const indexOfLastRow = currentPage * rowsPerPage;

  const indexOfFirstRow =
    indexOfLastRow - rowsPerPage;

  const currentRows = searchResults.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  const totalPages = Math.ceil(
    searchResults.length / rowsPerPage
  );

  return (
    <div>

      <h5 className="mb-4 fw-bold text-success section-title">
        แดชบอร์ด
      </h5>

      {/* SEARCH */}

      <form
        onSubmit={handleSearch}
        className="mb-4 d-flex justify-content-end"
      >

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
              <option
                key={i + 1}
                value={i + 1}
              >
                {thaiMonths[i]}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: "120px" }}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            {[2567, 2568, 2569].map((y) => (
              <option
                key={y}
                value={y}
              >
                {y}
              </option>
            ))}
          </select>

          <button className="btn btn-success">
            ค้นหา
          </button>

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

      {searchResults.length > 0 && (

        <div className="card mb-4">

          <div className="card-body">

            <h6 className="fw-bold mb-3">
              ผลการค้นหา
            </h6>

            <div className="table-responsive">

              <table className="table table-bordered align-middle">

                <thead className="table-success">

                  <tr>
                    <th>ชื่อ-นามสกุล</th>
                    <th>ห้องเรียน</th>
                    <th width="140">
                      รายละเอียด
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {currentRows.map((c) => (

                    <tr key={c.child_id}>

                      <td className="text-start ps-3">
                        {c.prefix}
                        {c.first_name}
                        {" "}
                        {c.last_name}
                      </td>

                      <td className="text-start ps-3">
                        {c.classroom_name}
                      </td>

                      <td className="text-center">

                        <button
                          className="btn btn-primary btn-sm"
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

            <div className="d-flex justify-content-center align-items-center gap-2 mt-3 flex-wrap">

              <button
                className="btn btn-outline-success btn-sm"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage(currentPage - 1)
                }
              >
                ก่อนหน้า
              </button>

              <span className="fw-bold">
                หน้า {currentPage} / {totalPages || 1}
              </span>

              <button
                className="btn btn-outline-success btn-sm"
                disabled={
                  currentPage === totalPages ||
                  totalPages === 0
                }
                onClick={() =>
                  setCurrentPage(currentPage + 1)
                }
              >
                ถัดไป
              </button>

            </div>

          </div>

        </div>

      )}

      {/* CHART */}

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

      {/* MODAL */}

      {showModal && detailData && (

        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)"
          }}
        >

          <div className="modal-dialog modal-xl modal-dialog-scrollable">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title">

                  รายละเอียดประจำเดือน

                  {" "}

                  {selectedChild?.prefix}
                  {selectedChild?.first_name}

                  {" "}

                  {selectedChild?.last_name}

                </h5>

                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />

              </div>

              <div className="modal-body">

                {/* ATTENDANCE */}

                <SectionTable
                  title="เช็คชื่อ"
                  data={detailData.attendance}
                  dateKey="record_date"
                  valueKey="status"
                />

                {/* MILK */}

                <SectionTable
                  title="ดื่มนม"
                  data={detailData.milk}
                  dateKey="record_date"
                  valueKey="status"
                />

                {/* LUNCH */}

                <SectionTable
                  title="รับประทานอาหาร"
                  data={detailData.lunch}
                  dateKey="record_date"
                  valueKey="status"
                />

                {/* TOOTHBRUSH */}

                <SectionTable
                  title="แปรงฟัน"
                  data={detailData.toothbrush}
                  dateKey="record_date"
                  valueKey="status"
                />

                {/* HEALTH */}

                <SectionTable
                  title="สุขภาพ"
                  data={detailData.health}
                  dateKey="evaluation_date"
                  valueKey="note"
                />

                {/* MEASUREMENT */}

                <h6 className="fw-bold text-success mt-4 mb-2">
                  น้ำหนัก / ส่วนสูง
                </h6>

                <div className="table-responsive">

                  <table className="table table-bordered">

                    <thead className="table-success">

                      <tr>
                        <th>วันที่</th>
                        <th>น้ำหนัก</th>
                        <th>ส่วนสูง</th>
                      </tr>

                    </thead>

                    <tbody>

                      {detailData.measurements.map((m, idx) => (

                        <tr key={idx}>

                          <td>{m.measurement_date}</td>
                          <td>{m.weight}</td>
                          <td>{m.height}</td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

/* ==================================================
   SECTION TABLE
================================================== */

function SectionTable({
  title,
  data,
  dateKey,
  valueKey
}) {

  return (
    <>

      <h6 className="fw-bold text-success mt-4 mb-2">
        {title}
      </h6>

      <div className="table-responsive">

        <table className="table table-bordered">

          <thead className="table-success">

            <tr>
              <th>วันที่</th>
              <th>ข้อมูล</th>
            </tr>

          </thead>

          <tbody>

            {data.length > 0 ? (

              data.map((item, idx) => (

                <tr key={idx}>
                  <td>{item[dateKey]}</td>
                  <td>{item[valueKey]}</td>
                </tr>

              ))

            ) : (

              <tr>
                <td colSpan="2" className="text-center">
                  ไม่มีข้อมูล
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

    </>
  );
}