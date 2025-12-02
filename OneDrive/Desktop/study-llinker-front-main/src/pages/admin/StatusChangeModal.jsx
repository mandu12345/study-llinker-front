import React from 'react';

const StatusChangeModal = ({ show, user, targetStatus, onConfirm, onClose }) => {
    if (!show) return null;

    const actionText = 
        targetStatus === 'Suspended' ? '정지' : 
        targetStatus === 'Inactive' ? '비활성화' : 
        '활성화';
    
    // 모달 UI는 Bootstrap Modal 스타일을 가정합니다.
    return (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-sm">
                <div className="modal-content">
                    <div className="modal-header bg-warning text-dark">
                        <h5 className="modal-title">상태 변경 확인</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p>사용자 <strong>{user.name}</strong>님의 계정 상태를</p>
                        <p className="fw-bold text-center">[{actionText}]</p>
                        <p>으로 변경하시겠습니까?</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>취소</button>
                        <button type="button" className="btn btn-warning" onClick={() => onConfirm(user.id, targetStatus)}>확인</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatusChangeModal;
