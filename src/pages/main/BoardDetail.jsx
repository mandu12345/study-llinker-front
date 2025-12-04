// src/pages/main/BoardDetail.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const BoardDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [groupInfo, setGroupInfo] = useState(null);

  // 로그인 사용자 ID 조회
  useEffect(() => {
    api
      .get("/users/profile")
      .then((res) => setUserId(res.data.userId))
      .catch(() => {});
  }, []);

  // 게시글 + 댓글 로드
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/study-posts/${postId}`);
        const data = res.data;
        setPost(data);

        const gid = data.groupId ?? data.group_id;
        if (data.type === "REVIEW" && gid) {
          try {
            const gRes = await api.get(`/study-groups/${gid}`);
            setGroupInfo(gRes.data);
          } catch {}
        }

        const cRes = await api.get(`/study-posts/${postId}/comments`);
        setComments(cRes.data);
      } catch (err) {
        console.error("❌ 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [postId]);

  if (loading || !post) return <p>로딩 중...</p>;

  // 게시글 삭제
  const deletePost = async () => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    try {
      await api.delete(`/study-posts/${postId}`);
      alert("삭제 완료");
      navigate("/main/board");
    } catch (err) {
      console.error(err);
      alert("삭제 실패");
    }
  };

  // 댓글 작성
  const writeComment = async () => {
    if (!newComment.trim()) return;

    try {
      await api.post(`/study-posts/${postId}/comments`, {
        content: newComment,
      });

      const res = await api.get(`/study-posts/${postId}/comments`);
      setComments(res.data);
      setNewComment("");
    } catch (err) {
      console.error("댓글 실패:", err);
    }
  };

  // 댓글 삭제
  const deleteCommentFn = async (cid) => {
    if (!window.confirm("삭제하시겠습니까?")) return;

    try {
      await api.delete(`/study-posts/${postId}/comments/${cid}`);
      setComments((prev) => prev.filter((c) => c.commentId !== cid));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-4" style={{ textAlign: "left" }}>
      {/* 뒤로가기 */}
      <button
        className="btn btn-secondary mb-3"
        onClick={() => navigate("/main/board")}
      >
        ← 뒤로가기
      </button>

      {/* 게시글 영역 */}
      <div className="card mb-4" style={{ textAlign: "left" }}>
        <div className="card-header">
          <h4 style={{ marginBottom: "0" }}>{post.title}</h4>
          <span className="badge bg-primary">{post.type}</span>
        </div>

        <div className="card-body" style={{ textAlign: "left" }}>
          <p style={{ whiteSpace: "pre-wrap" }}>{post.content}</p>

          <p className="text-muted">
            작성자: {post.leaderName || "익명"}  
          </p>

          {post.type === "REVIEW" && groupInfo && (
            <p className="text-muted">
              스터디명: <strong>{groupInfo.title}</strong>
            </p>
          )}

          {/* 수정/삭제 버튼 — 작성자만 */}
          {post.leaderId === userId && (
            <div className="mt-3">
              <button
                className="btn btn-warning me-2"
                onClick={() => navigate(`/main/board/edit/${postId}`)}
              >
                수정
              </button>
              <button className="btn btn-danger" onClick={deletePost}>
                삭제
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 댓글 영역 */}
      <div className="mb-5" style={{ textAlign: "left" }}>
        <h5>댓글</h5>

        {comments.map((c) => (
          <div key={c.commentId} className="card p-3 mb-2" style={{ textAlign: "left" }}>
            <p style={{ marginBottom: "6px" }}>{c.content}</p>
            <small className="text-muted">
              {c.userName || "사용자"} • {c.createdAt}
            </small>

            {c.userId === userId && (
              <button
                className="btn btn-danger btn-sm mt-2"
                style={{ width: "auto" }}
                onClick={() => deleteCommentFn(c.commentId)}
              >
                삭제
              </button>
            )}
          </div>
        ))}

        {/* 댓글 입력 */}
        <textarea
          className="form-control mt-3"
          rows={2}
          placeholder="댓글 작성..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          style={{ textAlign: "left" }}
        />

        <button className="btn btn-primary mt-2" onClick={writeComment}>
          댓글 작성
        </button>
      </div>
    </div>
  );
};

export default BoardDetail;
