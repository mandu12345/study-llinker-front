import React, { useState, useEffect } from "react";
import api from "../../axios";

// 모달
import UserEditModal from "./UserEditModal";
import UserDeleteModal from "./UserDeleteModal";
import StatusChangeModal from "./StatusChangeModal";

const UserList = () => {
    const [users, setUsers] = useState([]);

    // 모달 상태
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    const [currentUser, setCurrentUser] = useState(null);

    // -----------------------------
    // ✅ 사용자 전체 조회 API
    // -----------------------------
    useEffect(() => {
        api.get("/users")
            .then(res => setUsers(res.data))
            .catch(err => console.error("사용자 목록 불러오기 실패:", err));
    }, []);

    // -----------------------------
    // 📝 수정하기
    // -----------------------------
    const handleEdit = (user) => {
        setCurrentUser(user);
        setIsEditModalOpen(true);
    };

    const handleSave = (updatedUser) => {
        api.put(`/users/${updatedUser.id}`, updatedUser)
            .then(() => {
                setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
                setIsEditModalOpen(false);
                alert("사용자 정보 수정 완료");
            })
            .catch(err => console.error("사용자 수정 실패:", err));
    };

    // -----------------------------
    // 🗑 삭제
    // -----------------------------
    const handleDeleteClick = (user) => {
        setCurrentUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = (id) => {
        api.delete(`/users/${id}`)
            .then(() => {
                setUsers(users.filter(u => u.id !== id));
                setIsDeleteModalOpen(false);
                alert("사용자 삭제 완료");
            })
            .catch(err => console.error("사용자 삭제 실패:", err));
    };

    // -----------------------------
    // ⚠ 상태 변경
    // -----------------------------
    const handleStatusChangeClick = (user, newStatus) => {
        setCurrentUser({ ...user, targetStatus: newStatus });
        setIsStatusModalOpen(true);
    };

    const handleStatusChangeConfirm = (id, newStatus) => {
        api.patch(`/users/${id}`, { status: newStatus })
            .then(() => {
                setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
                setIsStatusModalOpen(false);
                alert("상태 변경 완료");
            })
            .catch(err => console.error("상태 변경 실패:", err));
    };

    const renderStatusButtons = (user) => {
        if (user.status === "Active") {
            return (
                <button className="btn btn-secondary btn-sm me-2"
                    onClick={() => handleStatusChangeClick(user, "Inactive")}>
                    비활성화
                </button>
            );
        } else {
            return (
                <button className="btn btn-success btn-sm me-2"
                    onClick={() => handleStatusChangeClick(user, "Active")}>
                    활성화
                </button>
            );
        }
    };

    return (
        <div>
            <h2>👥 사용자 관리</h2>

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
                                <button className="btn btn-info btn-sm me-2" onClick={() => handleEdit(u)}>수정</button>
                                {renderStatusButtons(u)}
                                <button className="btn btn-danger btn-sm"
                                    onClick={() => handleDeleteClick(u)}>
                                    삭제
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

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
