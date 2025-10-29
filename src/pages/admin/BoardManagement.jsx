// src/pages/admin/BoardManagement.jsx

import React, { useState } from "react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";

// ------------------------------------------------------------
// 📜 가상의 신고 목록 더미 데이터 (F-S-BM-005)
// ------------------------------------------------------------
const dummyReports = [
  { id: 1, type: "게시글", postId: 101, reporter: "userA", reported: "userB", reason: "부적절한 언어 사용", status: "Pending", date: "2025-10-25" },
  { id: 2, type: "댓글", postId: 55, reporter: "userC", reported: "userD", reason: "광고/스팸", status: "Pending", date: "2025-10-26" },
  { id: 3, type: "게시글", postId: 210, reporter: "userE", reported: "userF", reason: "저작권 침해 의심", status: "Completed", date: "2025-10-24" },
];

// ------------------------------------------------------------
// 📰 전체 게시글 목록 더미 데이터
// ------------------------------------------------------------
const dummyPosts = [
  { id: 301, title: "스터디 모집 공고: React Hooks 마스터!", author: "admin", category: "모집", date: "2025-10-28", views: 45, content: "React Hooks 마스터를 목표로 주 2회 온라인 스터디를 모집합니다. 열정적인 분들의 참여를 기다립니다." },
  { id: 302, title: "주말 코딩 모임 후기입니다.", author: "testuser", category: "후기", date: "2025-10-27", views: 23, content: "지난 주말 진행된 오프라인 모임이 성공적으로 끝났습니다. 다음 주제는 Next.js 입니다." },
  { id: 303, title: "파이썬 가상 환경 질문 드립니다.", author: "userA", category: "질문", date: "2025-10-26", views: 15, content: "venv와 conda 중 어떤 것을 사용하는 것이 좋을까요? 장단점을 알려주세요." },
  { id: 304, title: "서비스 업데이트 피드백 제안", author: "userB", category: "자유", date: "2025-10-25", views: 80, content: "모바일 앱의 로딩 속도를 개선할 필요가 있어 보입니다. 관련하여 피드백 드립니다." },
];

// ------------------------------------------------------------
// 📜 전체 게시글 목록 컴포넌트 (카테고리 필터 기능 + 페이지 이동)
// ------------------------------------------------------------
const PostList = () => {
  const [posts, setPosts] = useState(dummyPosts);
  const [filterCategory, setFilterCategory] = useState("");
  const navigate = useNavigate();

  const handleDelete = (id) => {
    if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      setPosts(posts.filter(p => p.id !== id));
      alert(`게시글 ${id}번 삭제 완료.`);
    }
  };

  const handleEditClick = (postId) => {
    navigate(`/admin/board/edit/${postId}`); // ✅ 새 페이지 이동
  };

  const filteredPosts = filterCategory
    ? posts.filter(p => p.category === filterCategory)
    : posts;

  return (
    <div>
      <h3>전체 게시글 목록 조회</h3>

      <div className="d-flex mb-3">
        <input type="text" className="form-control w-25 me-2" placeholder="제목/작성자 검색 (추후 구현)" />
        <select
          className="form-select w-25"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">카테고리 전체</option>
          <option value="모집">모집</option>
          <option value="후기">후기</option>
          <option value="질문">질문</option>
          <option value="자유">자유</option>
        </select>
      </div>

      {filteredPosts.length === 0 ? (
        <p className="text-muted mt-4">해당 카테고리에 해당하는 게시글이 없습니다.</p>
      ) : (
        <table className="table table-striped table-hover mt-3">
          <thead>
            <tr>
              <th>ID</th>
              <th>제목</th>
              <th>작성자</th>
              <th>카테고리</th>
              <th>날짜</th>
              <th>조회수</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td
                  className="text-primary"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleEditClick(p.id)}
                >
                  {p.title}
                </td>
                <td>{p.author}</td>
                <td>{p.category}</td>
                <td>{p.date}</td>
                <td>{p.views}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ------------------------------------------------------------
// 📜 나머지 컴포넌트 (공지, 신고 탭 유지)
// ------------------------------------------------------------
const NoticeManager = () => (
  <div>
    <h3>공지사항 등록/관리</h3>
    <p>공지사항을 작성, 수정, 삭제하는 UI 틀입니다.</p>
    <input type="text" className="form-control mb-2 w-50" placeholder="공지사항 제목 작성/수정" />
    <textarea className="form-control mb-2 w-75" rows="3" placeholder="공지사항 내용 작성/수정"></textarea>
    <button className="btn btn-sm btn-primary me-2">등록/수정</button>
    <button className="btn btn-sm btn-danger">삭제</button>
  </div>
);

const getStatusLabel = (status) => {
  switch (status) {
    case "Pending":
      return "대기중";
    case "Completed":
      return "처리 완료";
    default:
      return status;
  }
};

const ReportReview = () => {
  const [reports] = useState(dummyReports);
  const handleProcess = (id) => {
    if (window.confirm("신고 내용을 검토하고 해당 게시물/댓글을 삭제 처리 하시겠습니까?")) {
      alert("신고 처리 완료. 관련 콘텐츠 삭제됨.");
    }
  };

  return (
    <div>
      <h3>신고 게시글 검토 및 처리</h3>
      <p>사용자 신고가 접수된 게시물 및 댓글을 확인하고 필요한 조치(삭제)를 취합니다.</p>
      <table className="table table-sm table-striped mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>유형</th>
            <th>게시물 ID</th>
            <th>신고 이유</th>
            <th>접수일</th>
            <th>상태</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.type}</td>
              <td>{r.postId}</td>
              <td>{r.reason}</td>
              <td>{r.date}</td>
              <td>{getStatusLabel(r.status)}</td>
              <td>
                {r.status === "Pending" ? (
                  <button className="btn btn-danger btn-sm" onClick={() => handleProcess(r.id)}>
                    삭제 처리
                  </button>
                ) : (
                  <span>처리 완료</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ------------------------------------------------------------
// 📜 BoardManagement 메인 (탭 유지)
// ------------------------------------------------------------
const BoardManagement = () => {
  return (
    <div className="board-management">
      <h2>📜 게시판 관리</h2>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <Link to="/admin/board/notice" className="nav-link">공지 관리</Link>
        </li>
        <li className="nav-item">
          <Link to="/admin/board/posts" className="nav-link">전체 게시글</Link>
        </li>
        <li className="nav-item">
          <Link to="/admin/board/reports" className="nav-link">신고 검토</Link>
        </li>
      </ul>

      <Routes>
        <Route path="/" element={<NoticeManager />} />
        <Route path="notice" element={<NoticeManager />} />
        <Route path="posts" element={<PostList />} />
        <Route path="reports" element={<ReportReview />} />
      </Routes>
    </div>
  );
};

export default BoardManagement;
