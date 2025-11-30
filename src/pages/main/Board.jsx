// src/pages/main/Board.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const Board = () => {
  const [tab, setTab] = useState("FREE"); // FREE | REVIEW
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]); // 검색용 원본 목록
  const [keyword, setKeyword] = useState(""); // 검색 키워드
  const [rating, setRating] = useState(0); // 후기 평점
  const [content, setContent] = useState(""); // 후기 작성 내용
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState({}); // postId별 댓글 목록
  const navigate = useNavigate();

  // 공통 게시글 로더 (탭 변경/후기 등록 후 재사용)
  const fetchPosts = async (currentTab = tab) => {
    try {
      const res = await api.get("/study-posts");

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.posts || []; // 백엔드가 {posts:[...]} 형식일 수도 있음

      const filtered = data.filter((p) => p.type === currentTab);
      setAllPosts(data);
      setPosts(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  // 게시글 목록 불러오기 (탭 변경 시)
  useEffect(() => {
    fetchPosts(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // 게시글/후기 검색 (클라이언트 필터링)
  const handleSearch = () => {
    if (keyword.length < 2) {
      alert("검색어는 2자 이상 입력하세요.");
      return;
    }

    const lower = keyword.toLowerCase();

    const filtered = allPosts.filter((p) => {
      if (p.type !== tab) return false;
      const title = (p.title || "").toLowerCase();
      const body = (p.content || "").toLowerCase();
      const author = (p.author || "").toLowerCase();
      return (
        title.includes(lower) ||
        body.includes(lower) ||
        author.includes(lower)
      );
    });

    setPosts(filtered);
  };

  // 후기 작성 (게시글 + 리뷰 두 번 호출, BoardWrite와 동일 패턴)
  const handleAddReview = async (e) => {
    e.preventDefault();

    if (!rating || !content) {
      alert("평점(1~5)과 내용을 입력하세요.");
      return;
    }
    if (content.length > 500) {
      alert("후기 내용은 500자 이내여야 합니다.");
      return;
    }
    if (rating < 1 || rating > 5) {
      alert("평점은 1~5 사이로 입력하세요.");
      return;
    }

    try {
      // 1) 로그인 사용자 정보에서 userId 가져오기
      const profileRes = await api.get("/users/profile");
      const userId = profileRes.data.user.userId;

      // 2) 후기용 게시글 먼저 생성
      const postRes = await api.post(
        `/study-posts`,
        {
          title: "스터디 후기",
          content,
          type: "REVIEW",
          latitude: null,
          longitude: null,
          location: null,
        },
        {
          params: { leaderId: userId },
        }
      );

      const postData = postRes.data || {};
      const postId = postData.postId || postData.post_id || postData.id;

      if (!postId) {
        throw new Error("게시글 ID를 가져오지 못했습니다.");
      }

      // 3) 리뷰 생성
      await api.post(`/study-posts/${postId}/reviews`, {
        rating,
        content,
      });

      alert("후기 등록이 완료되었습니다.");
      setRating(0);
      setContent("");

      // 후기 탭 목록 다시 로드
      fetchPosts("REVIEW");
    } catch (err) {
      console.error(err);
      alert("후기 등록 실패");
    }
  };

  // 댓글 작성 (현재는 프론트 로컬 상태만 사용)
  const handleAddComment = (postId) => {
    if (!newComment.trim()) return;
    if (newComment.length > 300) {
      alert("댓글은 300자 이내로 입력해주세요.");
      return;
    }

    setComments((prev) => ({
      ...prev,
      [postId]: [
        ...(prev[postId] || []),
        {
          id: Date.now(),
          content: newComment,
          author: "나", // 나중에 백엔드 댓글 API 연동 시 서버 값으로 교체
          createdAt: new Date().toLocaleString(),
        },
      ],
    }));
    setNewComment("");
    alert("댓글이 등록되었습니다.");
  };

  // 댓글 삭제 (역시 로컬 상태만)
  const handleDeleteComment = (postId, commentId) => {
    setComments((prev) => ({
      ...prev,
      [postId]: prev[postId].filter((c) => c.id !== commentId),
    }));
    alert("댓글이 삭제되었습니다.");
  };

  // 신고 기능 (API 대신 안내만)
  const handleReport = (postId) => {
    const reason = prompt("신고 사유를 입력하세요 (필수)");
    if (!reason || !reason.trim()) return;
    alert("신고가 접수되었습니다. (백엔드 신고 API 연동 예정)");
  };

  return (
    <div>
      <h2>게시판</h2><br></br>

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

      {/* 글쓰기 버튼 (자유게시판 전용) */}
      {tab === "FREE" && (
        <div className="mb-3 text-end">
          <button
            className="btn btn-success"
            onClick={() => navigate("/main/board/write")}
          >
            ✍️ 글쓰기
          </button>
        </div>
      )}

      {/* 후기 작성 폼 (후기 탭일 때만 표시) */}
      {tab === "REVIEW" && (
        <form onSubmit={handleAddReview} className="mb-4">
          <h5>후기 작성</h5>
          <label>평점(1~5): </label>
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="form-control mb-2"
            style={{ width: "100px" }}
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="form-control mb-2"
            placeholder="후기 내용을 입력하세요 (500자 이내)"
            rows="3"
          ></textarea>
          <button className="btn btn-primary" type="submit">
            등록
          </button>
        </form>
      )}

      {/* 검색창 */}
      <div className="input-group mb-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="검색어 입력 (제목, 내용, 작성자)"
          className="form-control"
        />
        <button className="btn btn-outline-secondary" onClick={handleSearch}>
          🔍 검색
        </button>
      </div>

      {/* 게시글/후기 목록 */}
      {posts.length > 0 ? (
        <ul className="list-group">
          {posts.map((p) => (
            <li key={p.postId} className="list-group-item mb-2">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5>{p.title}</h5>
                  {tab === "REVIEW" && p.rating && (
                    <p>⭐ 평점: {p.rating}/5</p>
                  )}
                  <p className="mb-1 text-muted">
                    {p.author} | {p.createdAt}
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
                <ul className="list-group mb-2">
                  {(comments[p.postId] || []).map((c) => (
                    <li
                      key={c.id}
                      className="list-group-item d-flex justify-content-between"
                    >
                      <span>
                        <strong>{c.author}</strong>: {c.content}
                        <br />
                        <small className="text-muted">{c.createdAt}</small>
                      </span>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteComment(p.postId, c.id)}
                      >
                        삭제
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="input-group">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="form-control"
                    placeholder="댓글 입력 (300자 이하)"
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
          ))}
        </ul>
      ) : (
        <p>게시글이 없습니다.</p>
      )}
    </div>
  );
};

export default Board;
