// src/pages/admin/SystemManagement.jsx

import React, { useState } from "react";

// 가상의 문의 목록
const dummyInquiries = [
    { id: 1, user: "testuser", title: "로그인 오류 문의", status: "Pending" },
    { id: 2, user: "studyA_leader", title: "그룹 개설 관련 문의", status: "Completed" },
];

const SystemManagement = () => {
    const [inquiries, setInquiries] = useState(dummyInquiries);
    
    // F-S-SM-001: 문의 답변 작성 (더미 함수)
    const handleAnswer = (id) => {
        alert(`F-S-SM-001: ${id}번 문의에 대한 답변 작성 모달을 띄웁니다.`);
        setInquiries(inquiries.map(i => i.id === id ? { ...i, status: 'Answering' } : i));
    };

    // F-S-SM-003: 문의 삭제 (더미 함수)
    const handleDeleteInquiry = (id) => {
        if(window.confirm(`${id}번 문의를 삭제하시겠습니까?`)) {
            alert(`F-S-SM-003: ${id}번 문의를 삭제했습니다.`);
            setInquiries(inquiries.filter(i => i.id !== id));
        }
    };

    // F-S-IM-001: 백업 스냅샷 관리 (더미 함수)
    const handleBackup = () => {
        alert("F-S-IM-001: 데이터베이스 백업 스냅샷을 생성합니다.");
    };

    // F-S-IM-002: 캐시 무효화 (더미 함수)
    const handleCacheInvalidate = () => {
        alert("F-S-IM-002: 시스템 캐시를 무효화(초기화)합니다.");
    };

    return (
        <div className="system-management">
            <h2>⚙️ 시스템 및 문의 관리</h2>

            {/* 문의 사항 관리 영역 */}
            <div className="card mb-4">
                <div className="card-header">고객 문의 사항 (F-S-SM)</div>
                <div className="card-body">
                    <table className="table table-sm table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>사용자</th>
                                <th>제목 (F-S-SM-001)</th>
                                <th>상태</th>
                                <th>액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inquiries.map(i => (
                                <tr key={i.id}>
                                    <td>{i.id}</td>
                                    <td>{i.user}</td>
                                    <td>{i.title}</td>
                                    <td>{i.status}</td>
                                    <td>
                                        <button className="btn btn-sm btn-primary me-2" 
                                                onClick={() => handleAnswer(i.id)} 
                                                disabled={i.status === 'Completed'}>
                                            답변 작성
                                        </button>
                                        <button className="btn btn-sm btn-danger" 
                                                onClick={() => handleDeleteInquiry(i.id)}>
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 시스템 운영 영역 */}
            <div className="card">
                <div className="card-header">시스템 운영 (F-S-IM)</div>
                <div className="card-body d-flex flex-column">
                    <button className="btn btn-warning mb-3" onClick={handleBackup}>
                        백업 스냅샷 관리 (F-S-IM-001)
                    </button>
                    <button className="btn btn-danger" onClick={handleCacheInvalidate}>
                        캐시 무효화 버튼 (F-S-IM-002)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SystemManagement;