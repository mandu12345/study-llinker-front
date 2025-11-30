// src/pages/admin/UserEditModal.jsx

import React, { useState } from 'react';

// F-S-UM-003: 사용자 데이터 수정 기능을 위한 모달 컴포넌트입니다.
const UserEditModal = ({ user, onSave, onClose }) => {
    // 수정 가능 항목 상태 관리 (이메일, 역할)
    const [editedUser, setEditedUser] = useState({
        ...user,
        email: user.email,
        role: user.role,
        // 신뢰도(점수) 등 추가 관리 항목이 있다면 여기에 포함
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(editedUser); // 수정된 데이터를 부모 컴포넌트로 전달
    };

    // 모달 UI는 Bootstrap Modal 스타일을 가정합니다.
    return (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">사용자 정보 수정: {user.name}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {/* 수정 불가능한 항목 (아이디, ID) */}
                            <div className="mb-3">
                                <label className="form-label">아이디</label>
                                <input type="text" className="form-control" value={editedUser.username} disabled />
                            </div>
                            
                            {/* F-S-UM-003: 이메일 수정 */}
                            <div className="mb-3">
                                <label className="form-label">이메일</label>
                                <input 
                                    type="email" 
                                    className="form-control" 
                                    name="email"
                                    value={editedUser.email} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                            
                            {/* F-S-UM-003: 역할 수정 */}
                            <div className="mb-3">
                                <label className="form-label">권한 (Role)</label>
                                <select 
                                    className="form-select" 
                                    name="role"
                                    value={editedUser.role} 
                                    onChange={handleChange}
                                >
                                    <option value="MEMBER">MEMBER (일반 사용자)</option>
                                    <option value="LEADER">LEADER (리더)</option>
                                </select>
                            </div>
                            
                            {/* (필요 시 신뢰도 점수, 관심사 등 추가 수정 항목 삽입) */}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>닫기</button>
                            <button type="submit" className="btn btn-primary">저장 (수정 완료)</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserEditModal;