// src/pages/main/MyPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const MyPage = () => {
  const navigate = useNavigate();

  // 상태값
  const [userInfo, setUserInfo] = useState(null);
  const [manner, setManner] = useState(null);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // -------------------------------------
  // 1) 사용자 정보 조회
  // -------------------------------------
  const fetchUserProfile = async () => {
    try {
      const res = await api.get("/users/profile");
      setUserInfo(res.data);
      return res.data.user_id; // userId 반환
    } catch (err) {
      console.error("사용자 정보 조회 오류:", err);
    }
  };

  // -------------------------------------
  // 2) 참여 그룹 조회
  // -------------------------------------
  const fetchJoinedGroups = async (userId) => {
    try {
      const res = await api.get(`/users/${userId}/groups`);
      setJoinedGroups(res.data);
    } catch (err) {
      console.error("참여 그룹 조회 오류:", err);
    }
  };

  // -------------------------------------
  // 3) 매너점수 조회
  // -------------------------------------
  const fetchMannerScore = async (userId) => {
    try {
      const res = await api.get(`/manners/${userId}`);
      setManner(res.data);
    } catch (err) {
      console.error("매너점수 조회 오류:", err);
    }
  };

  // -------------------------------------
  // 전체 데이터 로드
  // -------------------------------------
  useEffect(() => {
    const loadData = async () => {
      const user = await fetchUserProfile(); // userId 얻음
      if (user) {
        await fetchJoinedGroups(user);
        await fetchMannerScore(user);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) return <div className="container mt-4">로딩중...</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">내 프로필</h2>

      {/* ------------------ 기본 정보 ------------------ */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">👤 기본 정보</h5>

          <p><strong>이름:</strong> {userInfo?.name}</p>
          <p><strong>아이디:</strong> {userInfo?.username}</p>
          <p><strong>이메일:</strong> {userInfo?.email}</p>
          <p><strong>관심사:</strong> {userInfo?.interest_tags?.join(", ")}</p>

          <div className="d-flex justify-content-end mt-3">
            <button
              className="btn btn-outline-primary me-2"
              onClick={() => navigate("/main/edit-profile")}
            >
              내 정보 수정
            </button>
            <button className="btn btn-outline-danger">
              회원 탈퇴
            </button>
          </div>
        </div>
      </div>

      {/* ------------------ 매너점수 ------------------ */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">🌟 매너점수</h5>

          <div className="progress" style={{ height: "25px" }}>
            <div
              className={`progress-bar ${
                (manner?.current_manner_score || 0) >= 70
                  ? "bg-success"
                  : "bg-warning"
              }`}
              role="progressbar"
              style={{ width: `${manner?.current_manner_score || 0}%` }}
            >
              {manner?.current_manner_score ?? 0}점
            </div>
          </div>

          <small className="text-muted">
            출석 점수: {manner?.attendance_score ?? 0} / 
            리더 점수: {manner?.leader_score ?? 0} / 
            위반 점수: {manner?.violation_score ?? 0}
          </small>
        </div>
      </div>

      {/* ------------------ 참여 스터디 그룹 ------------------ */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">📚 참여한 스터디 그룹</h5>

          {joinedGroups.length > 0 ? (
            <ul className="list-group">
              {joinedGroups.map((g) => (
                <li
                  key={g.group_id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>{g.title}</strong>
                    <br />
                    리더: {g.leader_name}
                  </div>
                  <span className="badge bg-primary">
                    상태: {g.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>참여 중인 스터디가 없습니다.</p>
          )}
        </div>
      </div>

      {/* ------------------ 활동 이력 (추후 API 연결용) ------------------ */}
      <div className="card shadow-sm mb-5">
        <div className="card-body">
          <h5 className="card-title mb-3">📈 활동 이력</h5>
          <p>출석률: 준비 중</p>
          <p>후기 작성: 준비 중</p>
          <p>게시글 작성: 준비 중</p>
          <p>댓글 수: 준비 중</p>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
