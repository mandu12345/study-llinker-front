import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const GroupEditPage = () => {
  const { groupId } = useParams();   // URL의 :groupId
  const navigate = useNavigate();

  // ✅ 더미 데이터 (초기값)
  const [group, setGroup] = useState({
    groupId: Number(groupId),
    title: "더미 스터디 그룹",
    description: "스터디 설명이 여기에 들어갑니다.",
    category: "Programming",
    leaderId: 100,
    maxMembers: 5,
    status: "Active"
  });

  const [loading, setLoading] = useState(true);

  // 🔹 API 데이터 조회
  useEffect(() => {
    api.get(`/study-groups/${groupId}`)
      .then(res => {
        setGroup(res.data);     // API 데이터로 덮어쓰기
        setLoading(false);
      })
      .catch(err => {
        console.error("그룹 불러오기 실패 → 더미데이터 유지:", err);
        setLoading(false);      // 실패해도 더미 데이터로 유지
      });
  }, [groupId]);

  const handleSave = () => {
    api.put(`/study-groups/${groupId}`, group)
      .then(() => {
        alert("그룹 정보 수정 완료");
        navigate("/admin/groups");
      })
      .catch(err => console.error("수정 실패:", err));
  };

  if (loading && !group) return <p>그룹 정보를 불러오는 중...</p>;

  return (
    <div className="container mt-4">
      <h2>📝 그룹 수정 (ID: {group.groupId})</h2>

      {/* 그룹명 */}
      <label className="form-label">그룹명</label>
      <input
        type="text"
        className="form-control mb-3"
        value={group.title}
        onChange={(e) => setGroup({ ...group, title: e.target.value })}
      />

      {/* 설명 */}
      <label className="form-label">설명</label>
      <textarea
        className="form-control mb-3"
        rows={3}
        value={group.description || ""}
        onChange={(e) => setGroup({ ...group, description: e.target.value })}
      />

      {/* 카테고리 */}
      <input
      type="text"
      className="form-control mb-3"
      value={group.category}
      placeholder="예: Java, Spring"
      onChange={(e) =>
        setGroup({ ...group, category: JSON.stringify(e.target.value.split(",")) })}
      />

      {/* 최대 인원 */}
      <label className="form-label">최대 인원 (maxMembers)</label>
      <input
        type="number"
        className="form-control mb-3"
        value={group.maxMembers}
        onChange={(e) =>
          setGroup({ ...group, maxMembers: Number(e.target.value) })
        }
      />

      {/* 상태 */}
      <label className="form-label">상태</label>
      <select
        className="form-select mb-3"
        value={group.status}
        onChange={(e) => setGroup({ ...group, status: e.target.value })}
      >
        <option value="ACTIVE">활성</option>
        <option value="INACTIVE">비활성</option>
        <option value="PENDING">대기중</option>
      </select>

      <div className="d-flex justify-content-end">
        <button
          className="btn btn-secondary me-2"
          onClick={() => navigate("/admin/groups")}
        >
          취소
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          저장
        </button>
      </div>
    </div>
  );
};

export default GroupEditPage;
