/* ดึง host ของ backend จาก .env */
const FILE_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "";

export function fileUrl(path) {
  if (!path) return "";

  // แก้ Windows path  \uploads\xx.jpg
  const clean = path.replace(/\\/g, "/");

  // ป้องกัน // ซ้อน
  if (clean.startsWith("/")) return FILE_BASE + clean;
  return FILE_BASE + "/" + clean;
}
