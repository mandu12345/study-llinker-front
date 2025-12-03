import React from 'react';

const UserDeleteModal = ({ show, user, onConfirm, onClose }) => {
    if (!show) return null;

    return (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-sm">
                <div className="modal-content">

                    <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title">사용자 삭제 확인</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        <p>
                            정말로 사용자 <strong>{user.name} ({user.username})</strong>님을<br />
                            영구 삭제하시겠습니까?
                        </p>
                        <p className="text-danger small">이 작업은 취소할 수 없습니다.</p>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            취소
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => onConfirm(user.userId)}  // ⭐ 수정: user.id → user.userId
                        >
                            영구 삭제
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default UserDeleteModal;
