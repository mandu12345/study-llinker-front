import React from 'react';

const GroupStatusChangeModal = ({ show, group, targetAction, onConfirm, onClose }) => {
    if (!show) return null;

    let actionText;
    let buttonClass;

    switch (targetAction) {
        case 'Approve':
            actionText = '승인 (Active)';
            buttonClass = 'btn-success';
            break;
        case 'Reject':
            actionText = '반려 (그룹 삭제)';
            buttonClass = 'btn-danger';
            break;
        case 'Deactivate':
            actionText = '비활성화 (Inactive)';
            buttonClass = 'btn-warning';
            break;
        case 'Activate':
            actionText = '활성화 (Active)';
            buttonClass = 'btn-success';
            break;
        default:
            actionText = '상태 변경';
            buttonClass = 'btn-primary';
    }

    // 모달 UI는 Bootstrap Modal 스타일을 가정합니다.
    return (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-sm">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">그룹 상태 변경 확인</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p>그룹 <strong>[{group.title}]</strong>의 상태를</p>
                        <p className="fw-bold text-center text-xl text-primary">[{actionText}]</p>
                        <p>으로 변경하시겠습니까?</p>
                        {targetAction === 'Reject' && <p className="text-danger small">※ 반려 시 그룹이 목록에서 삭제됩니다.</p>}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>취소</button>
                        <button type="button" className={`btn ${buttonClass}`} onClick={() => onConfirm(group.id, targetAction)}>확인</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupStatusChangeModal;
