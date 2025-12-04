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

  // 🔥 로그인 유저 ID 가져오기 (userId가 맞는 필드)
  useEffect(() => {
    api
      .get("/users/profile")
      .then((res) => {
        // 🔥 user_id → userId 로 통일
        setUserId(res.data.userId);
      })
      .catch(() => {});
  }, []);

  // 게시글 · 댓글 로드 + (REVIEW 게시글일 경우 스터디 정보 로드)
useEffect(() => {
  const load = async () => {
    try {
      // 1) 게시글 조회
      const res = await api.get(`/study-posts/${postId}`);
      const postData = res.data;
      setPost(postData);

      // ⭐ groupId가 올바르게 전달되는지 확인
      const gid = postData.groupId ?? postData.group_id;
      console.log("📌 [DEBUG] gid 최종값:", gid);

      // 2) REVIEW + groupId 있을 때만 스터디 정보 조회
      if (postData.type === "REVIEW" && gid) {
        try {
          const gRes = await api.get(`/study-groups/${gid}`);
          setGroupInfo(gRes.data);
        } catch (err) {
          console.error("❌ 스터디 정보 조회 실패:", err);
        }
      } else {
        console.log("⚠ REVIEW가 아니거나 groupId 없음 → 스터디 정보 조회 안 함");
      }

      // 3) 댓글 조회
      const cRes = await api.get(`/study-posts/${postId}/comments`);
      setComments(cRes.data);
    } catch (err) {
      console.error("❌ 게시글/댓글 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  load();
}, [postId]);


  if (loading || !post) return <p>로딩 중...</p>;

  // -----------------------------
  // 🔥 게시글 삭제
  // -----------------------------
  const deletePost = async () => {
    if (!window.confirm("삭제하시겠습니까?")) return;

    try {
      await api.delete(`/study-posts/${postId}`);
      alert("삭제 완료");
      navigate("/main/board");
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제 실패");
    }
  };

  // -----------------------------
  // 🔥 댓글 작성
  // -----------------------------
  const writeComment = async () =>
    {
    if (!newComment.trim()) return;

    try {
      await api.post(`/study-posts/${postId}/comments`, {
        content: newComment,
      });

      const res = await api.get(`/study-posts/${postId}/comments`);
      setComments(res.data);
      setNewComment("");
    } catch (err) {
      console.error("댓글 등록 실패:", err);
      alert("댓글 등록 실패");
    }
  };

  // -----------------------------
  // 🔥 댓글 삭제
  // -----------------------------
  const deleteComment = async (cid) => {
    if (!window.confirm("삭제하시겠습니까?")) return;

    try {
      await api.delete(`/study-posts/${postId}/comments/${cid}`);
      setComments((prev) => prev.filter((c) => c.commentId !== cid));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <button
        className="btn btn-secondary mb-3"
        onClick={() => navigate("/main/board")}
      >
        ← 뒤로가기
      </button>

      {/* -------------------- */}
      {/* 게시글 영역 */}
      {/* -------------------- */}
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

          {post.type === "REVIEW" && groupInfo && (
            <p className="text-muted">
              스터디명: <strong>{groupInfo.title}</strong>
            </p>
          )}

          {/* 🔥 게시글 작성자만 수정/삭제 가능 */}
          {post.leaderId === userId && (
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

      {/* -------------------- */}
      {/* 댓글 영역 */}
      {/* -------------------- */}
      <div className="mb-5">
        <h5>댓글</h5>

        {comments.map((c) => (
          <div key={c.commentId} className="card p-3 mb-2">
            <p>{c.content}</p>
            <small className="text-muted">
              {c.userName || "사용자"} • {c.createdAt}
            </small>

            {c.userId === userId && (
              <button
                className="btn btn-danger btn-sm mt-2"
                onClick={() => deleteComment(c.commentId)}
              >
                삭제
              </button>
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
