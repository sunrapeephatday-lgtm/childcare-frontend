import React, { useState } from 'react';
import API from '../api/api';

export default function AdminCreateTeacher() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [centerId, setCenterId] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/create-teacher', { username, password, full_name: fullName, center_id: centerId });
      alert('สร้างครูเรียบร้อย');
      setUsername(''); setPassword(''); setFullName(''); setCenterId('');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || 'สร้างไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <h5>สร้างบัญชีครู</h5>
        <form onSubmit={handleCreate}>
          <div className="mb-3">
            <label>ชื่อ</label>
            <input className="form-control" value={username} onChange={e=>setUsername(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label>Password</label>
            <input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label>ชื่อ-นามสกุล</label>
            <input className="form-control" value={fullName} onChange={e=>setFullName(e.target.value)} />
          </div>
          <div className="mb-3">
            <label>center_id</label>
            <input className="form-control" value={centerId} onChange={e=>setCenterId(e.target.value)} />
          </div>
          <button className="btn btn-primary" disabled={loading}>{loading ? 'กำลังสร้าง...' : 'สร้างครู'}</button>
        </form>
      </div>
    </div>
  );
}
