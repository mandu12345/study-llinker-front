import React, { useState, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("testuser"); // 기본 아이디
  const [password, setPassword] = useState("1234");     // 기본 비번
  const { login } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ 실제 API 대신 더미 로그인 처리
    if (username === "testuser" && password === "1234") {
      login("dummy-jwt-token"); // 더미 토큰 저장
      navigate("/main");        // 메인 페이지 이동
    } else {
      alert("아이디/비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div style={{ padding: "50px" }}>
      <h2>로그인 페이지</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        /><br /><br />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br /><br />
        <button type="submit">로그인</button>
      </form>
    </div>
  );
};

export default Login;
