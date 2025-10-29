// src/pages/admin/SystemManagement.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// 가상의 문의 목록
const dummyInquiries = [
  { id: 1, user: "testuser", title: "로그인 오류 문의", status: "Pending" },
  { id: 2, user: "studyA_leader", title: "그룹 개설 관련 문의", status: "Completed" },
];

const SystemManagement = () => {
  const [inquiries, setInquiries] = useState(dummyInquiries);
  const navigate = useNavigate();

  const getStatusLabel = (status) => {
    switch (status) {
      case "Pending":
        return "대기중";
      case "Answering":
        return "답변중";
      case "Completed":
        return "답변완료";
      default:
        return "대기중";
    }
  };

  // “답변 작성” 클릭 시 해당 문의 ID로 이동
  const handleAnswerClick = (id) => {
    navigate(`/admin/system/answer/${id}`);
  };

  const handleDeleteInquiry = (id) => {
    if (window.confirm(`${id}번 문의를 삭제하시겠습니까?`)) {
      setInquiries(inquiries.filter((i) => i.id !== id));
      alert(`F-S-SM-003: ${id}번 문의를 삭제했습니다.`);
    }
  };

  const handleBackup = () => alert("F-S-IM-001: 백업 스냅샷 생성");
  const handleCacheInvalidate = () => alert("F-S-IM-002: 캐시 무효화 실행");

  return (
    <div className="system-management">
      <h2>⚙️ 시스템 및 문의 관리</h2>

      {/* 문의사항 목록 */}
      <div className="card mb-4">
        <div className="card-header">고객 문의 사항</div>
        <div className="card-body">
          <table className="table table-sm table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>사용자</th>
                <th>제목</th>
                <th>상태</th>
                <th>액션</th>
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
                        i.status === "Pending"
                          ? "text-secondary"
                          : i.status === "Answering"
                          ? "text-primary"
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

      {/* 시스템 운영 영역 */}
      <div className="card">
        <div className="card-header">시스템 운영</div>
        <div className="card-body d-flex flex-column">
          <button className="btn btn-warning mb-3" onClick={handleBackup}>
            백업 스냅샷 관리
          </button>
          <button className="btn btn-danger" onClick={handleCacheInvalidate}>
            캐시 무효화 버튼
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemManagement;
