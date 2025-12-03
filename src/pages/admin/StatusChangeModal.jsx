// src/pages/admin/StatusChangeModal.jsx
import React, { useState } from "react";

const StatusChangeModal = ({ user, targetStatus, onClose, onConfirm }) => {
  const [status, setStatus] = useState(targetStatus);

  const handleSubmit = () => {
    onConfirm(user.userId, status); // ⭐ userId 반드시 함께 전달!
  };

  return (
    <div className="modal show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">상태 변경</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              닫기
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              변경
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StatusChangeModal;
