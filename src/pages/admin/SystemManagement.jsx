import React, { useState } from "react";
import { useNavigate, Routes, Route, Link, useLocation } from "react-router-dom";
import NotificationManager from "./NotificationManager"; 

// -----------------------------------------------------------------
// 가상의 문의 목록
// -----------------------------------------------------------------
const dummyInquiries = [
    { id: 1, user: "testuser", title: "로그인 오류 문의", status: "Pending" },
    { id: 2, user: "studyA_leader", title: "그룹 개설 관련 문의", status: "Completed" },
];

// -----------------------------------------------------------------
// 문의 관리 컴포넌트 (InquiryManager)
// -----------------------------------------------------------------
const InquiryManager = ({ inquiries, setInquiries }) => {
    const navigate = useNavigate();
    const alert = (message) => console.log(message);
    const confirm = (message) => window.confirm(message);

    const getStatusLabel = (status) => {
        switch (status) {
            case "Pending": return "대기중";
            case "Answering": return "답변중";
            case "Completed": return "답변완료";
            default: return "대기중";
        }
    };

    const handleAnswerClick = (id) => {
        navigate(`/admin/system/answer/${id}`);
    };

    const handleDeleteInquiry = (id) => {
        if (confirm(`${id}번 문의를 삭제하시겠습니까?`)) {
            setInquiries(inquiries.filter((i) => i.id !== id));
            alert(`F-S-SM-003: ${id}번 문의를 삭제했습니다.`);
        }
    };

    return (
        <div className="card mb-4">
            <div className="card-header">고객 문의 사항</div>
            <div className="card-body">
                <table className="table table-sm table-striped">
                    <thead>
                        <tr>
                            <th>ID</th><th>사용자</th><th>제목</th><th>상태</th><th>액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inquiries.map((i) => (
                            <tr key={i.id}>
                                <td>{i.id}</td>
                                <td>{i.user}</td>
                                <td>{i.title}</td>
                                <td>
                                    <span
                                        className={
                                            i.status === "Pending" ? "text-secondary"
                                            : i.status === "Answering" ? "text-primary"
                                            : "text-success"
                                        }
                                    >
                                        {getStatusLabel(i.status)}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-primary me-2"
                                        onClick={() => handleAnswerClick(i.id)}
                                        disabled={i.status === "Completed"}
                                    >
                                        답변 작성
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDeleteInquiry(i.id)}
                                    >
                                        삭제
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// -----------------------------------------------------------------
// 시스템 운영 컴포넌트 (SystemOperator)
// -----------------------------------------------------------------
const SystemOperator = () => {
    const alert = (message) => console.log(message);
    const handleBackup = () => alert("F-S-IM-001: 백업 스냅샷 생성");
    const handleCacheInvalidate = () => alert("F-S-IM-002: 캐시 무효화 실행");

    return (
        <div className="card">
            <div className="card-header">시스템 운영</div>
            <div className="card-body d-flex flex-column">
                <p className="text-muted">
                    시스템 운영에 필요한 기능들입니다. 이 텍스트가 보이지 않으면 렌더링 오류입니다.
                </p> 
                <button className="btn btn-warning mb-3" onClick={handleBackup}>
                    백업 스냅샷 관리
                </button>
                <button className="btn btn-danger" onClick={handleCacheInvalidate}>
                    캐시 무효화 버튼
                </button>
            </div>
        </div>
    );
};

// -----------------------------------------------------------------
// 시스템 관리 메인 컴포넌트 (SystemManagement)
// -----------------------------------------------------------------
const SystemManagement = () => {
    const [inquiries, setInquiries] = useState(dummyInquiries);
    const location = useLocation(); 

    // 현재 경로와 비교하여 활성 탭 표시
    const getActiveLinkClass = (pathSegment) => {
        const currentPath = location.pathname;
        if (pathSegment === "index") {
            return currentPath === "/admin/system" ? "active" : "";
        }
        return currentPath.includes(pathSegment) ? "active" : "";
    };

    return (
        <div className="system-management">
            <h2>⚙️ 시스템 및 문의 관리</h2>

            {/* 서브 네비게이션 탭 */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    {/* 문의 관리 (기본 탭) */}
                    <Link
                        to="/admin/system"
                        className={`nav-link ${getActiveLinkClass("index")}`}
                    >
                        문의 관리
                    </Link>
                </li>
                <li className="nav-item">
                    {/* 시스템 운영 */}
                    <Link
                        to="/admin/system/system-op"
                        className={`nav-link ${getActiveLinkClass("system-op")}`}
                    >
                        시스템 운영
                    </Link>
                </li>
                <li className="nav-item">
                    {/* 알림 관리 */}
                    <Link
                        to="/admin/system/notifications"
                        className={`nav-link ${getActiveLinkClass("notifications")}`}
                    >
                        알림 관리
                    </Link>
                </li>
            </ul>

            {/* 중첩 라우팅 */}
            <Routes>
                <Route
                    index
                    element={<InquiryManager inquiries={inquiries} setInquiries={setInquiries} />}
                />
                <Route path="system-op" element={<SystemOperator />} />
                <Route path="notifications" element={<NotificationManager />} />
            </Routes>
        </div>
    );
};

export default SystemManagement;
