// src/pages/admin/UserList.jsx

import React, { useState } from "react";

// (새로 생성한) 사용자 관련 모달 컴포넌트들을 import 합니다.
import UserEditModal from './UserEditModal'; 
import UserDeleteModal from './UserDeleteModal'; // 삭제 확인 모달 추가
import StatusChangeModal from './StatusChangeModal'; // 상태 변경 확인 모달 추가

const dummyUsers = [
    { id: 1, username: "testuser", name: "홍길동", email: "hong@test.com", role: "USER", status: "Active" },
    { id: 2, username: "admin", name: "관리자", email: "admin@test.com", role: "ADMIN", status: "Active" },
    { id: 3, username: "banneduser", name: "문제계정", email: "ban@test.com", role: "USER", status: "Suspended" },
    { id: 4, username: "inactive", name: "휴면계정", email: "sleep@test.com", role: "USER", status: "Inactive" },
];

const UserList = () => {
    const [users, setUsers] = useState(dummyUsers);
    
    // 모달 상태 관리
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // 삭제 모달 상태 추가
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false); // 상태 변경 모달 상태 추가

    const [currentUser, setCurrentUser] = useState(null); // 현재 작업 대상 사용자

    // ------------------------------------------------
    // 🗑️ 삭제 관련 로직 (Modal로 변경)
    // ------------------------------------------------
    const handleDeleteClick = (user) => {
        setCurrentUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = (id) => {
        setUsers(users.filter((u) => u.id !== id));
        setIsDeleteModalOpen(false);
        alert(`✅ 사용자 ${id}번이 영구 삭제되었습니다.`);
    };
    // ------------------------------------------------


    // ------------------------------------------------
    // ⚠️ 상태 변경 관련 로직 (Modal로 변경)
    // ------------------------------------------------
    const handleStatusChangeClick = (user, targetStatus) => {
        setCurrentUser({ ...user, targetStatus }); // 현재 사용자 정보와 목표 상태를 함께 저장
        setIsStatusModalOpen(true);
    };

    const handleStatusChangeConfirm = (id, newStatus) => {
        setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
        setIsStatusModalOpen(false);
        alert(`✅ 사용자 ${id}번의 상태가 ${newStatus}로 변경되었습니다.`);
    };

    const renderStatusButtons = (user) => {
        // ... (이전과 동일한 로직, 클릭 이벤트만 Modal 호출로 변경)
        if (user.status === "Active") {
            return (
                <>
                
                    <button className="btn btn-secondary btn-sm me-2" onClick={() => handleStatusChangeClick(user, "Inactive")}>
                        비활성화
                    </button>
                </>
            );
        } else if (user.status === "Suspended" || user.status === "Inactive") {
            return (
                <button className="btn btn-success btn-sm me-2" onClick={() => handleStatusChangeClick(user, "Active")}>
                    활성화
                </button>
            );
        }
        return null;
    };
    // ------------------------------------------------


    // 📝 수정 모달 열기/저장 로직 (Modal 상태 이름만 변경)
    const handleEdit = (user) => {
        setCurrentUser(user);
        setIsEditModalOpen(true);
    };

    const handleSave = (updatedUser) => {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        setIsEditModalOpen(false);
        setCurrentUser(null);
        alert(`✅ ${updatedUser.name} 님의 정보가 수정되었습니다.`);
    };

    return (
        <div>
            <h2>👥 사용자 관리</h2>
            
            {/* 필터링 및 검색 UI 틀 (생략) */}

            <table className="table table-striped">
                {/* ... (테이블 헤더/바디는 변경 없음) ... */}
                <thead>
                    <tr>
                        <th>ID</th><th>아이디</th><th>이름</th><th>이메일</th><th>권한</th><th>상태</th><th>액션</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.username}</td>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>{u.status}</td>
                            <td>
                                <button className="btn btn-info btn-sm me-2" onClick={() => handleEdit(u)}>
                                    수정
                                </button>
                                {renderStatusButtons(u)}
                                {/* 삭제 버튼 클릭 이벤트 변경 */}
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteClick(u)}>
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

            {/* 사용자 정보 수정 모달 (F-S-UM-003) */}
            {isEditModalOpen && currentUser && (
                <UserEditModal 
                    user={currentUser} 
                    onSave={handleSave} 
                    onClose={() => setIsEditModalOpen(false)} 
                />
            )}
            
            {/* 사용자 삭제 확인 모달 */}
            {isDeleteModalOpen && currentUser && (
                <UserDeleteModal
                    show={isDeleteModalOpen}
                    user={currentUser}
                    onConfirm={handleDeleteConfirm}
                    onClose={() => setIsDeleteModalOpen(false)}
                />
            )}

            {/* 상태 변경 확인 모달 (정지/비활성화/활성화) */}
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