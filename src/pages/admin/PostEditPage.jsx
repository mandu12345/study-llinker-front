import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../axios";

const PostEditPage = () => {
  const { id } = useParams();                 // DB: post_id
  const navigate = useNavigate();
  const [post, setPost] = useState(null);

  // -----------------------------------
  // ✅ 게시글 상세 조회 (GET /api/study-posts/{postId})
  // -----------------------------------
  useEffect(() => {
    api.get(`/study-posts/${id}`)
      .then(res => setPost(res.data))
      .catch(err => console.error("게시글 불러오기 실패:", err));
  }, [id]);

  // -----------------------------------
  // 📝 게시글 수정 (PUT /api/study-posts/{postId})
  // -----------------------------------
  const handleSave = () => {
    api.put(`/study-posts/${id}`, post)
      .then(() => {
        alert(`게시글 "${post.title}" 수정 완료`);
        navigate("/admin/board/posts");
      })
      .catch(err => console.error("게시글 수정 실패:", err));
  };

  if (!post) return <p>게시글을 불러오는 중...</p>;

  return (
    <div className="container mt-4">
      <h2>📝 게시글 수정 (ID: {id})</h2>

      {/* 제목 */}
      <label className="form-label">제목</label>
      <input
        type="text"
        className="form-control mb-3"
        value={post.title}
        onChange={(e) => setPost({ ...post, title: e.target.value })}
      />

      {/* 작성자 (leader_id) */}
      <label className="form-label">작성자 (leader_id)</label>
      <input
        type="text"
        className="form-control mb-3"
        value={post.leader_id}
        disabled
      />

      {/* 유형 (type) */}
      <label className="form-label">게시글 유형(type)</label>
      <select
        className="form-select mb-3"
        value={post.type || ""}
        onChange={(e) => setPost({ ...post, type: e.target.value })}
      >
        <option value="FREE">자유글</option>
        <option value="STUDY">스터디 모집</option>
        <option value="REVIEW">스터디 후기</option>
      </select>

      {/* 내용 */}
      <label className="form-label">내용</label>
      <textarea
        className="form-control mb-3"
        rows="8"
        value={post.content}
        onChange={(e) => setPost({ ...post, content: e.target.value })}
      />

      <div className="d-flex justify-content-end mt-4">
        <button className="btn btn-secondary me-2" onClick={() => navigate("/admin/board/posts")}>
          취소
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          저장
        </button>
      </div>
    </div>
  );
};

export default PostEditPage;
