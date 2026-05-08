import React, { useState } from "react";
import API, { setAuthToken } from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
       setErrorMsg("");
      const res = await API.post("/auth/login", { username, password });
      const { token, user } = res.data;

      setAuthToken(token);
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
      setUser && setUser(user);

      if (user.role === "admin") {
        window.location.href = "/admin";
      } else if (user.role === "teacher") {
        window.location.href = "/teacher/children";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
  const msg = err?.response?.data?.error;

  if (
    msg === "user not found" ||
    msg === "ไม่พบบัญชีผู้ใช้"
  ) {
    setErrorMsg("ยังไม่ได้เป็นสมาชิก หรือไม่พบบัญชีผู้ใช้");
  } else if (
  msg === "invalid password" ||
  msg === "รหัสผ่านไม่ถูกต้อง" ||
  msg === "username/password ไม่ถูกต้อง"
) {
  setErrorMsg("ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง");
} else {
    setErrorMsg("เข้าสู่ระบบไม่สำเร็จ");
  }
} finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #d4f8e8, #eafff5)"
      }}
    >
      <div className="card shadow-lg" style={{ width: 380, borderRadius: 18 }}>
        <div className="card-body p-4">
          <h4 className="text-center mb-4 text-success fw-bold">
  เข้าสู่ระบบ
</h4>

{errorMsg && (
  <div className="alert alert-danger py-2">
    {errorMsg}
  </div>
)}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>

              <div className="position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control pe-5"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  required
                />

                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#666"
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <button className="btn btn-success w-100" disabled={loading}>
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          <div className="text-center mt-3">
            <Link to="/register" className="text-success text-decoration-none">
              ยังไม่มีบัญชี? สมัครสมาชิก
            </Link>
          </div>

          <div className="text-center mt-2">
            <Link
              to="/forgot-password"
              className="text-success text-decoration-none"
            >
              ลืมรหัสผ่าน ?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}