// src/pages/admin/UserList.jsx

import React, { useState, useEffect } from "react";
import api from "../../api/axios";

import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { MdPeopleAlt } from "react-icons/md";

import UserEditModal from "./UserEditModal";
import UserDeleteModal from "./UserDeleteModal";
import StatusChangeModal from "./StatusChangeModal";

// ------------------------------------------------------
// 🔵 사용자 목록 테이블
// ------------------------------------------------------
const UserTable = ({ users, onEdit, onDelete, onStatusChange }) => {
  const renderStatusButtons = (user) => {
    if (user.status === "Active") {
      return (
        <button
          className="btn btn-outline-secondary btn-sm me-2"
          onClick={() => onStatusChange(user, "Inactive")}
        >
          <FaToggleOff className="me-1" /> 비활성화
        </button>
      );
    }
    return (
      <button
        className="btn btn-outline-success btn-sm me-2"
        onClick={() => onStatusChange(user, "Active")}
      >
        <FaToggleOn className="me-1" /> 활성화
      </button>
    );
  };

  return (
    <table className="table table-hover align-middle">
      <thead className="table-light">
        <tr>
          <th>ID</th>
          <th>아이디</th>
          <th>이름</th>
          <th>이메일</th>
          <th>권한</th>
          <th>상태</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.userId}>
            <td>{u.userId}</td>
            <td>{u.username}</td>
            <td>{u.name}</td>
            <td>{u.email}</td>
            <td>{u.role}</td>
            <td>
              {u.status === "Active" ? (
                <span className="badge bg-success">활성</span>
              ) : (
                <span className="badge bg-secondary">비활성</span>
              )}
            </td>
            <td>
              <button
                className="btn btn-outline-info btn-sm me-2"
                onClick={() => onEdit(u)}
              >
                <FaEdit className="me-1" /> 수정
              </button>

              {renderStatusButtons(u)}

              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => onDelete(u)}
              >
                <FaTrash className="me-1" /> 삭제
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// ------------------------------------------------------
// 🔵 메인 UserList
// ------------------------------------------------------
const UserList = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // ✅ 관리자 전용 사용자 목록 API
  useEffect(() => {
    api
      .get("/admin/users")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.error("관리자 사용자 목록 불러오기 실패:", err);
        alert("관리자 권한이 없거나 서버 오류입니다.");
      });
  }, []);

  // 🔵 수정
  const handleEdit = (user) => {
    setCurrentUser(user);
    setIsEditModalOpen(true);
  };

  const handleSave = async (updatedUser) => {
    try {
      await api.put(`/admin/users/${updatedUser.userId}`, updatedUser);
      setUsers((prev) =>
        prev.map((u) => (u.userId === updatedUser.userId ? updatedUser : u))
      );
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("관리자 수정 실패:", err);
      alert("수정 실패");
    }
  };

  // 🔵 삭제
  const handleDeleteClick = (user) => {
    setCurrentUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("관리자 삭제 실패:", err);
      alert("삭제 실패");
    }
  };

  // 🔵 상태 변경
  const handleStatusChange = (user, newStatus) => {
    setCurrentUser({ ...user, targetStatus: newStatus });
    setIsStatusModalOpen(true);
  };

  const handleStatusChangeConfirm = async (userId, newStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      setUsers((prev) =>
        prev.map((u) =>
          u.userId === userId ? { ...u, status: newStatus } : u
        )
      );
      setIsStatusModalOpen(false);
    } catch (err) {
      console.error("상태 변경 실패:", err);
      alert("상태 변경 실패");
    }
  };

  return (
    <div>
      <h2 className="mb-4">
        <MdPeopleAlt size={28} className="me-2" />
        관리자 - 사용자 관리
      </h2>

      <UserTable
        users={users}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onStatusChange={handleStatusChange}
      />

      {/* 모달 */}
      {isEditModalOpen && currentUser && (
        <UserEditModal
          user={currentUser}
          onSave={handleSave}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {isDeleteModalOpen && currentUser && (
        <UserDeleteModal
          show={isDeleteModalOpen}
          user={currentUser}
          onConfirm={handleDeleteConfirm}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}

      {isStatusModalOpen && currentUser && (
        <StatusChangeModal
          show={isStatusModalOpen}
          user={currentUser}
          targetStatus={currentUser.targetStatus}
          onConfirm={handleStatusChangeConfirm}
          onClose={() => setIsStatusModalOpen(false)}
        />
      )}
    </div>
  );
};

export default UserList;