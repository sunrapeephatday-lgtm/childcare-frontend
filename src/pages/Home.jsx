// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import API from "../api/api";
import "../styles/Home.css";
import { Link } from "react-router-dom";

/* ใช้ backend URL จาก .env */
const FILE_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "";

const fileUrl = (p) => {
  if (!p) return "";
  return FILE_BASE + p.replace(/\\/g, "/");
};

export default function Home() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalImg, setModalImg] = useState(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    try {
      const res = await API.get("/announcements");
      const rows = res.data.rows || [];

      const withImages = await Promise.all(
        rows.map(async (a) => {
          const r = await API.get(`/announcements/${a.announcement_id}`);
          return { ...a, images: r.data.images || [] };
        })
      );

      setAnnouncements(withImages);
    } catch (err) {
      console.error("โหลดข่าวล้มเหลว", err);
    } finally {
      setLoading(false);
    }
  }

  function formatThaiDate(dateString) {
    if (!dateString) return "-";

    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear() + 543;

    return `${day}/${month}/${year}`;
  }

  return (
    <div className="home-wrapper">
      {/* ================= HERO ================= */}
      <section className="hero-section">
        <img src="/images/ccdd.png" alt="banner" className="hero-img" />
      </section>

      {/* ================= CONTENT ================= */}
      <div className="home-content">
        <div className="main-title-box">
          <h1>
            ยินดีต้อนรับสู่ศูนย์พัฒนาเด็กเล็กสังกัดองค์การบริหารส่วนตำบลหนองน้ำแดง
          </h1>
        </div>

        <div className="content-layout">
          {/* ================= MAIN ================= */}
          <main>
            <section className="news-wrapper">
              <h2 className="mt-4 fw-bold text-success section-title">
                ข่าวประชาสัมพันธ์
              </h2>

              {loading && <p>กำลังโหลดข่าว...</p>}
              {!loading && announcements.length === 0 && <p>ยังไม่มีข่าว</p>}

              {announcements.map((n) => {
                const imgs = n.images || [];
                const mainImg = imgs[0];
                const thumbs = imgs.slice(1, 4);

                return (
                  <div key={n.announcement_id} className="news-card">
                    {imgs.length > 0 && (
                      <div className="news-gallery-layout">
                        <div className="gallery-main">
                          <img
                            src={fileUrl(mainImg.image_url)}
                            alt=""
                            onClick={() => setModalImg(mainImg.image_url)}
                          />
                        </div>

                        <div className="gallery-side">
                          {thumbs.map((img) => (
  <div key={img.image_id}>
    <img
      src={fileUrl(img.image_url)}
      alt=""
      onClick={() => setModalImg(img.image_url)}
    />
  </div>
))}
                        </div>
                      </div>
                    )}

                    <h3 className="news-title">{n.title}</h3>

                    <p className="news-text" style={{ whiteSpace: "pre-wrap" }}>
                      {n.content}
                    </p>

                    <p className="news-meta">
                      เพิ่มโดย {n.created_by_name || "admin"} • {formatThaiDate(n.created_at)}
                    </p>
                  </div>
                );
              })}
            </section>
          </main>

          {/* ================= SIDEBAR ================= */}
          <aside className="sidebar">
            <div className="sidebar-box">
              <h3>ลิงก์ที่เกี่ยวข้อง</h3>
              <ul>
                <li>
                  <Link to="/staff">
                    บุคลากรทางการศึกษา
                  </Link>
                </li>
                <li>
                  <a
                    href="https://www.nongnumdang.go.th/history.php"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ประวัติความเป็นมา
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.nongnumdang.go.th/local_map.php"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ที่ตั้งและแผนที่
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.nongnumdang.go.th/vision.php"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    วิสัยทัศน์และพันธกิจ
                  </a>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-col">
            <h4>
              ศูนย์พัฒนาเด็กเล็กสังกัดองค์การบริหารส่วนตำบลหนองน้ำแดง
            </h4>
            <p>
              399 หมู่ 11 ต.หนองน้ำแดง<br />
              อ.ปากช่อง จ.นครราชสีมา<br />
              โทร 044 000 360<br />
              Facebook:{" "}
              <a
                href="https://www.facebook.com/profile.php?id=100064728787300&sk=directory_contact_info"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-fb"
              >
                ศูนย์พัฒนาเด็กเล็กสังกัดองค์การบริหารส่วนตำบลหนองน้ำแดง
              </a>
            </p>
          </div>
          <div className="footer-col">
            <h4>องค์การบริหารส่วนตำบลหนองน้ำแดง</h4>
            <p>
              399 หมู่ 11 ต.หนองน้ำแดง อ.ปากช่อง
              จ.นครราชสีมา 30130<br />
              โทร/โทรสาร: 044-000990<br />
              สายตรงผู้บริหาร: 064-8302913<br />
              งานจัดเก็บรายได้ (ภาษี): 082-9039500<br />
              E-Mail: saraban_06302109@dla.go.th<br />
              Website:{" "}
              <a
                href="https://www.nongnumdang.go.th/index.php"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.nongnamdaeng.go.th
              </a>
            </p>
          </div>
        </div>
        <div className="footer-bottom">© 2026 ศูนย์พัฒนาเด็กเล็ก</div>
      </footer>

      {/* ================= MODAL ================= */}
      {modalImg && (
        <div className="image-modal" onClick={() => setModalImg(null)}>
          <img src={fileUrl(modalImg)} alt="big" />
        </div>
      )}
    </div>
  );
}
