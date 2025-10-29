// src/pages/admin/PostEditPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const dummyPosts = [
  { id: 301, title: "스터디 모집 공고: React Hooks 마스터!", author: "admin", category: "모집", content: "React Hooks 마스터를 목표로 주 2회 온라인 스터디를 모집합니다." },
  { id: 302, title: "주말 코딩 모임 후기입니다.", author: "testuser", category: "후기", content: "지난 주말 진행된 오프라인 모임이 성공적으로 끝났습니다." },
  { id: 303, title: "파이썬 가상 환경 질문 드립니다.", author: "userA", category: "질문", content: "venv와 conda 중 어떤 것이 좋을까요?" },
  { id: 304, title: "서비스 업데이트 피드백 제안", author: "userB", category: "자유", content: "모바일 앱의 로딩 속도를 개선할 필요가 있어 보입니다." },
];

const PostEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const found = dummyPosts.find(p => p.id === Number(id));
    setPost(found);
  }, [id]);

  const handleSave = () => {
    alert(`게시글 "${post.title}" 수정이 완료되었습니다.`);
    navigate("/admin/board/posts");
  };

  if (!post) return <p>게시글을 불러오는 중...</p>;

  return (
    <div className="container mt-4">
      <h2>📝 게시글 수정 (ID: {id})</h2>

      <div className="mt-4">
        <label className="form-label">제목</label>
        <input
          type="text"
          className="form-control mb-3"
          value={post.title}
          onChange={(e) => setPost({ ...post, title: e.target.value })}
        />

        <label className="form-label">작성자</label>
        <input type="text" className="form-control mb-3" value={post.author} disabled />

        <label className="form-label">카테고리</label>
        <select
          className="form-select mb-3"
          value={post.category}
          onChange={(e) => setPost({ ...post, category: e.target.value })}
        >
          <option value="모집">모집</option>
          <option value="후기">후기</option>
          <option value="질문">질문</option>
          <option value="자유">자유</option>
        </select>

        <label className="form-label">내용</label>
        <textarea
          className="form-control mb-3"
          rows="8"
          value={post.content}
          onChange={(e) => setPost({ ...post, content: e.target.value })}
        />

        <div className="d-flex justify-content-end mt-4">
          <button className="btn btn-secondary me-2" onClick={() => navigate("/admin/board/posts")}>
            취소
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostEditPage;
