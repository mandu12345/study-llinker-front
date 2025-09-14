// src/pages/admin/GroupList.jsx
import React, { useState } from "react";

const dummyGroups = [
  { id: 1, title: "Java 스터디", leader: "홍길동", members: 5, max: 10 },
  { id: 2, title: "AI 스터디", leader: "이호주", members: 8, max: 10 },
];

const GroupList = () => {
  const [groups, setGroups] = useState(dummyGroups);

  const handleDelete = (id) => {
    if (window.confirm("이 그룹을 삭제하시겠습니까?")) {
      setGroups(groups.filter((g) => g.id !== id));
    }
  };

  return (
    <div>
      <h2>📚 스터디 그룹 관리</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>그룹명</th>
            <th>리더</th>
            <th>인원</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g.id}>
              <td>{g.id}</td>
              <td>{g.title}</td>
              <td>{g.leader}</td>
              <td>{g.members}/{g.max}</td>
              <td>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(g.id)}>
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

export default GroupList;
