// src/pages/admin/GroupList.jsx

import React, { useState } from "react";
import GroupEditModal from "./GroupEditModal"; // 그룹 수정 모달
import GroupDeleteModal from "./GroupDeleteModal"; // 그룹 삭제 모달
import GroupStatusChangeModal from "./GroupStatusChangeModal"; // 그룹 상태 변경 모달
import StatsModal from './StatsModal'; // 통계 모달 (추가)

const dummyGroups = [
  { id: 1, title: "Java 스터디", leader: "홍길동", members: 5, max: 10, status: "Pending", category: "IT" },
  { id: 2, title: "AI 스터디", leader: "이호주", members: 8, max: 10, status: "Active", category: "AI" },
  { id: 3, title: "파이썬 기초", leader: "김철수", members: 3, max: 5, status: "Active", category: "IT" },
  { id: 4, title: "자유 독서 모임", leader: "박영희", members: 2, max: 10, status: "Inactive", category: "Culture" },
];

const GroupList = () => {
  const [groups, setGroups] = useState(dummyGroups);

  // 모달 상태 관리
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false); // 📊 통계 모달 상태 추가

  const [currentGroup, setCurrentGroup] = useState(null); 
  const [targetAction, setTargetAction] = useState(null); 

  // ------------------------------------------------
  // 🗑️ 삭제 로직
  // ------------------------------------------------
  const handleDeleteClick = (group) => {
    setCurrentGroup(group);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = (id) => {
    setGroups(groups.filter((g) => g.id !== id));
    setIsDeleteModalOpen(false);
    alert(`✅ 그룹 ${id}번이 영구 삭제되었습니다.`);
  };

  // ------------------------------------------------
  // 📝 수정 로직
  // ------------------------------------------------
  const handleEditClick = (group) => {
    setCurrentGroup(group);
    setIsEditModalOpen(true);
  };

  const handleSave = (updatedGroup) => {
    setGroups(groups.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)));
    setIsEditModalOpen(false);
    alert(`✅ 그룹 [${updatedGroup.title}] 정보가 수정되었습니다.`);
  };

  // ⚠️ 상태 변경 로직
  const handleStatusChangeClick = (group, action) => {
    setCurrentGroup(group);
    setTargetAction(action);
    setIsStatusModalOpen(true);
  };

  const handleStatusChangeConfirm = (id, action) => {
    let message = '';
    let updatedGroups = groups;

    if (action === 'Approve' || action === 'Activate') {
      message = '활성화';
      updatedGroups = groups.map((g) => (g.id === id ? { ...g, status: 'Active' } : g));
    } else if (action === 'Deactivate') {
      message = '비활성화';
      updatedGroups = groups.map((g) => (g.id === id ? { ...g, status: 'Inactive' } : g));
    } else if (action === 'Reject') {
      message = '반려 및 삭제';
      updatedGroups = groups.filter((g) => g.id !== id); 
    }

    setGroups(updatedGroups);
    setIsStatusModalOpen(false);
    alert(`✅ 그룹 ${id}번이 [${message}] 처리되었습니다.`);
  };

  // F-S-GM-003: 상태에 따른 버튼 렌더링 로직
  const renderStatusButtons = (group) => {
    if (group.status === "Pending") {
      return (
        <>
          <button className="btn btn-success btn-sm me-2" onClick={() => handleStatusChangeClick(group, 'Approve')}>승인</button>
          <button className="btn btn-warning btn-sm me-2" onClick={() => handleStatusChangeClick(group, 'Reject')}>반려</button>
        </>
      );
    } else if (group.status === "Active") {
      return (
        <button className="btn btn-warning btn-sm me-2" onClick={() => handleStatusChangeClick(group, 'Deactivate')}>비활성화</button>
      );
    } else if (group.status === "Inactive") {
      return (
        <button className="btn btn-success btn-sm me-2" onClick={() => handleStatusChangeClick(group, 'Activate')}>활성화</button>
      );
    }
    return null;
  };
    
  // 📊 통계 확인 버튼 클릭 이벤트 (모달 열기)
  const handleStatsClick = () => {
    setIsStatsModalOpen(true);
  };


  return (
    <div>
      <h2>📚 스터디 그룹 관리 </h2>

      {/* F-S-GM-001: 필터링 및 통계 UI 틀 추가 */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* F-S-GM-001: 필터링 */}
        <input type="text" className="form-control w-25 me-2" placeholder="그룹명 검색 " />
        {/* F-S-GM-006: 스터디 통계 확인 버튼 */}
        <button className="btn btn-secondary" onClick={handleStatsClick}>
          📊 통계 확인
        </button>
      </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>그룹명 </th>
            <th>카테고리 </th>
            <th>리더</th>
            <th>인원</th>
            <th>상태 </th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g.id}>
              <td>{g.id}</td>
              <td>{g.title}</td>
              <td>{g.category}</td>
              <td>{g.leader}</td>
              <td>{g.members}/{g.max}</td>
              <td>{g.status}</td>
              <td>
                <button className="btn btn-info btn-sm me-2" onClick={() => handleEditClick(g)}>
                  상세/수정
                </button>
                {renderStatusButtons(g)}
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteClick(g)}>
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ==================================== */}
      {/* 💡 모달 렌더링 영역 */}
      {/* ==================================== */}

      {/* 그룹 정보 수정 모달 (F-S-GM-002) */}
      {isEditModalOpen && currentGroup && (
        <GroupEditModal
          show={isEditModalOpen}
          group={currentGroup}
          onSave={handleSave}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* 그룹 삭제 확인 모달 */}
      {isDeleteModalOpen && currentGroup && (
        <GroupDeleteModal
          show={isDeleteModalOpen}
          group={currentGroup}
          onConfirm={handleDeleteConfirm}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}

      {/* 그룹 상태 변경 확인 모달 */}
      {isStatusModalOpen && currentGroup && targetAction && (
        <GroupStatusChangeModal
          show={isStatusModalOpen}
          group={currentGroup}
          targetAction={targetAction}
          onConfirm={handleStatusChangeConfirm}
          onClose={() => setIsStatusModalOpen(false)}
        />
      )}
      
      {/* 📊 통계 확인 모달 추가 */}
      {isStatsModalOpen && (
        <StatsModal
          show={isStatsModalOpen}
          onClose={() => setIsStatsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default GroupList;