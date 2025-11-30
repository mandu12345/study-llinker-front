import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";   // 라우팅 위해 추가
import api from "../../api/axios";

import GroupDeleteModal from "./GroupDeleteModal";
import GroupStatusChangeModal from "./GroupStatusChangeModal";
import StatsModal from "./StatsModal";

const GroupList = () => {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([
    {
      groupId: 1,
      title: "자바 스터디",
      category: "Programming",
      leaderId: 101,
      maxMembers: 3,
      max: 5,
      status: "Active"
    },
    {
      groupId: 2,
      title: "면접 대비 스터디",
      category: "Career",
      leaderId: 102,
      maxMembers: 5,
      max: 5,
      status: "Pending"
    },
    {
      groupId: 3,
      title: "알고리즘 스터디",
      category: "Algorithm",
      leaderId: 103,
      maxMembers: 2,
      max: 6,
      status: "Inactive"
    },
    {
      groupId: 4,
      title: "React 프론트엔드 스터디",
      category: "Frontend",
      leaderId: 104,
      maxMembers: 4,
      max: 8,
      status: "Active"
    }
  ]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  const [currentGroup, setCurrentGroup] = useState(null);
  const [targetAction, setTargetAction] = useState(null);

  // 🔹 전체 조회
  useEffect(() => {
    api
      .get("/study-groups")
      .then((res) => setGroups(res.data))
      .catch((err) => console.error("그룹 목록 조회 실패:", err));
  }, []);

  // 🔹 삭제
  const handleDeleteClick = (group) => {
    setCurrentGroup(group);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = (groupId) => {
    api
      .delete(`/study-groups/${groupId}`)
      .then(() => {
        setGroups(groups.filter((g) => g.groupId !== groupId));
        setIsDeleteModalOpen(false);
      });
  };

  // 🔹 상태 변경
  const handleStatusChangeClick = (group, action) => {
    setCurrentGroup(group);
    setTargetAction(action);
    setIsStatusModalOpen(true);
  };

  const handleStatusChangeConfirm = (groupId, action) => {
    let newStatus = null;

    if (action === "Activate") newStatus = "Active";
    else if (action === "Deactivate") newStatus = "Inactive";
    else if (action === "Pending") newStatus = "Pending";

    api
      .patch(`/study-groups/${groupId}`, { status: newStatus })
      .then(() => {
        setGroups(
          groups.map((g) =>
            g.groupId === groupId ? { ...g, status: newStatus } : g
          )
        );
        setIsStatusModalOpen(false);
      });
  };

  // 상태 표시 한국어 변환
  const getStatusLabel = (status) => {
    switch (status) {
      case "Pending":
        return "대기중";
      case "Active":
        return "활성";
      case "Inactive":
        return "비활성";
      default:
        return status;
    }
  };

  // 버튼 렌더링
  const renderStatusButtons = (g) => {
    if (g.status === "Pending") {
      return (
        <>
          <button
            className="btn btn-success btn-sm me-2"
            onClick={() => handleStatusChangeClick(g, "Activate")}
          >
            활성화
          </button>
          <button
            className="btn btn-warning btn-sm me-2"
            onClick={() => handleStatusChangeClick(g, "Deactivate")}
          >
            비활성화
          </button>
        </>
      );
    } else if (g.status === "Active") {
      return (
        <button
          className="btn btn-warning btn-sm me-2"
          onClick={() => handleStatusChangeClick(g, "Deactivate")}
        >
          비활성화
        </button>
      );
    } else {
      return (
        <button
          className="btn btn-success btn-sm me-2"
          onClick={() => handleStatusChangeClick(g, "Activate")}
        >
          활성화
        </button>
      );
    }
  };

  const handleStatsClick = () => setIsStatsModalOpen(true);

  return (
    <div>
      <h2>📚 스터디 그룹 관리</h2>

      <div className="d-flex justify-content-between mb-3">
        <input className="form-control w-25" placeholder="그룹명 검색" />
        <button className="btn btn-secondary" onClick={handleStatsClick}>
          📊 통계 확인
        </button>
      </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>그룹명</th>
            <th>카테고리</th>
            <th>리더ID</th>
            <th>최대인원</th>
            <th>상태</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g.groupId}>
              <td>{g.groupId}</td>
              <td>{g.title}</td>
              <td>{g.category}</td>
              <td>{g.leaderId}</td>
              <td>
                {g.maxMembers}/{g.max}
              </td>
              <td>{getStatusLabel(g.status)}</td>

              <td>
                {/* 🔵 수정 페이지로 이동 */}
                <button
                  className="btn btn-info btn-sm me-2"
                  onClick={() =>
                    navigate(`/admin/groups/edit/${g.groupId}`)
                  }
                >
                  수정
                </button>

                {renderStatusButtons(g)}

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteClick(g)}
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 모달들 */}
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
        <StatsModal
          show={isStatsModalOpen}
          onClose={() => setIsStatsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default GroupList;
