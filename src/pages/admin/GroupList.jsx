import React, { useState, useEffect } from "react";
import api from "../../axios";

import GroupEditModal from "./GroupEditModal";
import GroupDeleteModal from "./GroupDeleteModal";
import GroupStatusChangeModal from "./GroupStatusChangeModal";
import StatsModal from "./StatsModal";

const GroupList = () => {
  const [groups, setGroups] = useState([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  const [currentGroup, setCurrentGroup] = useState(null);
  const [targetAction, setTargetAction] = useState(null);

  // ----------------------------------------
  // ✅ 1. 그룹 전체 조회 API (GET)
  // ----------------------------------------
  useEffect(() => {
    api.get("/study-groups")
      .then(res => setGroups(res.data))
      .catch(err => console.error("그룹 목록 조회 실패:", err));
  }, []);

  // ----------------------------------------
  // 📝 2. 그룹 수정 (PUT /study-groups/{id})
  // ----------------------------------------
  const handleEditClick = (group) => {
    setCurrentGroup(group);
    setIsEditModalOpen(true);
  };

  const handleSave = (updatedGroup) => {
    api.put(`/study-groups/${updatedGroup.id}`, updatedGroup)
      .then(() => {
        setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g));
        setIsEditModalOpen(false);
        alert(`그룹 [${updatedGroup.title}] 수정 완료`);
      })
      .catch(err => console.error("그룹 수정 실패:", err));
  };

  // ----------------------------------------
  // 🗑 3. 그룹 삭제 (DELETE /study-groups/{id})
  // ----------------------------------------
  const handleDeleteClick = (group) => {
    setCurrentGroup(group);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = (id) => {
    api.delete(`/study-groups/${id}`)
      .then(() => {
        setGroups(groups.filter(g => g.id !== id));
        setIsDeleteModalOpen(false);
        alert(`그룹 ${id} 삭제 완료`);
      })
      .catch(err => console.error("그룹 삭제 실패:", err));
  };

  // ----------------------------------------
  // ⚙ 4. 그룹 상태 변경 모달 열기
  // ----------------------------------------
  const handleStatusChangeClick = (group, action) => {
    setCurrentGroup(group);
    setTargetAction(action);
    setIsStatusModalOpen(true);
  };

  // ----------------------------------------
  // ⚙ 5. 그룹 상태 변경 (PATCH /study-groups/{id})
  // ----------------------------------------
  const handleStatusChangeConfirm = (id, action) => {
    let newStatus = null;

    if (action === "Activate") newStatus = "Active";
    else if (action === "Deactivate") newStatus = "Inactive";
    else if (action === "Pending") newStatus = "Pending";

    if (!newStatus) {
      console.error("Unknown action:", action);
      return;
    }

    api.patch(`/study-groups/${id}`, { status: newStatus })
      .then(() => {
        setGroups(groups.map(g =>
          g.id === id ? { ...g, status: newStatus } : g
        ));
        setIsStatusModalOpen(false);
        alert(`그룹 상태가 '${newStatus}'로 변경되었습니다.`);
      })
      .catch(err => console.error("그룹 상태 변경 실패:", err));
  };

  // 그룹 상태 텍스트 변환
  const getStatusLabel = (status) => {
    switch (status) {
      case "Pending": return "대기중";
      case "Active": return "활성";
      case "Inactive": return "비활성";
      default: return status;
    }
  };

  // 상태 버튼 렌더링
  const renderStatusButtons = (group) => {
    if (group.status === "Pending") {
      return (
        <>
          <button className="btn btn-success btn-sm me-2"
            onClick={() => handleStatusChangeClick(group, "Activate")}>
            활성화
          </button>

          <button className="btn btn-warning btn-sm me-2"
            onClick={() => handleStatusChangeClick(group, "Deactivate")}>
            비활성화
          </button>
        </>
      );
    } else if (group.status === "Active") {
      return (
        <button className="btn btn-warning btn-sm me-2"
          onClick={() => handleStatusChangeClick(group, "Deactivate")}>
          비활성화
        </button>
      );
    } else {
      return (
        <button className="btn btn-success btn-sm me-2"
          onClick={() => handleStatusChangeClick(group, "Activate")}>
          활성화
        </button>
      );
    }
  };

  const handleStatsClick = () => setIsStatsModalOpen(true);

  return (
    <div>
      <h2>📚 스터디 그룹 관리</h2>

      {/* 검색 + 통계 버튼 */}
      <div className="d-flex justify-content-between mb-3">
        <input type="text" className="form-control w-25" placeholder="그룹명 검색" />
        <button className="btn btn-secondary" onClick={handleStatsClick}>
          📊 통계 확인
        </button>
      </div>

      {/* 그룹 목록 테이블 */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>그룹명</th>
            <th>카테고리</th>
            <th>리더</th>
            <th>인원</th>
            <th>상태</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(g => (
            <tr key={g.id}>
              <td>{g.id}</td>
              <td>{g.title}</td>
              <td>{g.category}</td>
              <td>{g.leaderName}</td>
              <td>{g.memberCount}/{g.max}</td>
              <td>{getStatusLabel(g.status)}</td>
              <td>
                <button className="btn btn-info btn-sm me-2"
                  onClick={() => handleEditClick(g)}>수정</button>

                {renderStatusButtons(g)}

                <button className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteClick(g)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 모달들 */}
      {isEditModalOpen && (
        <GroupEditModal
          show={isEditModalOpen}
          group={currentGroup}
          onSave={handleSave}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {isDeleteModalOpen && (
        <GroupDeleteModal
          show={isDeleteModalOpen}
          group={currentGroup}
          onConfirm={handleDeleteConfirm}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}

      {isStatusModalOpen && (
        <GroupStatusChangeModal
          show={isStatusModalOpen}
          group={currentGroup}
          targetAction={targetAction}
          onConfirm={handleStatusChangeConfirm}
          onClose={() => setIsStatusModalOpen(false)}
        />
      )}

      {isStatsModalOpen && (
        <StatsModal show={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} />
      )}
    </div>
  );
};

export default GroupList;
