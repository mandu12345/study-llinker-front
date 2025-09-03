import React, { useState } from "react";
import api from "../api/axios";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 간단한 유효성 체크
    if (!username || !password || !email || !name) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    if (password.length < 6) {
      alert("비밀번호는 최소 6자리 이상이어야 합니다.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("올바른 이메일 형식이 아닙니다.");
      return;
    }

    try {
      const res = await api.post("/auth/register", {
        username,
        password,
        email,
        name,
      });

      console.log("회원가입 응답:", res.data); // ⭐ 응답 확인
      alert("회원가입 성공!");
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("회원가입 실패! 이미 존재하는 아이디인지 확인하세요.");
    }
  };

  return (
    <div style={{ padding: "50px" }}>
      <h2>회원가입 페이지</h2>
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

        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br /><br />

        <input
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        /><br /><br />

        <button type="submit">회원가입</button>
      </form>
    </div>
  );
};

export default Register;
