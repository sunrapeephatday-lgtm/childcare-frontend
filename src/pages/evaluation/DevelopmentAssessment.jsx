import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/api";

export default function DevelopmentAssessment() {
  const { childId } = useParams();

  const [items, setItems] = useState([]);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [assessmentCount, setAssessmentCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    loadItems();
    loadHistory();
  }, []);

  async function loadItems() {
    try {
      const res = await API.get("/development/items");
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadHistory() {
    try {
      const res = await API.get(`/development/child/${childId}/progress`);
      const count = res.data?.length || 0;

      setAssessmentCount(count);

      if (count >= 2) {
        setLimitReached(true);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function setLevel(itemId, level) {
    if (saved || limitReached) return;

    setAnswers(prev => ({
      ...prev,
      [itemId]: level
    }));
  }

  async function submit() {
    if (limitReached) {
      alert("เด็กคนนี้ประเมินครบ 2 ครั้งแล้ว");
      return;
    }

    const payload = {
      child_id: Number(childId),
      results: items.map(i => ({
        item_id: i.item_id,
        level_id: answers[i.item_id] || 1
      }))
    };

    setSaving(true);

    try {
      await API.post("/development", payload);

      setSaved(true);
      setAssessmentCount(prev => prev + 1);

      if (assessmentCount + 1 >= 2) {
        setLimitReached(true);
      }

      alert("บันทึกผลการประเมินเรียบร้อย");
    } catch (err) {
      console.error(err);
      alert("บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container my-4">
      <h4 className="mb-3 text-center">แบบประเมินพัฒนาการเด็ก</h4>

      <div className="mb-3">
        <strong>จำนวนครั้งที่ประเมินแล้ว:</strong> {assessmentCount} / 2
      </div>

      {limitReached && (
        <div className="alert alert-danger">
          เด็กคนนี้ประเมินครบ 2 ครั้งแล้ว ไม่สามารถประเมินเพิ่มได้
        </div>
      )}

      <table className="table table-bordered align-middle">
        <thead className="table-light text-center">
          <tr>
            <th>ลำดับ</th>
            <th>รายการประเมิน</th>
            <th>ทำได้สม่ำเสมอ</th>
            <th>ทำได้บางครั้ง</th>
            <th>ยังทำไม่ได้</th>
          </tr>
        </thead>

        <tbody>
          {items.map((it, idx) => (
            <tr key={it.item_id}>
              <td className="text-center">{idx + 1}</td>
              <td>{it.description}</td>

              {[3, 2, 1].map(lv => (
                <td className="text-center" key={lv}>
                  <input
                    type="radio"
                    disabled={saved || limitReached}
                    name={`item-${it.item_id}`}
                    checked={answers[it.item_id] === lv}
                    onChange={() => setLevel(it.item_id, lv)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {!saved && !limitReached && (
        <div className="text-end">
          <button
            className="btn btn-primary"
            onClick={submit}
            disabled={saving}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกผลการประเมิน"}
          </button>
        </div>
      )}
    </div>
  );
}