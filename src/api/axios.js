import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:8080/api"     // 로컬 개발용
      : "http://gachon.studylink.click/api", // 배포용
});

api.interceptors.request.use((config) => {
  if (!config.url.includes("/auth/login") && !config.url.includes("/auth/register")) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
