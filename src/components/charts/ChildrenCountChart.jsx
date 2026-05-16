import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function ChildrenCountChart({ data }) {
  // กันกรณี data ยังไม่มา
  if (!data) {
    return (
      <div className="card shadow-sm rounded-4 p-4">
        <h5 className="fw-bold mb-3">สรุปจำนวนนักเรียน</h5>
        <div className="text-muted">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  const { total, boys, girls } = data;

  const chartData = [
    {
      name: "เด็กนักเรียนทั้งหมด",
      value: total,
      color: "#2563eb", // น้ำเงิน
    },
    {
      name: "เด็กชาย",
      value: boys,
      color: "#0ea5e9", // ฟ้า
    },
    {
      name: "เด็กหญิง",
      value: girls,
      color: "#ec4899", // ชมพู
    },
  ];

  return (
    <div className="card shadow-sm rounded-4 p-4 h-100">
      <h5 className="fw-bold mb-3">สรุปจำนวนนักเรียน</h5>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 35, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis
            allowDecimals={false}
            label={{
              value: "จำนวนเด็ก (คน)",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle" },
            }}
          />
          <Tooltip
            formatter={(value) => [`${value} คน`, "จำนวน"]}
          />

          <Bar dataKey="value">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{marginTop:12,fontSize:13}}>
        <span style={{color:"#2563eb",fontWeight:600}}>■ เด็กทั้งหมด</span>{" "}
        <span style={{color:"#0ea5e9",fontWeight:600}}>■ เด็กชาย</span>{" "}
        <span style={{color:"#ec4899",fontWeight:600}}>■ เด็กหญิง</span>
      </div>
    </div>
  );
}
