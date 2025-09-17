import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // 더미 로그인 처리
    if (username === "admin" && password === "1234") {
      login("dummy-admin-token", "ADMIN");   // 관리자 로그인
      navigate("/admin/dashboard");
    } else if (username === "testuser" && password === "1234") {
      login("dummy-user-token", "USER");     // 일반 사용자 로그인
      navigate("/main");
    } else {
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
