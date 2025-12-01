import axios from "axios";

const api = axios.create({
  baseURL:
    window.location.hostname === "localhost"
      ? "http://localhost:8080/api"
      : "http://gachon.studylink.click/api",
});

// JWT 자동 적용 인터셉터
api.interceptors.request.use((config) => {
  // 로그인 요청
  const isLogin = config.url.includes("/auth/login");

  // 회원가입 요청
  const isRegister =
    config.url.includes("/users") && config.method === "post";

  // 로그인/회원가입 에는 Authorization 제거
  if (!isLogin && !isRegister) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(">>> Axios Authorization:", config.headers.Authorization);
    } else {
      console.log(">>> Axios: 토큰 없음");
    }
  } else {
    console.log(">>> 로그인 또는 회원가입 요청 → 헤더 제거");
  }

  return config;
});

// 토큰 만료 시 자동 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
