import React from "react";
import { useNavigate } from "react-router-dom";

export default function StaffPage() {
  const navigate = useNavigate();

  const staffs = [
    {
      name: "นางปิยนาถ วรรณวิเศษ",
      position: "ผู้อำนวยการกองการศึกษา ศาสนาและวัฒนธรรม",
      image: "/images/t01.png"
    },
    {
      name: "นางสาวพันไมล์ ฤทธิ์ศรเดช",
      position: "นักวิชาการศึกษา",
      image: "/images/t02.png"
    },
    {
      name: "นางมารตรี ชวลีย์รัชชานนท์",
      position:"ครู รักษาการในตำแหน่ง ผอ.ศพด.อบต.หนองน้ำแดง",
      image: "/images/t03.png"
    },
    {
      name: "นางสาวปรียาภัทร ชมพัฒน์",
      position: "ครู ศพด.อบต.หนองน้ำแดง",
      image: "/images/t07.png"
    },
    {
      name: "นางสาวสุกัญญา งามสะอาด",
      position: "ผู้ดูแลเด็ก ศพด.อบต.หนองน้ำแดง",
      image: "/images/t04.png"
    },
    {
      name: "นางสาวพรทิพย์ ณ รังษี",
      position: "ผู้ดูแลเด็ก ศพด.อบต.หนองน้ำแดง",
      image: "/images/t05.png"
    },
    {
      name: "นางสาวปัญญาพร กองอุนนท์",
      position: "ผู้ดูแลเด็ก ศพด.อบต.หนองน้ำแดง",
      image: "/images/t06.png"
    },
    
    {
      name: "นางอรนุช เครือบนอก",
      position: "แม่บ้าน",
      image: "/images/t08.png"
    }
  ];

  return (
    <div className="container py-4">
      <div
  style={{
    width: "100vw",
    marginLeft: "calc(50% - 50vw)",
    marginRight: "calc(50% - 50vw)",
    marginTop: "-24px",
    marginBottom: "40px",
    overflow: "hidden",
    background: "#a8e6a3"
  }}
>
  <img
    src="/images/ccdd.png"
    alt="banner"
    style={{
      width: "100%",
      height: "auto",
      objectFit: "contain",
      display: "block"
    }}
  />
</div>
      <button
        className="btn btn-outline-secondary"
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "40px"
        }}
      >
        ← ย้อนกลับ
      </button>

      <h2
        className="fw-bold"
        style={{
          color: "#0c8f4f",
          borderLeft: "6px solid #20c45a",
          paddingLeft: "14px",
          lineHeight: "1.2",
          marginBottom: "35px"
        }}
      >
        บุคลากรทางการศึกษา
      </h2>

      <div className="row">
        {staffs.map((s, i) => (
          <div className="col-lg-4 col-md-6 mb-4" key={i}>
            <div
              className="card shadow-sm border-0 h-100"
              style={{
                borderRadius: "20px",
                overflow: "hidden"
              }}
            >
              <div className="card-body text-center p-4 d-flex flex-column align-items-center">
               <img
  src={s.image}
  alt={s.name}
  style={{
    width: "220px",
    height: "280px",
    objectFit: "cover",
    objectPosition: "center top",
    borderRadius: "16px",
    marginBottom: "20px",
    background: "#eef4f0",
    padding: "6px"
  }}
/>

                <h5
                  className="fw-bold text-success mb-2"
                  style={{
                    textDecoration: "none",
                    border: "none",
                    boxShadow: "none"
                  }}
                >
                  {s.name}
                </h5>

                <p
                  className="mb-0"
                  style={{
                    color: "#666",
                    fontSize: "15px"
                  }}
                >
                  {s.position}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}