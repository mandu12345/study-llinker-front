// src/pages/admin/UserEditModal.jsx
import React, { useState } from "react";

const UserEditModal = ({ user, onSave, onClose }) => {
  const [editedUser, setEditedUser] = useState({
    userId: user.userId,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedUser);
  };

  return (
    <div className="modal show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">사용자 정보 수정</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">

              <div className="mb-3">
                <label>아이디</label>
                <input className="form-control" value={editedUser.username} disabled />
              </div>

              <div className="mb-3">
                <label>이름</label>
                <input
                  className="form-control"
                  name="name"
                  value={editedUser.name}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label>이메일</label>
                <input
                  className="form-control"
                  name="email"
                  value={editedUser.email}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label>권한(Role)</label>
                <select
                  className="form-select"
                  name="role"
                  value={editedUser.role}
                  onChange={handleChange}
                >
                  <option value="MEMBER">MEMBER</option>
                  <option value="LEADER">LEADER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                닫기
              </button>
              <button type="submit" className="btn btn-primary">
                저장
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default UserEditModal;
