// src/pages/admin/BoardManagement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

import {
  FaTrash,
  FaBullhorn,
  FaFilter,
  FaSearch,
  FaExclamationTriangle,
} from "react-icons/fa";

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

  // 신고 사유 모달
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [currentReason, setCurrentReason] = useState("");

  const handleShowReason = (reason) => {
    setCurrentReason(reason || "신고 사유가 없습니다.");
    setShowReasonModal(true);
  };

  // 공지 등록
  const handleCreateNotice = () => {
    if (!noticeTitle || !noticeContent) {
      alert("제목과 내용을 입력하세요.");
      return;
    }

    api
      .post("/study-posts", {
        title: noticeTitle,
        content: noticeContent,
        type: "NOTICE"
      })
      .then(() => {
        alert("공지사항이 등록되었습니다.");
        setNoticeTitle("");
        setNoticeContent("");
        return api.get("/study-posts");
      })
      .then((res) => setPosts(sortPosts(res.data)))
      .catch((err) => console.error("공지 생성 실패:", err));
  };

  // 전체 조회
  useEffect(() => {
    api
      .get("/study-posts")
      .then((res) => setPosts(sortPosts(res.data)))
      .catch((err) => console.error("조회 실패 → 더미 유지:", err));
  }, []);

  const sortPosts = (data) => {
    return [...data].sort((a, b) => {
      if (a.type === "NOTICE" && b.type !== "NOTICE") return -1;
      if (a.type !== "NOTICE" && b.type === "NOTICE") return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  // 삭제
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

  const handleEditClick = (postId) => navigate(`/admin/board/edit/${postId}`);

  // 필터링
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
      <h2 className="fw-bold mb-4">📜 게시글 관리</h2>

      {/* ============================ */}
      {/* 📌 공지사항 등록 Card */}
      {/* ============================ */}
      <div className="card shadow-sm p-4 mb-4">
        <h4 className="mb-3">
          <FaBullhorn className="text-primary me-2" />
          공지사항 등록
        </h4>

        <input
          type="text"
          className="form-control mb-2"
          placeholder="공지 제목"
          value={noticeTitle}
          onChange={(e) => setNoticeTitle(e.target.value)}
        />

        <textarea
          className="form-control mb-3"
          rows="3"
          placeholder="공지 내용"
          value={noticeContent}
          onChange={(e) => setNoticeContent(e.target.value)}
        ></textarea>

        <button className="btn btn-primary px-4" onClick={handleCreateNotice}>
          등록하기
        </button>
      </div>

      {/* ============================ */}
      {/* 🔍 검색 / 필터 Card */}
      {/* ============================ */}
      <div className="card shadow-sm p-3 mb-4">
        <div className="d-flex align-items-center gap-3">

          {/* 검색창 */}
          <div className="input-group w-50">
            <span className="input-group-text bg-light">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="제목 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 카테고리 */}
          <select
            className="form-select w-25"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">전체 유형</option>
            <option value="NOTICE">📌 공지사항</option>
            <option value="STUDY">스터디 모집</option>
            <option value="REVIEW">후기</option>
          </select>

          {/* 신고 필터 */}
          <div className="form-check d-flex align-items-center">
            <input
              type="checkbox"
              className="form-check-input"
              checked={showOnlyReported}
              onChange={() => setShowOnlyReported(!showOnlyReported)}
            />
            <label className="form-check-label ms-2">
              <FaExclamationTriangle className="text-danger me-1" />
              신고된 글만
            </label>
          </div>
        </div>
      </div>

      {/* ============================ */}
      {/* 📌 게시글 목록 Table */}
      {/* ============================ */}
      <div className="card shadow-sm p-3">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>제목</th>
              <th>작성자</th>
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
                    color: "#0d6efd",
                    fontWeight: "500",
                  }}
                >
                  {p.type === "NOTICE" && "📌 "}
                  {p.title}
                </td>

                <td>{p.leaderId}</td>
                <td>{p.type}</td>

                <td>
                  {p.reported ? (
                    <span
                      className="text-danger fw-bold"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleShowReason(p.reportReason)}
                    >
                      <FaExclamationTriangle className="me-1" />
                      신고됨
                    </span>
                  ) : (
                    "정상"
                  )}
                </td>

                <td>{new Date(p.createdAt).toLocaleDateString("ko-KR")}</td>

                <td>
                  <button
                    className="btn btn-danger btn-sm d-flex align-items-center"
                    onClick={() => handleDelete(p.postId)}
                  >
                    <FaTrash className="me-1" />
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
            <div className="modal-content shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <FaExclamationTriangle className="me-2" />
                  신고 사유
                </h5>
                <button
                  className="btn-close btn-close-white"
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
