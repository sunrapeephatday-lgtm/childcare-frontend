// src/pages/admin/Dashboard.jsx
import { useEffect, useState } from "react";
import API from "../../api/api";


export default function Dashboard() {
const [data, setData] = useState(null);


useEffect(() => {
API.get("/admin/dashboard").then(res => setData(res.data));
}, []);


if (!data) return <p>Loading...</p>;


return (
<div>
<h1>Dashboard</h1>
<div className="cards">
<div className="card">เด็กทั้งหมด: {data.children}</div>
<div className="card">ครู: {data.teachers}</div>
<div className="card">สมัครใหม่: {data.enrollments}</div>
</div>
</div>
);
}