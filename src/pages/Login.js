import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import api from "../api/axios";

// 더미 JWT 토큰 생성 함수
function createDummyToken(role) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ userId: "0", role }));
  const signature = "dummysignature";
  return `${header}.${payload}.${signature}`;
}

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 개발자용 슈퍼유저 계정 (백엔드 없이 바로 로그인 가능)
    if (username === "superuser" && password === "1234") {
      const dummyToken = createDummyToken("ADMIN");
      login(dummyToken, "ADMIN");
      alert("슈퍼유저로 로그인했습니다.");
      navigate("/main");
      return;
    }

    // 관리자용 슈퍼유저 계정 
    if (username === "admin" && password === "1234") {
      const dummyToken = createDummyToken("ADMIN"); // ADMIN 권한 부여
      login(dummyToken, "ADMIN");
      alert("관리자(ADMIN)로 로그인했습니다. 관리자 페이지로 이동합니다.");
      // App.js에 정의된 관리자 경로(/admin)로 이동
      navigate("/admin"); 
      return;
    }

    try {
      // 실제 백엔드 로그인 API 호출
      const res = await api.post("/auth/login", { username, password });

      // 응답에서 JWT 토큰 꺼내기
      const token = res.data.token;

      if (token) {
        login(token, "USER"); // 일반 유저 로그인
        navigate("/main"); // 메인 페이지로 이동
      } else {
        alert("로그인 실패: 토큰이 없습니다.");
      }
    } catch (err) {
      console.error("로그인 오류:", err);
      alert("아이디/비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className="container mt-5">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">아이디</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">비밀번호</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          로그인
        </button>
      </form>

      <div className="mt-3">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/register")}
        >
          회원가입
        </button>
      </div>
    </div>
  );
};

export default Login;
