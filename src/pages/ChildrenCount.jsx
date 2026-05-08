// src/pages/ChildrenCount.jsx
import React, { useEffect, useState } from 'react';
import API from '../api/api'; // axios instance with baseURL

export default function ChildrenCount() {
  const [counts, setCounts] = useState([]);
  const [loadingCounts, setLoadingCounts] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [childrenRows, setChildrenRows] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [activeClassroom, setActiveClassroom] = useState(null);

  useEffect(() => {
    loadCounts();
  }, []);

  async function loadCounts() {
    setLoadingCounts(true);
    try {
      const res = await API.get('/children/counts');
      setCounts(res.data.rows || []);
    } catch (err) {
      console.error('load counts err', err);
      setCounts([]);
    } finally {
      setLoadingCounts(false);
    }
  }

  async function openChildren(classroomId = null) {
    setActiveClassroom(classroomId);
    setLoadingChildren(true);
    setShowModal(true);
    try {
      const url = classroomId ? `/children?classroom=${encodeURIComponent(classroomId)}` : '/children';
      const res = await API.get(url);
      setChildrenRows(res.data.rows || []);
    } catch (err) {
      console.error('load children err', err);
      setChildrenRows([]);
    } finally {
      setLoadingChildren(false);
    }
  }

  return (
    <div className="container my-4">
      <h3 className="mb-3">จำนวนเด็ก</h3>

      <div className="card p-3 mb-3">
        <div className="d-flex flex-wrap gap-2">
          <div className="me-3 align-self-center">
            <button className="btn btn-outline-primary" onClick={() => openChildren(null)}>
              ทั้งหมด
            </button>
          </div>

          {loadingCounts ? (
            <div>กำลังโหลด...</div>
          ) : (
            counts.map(c => (
              <div key={String(c.classroom_id)} className="me-2">
                <button
                  className="btn btn-light border"
                  onClick={() => openChildren(c.classroom_id)}
                >
                  ห้อง {c.classroom_id} — <span className="badge bg-primary ms-2">{c.cnt}</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor:'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">รายการเด็ก {activeClassroom ? ` — ห้อง ${activeClassroom}` : ''}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                {loadingChildren ? (
                  <div>กำลังโหลด...</div>
                ) : childrenRows.length === 0 ? (
                  <div className="text-muted">ไม่มีข้อมูลเด็ก</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>child_code</th>
                          <th>ชื่อ-นามสกุล</th>
                          <th>วันเกิด</th>
                          <th>เพศ</th>
                          <th>ห้อง</th>
                        </tr>
                      </thead>
                      <tbody>
                        {childrenRows.map((r, idx) => (
                          <tr key={r.child_id}>
                            <td>{idx + 1}</td>
                            <td>{r.child_code || '-'}</td>
                            <td>{`${r.prefix || ''} ${r.first_name || ''} ${r.last_name || ''}`}</td>
                            <td>{r.birthday ? new Date(r.birthday).toLocaleDateString() : '-'}</td>
                            <td>{r.gender || '-'}</td>
                            <td>{r.classroom_id || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>ปิด</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
