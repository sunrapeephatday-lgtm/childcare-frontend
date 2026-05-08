import React, { useEffect, useState } from 'react';
import API from '../api/api';

export default function MyChildren() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/enrollments/my').then(res => setChildren(res.data || [])).catch(err => {
      console.error(err);
      alert('โหลดข้อมูลไม่สำเร็จ');
    }).finally(()=>setLoading(false));
  }, []);

  if (loading) return <p>กำลังโหลด...</p>;
  if (!children.length) return <div className="alert alert-info">ยังไม่มีบุตรลงทะเบียน</div>;

  return (
    <div>
      <h5>ข้อมูลบุตรหลานของฉัน</h5>
      <div className="list-group">
        {children.map(c => (
          <div className="list-group-item" key={c.id || c.child_id}>
            <div className="d-flex justify-content-between">
              <div>
                <strong>{c.child_name}</strong>
                <div className="small text-muted">เกิด: {c.dob}</div>
              </div>
              <div>
                <div className="small">สถานะ: {c.status || 'รอตรวจ'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
