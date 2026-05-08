import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import "../styles/Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [avatar, setAvatar] = useState(null);

  const [form, setForm] = useState({
    center_id: "",
    email: "",
    username: "",
    password: "",
    prefix: "",
    first_name: "",
    last_name: "",
    phone: ""
  });

  useEffect(() => {
    API.get("/centers")
      .then(res => setCenters(res.data))
      .catch(() =>
        setMsg({ type: "danger", text: "โหลดข้อมูลศูนย์ไม่สำเร็จ" })
      );
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(s => ({ ...s, [name]: value }));
  }

  

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    setLoading(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (avatar) fd.append("avatar", avatar);

      await API.post("/auth/register", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      navigate("/login");

    } catch (err) {
      setMsg({
        type: "danger",
        text: err.response?.data?.error || "สมัครสมาชิกไม่สำเร็จ"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">
      <div className="card shadow-lg register-card">
      <div className="card-body p-3">

          <h4 className="text-center mb-4 text-success fw-bold">
            สมัครสมาชิก
          </h4>

          {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* avatar */}
              <div className="col-12 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setAvatar(e.target.files[0])}
                />
              </div>

              {/* center */}
              <div className="col-12">
                <label className="form-label">ศูนย์เด็กเล็ก</label>
                <select
  name="center_id"
  className="form-select"
  value={form.center_id}
  onChange={onChange}
  required
  onInvalid={(e) => {
    e.target.setCustomValidity("กรุณาเลือกศูนย์เด็กเล็ก");
  }}
  onInput={(e) => {
    e.target.setCustomValidity("");
  }}
>
  <option value="">-- เลือกศูนย์ --</option>

  {centers.map(c => (
    <option key={c.center_id} value={c.center_id}>
      {c.name}
    </option>
  ))}
</select>
              </div>

              {/* prefix */}
              <div className="col-md-6">
                <label className="form-label">คำนำหน้า</label>
                <select
  name="prefix"
  className="form-select"
  value={form.prefix}
  onChange={onChange}
  required
  onInvalid={(e) => {
    e.target.setCustomValidity("กรุณาเลือกคำนำหน้า");
  }}
  onInput={(e) => {
    e.target.setCustomValidity("");
  }}
>
                  <option value="">-- เลือก --</option>
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                </select>
              </div>

              {/* name */}
              <div className="col-md-6">
                <label className="form-label">ชื่อ</label>
                <input
  name="first_name"
  className="form-control"
  value={form.first_name}
  onChange={onChange}
  required
  placeholder="กรอกชื่อ"
  onInvalid={(e) => {
    e.target.setCustomValidity("กรุณากรอกชื่อ");
  }}
  onInput={(e) => {
    e.target.setCustomValidity("");
  }}
/>
              </div>

              <div className="col-md-6">
                <label className="form-label">นามสกุล</label>
                <input
                  name="last_name"
                  className="form-control"
                  value={form.last_name}
                  onChange={onChange}
                  required
                  placeholder="กรอกนามสกุล"
                  onInvalid={(e) => {
                    e.target.setCustomValidity("กรุณากรอกนามสกุล");
                  }}
                  onInput={(e) => {
                    e.target.setCustomValidity("");
                  }}
                />
              </div>

              {/* phone */}
              <div className="col-md-6">
                <label className="form-label">เบอร์โทร</label>
                <input
  name="phone"
  className="form-control"
  value={form.phone}
  onChange={(e) => {
    const onlyNums = e.target.value.replace(/\D/g, "");
    setForm(s => ({
      ...s,
      phone: onlyNums.slice(0, 10)
    }));
  }}
  required
  pattern="0[0-9]{9}"
  inputMode="numeric"
  maxLength={10}
  placeholder="กรอกเบอร์โทร 10 หลัก"
  onInvalid={(e) => {
    e.target.setCustomValidity(
      "กรุณากรอกเบอร์โทรให้ถูกต้อง (10 หลัก และขึ้นต้นด้วย 0)"
    );
  }}
  onInput={(e) => {
    e.target.setCustomValidity("");
  }}
/>
              </div>

              {/* email */}
              <div className="col-md-6">
                <label className="form-label">อีเมล</label>
                <input
  type="email"
  name="email"
  className="form-control"
  value={form.email}
  onChange={onChange}
  required
  placeholder="example@gmail.com"
  pattern="^[^\s@]+@[^\s@]+\.com$"
  onInvalid={(e) => {
    e.target.setCustomValidity(
      "กรุณากรอกอีเมลให้ถูกต้อง และลงท้ายด้วย .com"
    );
  }}
  onInput={(e) => {
    e.target.setCustomValidity("");
  }}
/>
              </div>

              {/* username */}
              <div className="col-md-6">
                <label className="form-label">Username</label>
                <input
                  name="username"
                  className="form-control"
                  value={form.username}
                  onChange={onChange}
                  required
                  minLength={4}
                  placeholder="กรอก Username"
                  onInvalid={(e) => {
                    e.target.setCustomValidity("Username ต้องมีความยาวอย่างน้อย 4 ตัวอักษร");
                  }}
                  onInput={(e) => {
                    e.target.setCustomValidity("");
                  }}
                />
              </div>

              {/* password */}
              <div className="col-md-6">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={form.password}
                  onChange={onChange}
                  required
                  minLength={6}
                  placeholder="กรอก Password"
                  onInvalid={(e) => {
                    e.target.setCustomValidity("Password ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
                  }}
                  onInput={(e) => {
                    e.target.setCustomValidity("");
                  }}
                />
              </div>

              <div className="col-12 mt-3">
                <button className="btn btn-success w-100" disabled={loading}>
                  {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
                </button>
              </div>
            </div>
          </form>

          <div className="text-center mt-3">
            <Link to="/login" className="text-success text-decoration-none">
              มีบัญชีแล้ว? เข้าสู่ระบบ
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}