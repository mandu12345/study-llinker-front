// src/pages/admin/UserList.jsx

import React, { useState } from "react";

const dummyUsers = [
  { id: 1, username: "testuser", name: "홍길동", email: "hong@test.com", role: "USER", status: "Active" },
  { id: 2, username: "admin", name: "관리자", email: "admin@test.com", role: "ADMIN", status: "Active" },
  { id: 3, username: "banneduser", name: "문제계정", email: "ban@test.com", role: "USER", status: "Suspended" },
  { id: 4, username: "inactive", name: "휴면계정", email: "sleep@test.com", role: "USER", status: "Inactive" },
];

const UserList = () => {
  const [users, setUsers] = useState(dummyUsers);

  const handleDelete = (id) => {
    if (window.confirm("정말 삭제하시겠습니까? (F-S-UM-005)")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

    // F-S-UM-004: 계정 상태 변경 (비활성/정지) 더미 함수
    const handleStatusChange = (id, newStatus) => {
        alert(`F-S-UM-004: ${id}번 사용자의 상태를 ${newStatus}로 변경합니다.`);
        setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
    };

  return (
    <div>
      <h2>👥 사용자 관리 (F-S-UM)</h2>
        
        {/* F-S-UM-001: 필터링 및 검색 UI 틀 추가 */}
        <div className="d-flex mb-3">
            <input type="text" className="form-control w-25 me-2" placeholder="아이디/이름 검색 (F-S-UM-001)" />
            <select className="form-select w-25 me-2">
                <option value="">권한 필터 (F-S-UM-001)</option>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
            </select>
        </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>아이디</th>
            <th>이름 (F-S-UM-002)</th>
            <th>이메일 (F-S-UM-003)</th>
            <th>권한 (F-S-UM-003)</th>
                <th>상태 (F-S-UM-004)</th>
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
                <td>{u.status}</td>
              <td>
                    {/* F-S-UM-003: 수정 버튼 (상세 페이지 이동 또는 모달 호출) */}
                    <button className="btn btn-info btn-sm me-2" onClick={() => alert(`F-S-UM-003: ${u.name}님 정보 수정 페이지로 이동`)}>
                        수정
                    </button>
                    {/* F-S-UM-004: 상태 변경 버튼 */}
                    {u.status === "Active" && (
                        <button className="btn btn-warning btn-sm me-2" onClick={() => handleStatusChange(u.id, "Suspended")}>
                            정지
                        </button>
                    )}
                    {u.status === "Suspended" && (
                        <button className="btn btn-success btn-sm me-2" onClick={() => handleStatusChange(u.id, "Active")}>
                            정지 해제
                        </button>
                    )}
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