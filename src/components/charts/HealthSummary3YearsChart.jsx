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

export default function HealthSummary3YearsChart() {
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
        `/health/summary-by-classroom?month=${month}&year=${year}`
      );

      const room3 = res.data.filter(
        (r) => r.classroom_name === "ห้อง 3 ขวบ"
      );

      const goodTotal = room3.reduce(
        (sum, r) => sum + Number(r.good_total || 0),
        0
      );

      const mediumTotal = room3.reduce(
        (sum, r) => sum + Number(r.medium_total || 0),
        0
      );

      const improveTotal = room3.reduce(
        (sum, r) => sum + Number(r.improve_total || 0),
        0
      );

      setData([
        {
          label: "ดี",
          total: goodTotal
        },
        {
          label: "ปานกลาง",
          total: mediumTotal
        },
        {
          label: "ปรับปรุง",
          total: improveTotal
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
    if (label === "ดี") return "#16a34a";
    if (label === "ปานกลาง") return "#f59e0b";
    if (label === "ปรับปรุง") return "#ef4444";
    return "#9ca3af";
  }

  return (
    <div className="card shadow-sm p-3 rounded-4 h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">
          สรุปสุขภาพห้อง 3 ขวบ
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
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="label"
            tick={{ fontSize: 13 }}
          />

          <YAxis
            allowDecimals={false}
            domain={[0, "auto"]}
          />

          <Tooltip
            formatter={(v) => [`${v} คน`, "จำนวนเด็ก"]}
          />

          <Bar dataKey="total" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={getColor(entry.label)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div
        className="mt-3 p-3 rounded-3"
        style={{
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
          fontSize: 13
        }}
      >
        <div className="fw-bold mb-2">
          เกณฑ์การประเมินสุขภาพ
        </div>

        <div className="mb-1">
          <span style={{ color: "#16a34a", fontWeight: 600 }}>
            ■ ดี
          </span>{" "}
          = ผมสะอาด ช่องปากสะอาด เล็บมือเล็บเท้าสะอาด
        </div>

        <div className="mb-1">
          <span style={{ color: "#f59e0b", fontWeight: 600 }}>
            ■ ปานกลาง
          </span>{" "}
          = มีบางจุดที่ยังไม่เรียบร้อย เช่น เล็บยาว หรือช่องปากไม่สะอาด
        </div>

        <div>
          <span style={{ color: "#ef4444", fontWeight: 600 }}>
            ■ ควรปรับปรุง
          </span>{" "}
          = มีหลายจุดที่ต้องดูแลเพิ่มเติม เช่น ผมไม่สะอาด เล็บยาวมาก หรือสุขอนามัยไม่ดี
        </div>
      </div>
    </div>
  );
}