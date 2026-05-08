import React, { useEffect, useState } from "react";
import API from "../api/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, Table, TableRow, TableCell } from "docx";
import "../styles/Brushings.css";

const thaiMonths = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
];

function toThaiDate(d){
  const x = new Date(d);
  return `${x.getDate()}/${x.getMonth()+1}/${x.getFullYear()+543}`;
}

function todayThai() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear() + 543;
  return `${day}/${month}/${year}`;
}

export default function BrushingsPage(){

  const [teacherId,setTeacherId] = useState(null);
  const [rows,setRows] = useState([]);
  const [history,setHistory] = useState([]);
  const [msg,setMsg] = useState(null);
  const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());

  useEffect(()=>{
    init();
  },[]);

  async function init(){
    try{

      const user = JSON.parse(sessionStorage.getItem("user"));

      if(!user || user.role !== "teacher"){
        setMsg({ type:"danger", text:"หน้านี้สำหรับครูเท่านั้น" });
        return;
      }

      const res = await API.get("/brushings/me");

      const tId = res.data.teacher_id;

      setTeacherId(tId);

      loadToday(tId);
      loadHistory(tId);

    }catch(err){
      console.error(err);
      setMsg({ type:"danger", text:"โหลดข้อมูลครูไม่สำเร็จ" });
    }
  }

  async function loadToday(tid){
    const res = await API.get("/brushings/today",{
      params:{ teacher_id: tid }
    });
    setRows(res.data.rows || []);
  }

  async function loadHistory(tid){
    const res = await API.get("/brushings/history",{
      params:{ teacher_id: tid }
    });
    setHistory(res.data.rows || []);
  }

  async function saveAll(){

    if(!teacherId){
      alert("ไม่พบ teacher id");
      return;
    }

    await API.post("/brushings",{
      items: rows.map(r=>({
        child_id:r.child_id,
        status:r.status,
        note:r.note,
        created_by:teacherId
      }))
    });

    setMsg({ type:"success", text:"บันทึกเรียบร้อย" });

    loadHistory(teacherId);
  }

  /* ===== GROUP HISTORY ===== */
  function buildMatrix(){
    if(!history.length) return null;

   const month = exportMonth - 1;
  const year = exportYear;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

    const map = {};
    history.forEach(h => {
  const recordDate = new Date(h.record_date);

  if (
    recordDate.getMonth() !== month ||
    recordDate.getFullYear() !== year
  ) {
    return;
  }

  const day = recordDate.getDate();
  const name = `${h.prefix}${h.first_name} ${h.last_name}`;

  if (!map[name]) map[name] = Array(daysInMonth).fill("");

  if (h.status === "แปรงฟันแล้ว") {
    map[name][day - 1] = "✓";
  } else if (h.status === "ยังไม่ได้แปรงฟัน") {
    map[name][day - 1] = "X";
  }
});

    return { map, daysInMonth, month, year };
  }

  function exportExcel() {
  const data = buildMatrix();
  if (!data) return;

  const { map, daysInMonth, month, year } = data;

  const shortMonths = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];

  const title =
    `บันทึกการแปรงฟันประจำเดือน ${thaiMonths[month]} พ.ศ. ${year + 543}`;

  const center =
    "ศูนย์พัฒนาเด็ก อบต.หนองน้ำแดง สังกัดองค์การบริหารส่วนตำบลหนองน้ำแดง";

  const header = ["ลำดับ", "ชื่อ-นามสกุล"];

  for (let d = 1; d <= daysInMonth; d++) {
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
  f: `COUNTIF(C${excelRow}:${XLSX.utils.encode_col(daysInMonth + 1)}${excelRow},"✓")`
}
]);
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  ws["!merges"] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: daysInMonth + 3 }
    },
    {
      s: { r: 1, c: 0 },
      e: { r: 1, c: daysInMonth + 3 }
    }
  ];

  ws["!cols"] = [
    { wch: 8 },
    { wch: 30 },
    ...Array(daysInMonth).fill({ wch: 7 }),
    { wch: 10 },
    { wch: 20 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "รายงานการแปรงฟัน");

  XLSX.writeFile(
    wb,
    `รายงานการแปรงฟัน_${thaiMonths[month]}_${year + 543}.xlsx`
  );
}
  return (
  <div className="container my-4">
    <h3 className="mb-3 fw-bold text-success section-title">
      บันทึกการแปรงฟัน (วันที่ {todayThai()})
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
          className="btn btn-success me-2"
          onClick={saveAll}
        >
          บันทึกทั้งหมด
        </button>

        <button
          className="btn btn-success"
          onClick={exportExcel}
        >
          Export Excel
        </button>
        </div>
      </div>
    </div>

    <div className="table-scroll">
      <table className="table table-bordered" style={{ tableLayout: "fixed", width: "100%" }}>
        <thead>
  <tr>
    <th style={{ width: "60px" }}>ลำดับ</th>
    <th style={{ width: "140px" }}>ชื่อ-นามสกุล</th>
    <th style={{ width: "160px" }}>สถานะ</th>
    <th style={{ width: "220px" }}>หมายเหตุ</th>
  </tr>
</thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.child_id}>
              <td>{i + 1}</td>
              <td style={{ textAlign: "left", paddingLeft: "16px", width: "220px" }}>
  {r.name}
</td>
              <td>
                <select
                  value={r.status}
                  onChange={e =>
                    setRows(rs =>
                      rs.map(x =>
                        x.child_id === r.child_id
                          ? { ...x, status: e.target.value }
                          : x
                      )
                    )
                  }
                >
                  <option>แปรงฟันแล้ว</option>
                  <option>ยังไม่ได้แปรงฟัน</option>
                </select>
              </td>
              <td>
                <input
                  value={r.note || ""}
                  onChange={e =>
                    setRows(rs =>
                      rs.map(x =>
                        x.child_id === r.child_id
                          ? { ...x, note: e.target.value }
                          : x
                      )
                    )
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <h5 className="mb-3 fw-bold text-success section-title">
      ประวัติการแปรงฟัน
    </h5>

    <div className="table-scroll">
      <table className="table table-bordered" style={{ tableLayout: "fixed", width: "100%" }}>
        <thead>
  <tr>
    <th style={{ width: "60px" }}>ลำดับ</th>
    <th style={{ width: "120px" }}>วันที่</th>
    <th style={{ width: "160px" }}>ชื่อ-นามสกุล</th>
    <th style={{ width: "180px" }}>สถานะ</th>
    <th style={{ width: "220px" }}>หมายเหตุ</th>
  </tr>
</thead>
        <tbody>
          {history.map((h, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{toThaiDate(h.record_date)}</td>
              <td style={{ textAlign: "left", paddingLeft: "16px", width: "220px" }}>
                {h.prefix}{h.first_name} {h.last_name}
              </td>
              <td>{h.status}</td>
              <td style={{ width: "220px" }}>
        {h.note || "-"}
      </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
}