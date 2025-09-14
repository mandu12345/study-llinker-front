// src/pages/admin/UserList.jsx
import React, { useState } from "react";

const dummyUsers = [
  { id: 1, username: "testuser", name: "홍길동", email: "hong@test.com", role: "USER" },
  { id: 2, username: "admin", name: "관리자", email: "admin@test.com", role: "ADMIN" },
];

const UserList = () => {
  const [users, setUsers] = useState(dummyUsers);

  const handleDelete = (id) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  return (
    <div>
      <h2>👥 사용자 관리</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>아이디</th>
            <th>이름</th>
            <th>이메일</th>
            <th>권한</th>
            <th>액션</th>
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
              <td>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
