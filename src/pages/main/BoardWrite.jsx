import React, { useState, useContext } from "react";
import { AuthContext } from "../../auth/AuthContext";
import api from "../../api/axios";

const BoardWrite = ({ defaultType }) => {
  const { user } = useContext(AuthContext); // 로그인 유저
  // JWT 토큰 안에 userId가 있다면 아래처럼 decode해서 사용
  // const decoded = user?.token ? jwtDecode(user.token) : null;
  // const userId = decoded?.userId;

  const userId = user?.userId; // AuthContext에 userId 저장되어 있으면 바로 사용

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState(defaultType || "FREE");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/study-posts?leaderId=${userId}`, {
        title,
        content,
        type, // FREE / STUDY / REVIEW
      });
      alert("게시글이 등록되었습니다!");
      setTitle("");
      setContent("");
    } catch (err) {
      console.error(err);
      alert("글 작성 실패");
    }
  };

  return (
    <div className="container mt-3">
      <h3>게시글 작성</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label className="form-label">제목</label>
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-2">
          <label className="form-label">내용</label>
          <textarea
            className="form-control"
            rows="5"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <div className="mb-2">
          <label className="form-label">게시판 종류</label>
          <select
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="FREE">자유게시판</option>
            <option value="STUDY">스터디 모집</option>
            <option value="REVIEW">스터디 리뷰</option>
          </select>
        </div>
        <button className="btn btn-primary" type="submit">
          등록
        </button>
      </form>
    </div>
  );
};

export default BoardWrite;
