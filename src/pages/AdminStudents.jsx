import React, { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function AdminStudents() {

  const navigate = useNavigate();

  const [rows,setRows] = useState([]);
  const [loading,setLoading] = useState(false);

  // ⭐ state สำหรับ popup เลื่อนชั้น
  const [showPromote,setShowPromote] = useState(false);
  const [selected,setSelected] = useState([]);
  const [promoting,setPromoting] = useState(false);

  useEffect(()=>{
    fetchStudents();
  },[]);

  async function fetchStudents(){
    setLoading(true);
    try{
      const res = await API.get("/students");
      setRows(res.data.rows || res.data || []);
    }catch(err){
      alert(err?.response?.data?.error || "โหลดข้อมูลไม่สำเร็จ");
    }
    setLoading(false);
  }

  /* ================= เลื่อนชั้น ================= */

  function openPromote(){
    setSelected([]);
    setShowPromote(true);
  }

  function toggle(child_id){
    if(selected.includes(child_id)){
      setSelected(selected.filter(x=>x!==child_id));
    }else{
      setSelected([...selected,child_id]);
    }
  }

  function selectAll(){
    const studying = rows
      .filter(r=>r.status==="studying")
      .map(r=>r.child_id);

    setSelected(studying);
  }

  function clearAll(){
    setSelected([]);
  }

  function confirmPromote(){

    if(selected.length===0){
      alert("กรุณาเลือกนักเรียน");
      return;
    }

    const ok = window.confirm("ต้องการเลื่อนชั้นประจำปีใช่หรือไม่ ?");
    if(!ok) return;

    setPromoting(true);

    API.post("/students/promote",{ ids:selected })
      .then(res=>{
        alert(`เลื่อนสำเร็จ\n\nเลื่อน: ${res.data.promoted} คน\nจบ: ${res.data.graduated} คน`);
        setShowPromote(false);
        fetchStudents();
      })
      .catch(()=>{
        alert("เกิดข้อผิดพลาด");
      })
      .finally(()=>{
        setPromoting(false);
      });
  }

  /* ================= ลาออก ================= */

  async function drop(childId){
    const ok = window.confirm("ต้องการให้นักเรียนลาออกใช่ไหม");
    if(!ok) return;

    try{
      await API.put(`/enrollments/child/${childId}/drop`);
      fetchStudents();
    }catch(err){
      alert(err?.response?.data?.error || "เกิดข้อผิดพลาด");
    }
  }

  return (
    <div className="container my-4">

      <div className="d-flex justify-content-between mb-3">
        <h5 className="mb-3 fw-bold text-success section-title">รายชื่อนักเรียน</h5>

        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={openPromote}
          >
            เลื่อนชั้นประจำปี
          </button>

          <button
            className="btn btn-outline-secondary"
            onClick={fetchStudents}
            disabled={loading}
          >
            {loading ? "กำลังโหลด..." : "รีเฟรช"}
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-sm">
          <thead className="table-light">
            <tr>
              <th>ลำดับ</th>
              <th>รหัสนักเรียน</th>
              <th>ชื่อ-นามสกุล</th>
              <th>ห้อง</th>
              <th>ปีการศึกษา</th>
              <th>สถานะ</th>
              <th>การจัดการ</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center">
                  ไม่มีข้อมูล
                </td>
              </tr>
            )}

            {rows.map((r,i)=>(
              <tr key={r.child_id}>
                <td>{i+1}</td>
                <td>{r.child_code || "-"}</td>
                <td className="text-start ps-3" style={{ minWidth: 260 }}>{r.prefix}{r.first_name} {r.last_name}</td>
                <td>{r.classroom_name || "-"}</td>
                <td>{r.academic_year || "-"}</td>

                <td>
                  <span className={
                    r.status==="studying"
                      ? "badge bg-success"
                      : "badge bg-secondary"
                  }>
                    {r.status==="studying"
                      ? "กำลังเรียน"
                      : "ลาออก"}
                  </span>
                </td>

                <td style={{ whiteSpace: "nowrap", width: 160 }}>
                  <button
                    className="btn btn-sm btn-outline-orange me-2"
                    onClick={()=>navigate(`/admin/students/${r.child_id}/edit`)}
                  >
                    แก้ไข
                  </button>

                  {r.status==="studying" && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={()=>drop(r.child_id)}
                    >
                      ลาออก
                    </button>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ⭐ POPUP เลื่อนชั้น */}
      {showPromote && (
        <div className="modal fade show"
          style={{display:"block",background:"rgba(0,0,0,.4)"}}>

          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">

              <div className="modal-header">
                <h5>เลือกนักเรียนเพื่อเลื่อนชั้น</h5>
                <button className="btn-close"
                  onClick={()=>setShowPromote(false)} />
              </div>

              <div className="modal-body">

                <div className="mb-2">
                  <button className="btn btn-sm btn-outline-success me-2" onClick={selectAll}>
                    เลือกทั้งหมด
                  </button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={clearAll}>
                    ล้าง
                  </button>
                </div>

                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>ลำดับ</th>
                      <th>ชื่อ</th>
                      <th>ห้อง</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.filter(r=>r.status==="studying").map(r=>(
                      <tr key={r.child_id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selected.includes(r.child_id)}
                            onChange={()=>toggle(r.child_id)}
                          />
                        </td>
                        <td>{r.prefix}{r.first_name} {r.last_name}</td>
                        <td>{r.classroom_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>

              <div className="modal-footer">
                <button className="btn btn-success" onClick={confirmPromote}>
                  ตกลง
                </button>
                <button className="btn btn-secondary" onClick={()=>setShowPromote(false)}>
                  ยกเลิก
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}