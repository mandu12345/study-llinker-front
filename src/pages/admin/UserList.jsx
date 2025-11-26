import React, { useState, useEffect } from "react";
import api from "../../api/axios";

// 모달
import UserEditModal from "./UserEditModal";
import UserDeleteModal from "./UserDeleteModal";
import StatusChangeModal from "./StatusChangeModal";

// ---------------------------------------------
// 🔵 사용자 목록 테이블 컴포넌트
// ---------------------------------------------
const UserTable = ({ users, onEdit, onDelete, onStatusChange }) => {
    const renderStatusButtons = (user) => {
        if (user.status === "Active") {
            return (
                <button
                    className="btn btn-secondary btn-sm me-2"
                    onClick={() => onStatusChange(user, "Inactive")}
                >
                    비활성화
                </button>
            );
        }
        return (
            <button
                className="btn btn-success btn-sm me-2"
                onClick={() => onStatusChange(user, "Active")}
            >
                활성화
            </button>
        );
    };

    return (
        <table className="table table-striped">
            <thead>
                <tr>
                    <th>ID</th><th>아이디</th><th>이름</th><th>이메일</th><th>권한</th><th>상태</th><th>액션</th>
                </tr>
            </thead>
            <tbody>
                {users.map(u => (
                    <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.username}</td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td>{u.status}</td>
                        <td>
                            <button className="btn btn-info btn-sm me-2" onClick={() => onEdit(u)}>
                                수정
                            </button>
                            {renderStatusButtons(u)}
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => onDelete(u)}
                            >
                                삭제
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};


// ---------------------------------------------
// 🔵 전체 출석 조회 테이블 컴포넌트
// ---------------------------------------------
const AllAttendanceTable = () => {
    const [attendance, setAttendance] = useState([]);

    useEffect(() => {
        api.get("/attendance")
            .then(res => setAttendance(res.data))
            .catch(err => console.error("출석 조회 실패:", err));
    }, []);

    return (
        <div>
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
                    {attendance.map(a => (
                        <tr key={a.attendance_id}>
                            <td>{a.attendance_id}</td>
                            <td>{a.user_id}</td>
                            <td>{a.schedule_id}</td>
                            <td>{a.status}</td>
                            <td>{a.checked_at}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


// ---------------------------------------------
// 🔵 메인 UserList (탭 포함)
// ---------------------------------------------
const UserList = () => {
    const [activeTab, setActiveTab] = useState("users");
    const [users, setUsers] = useState([]);

    // 모달 관리
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // 사용자 데이터 가져오기
    useEffect(() => {
        api.get("/users")
            .then(res => setUsers(res.data))
            .catch(err => console.error("사용자 목록 불러오기 실패:", err));
    }, []);

    // 수정
    const handleEdit = (user) => {
        setCurrentUser(user);
        setIsEditModalOpen(true);
    };

    // 저장
    const handleSave = (updatedUser) => {
        api.put(`/users/${updatedUser.id}`, updatedUser)
            .then(() => {
                setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
                setIsEditModalOpen(false);
                alert("사용자 정보 수정 완료");
            });
    };

    // 삭제
    const handleDeleteClick = (user) => {
        setCurrentUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = (id) => {
        api.delete(`/users/${id}`)
            .then(() => {
                setUsers(users.filter(u => u.id !== id));
                setIsDeleteModalOpen(false);
            });
    };

    // 상태 변경
    const handleStatusChange = (user, newStatus) => {
        setCurrentUser({ ...user, targetStatus: newStatus });
        setIsStatusModalOpen(true);
    };

    const handleStatusChangeConfirm = (id, newStatus) => {
        api.patch(`/users/${id}`, { status: newStatus })
            .then(() => {
                setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
                setIsStatusModalOpen(false);
            });
    };

    return (
        <div>
            <h2>👥 사용자 관리</h2>

            {/* 🔥 탭 UI */}
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
                        className={`nav-link ${activeTab === "attendance" ? "active" : ""}`}
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
