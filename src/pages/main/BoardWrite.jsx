// src/pages/main/BoardWrite.jsx
import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../auth/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const BoardWrite = ({ defaultType }) => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const isEdit = Boolean(postId);

  const { user } = useContext(AuthContext);
  const userId = user?.userId;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState(defaultType || "FREE");

  // REVIEW 전용
  const [rating, setRating] = useState(0);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");

  // ================================
  // 수정 모드라면 기존 데이터 불러오기
  // ================================
  useEffect(() => {
    if (!isEdit) return;

    const load = async () => {
      try {
        const res = await api.get(`/study-posts/${postId}`);
        const p = res.data;

        setTitle(p.title);
        setContent(p.content);
        setType(p.type);

        if (p.type === "REVIEW") {
          setRating(p.rating || 5);
          setSelectedGroupId(p.group_id || "");
        }
      } catch (err) {
        console.error("게시글 불러오기 실패:", err);
      }
    };

    load();
  }, [isEdit, postId]);

  // ================================
  // 후기 작성용 가입 스터디 목록 불러오기
  // ================================
  useEffect(() => {
    if (type !== "REVIEW" || !userId) return;

    const loadGroups = async () => {
      try {
        const groupsRes = await api.get("/study-groups");
        const groups = groupsRes.data || [];

        const myGroups = [];

        for (const g of groups) {
          try {
            const memRes = await api.get(
              `/study-groups/${g.groupId}/members/${userId}`
            );

            if (memRes.data?.status === "APPROVED") {
              myGroups.push(g);
            }
          } catch (err) {
            // 가입 안 된 스터디는 무시
          }
        }

        setJoinedGroups(myGroups);
      } catch (err) {
        console.error("스터디 목록 불러오기 실패:", err);
      }
    };

    loadGroups();
  }, [type, userId]);

  // ================================
  // 저장
  // ================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력하세요.");
      return;
    }

    try {
      if (isEdit) {
        // ============================
        // 수정 모드
        // ============================
        await api.patch(`/study-posts/${postId}`, {
          title,
          content,
          type,
        });

        alert("게시글 수정 완료!");
        navigate(`/main/board/${postId}`);
      } else {
        // ============================
        // 작성 모드
        // ============================
        const postRes = await api.post(
          `/study-posts?leaderId=${userId}`,
          {
            title,
            content,
            type,
            groupId: type === "REVIEW" ? selectedGroupId : null,
          }
        );

        const newId = postRes.data?.postId;

        if (type === "REVIEW") {
          await api.post(`/study-posts/${newId}/reviews`, {
            content,
            rating,
          });
        }

        alert("게시글 등록 완료!");
        navigate(`/main/board/${newId}`);
      }
    } catch (err) {
      console.error("저장 실패:", err);
      alert("오류 발생");
    }
  };

  return (
    <div className="container mt-3">
      <h3>{isEdit ? "게시글 수정" : "게시글 작성"}</h3>

      <form onSubmit={handleSubmit}>
        {/* 제목 */}
        <input
          className="form-control mb-3"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* 내용 */}
        <textarea
          className="form-control mb-3"
          rows="6"
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* 게시판 종류 */}
        <select
          className="form-select mb-3"
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={isEdit} // 수정 시 변경 불가
        >
          <option value="FREE">자유게시판</option>
          <option value="REVIEW">스터디 리뷰</option>
        </select>

        {/* REVIEW 전용 UI */}
        {type === "REVIEW" && (
          <>
            <label className="form-label">평점 (1~5)</label>
            <input
              type="number"
              min="1"
              max="5"
              className="form-control mb-3"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />

            <label className="form-label">후기 대상 스터디</label>
            <select
              className="form-select mb-3"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              <option value="">스터디 선택</option>

              {joinedGroups.map((g) => (
                <option key={g.groupId} value={g.groupId}>
                  {g.title}
                </option>
              ))}
            </select>
          </>
        )}

        <button className="btn btn-primary">저장</button>
        <button
          className="btn btn-secondary ms-2"
          onClick={() => navigate("/main/board")}
        >
          취소
        </button>
      </form>
    </div>
  );
};

export default BoardWrite;
