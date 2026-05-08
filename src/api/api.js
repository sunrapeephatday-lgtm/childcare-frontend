import axios from "axios";

/* ดึง URL จาก .env เท่านั้น */
const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  console.error("VITE_API_URL not found. Check .env file");
}

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true
});

/* แนบ token ทุก request */
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ใช้ตอน login เท่านั้น */
export function setAuthToken(token) {
  if (token) {
    sessionStorage.setItem("token", token);
  } else {
    sessionStorage.removeItem("token");
  }
}

export default API;
