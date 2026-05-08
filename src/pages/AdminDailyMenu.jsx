import React, { useEffect, useState } from "react";
import API from "../api/api";
import { saveAs } from "file-saver";

/* ===== helpers ===== */
function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - offset * 60000);
  return localDate.toISOString().split("T")[0];
}

function formatThaiDate(d) {
  const date = new Date(d);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);

  const day = String(localDate.getDate()).padStart(2, "0");
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const year = localDate.getFullYear() + 543;

  return `${day}/${month}/${year}`;
}

export default function AdminDailyMenu() {

  const thaiMonths = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
  ];

  const [form, setForm] = useState({
    menu_date: todayISO(),
    main_menu:"",
    stir_menu:"",
    soup_menu:"",
    fried_menu:"",
    dessert_menu:"",
    note:""
  });

  const [menus, setMenus] = useState([]);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState(null);

  const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadMenus();
  }, []);

  async function loadMenus() {
    const res = await API.get("/daily-menu");
    setMenus(res.data || []);
  }

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();

    await API.post("/daily-menu", form);

    setMsg({ type:"success", text:"บันทึกเมนูเรียบร้อย" });
    setEditing(false);

    setForm({
      menu_date: todayISO(),
      main_menu:"",
      stir_menu:"",
      soup_menu:"",
      fried_menu:"",
      dessert_menu:"",
      note:""
    });

    loadMenus();
  }

  function handleEdit(m) {
    setEditing(true);

    const d = new Date(m.menu_date);
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60000);

    setForm({
      menu_date: localDate.toISOString().split("T")[0],
      main_menu: m.main_menu || "",
      stir_menu: m.stir_menu || "",
      soup_menu: m.soup_menu || "",
      fried_menu: m.fried_menu || "",
      dessert_menu: m.dessert_menu || "",
      note: m.note || ""
    });
  }

  async function handleDelete(id){
    if(!window.confirm("ยืนยันการลบ?")) return;
    await API.delete(`/daily-menu/${id}`);
    loadMenus();
  }

  function resetForm() {
    setEditing(false);

    setForm({
      menu_date: todayISO(),
      main_menu:"",
      stir_menu:"",
      soup_menu:"",
      fried_menu:"",
      dessert_menu:"",
      note:""
    });
  }

  /* ===== EXPORT WORD ===== */
  function exportWord() {
    const month = exportMonth - 1;
    const year = exportYear;

    const monthYear = `${thaiMonths[month]} ${year + 543}`;

    let html = `
      <html>
      <head><meta charset="utf-8"/></head>
      <body>
        <h3 style="text-align:center">รายการอาหารกลางวัน</h3>
        <p style="text-align:center">${monthYear}</p>
        <table border="1" width="100%" cellspacing="0" cellpadding="5">
          <tr>
            <th>ลำดับ</th>
            <th>วันที่</th>
            <th>รายการ</th>
            <th>หมายเหตุ</th>
          </tr>
    `;

    const filtered = menus.filter(m=>{
      const d = new Date(m.menu_date);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    filtered.forEach((m,i)=>{
      const food = `${m.main_menu} ${m.stir_menu} ${m.soup_menu} ${m.fried_menu} ${m.dessert_menu}`;
      html += `
        <tr>
          <td>${i+1}</td>
          <td>${formatThaiDate(m.menu_date)}</td>
          <td>${food}</td>
          <td>${m.note || ""}</td>
        </tr>
      `;
    });

    html += `</table></body></html>`;

    const blob = new Blob(['\ufeff', html], {
      type: "application/msword;charset=utf-8"
    });

    saveAs(blob, "menu.doc");
  }

  return (
    <div className="container-fluid px-5 my-4">

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold text-success section-title">จัดการเมนูอาหารกลางวัน</h5>
      </div>

      {msg && <div className="alert alert-success">{msg.text}</div>}

      {/* FORM */}
      <form onSubmit={onSubmit} className="card shadow-sm border-0 mb-4">
        <div className="card-body">

          <div className="row g-3">

            <div className="col-lg-2">
              <label className="form-label small">วันที่</label>
              <input type="date"
                className="form-control"
                name="menu_date"
                value={form.menu_date}
                onChange={onChange}
                disabled={editing}
              />
            </div>

            <div className="col-lg-2">
              <label className="form-label small">เมนูหลัก</label>
              <input className="form-control" name="main_menu" value={form.main_menu} onChange={onChange}/>
            </div>

            <div className="col-lg-2">
              <label className="form-label small">เมนูผัด</label>
              <input className="form-control" name="stir_menu" value={form.stir_menu} onChange={onChange}/>
            </div>

            <div className="col-lg-2">
              <label className="form-label small">เมนูต้ม</label>
              <input className="form-control" name="soup_menu" value={form.soup_menu} onChange={onChange}/>
            </div>

            <div className="col-lg-2">
              <label className="form-label small">เมนูทอด</label>
              <input className="form-control" name="fried_menu" value={form.fried_menu} onChange={onChange}/>
            </div>

            <div className="col-lg-2">
              <label className="form-label small">ของหวาน</label>
              <input className="form-control" name="dessert_menu" value={form.dessert_menu} onChange={onChange}/>
            </div>

            <div className="col-lg-6">
              <label className="form-label small">หมายเหตุ</label>
              <input className="form-control" name="note" value={form.note} onChange={onChange}/>
            </div>

          </div>

          {/* 🔥 ปุ่มอยู่ล่างตรงกลาง */}
          <div className="d-flex justify-content-center gap-3 mt-4">

            <button type="submit" className="btn btn-success px-5">
              {editing ? "บันทึกแก้ไข" : "บันทึกเมนู"}
            </button>

            {editing && (
              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={resetForm}
              >
                ยกเลิก
              </button>
            )}

          </div>

        </div>
      </form>

      <hr className="my-4"/>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-end gap-2 mb-2">
        <h5 className="fw-bold text-success section-title">
          ประวัติรายการเมนูอาหารกลางวัน
        </h5>

        <div className="d-flex flex-wrap gap-2 export-filters">

          <select
            className="form-select"
            value={exportMonth}
            onChange={(e)=>setExportMonth(Number(e.target.value))}
            style={{ width: "140px", flex: 1 }}
          >
            {thaiMonths.map((m,i)=>(
              <option key={i} value={i+1}>{m}</option>
            ))}
          </select>

          <select
            className="form-select"
            value={exportYear}
            onChange={(e)=>setExportYear(Number(e.target.value))}
            style={{ width: "120px" }}
          >
            {[2568,2569,2570].map(y=>(
              <option key={y} value={y-543}>{y}</option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-success export-btn"
            onClick={exportWord}
          >
            ส่งออก Word
          </button>

        </div>
      </div>

      {/* TABLE */}
      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-success">
            <tr>
              <th>วันที่</th>
              <th>รายการอาหาร</th>
              <th>หมายเหตุ</th>
              <th>จัดการ</th>
            </tr>
          </thead>

          <tbody>
            {menus.map(m=>(
              <tr key={m.daily_menu_id}>
                <td>{formatThaiDate(m.menu_date)}</td>
                <td>
                  {m.main_menu} {m.stir_menu} {m.soup_menu} {m.fried_menu} {m.dessert_menu}
                </td>
                <td>{m.note || "-"}</td>
                <td>
                  <button className="btn btn-sm btn-outline-orange me-1" onClick={()=>handleEdit(m)}>แก้ไข</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={()=>handleDelete(m.daily_menu_id)}>ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}