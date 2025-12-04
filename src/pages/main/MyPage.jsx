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
      console.log("📌 프로필 응답:", res.data);
      setUserInfo(res.data);
      return res.data;
    } catch (err) {
      console.error("사용자 정보 조회 오류:", err);
      return null;
    }
  };

  // 2) 참여 그룹 조회
  const fetchJoinedGroups = async (userId) => {
    try {
      const allGroupsRes = await api.get("/study-groups");
      const groups = allGroupsRes.data || [];

      const myGroups = [];

      for (const g of groups) {
        try {
          // 1) 내가 가입한 그룹인지 확인
          const memRes = await api.get(
            `/study-groups/${g.groupId}/members/${userId}`
          );

          if (memRes.data && memRes.data.status === "APPROVED") {

            // 2) 리더 정보 조회
            const leaderRes = await api.get(
              `/study-groups/${g.groupId}/leader`
            );

            const leaderName = leaderRes.data?.name || "(알 수 없음)";

            myGroups.push({
              ...g,
              status: memRes.data.status,
              leaderName: leaderName,   // 🔥 리더 이름 정상 주입
            });
          }
        } catch (err) {
          // 가입 안 된 그룹 → 무시
        }
      }

      setJoinedGroups(myGroups);
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
  //    - 게시글: post.leaderId === 내 userId
  //    - 댓글: comment.userId === 내 userId
  const fetchActivityHistory = async (userId) => {
    try {
      const postsRes = await api.get("/study-posts");
      const allPosts = postsRes.data || [];
      console.log("📌 전체 게시글 예시:", allPosts[0]);

      // ✅ 내가 리더인 글들만 필터링
      const myPosts = allPosts.filter((p) => p.leaderId === userId);

      const postCount = myPosts.filter((p) => p.type === "FREE").length;
      const reviewCount = myPosts.filter((p) => p.type === "REVIEW").length;

      // ✅ 내가 쓴 댓글 수 계산 (comment.userId 기준)
      let commentCount = 0;
      for (const post of allPosts) {
        try {
          const cmRes = await api.get(`/study-posts/${post.postId}/comments`);
          const comments = cmRes.data || [];

          const myComments = comments.filter(
            (c) => c.userId === userId
          );

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
    if (
      !window.confirm(
        "정말 계정을 탈퇴하시겠습니까?\n탈퇴 후 복구는 불가능합니다."
      )
    ) {
      return;
    }

    try {
      if (!userInfo) {
        alert("사용자 정보를 불러오지 못했습니다.");
        return;
      }

      await api.delete(`/users/${userInfo.userId}`); // ✅ userId 사용

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
        const userId = user.userId;

        await Promise.all([
          fetchJoinedGroups(userId),
          fetchMannerScore(userId),
          fetchActivityHistory(userId),
        ]);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="container mt-4">로딩중...</div>;

  return (
    <div>
      <h2><strong>내 프로필</strong></h2>
      <br />
      {/* ------------------ 기본 정보 ------------------ */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">👤 기본 정보</h5>

          <p>
            <strong>이름:</strong> {userInfo?.name}
          </p>
          <p>
            <strong>아이디:</strong> {userInfo?.username}
          </p>
          <p>
            <strong>이메일:</strong> {userInfo?.email}
          </p>
          <p>
            <strong>관심사:</strong>{" "}
            {userInfo?.interestTags && userInfo.interestTags.length > 0
              ? userInfo.interestTags.join(", ")
              : "없음"}
          </p>

          <div className="d-flex justify-content-end mt-3">
            <button
              className="btn btn-outline-primary me-2"
              onClick={() => navigate("/main/edit-profile")}
            >
              내 정보 수정
            </button>
            <button
              className="btn btn-outline-danger"
              onClick={handleDeleteAccount}
            >
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
                (manner?.currentMannerScore || 0) >= 70
                  ? "bg-success"
                  : "bg-warning"
              }`}
              role="progressbar"
              style={{ width: `${manner?.currentMannerScore || 0}%` }}
            >
              {manner?.currentMannerScore ?? 0}점
            </div>
          </div>
        </div>
      </div>

            {/* ------------------ 참여 스터디 그룹 ------------------ */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">📚 참여한 스터디 그룹</h5>

          {joinedGroups && joinedGroups.length > 0 ? (
            <ul className="list-group">
              {joinedGroups.map((g) => (
                <li
                  key={g.groupId} // ✅ group_id 말고 groupId
                  className="list-group-item d-flex justify-content-between align-items-center"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setSelectedGroup({
                      ...g,
                      group_id: g.groupId,   // 🔹 DetailModal용 필드 추가
                    });
                    setShowGroupModal(true);
                  }}
                  
                >
                  <div>
                    <strong>{g.title}</strong>
                    <div className="small text-muted mt-1">
                      리더: {g.leaderName} / 상태: {g.status}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>참여 중인 스터디가 없습니다.</p>
          )}
        </div>
      </div>

      {/* ------------------ 활동 이력 ------------------ */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">📝 활동 이력</h5>
          <div className="d-flex justify-content-around text-center">
            <div>
              <p className="h4 text-primary">{activity.posts}</p>
              <small className="text-muted">자유 게시글</small>
            </div>
            <div>
              <p className="h4 text-success">{activity.reviews}</p>
              <small className="text-muted">스터디 후기글</small>
            </div>
            <div>
              <p className="h4 text-warning">{activity.comments}</p>
              <small className="text-muted">댓글</small>
            </div>
          </div>
        </div>
      </div>
      
      {/* ------------------ 모달 ------------------ */}
      {showGroupModal && selectedGroup && (
        <StudyGroupDetailModal
          group={selectedGroup}
          userId={userInfo.userId}   // ★ 리더 여부 판단을 위해 필수
          onClose={() => {
            setShowGroupModal(false);
            setSelectedGroup(null);
          }}
        />
      )}
    </div>
  );
};

export default MyPage;