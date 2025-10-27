// src/pages/admin/BoardManagement.jsx

import React, { useState } from "react";
import { Link, Routes, Route } from "react-router-dom";
// (이전에 추가된 모달 컴포넌트들을 import 했다고 가정합니다)

// ------------------------------------------------------------
// 📜 가상의 신고 목록 더미 데이터 (F-S-BM-005) (생략)
// ------------------------------------------------------------
const dummyReports = [
    { id: 1, type: "게시글", postId: 101, reporter: "userA", reported: "userB", reason: "부적절한 언어 사용", status: "Pending", date: "2025-10-25" },
    { id: 2, type: "댓글", postId: 55, reporter: "userC", reported: "userD", reason: "광고/스팸", status: "Pending", date: "2025-10-26" },
    { id: 3, type: "게시글", postId: 210, reporter: "userE", reported: "userF", reason: "저작권 침해 의심", status: "Completed", date: "2025-10-24" },
];

// ------------------------------------------------------------
// 📜 신고 검토 컴포넌트 (F-S-BM-005) (생략)
// ------------------------------------------------------------
const ReportReview = () => {
    // ... (로직 생략)
    const [reports, setReports] = useState(dummyReports);

    const handleProcess = (id) => {
         if (window.confirm("신고 내용을 검토하고 해당 게시물/댓글을 삭제 처리 하시겠습니까?")) {
             alert(`신고 처리 완료. 관련 콘텐츠 삭제됨.`);
             setReports(reports.map(r => r.id === id ? { ...r, status: 'Completed', action: '삭제 완료' } : r));
         }
    };
    
    return (
        // ... (UI 생략)
        <div>
            <h3>신고 게시글 검토 및 처리</h3>
            <p>사용자 신고가 접수된 게시물 및 댓글을 확인하고 필요한 조치(삭제)를 취합니다.</p>
            {/* 테이블 UI 생략 */}
            <table className="table table-sm table-striped mt-3">
                <thead>
                    <tr><th>ID</th><th>유형</th><th>게시물 ID</th><th>신고 이유</th><th>접수일</th><th>상태</th><th>액션</th></tr>
                </thead>
                <tbody>
                    {reports.map(r => (
                        <tr key={r.id}>
                            <td>{r.id}</td><td>{r.type}</td><td>{r.postId}</td><td>{r.reason}</td><td>{r.date}</td><td>{r.status}</td>
                            <td>
                                {r.status === 'Pending' ? (
                                    <button 
                                        className="btn btn-danger btn-sm" 
                                        onClick={() => handleProcess(r.id)}
                                    >
                                        삭제 처리
                                    </button>
                                ) : (
                                    <span>{r.action || '처리 완료'}</span>
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
// 📜 나머지 게시판 관리 컴포넌트 틀 (기존 유지)
// ------------------------------------------------------------
const PostList = () => (
    <div>
        <h3>게시글 목록 조회</h3>
        <p>전체 게시글과 댓글을 조회하고 상세 수정/삭제 링크를 제공합니다.</p>
        <button className="btn btn-sm btn-info me-2">게시글 상세 수정</button>
        <button className="btn btn-sm btn-danger">게시글 삭제</button>
    </div>
);

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

// ------------------------------------------------------------
// 📜 BoardManagement 컴포넌트 (경로 수정 완료)
// ------------------------------------------------------------
const BoardManagement = () => {
    return (
        <div className="board-management">
            <h2>📜 게시판 관리</h2>
            
            {/* 서브 네비게이션: 절대 경로 사용으로 수정 */}
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

            {/* 중첩 라우트 (path는 그대로 상대 경로 유지) */}
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