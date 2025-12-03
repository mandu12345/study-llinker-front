// src/pages/main/Board.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useContext } from "react";
import { AuthContext } from "../../auth/AuthContext";

const Board = () => {
  const [tab, setTab] = useState("FREE"); // FREE | REVIEW
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const { user } = useContext(AuthContext);

  // 후기 작성 (현재 UI에서 직접 사용하진 않지만, 기존 기능 유지용)
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");

  // 댓글
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState({}); // postId -> comment list

  // 리뷰 평점(리뷰 게시글별 평균 평점) 저장
  const [reviewRatings, setReviewRatings] = useState({}); // postId -> { avg, count }

  const navigate = useNavigate();

  // 1) 게시글 전체 조회
  const fetchPosts = async (currentTab = tab) => {
    try {
      const res = await api.get("/study-posts");
      const list = Array.isArray(res.data) ? res.data : [];

      setAllPosts(list);
      setPosts(list.filter((p) => p.type === currentTab));
    } catch (err) {
      console.error("게시글 조회 실패:", err);
    }
  };

  // 2) 댓글 전체 조회
  const fetchComments = async (postId) => {
    try {
      const res = await api.get(`/study-posts/${postId}/comments`);
      // res.data: List<StudyCommentResponse>
      setComments((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error("댓글 조회 실패:", err);
    }
  };

  // 3) REVIEW 탭용: 각 리뷰 게시글의 평균 평점 로딩
  const fetchReviewRatings = async (postsForCalc) => {
    try {
      const reviewPosts = postsForCalc.filter((p) => p.type === "REVIEW");
      const ratingMap = {};

      for (const p of reviewPosts) {
        try {
          const res = await api.get(`/study-posts/${p.postId}/reviews`);
          const reviews = Array.isArray(res.data) ? res.data : [];
          if (reviews.length > 0) {
            const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
            const avg = sum / reviews.length;
            ratingMap[p.postId] = {
              avg,
              count: reviews.length,
            };
          } else {
            ratingMap[p.postId] = { avg: null, count: 0 };
          }
        } catch (err) {
          console.error(`리뷰 조회 실패 (postId=${p.postId}):`, err);
        }
      }

      setReviewRatings(ratingMap);
    } catch (err) {
      console.error("리뷰 평점 계산 실패:", err);
    }
  };

  // ✅ 탭 변경 시 게시글 불러오기 (user 준비될 때까진 호출 금지)
  useEffect(() => {
    // 🔥 user가 아직 null이면 API 호출하면 안 됨 → 403 방지
    if (!user) {
      console.log("⏳ Board: user 정보 준비 전 → /study-posts API 호출 지연");
      return;
    }

    const load = async () => {
      try {
        console.log("📌 Board: /study-posts 요청 시작 (tab =", tab, ")");
        const res = await api.get("/study-posts");
        const list = Array.isArray(res.data) ? res.data : [];

        setAllPosts(list);

        const filtered = list.filter((p) => p.type === tab);
        setPosts(filtered);

        // REVIEW 탭일 때만 평점 계산
        if (tab === "REVIEW") {
          fetchReviewRatings(list);
        }
      } catch (err) {
        console.error("게시글 조회 실패:", err);
      }
    };

    load();
  }, [tab, user]);

  // 검색
  const handleSearch = () => {
    if (keyword.length < 2) {
      alert("검색어는 2자 이상 입력하세요.");
      return;
    }

    const lower = keyword.toLowerCase();
    const filtered = allPosts.filter(
      (p) =>
        p.type === tab &&
        (((p.title || "").toLowerCase().includes(lower)) ||
          ((p.content || "").toLowerCase().includes(lower)) ||
          ((p.leaderName || "").toLowerCase().includes(lower))) // ✅ DTO 기준: leaderName 사용
    );

    setPosts(filtered);
  };

  // 후기 작성 — 게시글 생성 → 리뷰 생성
  // (현재 화면에서 사용하진 않지만, 기존 기능 유지 + DTO 기준으로 필드 맞춤)
  const handleAddReview = async (e) => {
    e.preventDefault();

    if (!rating || !content) {
      alert("평점과 내용을 입력하세요.");
      return;
    }
    if (rating < 1 || rating > 5) {
      alert("평점은 1~5 사이입니다.");
      return;
    }

    try {
      // 1) 게시글 생성 (StudyPostCreateRequest 규격에 맞게)
      const postRes = await api.post("/study-posts", {
        title: "스터디 후기",
        content,
        type: "REVIEW", // FREE / STUDY / REVIEW 중 하나
        // groupId는 필요 시 BoardWrite에서 처리 (여기는 빠른 후기용)
      });

      const postId = postRes.data.postId;
      if (!postId) throw new Error("postId 없음");

      // 2) 리뷰 생성 (StudyReviewCreateRequest: rating, content)
      await api.post(`/study-posts/${postId}/reviews`, {
        rating,
        content,
        // userId는 백엔드에서 AuthenticationPrincipal로 처리
      });

      alert("후기 등록 완료");
      setRating(0);
      setContent("");
      fetchPosts("REVIEW");
    } catch (err) {
      console.error(err);
      alert("후기 등록 실패");
    }
  };

  // 댓글 작성
  const handleAddComment = async (postId) => {
    if (!newComment.trim()) return;

    try {
      await api.post(`/study-posts/${postId}/comments`, {
        content: newComment, // StudyCommentRequest.content
      });

      setNewComment("");
      await fetchComments(postId);
      alert("댓글 등록 완료");
    } catch (err) {
      console.error(err);
      alert("댓글 등록 실패");
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (postId, commentId) => {
    try {
      await api.delete(`/study-posts/${postId}/comments/${commentId}`);
      fetchComments(postId);
      alert("댓글 삭제 완료");
    } catch (err) {
      console.error(err);
    }
  };

  // 신고
  const handleReport = async (postId) => {
    const reason = prompt("신고 사유를 입력하세요 (필수)");
    if (!reason) return;

    try {
      await api.patch(`/study-posts/${postId}`, {
        reported: true,
        reportReason: reason, // ✅ DTO StudyPostUpdateRequest.reportReason
      });

      alert("신고가 접수되었습니다.");
    } catch (err) {
      console.error(err);
      alert("신고 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <h2>게시판</h2>
      <br />

      {/* 탭 버튼 */}
      <div className="btn-group mb-3">
        <button
          className={`btn btn-${
            tab === "FREE" ? "primary" : "outline-primary"
          }`}
          onClick={() => setTab("FREE")}
        >
          자유게시판
        </button>
        <button
          className={`btn btn-${
            tab === "REVIEW" ? "primary" : "outline-primary"
          }`}
          onClick={() => setTab("REVIEW")}
        >
          스터디 리뷰
        </button>
      </div>

      {/* 글쓰기 버튼 */}
      <div className="mb-3 text-end">
        <button
          className="btn btn-success"
          onClick={() => navigate("/main/board/write")}
        >
          ✍️ 글쓰기
        </button>
      </div>

      {/* 검색 */}
      <div className="input-group mb-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="form-control"
          placeholder="검색어 입력"
        />
        <button className="btn btn-outline-secondary" onClick={handleSearch}>
          🔍 검색
        </button>
      </div>

      {/* 게시글 목록 */}
      {posts.length > 0 ? (
        <ul className="list-group">
          {posts.map((p) => {
            const ratingInfo = reviewRatings[p.postId];
            return (
              <li key={p.postId} className="list-group-item mb-2">
                <div className="d-flex justify-content-between">
                  <div>
                    <h5>{p.title}</h5>
                    {tab === "REVIEW" && ratingInfo && ratingInfo.avg && (
                      <p>
                        ⭐ 평점: {ratingInfo.avg.toFixed(1)}/5 (
                        {ratingInfo.count}개)
                      </p>
                    )}
                    <p className="text-muted">
                      {p.leaderName || "작성자 정보 없음"} | {p.createdAt}
                    </p>
                    <p>{p.content}</p>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleReport(p.postId)}
                  >
                    🚨 신고
                  </button>
                </div>

                {/* 댓글 목록 */}
                <div className="mt-3">
                  <h6>댓글</h6>

                  {/* 댓글 로딩 버튼 */}
                  {comments[p.postId] === undefined && (
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => fetchComments(p.postId)}
                    >
                      댓글 불러오기
                    </button>
                  )}

                  <ul className="list-group mb-2">
                    {(comments[p.postId] || []).map((c) => {
                      const displayName =
                        c.userName || `사용자 ${c.userId ?? "알 수 없음"}`;
                      return (
                        <li
                          key={c.commentId}
                          className="list-group-item d-flex justify-content-between"
                        >
                          <span>
                            <strong>{displayName}</strong>: {c.content}
                            <br />
                            <small className="text-muted">
                              {c.createdAt}
                            </small>
                          </span>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleDeleteComment(p.postId, c.commentId)
                            }
                          >
                            삭제
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  {/* 댓글 입력 */}
                  <div className="input-group">
                    <input
                      className="form-control"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="댓글 입력"
                    />
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => handleAddComment(p.postId)}
                    >
                      등록
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>게시글이 없습니다.</p>
      )}
    </div>
  );
};

export default Board;
