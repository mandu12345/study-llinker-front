// src/pages/main/BoardDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const BoardDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);

  const [comments, setComments] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  const [reviews, setReviews] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewText, setEditReviewText] = useState("");

  const [newComment, setNewComment] = useState("");
  const [newReview, setNewReview] = useState("");

  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState(null);

  // ================================
  // 로그인 정보
  // ================================
  useEffect(() => {
    api.get("/users/profile")
      .then((res) => setUserId(res.data.user_id))
      .catch(() => {});
  }, []);

  // ================================
  // 게시글 상세 + 댓글 + 리뷰 불러오기
  // ================================
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/study-posts/${postId}`);
        setPost(res.data);

        const cRes = await api.get(`/study-posts/${postId}/comments`);
        setComments(cRes.data);

        if (res.data.type === "REVIEW") {
          const rRes = await api.get(`/study-posts/${postId}/reviews`);
          setReviews(rRes.data);
        }
      } catch (err) {
        console.error("불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [postId]);

  if (loading || !post) return <p>로딩 중...</p>;

  const isReviewPost = post.type === "REVIEW";

  // ================================
  // 게시글 삭제
  // ================================
  const deletePost = async () => {
    if (!window.confirm("삭제하시겠습니까?")) return;

    try {
      await api.delete(`/study-posts/${postId}`);
      alert("삭제 완료");
      navigate("/main/board");
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  // ================================
  // 댓글 작성
  // ================================
  const writeComment = async () => {
    if (!newComment.trim()) return;

    await api.post(`/study-posts/${postId}/comments`, { content: newComment });
    const res = await api.get(`/study-posts/${postId}/comments`);
    setComments(res.data);
    setNewComment("");
  };

  // 댓글 삭제
  const deleteComment = async (cid) => {
    if (!window.confirm("삭제하시겠습니까?")) return;

    await api.delete(`/study-posts/${postId}/comments/${cid}`);
    setComments((prev) => prev.filter((c) => c.comment_id !== cid));
  };

  // 댓글 수정 저장
  const saveComment = async (cid) => {
    await api.patch(`/study-posts/${postId}/comments/${cid}`, {
      content: editCommentText,
    });

    const res = await api.get(`/study-posts/${postId}/comments`);
    setComments(res.data);

    setEditingCommentId(null);
    setEditCommentText("");
  };

  // ================================
  // 후기 작성
  // ================================
  const writeReview = async () => {
    if (!newReview.trim()) return;

    await api.post(`/study-posts/${postId}/reviews`, {
      content: newReview,
      rating: 5,
    });

    const res = await api.get(`/study-posts/${postId}/reviews`);
    setReviews(res.data);
    setNewReview("");
  };

  // 후기 삭제
  const deleteReview = async (rid) => {
    if (!window.confirm("삭제하시겠습니까?")) return;

    await api.delete(`/study-posts/${postId}/reviews/${rid}`);
    setReviews((prev) => prev.filter((r) => r.review_id !== rid));
  };

  // 후기 수정 저장
  const saveReview = async (rid) => {
    await api.patch(`/study-posts/${postId}/reviews/${rid}`, {
      content: editReviewText,
      rating: 5,
    });

    const res = await api.get(`/study-posts/${postId}/reviews`);
    setReviews(res.data);

    setEditingReviewId(null);
    setEditReviewText("");
  };

  return (
    <div className="container mt-4">

      <button className="btn btn-secondary mb-3"
        onClick={() => navigate("/main/board")}
      >
        ← 뒤로가기
      </button>

      {/* ------------------------------ */}
      {/* 게시글 영역 */}
      {/* ------------------------------ */}
      <div className="card mb-4">
        <div className="card-header">
          <h4>{post.title}</h4>
          <span className="badge bg-primary">{post.type}</span>
        </div>

        <div className="card-body">
          <p>{post.content}</p>

          <p className="text-muted">
            작성자: {post.leaderName || "익명"}
          </p>

          {post.userId === userId && (
            <>
              <button
                className="btn btn-warning me-2"
                onClick={() => navigate(`/main/board/edit/${postId}`)}
              >
                수정
              </button>

              <button className="btn btn-danger" onClick={deletePost}>
                삭제
              </button>
            </>
          )}
        </div>
      </div>

      {/* ------------------------------ */}
      {/* 후기 영역 */}
      {/* ------------------------------ */}
      {isReviewPost && (
        <div className="mb-5">
          <h5>후기</h5>

          {reviews.map((r) => (
            <div key={r.review_id} className="card p-3 mb-2">

              {editingReviewId === r.review_id ? (
                <>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={editReviewText}
                    onChange={(e) => setEditReviewText(e.target.value)}
                  />

                  <button
                    className="btn btn-primary btn-sm mt-2 me-2"
                    onClick={() => saveReview(r.review_id)}
                  >
                    저장
                  </button>

                  <button
                    className="btn btn-secondary btn-sm mt-2"
                    onClick={() => {
                      setEditingReviewId(null);
                      setEditReviewText("");
                    }}
                  >
                    취소
                  </button>
                </>
              ) : (
                <>
                  <p>{r.content}</p>
                  <small className="text-muted">{r.username}</small>

                  {r.user_id === userId && (
                    <>
                      <button
                        className="btn btn-warning btn-sm mt-2 me-2"
                        onClick={() => {
                          setEditingReviewId(r.review_id);
                          setEditReviewText(r.content);
                        }}
                      >
                        수정
                      </button>

                      <button
                        className="btn btn-danger btn-sm mt-2"
                        onClick={() => deleteReview(r.review_id)}
                      >
                        삭제
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          ))}

          <textarea
            className="form-control mt-3"
            rows={2}
            placeholder="후기 작성..."
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
          />
          <button className="btn btn-primary mt-2" onClick={writeReview}>
            후기 작성
          </button>
        </div>
      )}

      {/* ------------------------------ */}
      {/* 댓글 영역 */}
      {/* ------------------------------ */}
      <div className="mb-5">
        <h5>댓글</h5>

        {comments.map((c) => (
          <div key={c.comment_id} className="card p-3 mb-2">

            {editingCommentId === c.comment_id ? (
              <>
                <textarea
                  className="form-control"
                  rows={2}
                  value={editCommentText}
                  onChange={(e) => setEditCommentText(e.target.value)}
                />

                <button
                  className="btn btn-primary btn-sm mt-2 me-2"
                  onClick={() => saveComment(c.comment_id)}
                >
                  저장
                </button>

                <button
                  className="btn btn-secondary btn-sm mt-2"
                  onClick={() => {
                    setEditingCommentId(null);
                    setEditCommentText("");
                  }}
                >
                  취소
                </button>
              </>
            ) : (
              <>
                <p>{c.content}</p>
                <small className="text-muted">{c.username}</small>

                {c.user_id === userId && (
                  <>
                    <button
                      className="btn btn-warning btn-sm mt-2 me-2"
                      onClick={() => {
                        setEditingCommentId(c.comment_id);
                        setEditCommentText(c.content);
                      }}
                    >
                      수정
                    </button>

                    <button
                      className="btn btn-danger btn-sm mt-2"
                      onClick={() => deleteComment(c.comment_id)}
                    >
                      삭제
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        ))}

        <textarea
          className="form-control mt-3"
          rows={2}
          placeholder="댓글 작성..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />

        <button className="btn btn-primary mt-2" onClick={writeComment}>
          댓글 작성
        </button>
      </div>
    </div>
  );
};

export default BoardDetail;
