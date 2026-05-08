import React, { useEffect, useState } from "react";
import API from "../api/api";

export default function MyEnrollment() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/enrollments/my")
      .then((res) => {
        setData(res.data[0] || null);
      })
      .catch(() => {
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>กำลังโหลด...</p>;

  if (!data) {
    return <p>ยังไม่มีการสมัครเรียน</p>;
  }

  return (
    <div className="container my-5">
      <h3>สถานะการสมัครเรียน</h3>

      <p><b>สถานะ:</b> {data.status}</p>

      {data.status === "rejected" && (
        <div className="alert alert-danger">
          เหตุผลที่ไม่อนุมัติ: {data.note}
        </div>
      )}

      {data.status === "pending" && (
        <div className="alert alert-warning">
          อยู่ระหว่างการพิจารณา
        </div>
      )}

      {data.status === "approved" && (
        <div className="alert alert-success">
          อนุมัติแล้ว
        </div>
      )}
    </div>
  );
}
