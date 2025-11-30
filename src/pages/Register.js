import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  // 관심 태그
  const [interestTags, setInterestTags] = useState([]);
  const [newTag, setNewTag] = useState("");

  // 태그 추가
  const handleAddTag = () => {
    if (newTag && !interestTags.includes(newTag)) {
      setInterestTags([...interestTags, newTag]);
    }
    setNewTag("");
  };

  // 회원가입 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password || !email || !name) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    try {
      const bodyData = {
        username,
        password,
        email,
        name,
        interestTags, // 선택: 태그 배열 전달
      };

      const res = await api.post("/users", bodyData);

      console.log("회원가입 응답:", res.data);
      alert("회원가입 성공!");
      navigate("/login");
    } catch (err) {
      console.error("회원가입 오류:", err);
      alert("회원가입 실패!");
    }
  };

  return (
    <div className="container mt-4">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        {/* 아이디 */}
        <div className="mb-3">
          <label className="form-label">아이디</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* 비밀번호 */}
        <div className="mb-3">
          <label className="form-label">비밀번호</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* 이메일 */}
        <div className="mb-3">
          <label className="form-label">이메일</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* 이름 */}
        <div className="mb-3">
          <label className="form-label">이름</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* 관심사 태그 */}
        <div className="mb-3">
          <label className="form-label">관심사 태그</label>
          <div>
            {interestTags.map((tag, i) => (
              <span key={i} className="badge bg-primary me-2">
                {tag}
              </span>
            ))}
          </div>

          <div className="input-group mt-2">
            <input
              type="text"
              className="form-control"
              placeholder="새 태그 입력"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleAddTag}
            >
              추가
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary mt-3">
          회원가입
        </button>
      </form>
    </div>
  );
};

export default Register;
