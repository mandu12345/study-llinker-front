// src/pages/admin/AnswerPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const dummyInquiries = [
  { id: 1, user: "testuser", title: "로그인 오류 문의", content: "로그인이 되지 않습니다.", status: "Pending" },
  { id: 2, user: "studyA_leader", title: "그룹 개설 관련 문의", content: "스터디 그룹 생성이 안됩니다.", status: "Completed" },
];

const AnswerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState(null);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    const found = dummyInquiries.find((i) => i.id === parseInt(id));
    if (found) setInquiry(found);
  }, [id]);

  const handleSave = () => {
    if (!answer.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }
    alert(`✅ ${inquiry.id}번 문의에 답변 완료!\n\n답변 내용:\n${answer}`);
    navigate("/admin/system");
  };

  if (!inquiry) return <div className="p-5">문의 정보를 불러오는 중...</div>;

  return (
    <div className="container py-5" style={{ maxWidth: "1200px" }}>
      <h2 className="mb-4">💬 문의 답변 작성 (ID: {inquiry.id})</h2>

      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-light">
          <strong>문의 정보</strong>
        </div>
        <div className="card-body">
          <p><strong>작성자:</strong> {inquiry.user}</p>
          <p><strong>제목:</strong> {inquiry.title}</p>
          <textarea
            className="form-control mb-3"
            value={inquiry.content}
            disabled
            rows="3"
          />
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-indigo-100">
          <strong>관리자 답변</strong>
        </div>
        <div className="card-body">
          <textarea
            className="form-control"
            placeholder="답변 내용을 입력하세요."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows="10"
            style={{ fontSize: "1rem" }}
          />
        </div>
      </div>

      <div className="d-flex justify-content-end">
        <button
          className="btn btn-secondary me-2"
          onClick={() => navigate("/admin/system")}
        >
          취소
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          답변 완료
        </button>
      </div>
    </div>
  );
};

export default AnswerPage;
