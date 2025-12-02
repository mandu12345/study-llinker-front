import React from 'react';

const GroupStatusChangeModal = ({ show, group, targetAction, onConfirm, onClose }) => {
    if (!show) return null;

    // action → status 맵핑
    let actionText = "";
    let buttonClass = "";

    switch (targetAction) {
        case "Activate":
            actionText = "활성화 (Active)";
            buttonClass = "btn-success";
            break;
        case "Deactivate":
            actionText = "비활성화 (Inactive)";
            buttonClass = "btn-warning";
            break;
        case "Pending":
            actionText = "대기 상태로 변경 (Pending)";
            buttonClass = "btn-secondary";
            break;
        default:
            actionText = "상태 변경";
            buttonClass = "btn-primary";
    }

    return (
        <div className="modal show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-sm">
                <div className="modal-content">

                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">그룹 상태 변경</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body text-center">
                        <p>
                            그룹 <strong>[{group?.title}]</strong>의 상태를  
                            <span className="fw-bold text-primary"> [{actionText}] </span>
                            로 변경하시겠습니까?
                        </p>
                    </div>

                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>취소</button>
                        <button
                            className={`btn ${buttonClass}`}
                            onClick={() => onConfirm(group.groupId, targetAction)}
                        >
                            확인
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default GroupStatusChangeModal;
