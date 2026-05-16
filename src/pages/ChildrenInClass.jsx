import React, { useEffect, useState } from "react";
import API from "../api/api";
import "../styles/ChildrenInClass.css";

export default function ChildrenInClass() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState(null);
  const [classroomName, setClassroomName] = useState("");
  const [notes, setNotes] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  
  useEffect(() => {
    load();
  }, []);

  async function load() {
  try {
    const res = await API.get("/children/class/myclass");

    const dataRows = res.data.rows || [];

    setRows(dataRows);
    setClassroomName(res.data.classroom_name || "");

    const initialNotes = {};

dataRows.forEach((r) => {
  initialNotes[r.child_id] = "";
});

setNotes(initialNotes);

  } catch (err) {
    console.error(err);
    setMsg("โหลดข้อมูลเด็กไม่สำเร็จ");
  }
}

  function thai(d) {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("th-TH");
  }

async function saveNote(childId) {
  try {
    await API.put(`/children/class/${childId}/note`, {
      note: notes[childId]
    });

    alert("บันทึกหมายเหตุสำเร็จ");

    setNotes((prev) => ({
      ...prev,
      [childId]: ""
    }));

    setRows((prev) =>
      prev.map((row) =>
        row.child_id === childId
          ? { ...row, note: "" }
          : row
      )
    );

  } catch (err) {
    console.error(err);
    alert("บันทึกหมายเหตุไม่สำเร็จ");
  }
}

  function ageYearMonth(d) {
    if (!d) return "-";
    const birth = new Date(d);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return `${years}.${months}`;
  }
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentRows = rows.slice(
  indexOfFirstRow,
  indexOfLastRow
);

const totalPages = Math.ceil(rows.length / rowsPerPage);
  return (
    <div className="container my-4">

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-3 fw-bold text-success section-title">
  ข้อมูลนักเรียนในห้อง {classroomName}
</h3>
      </div>

      {msg && <div className="alert alert-danger">{msg}</div>}

      <div className="table-responsive">
        <table
  className="table table-bordered table-sm align-middle"
  style={{ fontSize: "14px" }}
>
         <thead className="table-success text-center">
  <tr>
    <th style={{ width: 60 }}>ลำดับ</th>
    <th style={{ width: 100 }}>รหัส</th>
    <th style={{ width: 160 }}>ชื่อ-นามสกุล</th>
    <th style={{ width: 120 }}>ชื่อเล่น</th>
    <th style={{ width: 120 }}>วันเกิด</th>
    <th style={{ width: 140 }}>เบอร์พ่อ</th>
    <th style={{ width: 140 }}>เบอร์แม่</th>
    <th style={{ width: 250 }}>หมายเหตุ</th>
  </tr>
</thead>

          <tbody>
            {currentRows.map((r, i) => (
              <tr key={i}>
                <td>{indexOfFirstRow + i + 1}</td>
                <td>{r.child_code || "-"}</td>
                <td className="text-start ps-3">
                    {r.prefix}{r.first_name} {r.last_name}
                </td>
                <td className="text-start ps-3">{r.nickname}</td>
                <td className="text-start ps-3">{thai(r.birth_date)}</td>
                <td className="text-start ps-3">{r.father_phone || "-"}</td>
                <td className="text-start ps-3">{r.mother_phone || "-"}</td>
                <td style={{ minWidth: "280px" }}>
  <textarea
          className="form-control form-control-sm"
          rows={3}
          value={notes[r.child_id] ?? ""}
          onChange={(e) =>
            setNotes((prev) => ({
              ...prev,
              [r.child_id]: e.target.value
            }))
          }
        />


  <button
    className="btn btn-success btn-sm mt-2 w-100"
    onClick={() => saveNote(r.child_id)}
  >
    บันทึก
  </button>
</td>
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
  );
}