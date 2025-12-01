import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../auth/AuthContext";
import api from "../../api/axios";

const BoardWrite = ({ defaultType }) => {
  const { user } = useContext(AuthContext);
  const userId = user?.userId;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState(defaultType || "FREE");

  // REVIEW 전용 필드
  const [rating, setRating] = useState(0);
  const [joinedGroups, setJoinedGroups] = useState([]); // 가입된 그룹 목록
  const [selectedGroupId, setSelectedGroupId] = useState(""); // 선택된 스터디 ID

  // 후기 작성 시: 가입된 스터디 목록 불러오기
  useEffect(() => {
    if (type !== "REVIEW" || !userId) return;

    const loadJoinedGroups = async () => {
      try {
        // 1) 전체 스터디 목록 조회
        const groupsRes = await api.get("/study-groups");
        const groups = groupsRes.data || [];

        const myGroups = [];

        // 2) 각 스터디에서 내가 멤버인지 검사
        for (const g of groups) {
          try {
            const memberRes = await api.get(
              `/study-groups/${g.groupId}/members/${userId}`
            );

            if (memberRes.data?.status === "APPROVED") {
              myGroups.push(g);
            }
          } catch (err) {
            // 가입 안 된 스터디는 404 or not found → 건너뜀
          }
        }

        setJoinedGroups(myGroups);
      } catch (err) {
        console.error("스터디 목록 로딩 실패:", err);
      }
    };

    loadJoinedGroups();
  }, [type, userId]);

  // 게시글 등록
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("로그인 정보가 없습니다. 다시 로그인 해주세요.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력하세요.");
      return;
    }

    if (type === "REVIEW") {
      // REVIEW 유효성
      if (rating < 1 || rating > 5) {
        alert("평점은 1~5 사이입니다.");
        return;
      }
      if (!selectedGroupId) {
        alert("후기를 남길 스터디를 선택하세요.");
        return;
      }
      if (content.length > 500) {
        alert("후기 내용은 500자 이내여야 합니다.");
        return;
      }
    } else {
      // FREE 유효성
      if (content.length > 2000) {
        alert("게시글 내용은 2000자 이내여야 합니다.");
        return;
      }
    }

    try {
      // 1) 게시글 생성
      const postRes = await api.post(
        `/study-posts?leaderId=${userId}`,
        {
          title,
          content,
          type,
          groupId: type === "REVIEW" ? selectedGroupId : null, 
        }
      );

      const postId = postRes.data?.postId;

      if (!postId) {
        throw new Error("postId를 가져올 수 없음");
      }

      // 2) 리뷰 생성 (REVIEW 전용)
      if (type === "REVIEW") {
        await api.post(`/study-posts/${postId}/reviews`, {
          rating,
          content,
        });
        alert("후기 등록 완료!");
      } else {
        alert("게시글 등록 완료!");
      }

      // 초기화
      setTitle("");
      setContent("");
      setRating(0);
      setSelectedGroupId("");
      setType(defaultType || "FREE");

    } catch (err) {
      console.error(err);
      alert("글 작성 실패. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <div className="container mt-3">
      <h3>게시글 작성</h3>

      <form onSubmit={handleSubmit}>
        {/* 제목 */}
        <div className="mb-2">
          <label className="form-label">제목</label>
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* 내용 */}
        <div className="mb-2">
          <label className="form-label">내용</label>
          <textarea
            className="form-control"
            rows="5"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <small className="text-muted">
            {type === "REVIEW"
              ? "후기 내용은 500자 이내로 작성해주세요."
              : "게시글 내용은 2000자 이하로 작성 가능합니다."}
          </small>
        </div>

        {/* 게시판 종류 */}
        <div className="mb-2">
          <label className="form-label">게시판 종류</label>
          <select
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="FREE">자유게시판</option>
            <option value="REVIEW">스터디 리뷰</option>
          </select>
        </div>

        {/* REVIEW 전용: 가입된 스터디 선택 */}
        {type === "REVIEW" && (
          <div className="mb-2">
            <label className="form-label">어떤 스터디에 대한 후기인가요?</label>
            <select
              className="form-select"
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

            {joinedGroups.length === 0 && (
              <small className="text-danger">
                가입된 스터디가 없습니다. 스터디에 가입해야 후기를 남길 수 있습니다.
              </small>
            )}
          </div>
        )}

        {/* REVIEW 전용: 평점 */}
        {type === "REVIEW" && (
          <div className="mb-2">
            <label className="form-label">평점 (1~5)</label>
            <input
              type="number"
              className="form-control"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              style={{ width: "100px" }}
              required
            />
          </div>
        )}

        {/* 등록 버튼 */}
        <button className="btn btn-primary" type="submit">
          등록
        </button>
      </form>
    </div>
  );
};

export default BoardWrite;
