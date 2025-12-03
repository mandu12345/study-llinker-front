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

  // ------------------------------------------------
  // 수정 모드 → 기존 게시글 불러오기
  // ------------------------------------------------
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
          setSelectedGroupId(p.groupId || "");
          // 리뷰 평점은 리뷰 API에서 따로 관리하므로 여기선 사용 X
          setRating(5);
        }
      } catch (err) {
        console.error("게시글 불러오기 실패:", err);
      }
    };

    load();
  }, [isEdit, postId]);

  // ------------------------------------------------
  // REVIEW 전용 — 가입 스터디 목록 로드
  // ------------------------------------------------
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

  // ------------------------------------------------
  // 저장 (작성 + 수정)
  // ------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력하세요.");
      return;
    }

    try {
      // ============================
      // 수정 모드
      // ============================
      if (isEdit) {
        await api.patch(`/study-posts/${postId}`, {
          title,
          content,
          type, // StudyPostUpdateRequest 필드
          groupId: type === "REVIEW" ? selectedGroupId : null,
        });

        alert("게시글 수정 완료!");
        navigate(`/main/board/${postId}`);
        return;
      }

      // ============================
      // 작성 모드 — StudyPostCreateRequest 기반
      // ============================

      const postBody = {
        title,
        content,
        type, // FREE / STUDY / REVIEW
        leaderId: userId, // DTO 필드, 백엔드에서 체크됨
        groupId: type === "REVIEW" ? selectedGroupId : null,
        maxMembers: 0, // FREE & REVIEW는 사용 안 함
        studyDate: null,
        location: null,
        latitude: null,
        longitude: null,
      };

      const postRes = await api.post("/study-posts", postBody);
      const newId = postRes.data?.postId;

      if (!newId) {
        alert("게시글 생성 실패: postId 누락");
        return;
      }

      // REVIEW → 생성 후 리뷰도 추가 생성해야 함
      if (type === "REVIEW") {
        await api.post(`/study-posts/${newId}/reviews`, {
          rating,
          content,
        });
      }

      alert("게시글 등록 완료!");
      navigate(`/main/board/${newId}`);
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
          disabled={isEdit} // 수정 시 게시판 변경 불가
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
              required
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
