// src/pages/admin/BoardManagement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const BoardManagement = () => {
  // ===============================
  // 📌 기본 더미 데이터
  // ===============================
  const [posts, setPosts] = useState([
    {
      postId: 1,
      title: "첫 번째 테스트 공지사항",
      leaderId: 100,
      type: "NOTICE",
      reported: false,
      reportReason: null,
      createdAt: "2025-01-01T10:00:00",
    },
    {
      postId: 2,
      title: "스터디 모집 테스트 글입니다",
      leaderId: 101,
      type: "STUDY",
      reported: false,
      reportReason: null,
      createdAt: "2025-01-02T15:00:00",
    },
    {
      postId: 3,
      title: "후기 테스트 글!",
      leaderId: 102,
      type: "REVIEW",
      reported: true,
      reportReason: "허위 후기 작성",
      createdAt: "2025-01-03T13:00:00",
    },
  ]);

  const [filterType, setFilterType] = useState("");
  const [showOnlyReported, setShowOnlyReported] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");

  const navigate = useNavigate();

  // ===============================
  // 📌 신고 사유 모달
  // ===============================
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [currentReason, setCurrentReason] = useState("");

  const handleShowReason = (reason) => {
    setCurrentReason(reason || "신고 사유가 없습니다.");
    setShowReasonModal(true);
  };

  // ===============================
  // 📌 공지사항 생성
  // ===============================
  const handleCreateNotice = () => {
    if (!noticeTitle || !noticeContent) {
      alert("제목과 내용을 입력하세요.");
      return;
    }

    api
      .post("/study-posts", {
        title: noticeTitle,
        content: noticeContent,
        type: "NOTICE",
        leaderId: 1, 
      })
      .then(() => {
        alert("공지사항이 등록되었습니다.");
        setNoticeTitle("");
        setNoticeContent("");
        return api.get("/study-posts");
      })
      .then((res) => {
        const sorted = sortPosts(res.data);
        setPosts(sorted);
      })
      .catch((err) => console.error("공지 생성 실패:", err));
  };

  // ===============================
  // 📌 게시글 전체 조회
  // ===============================
  useEffect(() => {
    api
      .get("/study-posts")
      .then((res) => {
        const sorted = sortPosts(res.data);
        setPosts(sorted);
      })
      .catch((err) => {
        console.error("게시글 조회 실패 → 더미 유지:", err);
      });
  }, []);

  // 정렬
  const sortPosts = (data) => {
    return [...data].sort((a, b) => {
      if (a.type === "NOTICE" && b.type !== "NOTICE") return -1;
      if (a.type !== "NOTICE" && b.type === "NOTICE") return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  // ===============================
  // 📌 게시글 삭제
  // ===============================
  const handleDelete = (postId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    api
      .delete(`/study-posts/${postId}`)
      .then(() => {
        setPosts((prev) => prev.filter((p) => p.postId !== postId));
        alert(`게시글 ${postId} 삭제 완료`);
      })
      .catch((err) => console.error("삭제 실패:", err));
  };

  // ===============================
  // 📌 게시글 수정 페이지 이동
  // ===============================
  const handleEditClick = (postId) => {
    navigate(`/admin/board/edit/${postId}`);
  };

  // ===============================
  // 📌 필터링
  // ===============================
  let filteredPosts = posts;

  if (searchQuery.trim() !== "") {
    filteredPosts = filteredPosts.filter((p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (filterType) {
    filteredPosts = filteredPosts.filter((p) => p.type === filterType);
  }

  if (showOnlyReported) {
    filteredPosts = filteredPosts.filter((p) => p.reported === true);
  }

  return (
    <div>
      <h2>📜 게시글 관리</h2>

      {/* ============================ */}
      {/* 📌 공지사항 등록 */}
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
      {/* 🔍 검색 + 카테고리 필터 */}
      {/* ============================ */}
      <div className="d-flex mb-3 gap-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="제목 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          className="form-select w-25"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">카테고리 필터</option>
          <option value="NOTICE">📌 공지사항</option>
          <option value="STUDY">스터디 모집</option>
          <option value="REVIEW">스터디 후기</option>
        </select>

        <div className="form-check ms-3 d-flex align-items-center">
          <input
            type="checkbox"
            className="form-check-input"
            id="reportedFilter"
            checked={showOnlyReported}
            onChange={() => setShowOnlyReported(!showOnlyReported)}
          />
          <label htmlFor="reportedFilter" className="form-check-label ms-2">
            ⚠ 신고된 글만
          </label>
        </div>
      </div>

      {/* ============================ */}
      {/* 📌 게시글 목록 */}
      {/* ============================ */}
      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>제목</th>
            <th>작성자 ID</th>
            <th>유형</th>
            <th>신고</th>
            <th>작성일</th>
            <th>액션</th>
          </tr>
        </thead>

        <tbody>
          {filteredPosts.map((p) => (
            <tr key={p.postId}>
              <td>{p.postId}</td>

              <td
                onClick={() => handleEditClick(p.postId)}
                style={{
                  cursor: "pointer",
                  color: "#007BFF",
                  textDecoration: "underline",
                }}
              >
                {p.type === "NOTICE" ? "📌 " : ""}
                {p.title}
              </td>

              <td>{p.leaderId}</td>
              <td>{p.type}</td>

              <td>
                {p.reported ? (
                  <span
                    style={{
                      cursor: "pointer",
                      color: "#d9534f",
                      fontWeight: "bold",
                    }}
                    onClick={() => handleShowReason(p.reportReason)}
                  >
                    ⚠ 신고됨
                  </span>
                ) : (
                  "정상"
                )}
              </td>

              <td>{new Date(p.createdAt).toLocaleDateString("ko-KR")}</td>

              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(p.postId)}
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ============================ */}
      {/* 🚨 신고 사유 모달 */}
      {/* ============================ */}
      {showReasonModal && (
        <div
          className="modal"
          style={{
            display: "block",
            background: "rgba(0,0,0,0.5)",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 9999,
          }}
        >
          <div className="modal-dialog" style={{ marginTop: "15%" }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">🚨 신고 사유</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowReasonModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <p>{currentReason}</p>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowReasonModal(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardManagement;
