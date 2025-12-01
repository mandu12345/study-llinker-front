// src/pages/admin/UserList.jsx

import React, { useState, useEffect } from "react";
import api from "../../api/axios";

import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { MdPeopleAlt } from "react-icons/md";

import UserEditModal from "./UserEditModal";
import UserDeleteModal from "./UserDeleteModal";
import StatusChangeModal from "./StatusChangeModal";

// ------------------------------------------------------
// 🔵 사용자 목록 테이블 (더미 + API 데이터)
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
// 🔵 전체 출석 조회 테이블 (더미 유지)
// ------------------------------------------------------
const AllAttendanceTable = () => {
    const [attendance, setAttendance] = useState([
        {
            attendanceId: 1,
            userId: 1,
            scheduleId: 101,
            status: "PRESENT",
            checkedAt: "2025-01-10 10:00:00"
        },
        {
            attendanceId: 2,
            userId: 2,
            scheduleId: 101,
            status: "LATE",
            checkedAt: "2025-01-10 10:05:00"
        }
    ]);

    useEffect(() => {
        api.get("/attendance")
            .then((res) => {
                if (Array.isArray(res.data) && res.data.length > 0) {
                    setAttendance(res.data);
                }
            })
            .catch((err) => console.error("출석 조회 실패 (더미 유지):", err));
    }, []);

    return (
        <div className="mt-4">
            <h4>🗓 전체 출석 현황</h4>

            <table className="table table-striped mt-3">
                <thead>
                    <tr>
                        <th>출석ID</th>
                        <th>사용자ID</th>
                        <th>일정ID</th>
                        <th>상태</th>
                        <th>출석 시간</th>
                    </tr>
                </thead>

                <tbody>
                    {attendance.map((a) => (
                        <tr key={a.attendanceId}>
                            <td>{a.attendanceId}</td>
                            <td>{a.userId}</td>
                            <td>{a.scheduleId}</td>
                            <td>{a.status}</td>
                            <td>{a.checkedAt}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// ------------------------------------------------------
// 🔵 메인 UserList (더미 + API 대체 구조 유지)
// ------------------------------------------------------
const UserList = () => {
    const [activeTab, setActiveTab] = useState("users");

    const [users, setUsers] = useState([
        // ⭐ 더미 데이터
        {
            userId: 1,
            username: "student01",
            name: "홍길동",
            email: "hong@example.com",
            role: "USER",
            status: "Active"
        },
        {
            userId: 2,
            username: "leader01",
            name: "김리더",
            email: "leader@example.com",
            role: "LEADER",
            status: "Inactive"
        }
    ]);

    const [currentUser, setCurrentUser] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    // 🔥 API가 성공하면 API 데이터로 교체
    useEffect(() => {
        api.get("/users")
            .then((res) => {
                if (Array.isArray(res.data) && res.data.length > 0) {
                    setUsers(res.data);
                } else {
                    console.warn("API 사용자 목록 없음 → 더미 유지");
                }
            })
            .catch((err) => console.error("사용자 목록 불러오기 실패 → 더미 유지:", err));
    }, []);

    // 🔵 수정
    const handleEdit = (user) => {
        setCurrentUser(user);
        setIsEditModalOpen(true);
    };

    const handleSave = (updatedUser) => {
        api.put(`/users/${updatedUser.userId}`, updatedUser).then(() => {
            setUsers(
                users.map((u) =>
                    u.userId === updatedUser.userId ? updatedUser : u
                )
            );
            setIsEditModalOpen(false);
        });
    };

    // 🔵 삭제
    const handleDeleteClick = (user) => {
        setCurrentUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = (userId) => {
        api.delete(`/users/${userId}`).then(() => {
            setUsers(users.filter((u) => u.userId !== userId));
            setIsDeleteModalOpen(false);
        });
    };

    // 🔵 상태 변경
    const handleStatusChange = (user, newStatus) => {
        setCurrentUser({ ...user, targetStatus: newStatus });
        setIsStatusModalOpen(true);
    };

    const handleStatusChangeConfirm = (userId, newStatus) => {
        api.patch(`/users/${userId}`, { status: newStatus }).then(() => {
            setUsers(
                users.map((u) =>
                    u.userId === userId ? { ...u, status: newStatus } : u
                )
            );
            setIsStatusModalOpen(false);
        });
    };

    return (
        <div>
            <h2 className="mb-4">
                <MdPeopleAlt size={28} className="me-2" />
                사용자 관리
            </h2>

            {/* 🔥 탭 */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === "users" ? "active" : ""}`}
                        onClick={() => setActiveTab("users")}
                    >
                        사용자 목록
                    </button>
                </li>

                <li className="nav-item">
                    <button
                        className={`nav-link ${
                            activeTab === "attendance" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("attendance")}
                    >
                        전체 출석 조회
                    </button>
                </li>
            </ul>

            {/* 🔥 탭별 화면 */}
            {activeTab === "users" && (
                <UserTable
                    users={users}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onStatusChange={handleStatusChange}
                />
            )}

            {activeTab === "attendance" && <AllAttendanceTable />}

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
