// src/pages/admin/BoardManagement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axios";

const BoardManagement = () => {
  const [posts, setPosts] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [showOnlyReported, setShowOnlyReported] = useState(false);

  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");

  const navigate = useNavigate();

  // =======================================
  // 📌 공지사항 등록 기능 (POST /study-posts)
  // =======================================
  const handleCreateNotice = () => {
    if (!noticeTitle || !noticeContent) {
      alert("제목과 내용을 입력하세요.");
      return;
    }

    api
      .post("/study-posts", {
        title: noticeTitle,
        content: noticeContent,
        type: "NOTICE",   // 공지사항은 무조건 NOTICE
        leader_id: 1,     // 관리자 계정 ID (임시), 로그인 정보로 대체 가능
      })
      .then(() => {
        alert("공지사항이 등록되었습니다.");

        // 입력 초기화
        setNoticeTitle("");
        setNoticeContent("");

        // 리스트 새로고침
        return api.get("/study-posts");
      })
      .then(res => {
        const sorted = [...res.data].sort((a, b) => {
          if (a.type === "NOTICE" && b.type !== "NOTICE") return -1;
          if (a.type !== "NOTICE" && b.type === "NOTICE") return 1;
          return new Date(b.created_at) - new Date(a.created_at);
        });
        setPosts(sorted);
      })
      .catch(err => console.error(err));
  };

  // =======================================
  // 📌 게시글 전체 조회
  // =======================================
  useEffect(() => {
    api.get("/study-posts")
      .then(res => {
        const sorted = [...res.data].sort((a, b) => {
          if (a.type === "NOTICE" && b.type !== "NOTICE") return -1;
          if (a.type !== "NOTICE" && b.type === "NOTICE") return 1;
          return new Date(b.created_at) - new Date(a.created_at);
        });
        setPosts(sorted);
      })
      .catch(err => console.error("게시글 조회 실패:", err));
  }, []);

  // 게시글 삭제
  const handleDelete = (postId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    api.delete(`/study-posts/${postId}`)
      .then(() => {
        setPosts(prev => prev.filter(p => p.post_id !== postId));
        alert(`게시글 ${postId} 삭제 완료`);
      })
      .catch(err => console.error("삭제 실패:", err));
  };

  const handleEditClick = (postId) => {
    navigate(`/admin/board/edit/${postId}`);
  };

  // 필터 처리
  let filteredPosts = posts;

  if (filterType) {
    filteredPosts = filteredPosts.filter(p => p.type === filterType);
  }

  if (showOnlyReported) {
    filteredPosts = filteredPosts.filter(p => p.reported === true);
  }

  return (
    <div>
      <h2>📜 게시글 관리</h2>

      {/* ============================ */}
      {/* 📌 공지사항 등록 영역 */}
      {/* ============================ */}
      <div className="card p-3 mb-4">
        <h4>📌 공지사항 등록</h4>

        <input
          type="text"
          className="form-control mb-2"
          placeholder="공지사항 제목"
          value={noticeTitle}
          onChange={(e) => setNoticeTitle(e.target.value)}
        />

        <textarea
          className="form-control mb-2"
          rows="3"
          placeholder="공지사항 내용"
          value={noticeContent}
          onChange={(e) => setNoticeContent(e.target.value)}
        ></textarea>

        <button className="btn btn-primary" onClick={handleCreateNotice}>
          공지사항 등록
        </button>
      </div>

      {/* ============================ */}
      {/* 📌 필터 섹션 */}
      {/* ============================ */}
      <div className="d-flex mb-3 align-items-center">
        <select
          className="form-select w-25 me-3"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">전체</option>
          <option value="FREE">자유글</option>
          <option value="STUDY">스터디 모집</option>
          <option value="REVIEW">후기</option>
          <option value="NOTICE">📌 공지사항</option>
        </select>

        <div className="form-check ms-3">
          <input
            type="checkbox"
            className="form-check-input"
            id="reportedFilter"
            checked={showOnlyReported}
            onChange={() => setShowOnlyReported(!showOnlyReported)}
          />
          <label htmlFor="reportedFilter" className="form-check-label">
            ⚠ 신고된 게시글만 보기
          </label>
        </div>
      </div>

      {/* ============================ */}
      {/* 📌 게시글 테이블 */}
      {/* ============================ */}
      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>제목</th>
            <th>작성자</th>
            <th>유형</th>
            <th>신고</th>
            <th>액션</th>
          </tr>
        </thead>

        <tbody>
          {filteredPosts.map((p) => (
            <tr key={p.post_id}>
              <td>{p.post_id}</td>
              <td onClick={() => handleEditClick(p.post_id)} style={{ cursor: "pointer" }}>
                {p.type === "NOTICE" ? "📌 " : ""}
                {p.title}
              </td>
              <td>{p.leader_id}</td>
              <td>{p.type}</td>
              <td>{p.reported ? "⚠ 신고됨" : "정상"}</td>

              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(p.post_id)}
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
};

export default BoardManagement;
