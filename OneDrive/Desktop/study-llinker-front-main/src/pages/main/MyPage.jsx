// src/pages/main/MyPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import StudyGroupDetailModal from "../../components/StudyGroupDetailModal";

const MyPage = () => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [manner, setManner] = useState(null);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [activity, setActivity] = useState({
    posts: 0,
    reviews: 0,
    comments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);

  // 1) 사용자 정보 조회
  
  const fetchUserProfile = async () => {
    
    try {
      const res = await api.get("/users/profile");
      setUserInfo(res.data);
      return res.data;
    } catch (err) {
      console.error("사용자 정보 조회 오류:", err);
    }
  };

  // 2) 참여 그룹 조회
  const fetchJoinedGroups = async (userId) => {
    try {
      const res = await api.get(`/users/${userId}/groups`);
      setJoinedGroups(res.data);
    } catch (err) {
      console.error("참여 그룹 조회 오류:", err);
    }
  };

  // 3) 매너점수 조회 
  const fetchMannerScore = async (userId) => {
    try {
      const res = await api.get(`/manners/${userId}`);
      console.log("📌 서버 매너 점수 응답:", res.data);
      setManner(res.data);
    } catch (err) {
      console.error("매너점수 조회 오류:", err);
    }
  };

  // 4) 활동 이력 조회
  const fetchActivityHistory = async (userId, username) => {
    try {
      // (1) 전체 게시글 가져와서 내가 쓴 글만 필터
      const postsRes = await api.get("/study-posts");
      const myPosts = postsRes.data.filter((p) => p.author === username);
      const postCount = myPosts.filter((p) => p.type === "FREE").length;
      const reviewCount = myPosts.filter((p) => p.type === "REVIEW").length;

      // (2) 게시글별 댓글을 모아 필터링
      let commentCount = 0;
      for (const post of postsRes.data) {
        try {
          const cmRes = await api.get(`/study-posts/${post.postId}/comments`);
          const myComments = cmRes.data.filter((c) => c.userId === userId);
          commentCount += myComments.length;
        } catch (e) {
          // 댓글 없는 글은 무시
        }
      }

      setActivity({
        posts: postCount,
        reviews: reviewCount,
        comments: commentCount,
      });
    } catch (err) {
      console.error("활동 이력 계산 오류:", err);
    }
  };

  // 5) 회원 탈퇴
  const handleDeleteAccount = async () => {
  if (!window.confirm("정말 계정을 탈퇴하시겠습니까?\n탈퇴 후 복구는 불가능합니다.")) {
    return;
  }

  try {
    await api.delete(`/users/${userInfo.user_id}`);

    alert("회원 탈퇴가 완료되었습니다.");

    // JWT 토큰 삭제
    localStorage.removeItem("token");

    // 로그인 페이지로 이동
    navigate("/login");
  } catch (err) {
    console.error("회원 탈퇴 오류:", err);
    alert("회원 탈퇴 실패! 관리자에게 문의하세요.");
  }
};


  // 전체 데이터 로드
  useEffect(() => {
    
    const load = async () => {
      const user = await fetchUserProfile();
      if (user) {
        const userId = user.userId  ;
        const username = user.username;
        await Promise.all([
          fetchJoinedGroups(userId),
          fetchMannerScore(userId),
          fetchActivityHistory(userId, username),
        ]);
      }
      setLoading(false);
    };
    load();
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
          <p><strong>관심사:</strong> {userInfo?.interestTags?.join(", ")}</p>

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

      {/* ------------------ 매너점수 ------------------ */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">🌟 매너점수</h5>

          <div className="progress" style={{ height: "25px" }}>
            <div
              className={`progress-bar ${
                (manner?.currentMannerScore  || 0) >= 70
                  ? "bg-success"
                  : "bg-warning"
              }`}
              role="progressbar"
              style={{ width: `${manner?.currentMannerScore  || 0}%` }}
            >
              {manner?.currentMannerScore  ?? 0}점
            </div>
          </div>
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
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setSelectedGroup(g);
                    setShowGroupModal(true);
                  }}
                >
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

      {/* ------------------ 활동 이력 ------------------ */}
      <div className="card shadow-sm mb-5">
        <div className="card-body">
          <h5 className="card-title mb-3">📈 활동 이력</h5>

          <p>후기 작성: {activity.reviews}개</p>
          <p>게시글 작성: {activity.posts}개</p>
          <p>댓글 수: {activity.comments}개</p>
        </div>
      </div>

      {/* 그룹 상세 모달 */}
      {showGroupModal && selectedGroup && (
        <StudyGroupDetailModal
          group={selectedGroup}
          userId={userInfo.user_id}
          onClose={() => setShowGroupModal(false)}
        />
      )}
    </div>
  );
};

export default MyPage;