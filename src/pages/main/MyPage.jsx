import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MyPage = () => {
  const navigate = useNavigate();

  // 더미 사용자 정보
  const [userInfo] = useState({
    username: "superuser",
    name: "관리자",
    email: "superuser@example.com",
    interest_tags: ["Java", "React", "AI"],
  });

  const [joinedGroups] = useState([
    {
      id: 1,
      title: "Java 스터디",
      leader: "홍길동",
      members: 5,
      max: 10,
      location: "가천대 중앙도서관",
      description: "Java 기본 문법과 객체지향 개념을 공부합니다.",
      scheduleDate: "2025-11-01",
      active: true,
    },
    {
      id: 2,
      title: "TOEIC 스터디",
      leader: "김영희",
      members: 8,
      max: 10,
      location: "분당 카페 24",
      description: "매주 모의고사 풀이와 LC·RC 집중 학습.",
      scheduleDate: "2025-11-05",
      active: false,
    },
  ]);

  const [mannerScore] = useState(84);
  const [selectedGroup, setSelectedGroup] = useState(null); // 상세보기용

  // 계정 탈퇴 (테스트용)
  const handleDeleteAccount = () => {
    if (window.confirm("정말 계정을 탈퇴하시겠습니까?")) {
      alert("테스트 모드에서는 실제 탈퇴가 실행되지 않습니다.");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">내 프로필</h2>

      {/* 기본 정보 */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">👤 기본 정보</h5>
          <p><strong>이름:</strong> {userInfo.name}</p>
          <p><strong>아이디:</strong> {userInfo.username}</p>
          <p><strong>이메일:</strong> {userInfo.email}</p>
          <p><strong>관심사:</strong> {userInfo.interest_tags.join(", ")}</p>

          <div className="d-flex justify-content-end mt-3">
            <button
              className="btn btn-outline-primary me-2"
              onClick={() => navigate("/main/edit-profile")}
            >
              내 정보 수정
            </button>
            <button className="btn btn-outline-danger" onClick={handleDeleteAccount}>
              회원 탈퇴
            </button>
          </div>
        </div>
      </div>

      {/* 매너점수 */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">🌟 매너점수</h5>
          <div className="progress" style={{ height: "25px" }}>
            <div
              className={`progress-bar ${mannerScore >= 70 ? "bg-success" : "bg-warning"}`}
              role="progressbar"
              style={{ width: `${mannerScore}%` }}
            >
              {mannerScore}점
            </div>
          </div>
        </div>
      </div>

      {/* 참여 그룹 */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">📚 참여한 스터디 그룹</h5>
          {joinedGroups.length > 0 ? (
            <ul className="list-group">
              {joinedGroups.map((g) => (
                <li
                  key={g.id}
                  className={`list-group-item d-flex justify-content-between align-items-center ${
                    g.active ? "" : "text-secondary"
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedGroup(g)}
                >
                  <div>
                    <strong>{g.title}</strong> <br />
                    리더: {g.leader} / 인원: {g.members}/{g.max}
                  </div>
                  <span className="badge bg-primary">{g.scheduleDate}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>참여 중인 스터디가 없습니다.</p>
          )}
        </div>
      </div>

      {/* 활동 이력 */}
      <div className="card shadow-sm mb-5">
        <div className="card-body">
          <h5 className="card-title mb-3">📈 활동 이력</h5>
          <p>출석률: 92%</p>
          <p>참여율: 88%</p>
          <p>후기 작성: 3개</p>
          <p>게시글 작성: 5개</p>
          <p>댓글 수: 12개</p>
        </div>
      </div>
    </div>
  );
};

export default MyPage;