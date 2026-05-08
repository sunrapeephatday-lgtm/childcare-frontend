import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/api';

/*
  Child detail page
  - GET /api/children/:id
  - GET /api/children/:id/medications
  - GET /api/children/:id/assessments
  - GET /api/children/:id/attendance
  - GET /api/children/:id/meals
*/

export default function ChildDetail() {
  const { id } = useParams();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);

  const [meds, setMeds] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadAll() {
    setLoading(true);
    try {
      const [cRes, mRes, aRes, atRes, mealRes] = await Promise.all([
        API.get(`/children/${id}`),
        API.get(`/children/${id}/medications`).catch(() => ({ data: [] })),
        API.get(`/children/${id}/assessments`).catch(() => ({ data: [] })),
        API.get(`/children/${id}/attendance`).catch(() => ({ data: [] })),
        API.get(`/children/${id}/meals`).catch(() => ({ data: [] })),
      ]);

      setChild(cRes.data || null);
      setMeds(mRes.data || []);
      setAssessments(aRes.data || []);
      setAttendance(atRes.data || []);
      setMeals(mealRes.data || []);
    } catch (err) {
      console.error(err);
      alert('โหลดข้อมูลเด็กไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="container mt-3"><p>กำลังโหลด...</p></div>;
  if (!child) return <div className="container mt-3"><div className="alert alert-warning">ไม่พบข้อมูลเด็ก</div></div>;

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h3>{child.first_name} {child.last_name}</h3>
          <div className="text-muted">เกิด: {child.dob || '-'}</div>
          <div className="text-muted">ผู้ปกครอง: {child.parent_contact || '-'}</div>
        </div>
        <div className="text-end">
          <Link to={`/children/${id}/edit`} className="btn btn-outline-primary me-2">แก้ไข</Link>
          <Link to="/children" className="btn btn-secondary">ย้อนกลับ</Link>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">ข้อมูลทั่วไป</div>
            <div className="card-body">
              <p><strong>ชื่อเต็ม:</strong> {child.first_name} {child.last_name}</p>
              <p><strong>วันเกิด:</strong> {child.dob || '-'}</p>
              <p><strong>โรคประจำตัว:</strong> {child.chronic_diseases || '-'}</p>
              <p><strong>แพ้อาหาร:</strong> {child.allergies || '-'}</p>
              <p><strong>หมายเหตุ:</strong> {child.notes || '-'}</p>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">ยา (ถ้ามี)</div>
            <div className="card-body">
              {meds.length === 0 ? <div className="text-muted">ยังไม่มีข้อมูลยา</div> : (
                <ul className="list-group">
                  {meds.map(m => (
                    <li key={m.id} className="list-group-item">
                      <div className="fw-semibold">{m.med_name}</div>
                      <div className="small text-muted">ขนาด: {m.dosage || '-'}</div>
                      <div className="small text-muted">เมื่อ: {m.when_to_give || '-'}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card mb-3">
            <div className="card-header">สรุปการประเมิน (ล่าสุด)</div>
            <div className="card-body">
              {assessments.length === 0 ? <div className="text-muted">ยังไม่มีผลการประเมิน</div> : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>วันที่</th>
                        <th>ด้าน</th>
                        <th>คะแนน / บันทึก</th>
                        <th>ผู้ประเมิน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessments.map(a => (
                        <tr key={a.id}>
                          <td>{a.assessment_date}</td>
                          <td>{a.domain}</td>
                          <td>{a.score ?? a.notes}</td>
                          <td>{a.assessor_name || a.assessor_id || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-header">การมาเรียน (ล่าสุด)</div>
            <div className="card-body">
              {attendance.length === 0 ? <div className="text-muted">ยังไม่มีบันทึกการมาเรียน</div> : (
                <ul className="list-group">
                  {attendance.map(at => (
                    <li key={at.id} className="list-group-item d-flex justify-content-between">
                      <div>
                        <div><strong>{at.date}</strong> — {at.status}</div>
                        <div className="small text-muted">{at.note}</div>
                      </div>
                      <div className="small text-muted">{at.recorded_by_name || at.recorded_by || ''}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">รายการอาหาร / เมนู</div>
            <div className="card-body">
              {meals.length === 0 ? <div className="text-muted">ยังไม่มีข้อมูลเมนู</div> : (
                <div className="list-group">
                  {meals.map(m => (
                    <div key={m.id} className="list-group-item">
                      <div className="d-flex justify-content-between">
                        <div>
                          <div className="fw-semibold">{m.meal_date} — {m.meal_type}</div>
                          <div className="small text-muted">{m.menu}</div>
                        </div>
                        <div className="text-end small text-muted">{m.calories ? `${m.calories} kcal` : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
