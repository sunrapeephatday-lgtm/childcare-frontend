import React, { useState } from "react";
import API from "../api/api";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [userId, setUserId] = useState(null);

  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= SEND OTP ================= */

  async function sendOtp(e){
    e.preventDefault();
    setMsg(null);

    if(!email && !phone){
      setMsg({type:"danger", text:"กรุณากรอก email หรือ เบอร์โทร"});
      return;
    }

    setLoading(true);

    try{

      const res = await API.post("/auth/forgot-password", {
        email,
        phone
      });

      setUserId(res.data.user_id);

      setMsg({type:"success", text:"ส่ง OTP แล้ว กรุณาตรวจสอบ"});
      setStep(2);

    }catch(err){
      setMsg({
        type:"danger",
        text: err.response?.data?.error || "เกิดข้อผิดพลาด"
      });
    }

    setLoading(false);
  }

  /* ================= RESET PASSWORD ================= */

  async function resetPassword(e){
    e.preventDefault();
    setMsg(null);

    if(!otp || !newPassword){
      setMsg({type:"danger", text:"กรุณากรอก OTP และ รหัสผ่านใหม่"});
      return;
    }

    setLoading(true);

    try{

      await API.post("/auth/reset-password", {
        user_id: userId,
        otp,
        newPassword
      });

      setMsg({type:"success", text:"เปลี่ยนรหัสผ่านสำเร็จ"});

      setTimeout(()=>{
        navigate("/login");
      },1500);

    }catch(err){
      setMsg({
        type:"danger",
        text: err.response?.data?.error || "เปลี่ยนรหัสผ่านไม่สำเร็จ"
      });
    }

    setLoading(false);
  }

  return(
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight:"100vh",
        background:"linear-gradient(135deg,#d4f8e8,#eafff5)"
      }}
    >
      <div className="card shadow-lg" style={{width:420,borderRadius:18}}>
        <div className="card-body p-4">

          <h4 className="text-center text-success mb-3 fw-bold">
            ลืมรหัสผ่าน
          </h4>

          {msg && (
            <div className={`alert alert-${msg.type}`}>
              {msg.text}
            </div>
          )}

          {/* ===== STEP 1 ===== */}
          {step === 1 && (
            <form onSubmit={sendOtp}>

              <div className="mb-3">
                <label className="form-label">กรอกอีเมล</label>
                <input
                  className="form-control"
                  value={email}
                  onChange={e=>setEmail(e.target.value)}
                />
              </div>

              <div className="text-center mb-2">หรือ</div>

              <div className="mb-3">
                <label className="form-label">กรอกเบอร์โทร</label>
                <input
                  className="form-control"
                  value={phone}
                  onChange={e=>setPhone(e.target.value)}
                />
              </div>

              <button className="btn btn-success w-100" disabled={loading}>
                {loading ? "กำลังส่ง OTP..." : "ส่ง OTP"}
              </button>

            </form>
          )}

          {/* ===== STEP 2 ===== */}
          {step === 2 && (
            <form onSubmit={resetPassword}>

              <div className="mb-3">
                <label className="form-label">กรอก OTP</label>
                <input
                  className="form-control"
                  value={otp}
                  onChange={e=>setOtp(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">รหัสผ่านใหม่</label>
                <input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={e=>setNewPassword(e.target.value)}
                />
              </div>

              <button className="btn btn-success w-100" disabled={loading}>
                {loading ? "กำลังเปลี่ยน..." : "เปลี่ยนรหัสผ่าน"}
              </button>

            </form>
          )}

          <div className="text-center mt-3">
            <Link to="/login" className="text-success text-decoration-none">
              กลับหน้า Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}