import axios from "axios";

const api = axios.create({
  baseURL:
    window.location.hostname === "localhost"
      ? "http://localhost:8080/api"     // 로컬 개발용
      : "http://gachon.studylink.click/api", // 배포용
});

api.interceptors.request.use((config) => {
  // 로그인·회원가입 요청에는 토큰 붙이지 않기
  if (!config.url.includes("/auth/login") && !config.url.includes("/auth/register")) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});


export default api;