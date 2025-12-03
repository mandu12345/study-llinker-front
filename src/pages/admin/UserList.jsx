// src/pages/admin/UserList.jsx
import React, { useState, useEffect, useContext } from "react";
import api from "../../api/axios";
import { AuthContext } from "../../auth/AuthContext";

import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { MdPeopleAlt } from "react-icons/md";

import UserEditModal from "./UserEditModal";
import UserDeleteModal from "./UserDeleteModal";
import StatusChangeModal from "./StatusChangeModal";


// ------------------------------------------------------
// 사용자 목록 테이블
// ------------------------------------------------------
const UserTable = ({ users, onEdit, onDelete, onStatusChange }) => {
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
                            {u.status === "ACTIVE" ? (
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

                            {u.status === "ACTIVE" ? (
                                <button
                                    className="btn btn-outline-secondary btn-sm me-2"
                                    onClick={() => onStatusChange(u, "INACTIVE")}
                                >
                                    <FaToggleOff className="me-1" /> 비활성화
                                </button>
                            ) : (
                                <button
                                    className="btn btn-outline-success btn-sm me-2"
                                    onClick={() => onStatusChange(u, "ACTIVE")}
                                >
                                    <FaToggleOn className="me-1" /> 활성화
                                </button>
                            )}

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
// 메인 UserList
// ------------------------------------------------------
const UserList = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);

    const [currentUser, setCurrentUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    // 사용자 목록 로드
    useEffect(() => {
        if (!user) return;
        fetchUsers();
    }, [user]);

    const fetchUsers = async () => {
        try {
            const res = await api.get("/admin/users");
            setUsers(res.data);
        } catch (err) {
            console.error("🚨 사용자 목록 불러오기 실패:", err);
        }
    };

    // 수정 모달
    const handleEdit = (u) => {
        setCurrentUser(u);
        setIsEditModalOpen(true);
    };

    const handleSave = async (updatedUser) => {
        try {
            await api.put(`/admin/users/${updatedUser.userId}`, updatedUser);
            setUsers((prev) =>
                prev.map((u) =>
                    u.userId === updatedUser.userId ? updatedUser : u
                )
            );
            setIsEditModalOpen(false);
        } catch (err) {
            console.error("수정 실패:", err);
        }
    };

    // 삭제 모달
    const handleDeleteClick = (u) => {
        setCurrentUser(u);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async (userId) => {
        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers((prev) => prev.filter((u) => u.userId !== userId));
            setIsDeleteModalOpen(false);
        } catch (err) {
            console.error("삭제 실패:", err);
        }
    };

    // 상태 변경 모달
    const handleStatusChange = (userObj, newStatus) => {
        setCurrentUser({ ...userObj, targetStatus: newStatus });
        setIsStatusModalOpen(true);
    };

    const handleStatusChangeConfirm = async (userId, newStatus) => {
        try {
            await api.patch(`/admin/users/${userId}/status`, {
                status: newStatus,
            });

            setUsers((prev) =>
                prev.map((u) =>
                    u.userId === userId ? { ...u, status: newStatus } : u
                )
            );

            setIsStatusModalOpen(false);
        } catch (err) {
            console.error("상태 변경 실패:", err);
        }
    };


    return (
        <div>
            <h2 className="mb-4">
                <MdPeopleAlt size={28} className="me-2" />
                사용자 관리 (관리자)
            </h2>

            <UserTable
                users={users}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onStatusChange={handleStatusChange}
            />

            {/* 모달들 */}
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
