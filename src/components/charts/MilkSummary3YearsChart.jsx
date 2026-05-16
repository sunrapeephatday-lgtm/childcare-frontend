import React, { useEffect, useState } from "react";
import API from "../../api/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export default function MilkSummary3YearsChart() {
  const today = new Date();

  const [data, setData] = useState([]);
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const thaiMonths = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม"
  ];

  useEffect(() => {
    load();
  }, [month, year]);

  async function load() {
    try {
      const res = await API.get(
        `/milk/summary-by-classroom?month=${month}&year=${year}`
      );

      const room3 = res.data.filter(
        (r) => r.classroom_name === "ห้อง 3 ขวบ"
      );

      const maleTotal = room3.reduce(
        (sum, r) => sum + Number(r.male_total || 0),
        0
      );

      const femaleTotal = room3.reduce(
        (sum, r) => sum + Number(r.female_total || 0),
        0
      );

      setData([
        {
          label: "ชาย",
          total: maleTotal
        },
        {
          label: "หญิง",
          total: femaleTotal
        }
      ]);
    } catch (err) {
      console.error(err);
    }
  }

  function prevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((prev) => prev - 1);
    } else {
      setMonth((prev) => prev - 1);
    }
  }

  function nextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((prev) => prev + 1);
    } else {
      setMonth((prev) => prev + 1);
    }
  }

  function getColor(label) {
    if (label === "ชาย") return "#3b82f6";
    if (label === "หญิง") return "#ec4899";
    return "#16a34a";
  }

  return (
    <div className="card shadow-sm p-3 rounded-4 h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">
          สรุปการดื่มนมห้อง 3 ขวบ
        </h5>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={prevMonth}
          >
            ←
          </button>

          <div className="fw-semibold px-2">
            {thaiMonths[month - 1]} {year + 543}
          </div>

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={nextMonth}
          >
            →
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, left: 45, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="label"
            tick={{ fontSize: 12 }}
          />

          <YAxis
            allowDecimals={false}
            label={{
              value: "จำนวนครั้งที่ดื่มนม",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle" }
            }}
          />

          <Tooltip
            formatter={(v) => [`${v} ครั้ง`, "จำนวนดื่มนม"]}
          />

          <Bar dataKey="total" radius={[8, 8, 0, 0]}>
            {data.map((e, i) => (
              <Cell key={i} fill={getColor(e.label)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div style={{ marginTop: 12, fontSize: 13 }}>
        <span style={{ color: "#3b82f6", fontWeight: 600 }}>
          ■ ชาย
        </span>{" "}
        <span style={{ color: "#ec4899", fontWeight: 600 }}>
          ■ หญิง
        </span>
      </div>
    </div>
  );
}
