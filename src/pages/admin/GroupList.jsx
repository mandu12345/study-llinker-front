// src/pages/admin/GroupList.jsx

import React, { useState } from "react";

const dummyGroups = [
  { id: 1, title: "Java 스터디", leader: "홍길동", members: 5, max: 10, status: "Pending", category: "IT" },
  { id: 2, title: "AI 스터디", leader: "이호주", members: 8, max: 10, status: "Active", category: "AI" },
  { id: 3, title: "파이썬 기초", leader: "김철수", members: 3, max: 5, status: "Active", category: "IT" },
  { id: 4, title: "자유 독서 모임", leader: "박영희", members: 2, max: 10, status: "Inactive", category: "Culture" },
];

const GroupList = () => {
  const [groups, setGroups] = useState(dummyGroups);

  const handleDelete = (id) => {
    if (window.confirm("이 그룹을 삭제하시겠습니까? (F-S-GM-005)")) {
      setGroups(groups.filter((g) => g.id !== id));
    }
  };
    
    // F-S-GM-003: 그룹 상태 변경 (승인/반려/비활성화) 더미 함수
    const handleStatusChange = (id, action) => {
        if (action === 'Approve') {
            alert(`F-S-GM-003: ${id}번 그룹을 승인(Active) 처리합니다.`);
            setGroups(groups.map(g => g.id === id ? { ...g, status: 'Active' } : g));
        } else if (action === 'Deactivate') {
            alert(`F-S-GM-003: ${id}번 그룹을 비활성화(Inactive) 처리합니다.`);
            setGroups(groups.map(g => g.id === id ? { ...g, status: 'Inactive' } : g));
        } else if (action === 'Reject') {
             alert(`F-S-GM-003: ${id}번 그룹을 반려(Reject) 처리합니다.`);
             setGroups(groups.filter(g => g.id !== id)); // 반려 시 삭제로 처리한다고 가정
        }
    };

  return (
    <div>
      <h2>📚 스터디 그룹 관리 (F-S-GM)</h2>

        {/* F-S-GM-001: 필터링 및 통계 UI 틀 추가 */}
        <div className="d-flex justify-content-between align-items-center mb-3">
             {/* F-S-GM-001: 필터링 */}
            <input type="text" className="form-control w-25 me-2" placeholder="그룹명 검색 (F-S-GM-001)" />
            {/* F-S-GM-006: 스터디 통계 확인 버튼 */}
            <button className="btn btn-secondary" onClick={() => alert("F-S-GM-006: 그룹별 통계 (출석률 등) 대시보드 표시")}>
                📊 통계 확인
            </button>
        </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>그룹명 (F-S-GM-002)</th>
            <th>카테고리 (F-S-GM-001)</th>
            <th>리더</th>
            <th>인원</th>
            <th>상태 (F-S-GM-003)</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g.id}>
              <td>{g.id}</td>
              <td>{g.title}</td>
              <td>{g.category}</td>
              <td>{g.leader}</td>
              <td>{g.members}/{g.max}</td>
              <td>{g.status}</td>
              <td>
                    {/* F-S-GM-002: 상세 조회/수정 버튼 */}
                    <button className="btn btn-info btn-sm me-2" onClick={() => alert(`F-S-GM-002: ${g.title} 상세 정보 및 F-S-GM-004 수정 페이지로 이동`)}>
                        상세/수정
                    </button>
                    
                    {/* F-S-GM-003: 상태 변경 버튼 */}
                    {g.status === 'Pending' && (
                        <>
                            <button className="btn btn-success btn-sm me-2" onClick={() => handleStatusChange(g.id, 'Approve')}>승인</button>
                            <button className="btn btn-warning btn-sm me-2" onClick={() => handleStatusChange(g.id, 'Reject')}>반려</button>
                        </>
                    )}
                    {g.status === 'Active' && (
                        <button className="btn btn-warning btn-sm me-2" onClick={() => handleStatusChange(g.id, 'Deactivate')}>비활성화</button>
                    )}
                    
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