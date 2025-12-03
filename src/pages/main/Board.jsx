// src/pages/main/Board.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../auth/AuthContext";

const Board = () => {
  const [tab, setTab] = useState("FREE"); // FREE | REVIEW
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const { user } = useContext(AuthContext);

  const [newComment, setNewComment] = useState({});
  const [comments, setComments] = useState({});
  const [reviewRatings, setReviewRatings] = useState({});

  const navigate = useNavigate();

  // =============================
  // 🔹 게시글 전체 조회
  // =============================
  const fetchPosts = async (targetTab = tab) => {
    try {
      const res = await api.get("/study-posts");
      const list = Array.isArray(res.data) ? res.data : [];

      setAllPosts(list);
      setPosts(list.filter((p) => p.type === targetTab));

      if (targetTab === "REVIEW") {
        fetchReviewRatings(list);
      }
    } catch (err) {
      console.error("게시글 조회 실패:", err);
    }
  };

  // =============================
  // ⭐ 최초 렌더링 시 게시판 로딩
  // =============================
  useEffect(() => {
    if (user) fetchPosts("FREE");
  }, [user]);

  // =============================
  // 🔹 탭 변경 시 재조회
  // =============================
  useEffect(() => {
    if (user) fetchPosts(tab);
  }, [tab, user]);

  // =============================
  // 🔹 댓글 조회
  // =============================
  const fetchComments = async (postId) => {
    try {
      const res = await api.get(`/study-posts/${postId}/comments`);
      setComments((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error("댓글 조회 실패:", err);
    }
  };

  // =============================
  // 🔹 리뷰 평점 조회
  // =============================
  const fetchReviewRatings = async (list) => {
    try {
      const reviewPosts = list.filter((p) => p.type === "REVIEW");
      const ratingMap = {};

      for (const p of reviewPosts) {
        try {
          const res = await api.get(`/study-posts/${p.postId}/reviews`);
          const reviews = Array.isArray(res.data) ? res.data : [];

          if (reviews.length > 0) {
            const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
            ratingMap[p.postId] = {
              avg: sum / reviews.length,
              count: reviews.length,
            };
          } else {
            ratingMap[p.postId] = { avg: null, count: 0 };
          }
        } catch {}
      }

      setReviewRatings(ratingMap);
    } catch (err) {
      console.error("평점 계산 실패:", err);
    }
  };

  // =============================
  // 🔹 검색
  // =============================
  const handleSearch = () => {
    if (keyword.length < 2) {
      alert("검색어는 2자 이상 입력하세요.");
      return;
    }

    const lower = keyword.toLowerCase();
    const filtered = allPosts.filter(
      (p) =>
        p.type === tab &&
        ((p.title || "").toLowerCase().includes(lower) ||
          (p.content || "").toLowerCase().includes(lower) ||
          (p.leaderName || "").toLowerCase().includes(lower))
    );

    setPosts(filtered);
  };

  // =============================
  // 🔹 댓글 등록
  // =============================
  const handleAddComment = async (postId) => {
    const text = newComment[postId] || "";
    if (!text.trim()) return;

    try {
      await api.post(`/study-posts/${postId}/comments`, { content: text });

      setNewComment((prev) => ({ ...prev, [postId]: "" }));
      await fetchComments(postId);

      alert("댓글 등록 완료");
    } catch (err) {
      console.error(err);
      alert("댓글 등록 실패");
    }
  };

  // =============================
  // 🔹 댓글 삭제
  // =============================
  const handleDeleteComment = async (postId, commentId) => {
    try {
      await api.delete(`/study-posts/${postId}/comments/${commentId}`);
      fetchComments(postId);
      alert("댓글 삭제 완료");
    } catch (err) {
      console.error(err);
    }
  };

  // =============================
  // 🔹 신고
  // =============================
  const handleReport = async (postId) => {
    const reason = prompt("신고 사유를 입력하세요");
    if (!reason) return;

    try {
      await api.patch(`/study-posts/${postId}`, {
        reported: true,
        reportReason: reason,
      });

      alert("신고 접수 완료");
    } catch (err) {
      console.error(err);
      alert("신고 실패");
    }
  };

  return (
    <div>
      <h2>게시판</h2>
      <br />

      {/* 탭 버튼 */}
      <div className="btn-group mb-3">
        <button
          className={`btn btn-${tab === "FREE" ? "primary" : "outline-primary"}`}
          onClick={() => setTab("FREE")}
        >
          자유게시판
        </button>
        <button
          className={`btn btn-${tab === "REVIEW" ? "primary" : "outline-primary"}`}
          onClick={() => setTab("REVIEW")}
        >
          스터디 리뷰
        </button>
      </div>

      {/* 글쓰기 */}
      <div className="mb-3 text-end">
        <button className="btn btn-success" onClick={() => navigate("/main/board/write")}>
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
                    <h5
                      style={{ cursor: "pointer", color: "#0d6efd" }}
                      onClick={() => navigate(`/main/board/detail/${p.postId}`)}
                    >
                      {p.title}
                    </h5>

                    {tab === "REVIEW" && ratingInfo && ratingInfo.avg && (
                      <p>
                        ⭐ 평점: {ratingInfo.avg.toFixed(1)}/5 ({ratingInfo.count}개)
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

                {/* 댓글 영역 */}
                <div className="mt-3">
                  <h6>댓글</h6>

                  {/* 댓글 불러오기 버튼 */}
                  {comments[p.postId] === undefined && (
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => fetchComments(p.postId)}
                    >
                      댓글 불러오기
                    </button>
                  )}

                  {/* 댓글 목록 */}
                  <ul className="list-group mb-2">
                    {(comments[p.postId] || []).map((c) => (
                      <li
                        key={c.commentId}
                        className="list-group-item d-flex justify-content-between"
                      >
                        <span>
                          <strong>{c.userName || `사용자 ${c.userId}`}</strong>:{" "}
                          {c.content}
                          <br />
                          <small className="text-muted">{c.createdAt}</small>
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
                    ))}
                  </ul>

                  {/* 댓글 입력 */}
                  <div className="input-group">
                    <input
                      className="form-control"
                      value={newComment[p.postId] || ""}
                      onChange={(e) =>
                        setNewComment((prev) => ({
                          ...prev,
                          [p.postId]: e.target.value,
                        }))
                      }
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
