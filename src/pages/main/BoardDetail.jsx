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

  useEffect(() => {
    api.get("/users/profile")
      .then((res) => setUserId(res.data.userId))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/study-posts/${postId}`);
        const data = res.data;
        setPost(data);

        const gid = data.groupId ?? data.group_id;
        if (data.type === "REVIEW" && gid) {
          const gRes = await api.get(`/study-groups/${gid}`);
          setGroupInfo(gRes.data);
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

  const deletePost = async () => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    try {
      await api.delete(`/study-posts/${postId}`);
      alert("삭제 완료");
      navigate("/main/board");
    } catch {
      alert("삭제 실패");
    }
  };

  const writeComment = async () => {
    if (!newComment.trim()) return;

    try {
      await api.post(`/study-posts/${postId}/comments`, {
        content: newComment,
      });

      const res = await api.get(`/study-posts/${postId}/comments`);
      setComments(res.data);
      setNewComment("");
    } catch {
      console.error("댓글 실패");
    }
  };

  const deleteCommentFn = async (cid) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      await api.delete(`/study-posts/${postId}/comments/${cid}`);
      setComments((prev) => prev.filter((c) => c.commentId !== cid));
    } catch {}
  };

  return (
    <div className="container mt-4" style={{ textAlign: "left" }}>
      <button className="btn btn-secondary mb-3" onClick={() => navigate("/main/board")}>
        ← 뒤로가기
      </button>

      {/* 게시글 영역 */}
      <div className="card mb-4">
        <div className="card-header">
          <h4 style={{ marginBottom: 0 }}>{post.title}</h4>
          <span className="badge bg-primary">{post.type}</span>
        </div>

        <div className="card-body">
          <p style={{ whiteSpace: "pre-wrap" }}>{post.content}</p>

          <p className="text-muted">작성자: {post.leaderName || "익명"}</p>

          {post.type === "REVIEW" && groupInfo && (
            <p className="text-muted">
              스터디명: <strong>{groupInfo.title}</strong>
            </p>
          )}

          {/* 수정/삭제 버튼 */}
          {post.leaderId === userId && (
            <div className="mt-3">
              <button
                className="btn me-2"
                style={{
                  backgroundColor: "#A3E4D7",
                  color: "#000",
                  fontWeight: "500",
                }}
                onClick={() => navigate(`/main/board/edit/${postId}`)}
              >
                수정
              </button>

              <button
                className="btn"
                style={{
                  backgroundColor: "#F5B7B1",
                  color: "#000",
                  fontWeight: "500",
                }}
                onClick={deletePost}
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 댓글 영역 */}
      <div className="mb-5">
        <h5>댓글</h5>

        {comments.map((c) => (
          <div key={c.commentId} className="card p-3 mb-2">
            <p style={{ marginBottom: 6 }}>{c.content}</p>

            <small className="text-muted">
              {c.userName || "사용자"} • {c.createdAt}
            </small>

            {c.userId === userId && (
              <button
                onClick={() => deleteCommentFn(c.commentId)}
                className="btn btn-sm mt-2"
                style={{
                  backgroundColor: "#F5B7B1",
                  color: "#000",
                  borderRadius: "8px",
                  padding: "2px 8px",
                  fontSize: "12px",
                  width: "fit-content",
                }}
              >
                ❌ 삭제
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
        />

        {/* 댓글 작성 버튼 → 보라색 */}
        <button
          className="btn mt-2"
          style={{
            backgroundColor: "#a78bfa",
            color: "white",
            fontWeight: "bold",
          }}
          onClick={writeComment}
        >
          댓글 작성
        </button>
      </div>
    </div>
  );
};

export default BoardDetail;
