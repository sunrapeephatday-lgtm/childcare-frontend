import React, { useEffect, useState } from 'react';
import API from '../api/api';
import { Link } from 'react-router-dom';

export default function Children() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newChild, setNewChild] = useState({
    first_name: '',
    last_name: '',
    dob: '',
    parent_contact: '',
    allergies: '',
    chronic_diseases: '',
  });

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    setLoading(true);
    try {
      // ถ้าต้องการ filter ตาม query ให้ใช้ ?q=
      const res = await API.get('/children', { params: q ? { q } : {} });
      setChildren(res.data || []);
    } catch (err) {
      console.error(err);
      alert('โหลดข้อมูลนักเรียนไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchList();
  }

  async function handleDelete(id) {
    if (!window.confirm('ต้องการลบข้อมูลนักเรียนใช่หรือไม่?')) return;
    try {
      await API.delete(`/children/${id}`);
      setChildren(prev => prev.filter(c => c.id !== id));
      alert('ลบเรียบร้อย');
    } catch (err) {
      console.error(err);
      alert('ลบไม่สำเร็จ');
    }
  }

  async function createQuickChild(e) {
    e.preventDefault();
    try {
      const res = await API.post('/children', newChild);
      // ถ้า backend คืนข้อมูล id, ดึงใหม่หรือเพิ่มใน list
      const createdId = res.data?.id;
      if (createdId) {
        // ดึงข้อมูลนักเรียนใหม่อีกครั้ง (เพื่อให้แน่ใจว่าข้อมูลครบ)
        await fetchList();
      } else {
        // ถ้า backend คืน object child:
        setChildren(prev => [res.data, ...prev]);
      }
      setShowAdd(false);
      setNewChild({
        first_name: '',
        last_name: '',
        dob: '',
        parent_contact: '',
        allergies: '',
        chronic_diseases: '',
      });
      alert('เพิ่มนักเรียนเรียบร้อย');
    } catch (err) {
      console.error(err);
      alert('เพิ่มนักเรียนไม่สำเร็จ');
    }
  }

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>รายชื่อนักเรียน</h3>
        <div>
          <button className="btn btn-success me-2" onClick={() => setShowAdd(true)}>เพิ่มนักเรียน</button>
          <Link to="/children/new" className="btn btn-outline-primary">หน้าสร้างเต็มรูปแบบ</Link>
        </div>
      </div>

      <form className="row g-2 mb-3" onSubmit={handleSearch}>
        <div className="col-auto" style={{ minWidth: 240 }}>
          <input className="form-control" placeholder="ค้นหาชื่อ / โรคประจำตัว / ผู้ปกครอง" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="col-auto">
          <button className="btn btn-primary" type="submit">ค้นหา</button>
        </div>
        <div className="col-auto">
          <button type="button" className="btn btn-secondary" onClick={() => { setQ(''); fetchList(); }}>รีเฟรช</button>
        </div>
      </form>

      {loading ? (
        <p>กำลังโหลด...</p>
      ) : children.length === 0 ? (
        <div className="alert alert-info">ยังไม่มีข้อมูลนักเรียน</div>
      ) : (
        <div className="row g-3">
          {children.map(c => (
            <div className="col-md-6" key={c.id}>
              <div className="card h-100">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <h5 className="card-title">{c.first_name} {c.last_name}</h5>
                    <p className="mb-1 text-muted">เกิด: {c.dob || 'ไม่ระบุ'}</p>
                    <p className="mb-0"><small>ผู้ปกครอง: {c.parent_contact || '-'}</small></p>
                    <p className="mb-0"><small>โรคประจำตัว: {c.chronic_diseases || '-'}</small></p>
                  </div>

                  <div className="d-flex flex-column align-items-end">
                    <Link to={`/children/${c.id}`} className="btn btn-outline-primary btn-sm mb-2">ดูรายละเอียด</Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>ลบ</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal แบบง่ายสำหรับเพิ่มนักเรียนแบบเร็ว */}
      {showAdd && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <form onSubmit={createQuickChild}>
                <div className="modal-header">
                  <h5 className="modal-title">เพิ่มนักเรียน (ด่วน)</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAdd(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label">ชื่อ</label>
                    <input className="form-control" value={newChild.first_name} onChange={e => setNewChild({...newChild, first_name: e.target.value})} required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">นามสกุล</label>
                    <input className="form-control" value={newChild.last_name} onChange={e => setNewChild({...newChild, last_name: e.target.value})} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">วันเกิด</label>
                    <input type="date" className="form-control" value={newChild.dob} onChange={e => setNewChild({...newChild, dob: e.target.value})} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">ผู้ปกครอง / เบอร์</label>
                    <input className="form-control" value={newChild.parent_contact} onChange={e => setNewChild({...newChild, parent_contact: e.target.value})} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">โรคประจำตัว</label>
                    <input className="form-control" value={newChild.chronic_diseases} onChange={e => setNewChild({...newChild, chronic_diseases: e.target.value})} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">แพ้อาหาร</label>
                    <input className="form-control" value={newChild.allergies} onChange={e => setNewChild({...newChild, allergies: e.target.value})} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>ยกเลิก</button>
                  <button type="submit" className="btn btn-primary">บันทึก</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
