import axios from "axios";

const api = axios.create({
  baseURL:
    window.location.hostname === "localhost"
      ? "http://localhost:8080/api"
      : "http://gachon.studylink.click/api",
});

// JWT 자동 적용 인터셉터
api.interceptors.request.use((config) => {
  const isLogin = config.url.includes("/auth/tokens");
  const isRegister = config.url === "/users" && config.method === "post";

  // 로그인/회원가입 요청에는 Authorization 제거
  if (!isLogin && !isRegister) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// 토큰 만료 시 자동 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // JWT 만료 → 자동 로그아웃 처리
      localStorage.removeItem("token");
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
