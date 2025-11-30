import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const EditProfile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(true);

  // ------------------------------------
  // 1. 사용자 정보 불러오기
  // ------------------------------------
  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/profile"); // 토큰 기반
      const data = res.data;

      setUser({
        user_id: data.user_id,
        username: data.username,
        email: data.email,
        name: data.name,
        password: "",
        interest_tags: data.interest_tags || [],
      });

      setLoading(false);
    } catch (err) {
      console.error("프로필 로드 오류:", err);
      alert("사용자 정보를 불러올 수 없습니다.");
      navigate("/main/mypage");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading || !user) return <div className="container mt-4">로딩중...</div>;

  // ------------------------------------
  // 2. 태그 추가
  // ------------------------------------
  const handleAddTag = () => {
    if (newTag && !user.interest_tags.includes(newTag)) {
      setUser({
        ...user,
        interest_tags: [...user.interest_tags, newTag],
      });
    }
    setNewTag("");
  };

  // 태그 제거
  const handleRemoveTag = (tag) => {
    setUser({
      ...user,
      interest_tags: user.interest_tags.filter((t) => t !== tag),
    });
  };

  // ------------------------------------
  // 3. 정보 수정 요청
  // ------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = {
      name: user.name,
      password: user.password || null,
      interest_tags: user.interest_tags,
    };

    try {
      await api.put(`/users/${user.user_id}`, body);
      alert("정보 수정 완료!");
      navigate("/main/mypage");
    } catch (err) {
      console.error("정보 수정 오류:", err);
      alert("수정 실패! 서버 상태를 확인하세요.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>내 정보 수정</h2>

      <form onSubmit={handleSubmit} className="mt-3">
        {/* 아이디 */}
        <div className="mb-3">
          <label className="form-label">아이디</label>
          <input
            className="form-control"
            value={user.username}
            readOnly
            style={{ backgroundColor: "#e9ecef" }}
          />
        </div>

        {/* 이메일 */}
        <div className="mb-3">
          <label className="form-label">이메일</label>
          <input
            className="form-control"
            value={user.email}
            readOnly
            style={{ backgroundColor: "#e9ecef" }}
          />
        </div>

        {/* 이름 */}
        <div className="mb-3">
          <label className="form-label">이름</label>
          <input
            className="form-control"
            value={user.name}
            onChange={(e) =>
              setUser({ ...user, name: e.target.value })
            }
          />
        </div>

        {/* 새 비밀번호 */}
        <div className="mb-3">
          <label className="form-label">새 비밀번호</label>
          <input
            type="password"
            className="form-control"
            placeholder="변경할 비밀번호 입력"
            value={user.password}
            onChange={(e) =>
              setUser({ ...user, password: e.target.value })
            }
          />
        </div>

        {/* 관심사 태그 */}
        <div className="mb-3">
          <label className="form-label">관심사 태그</label>
          <div className="mb-2">
            {user.interest_tags.map((tag, i) => (
              <span
                key={i}
                className="badge bg-primary me-2"
                style={{ cursor: "pointer" }}
                onClick={() => handleRemoveTag(tag)}
              >
                {tag} ✕
              </span>
            ))}
          </div>

          <div className="input-group mt-2">
            <input
              type="text"
              className="form-control"
              placeholder="새 태그 입력"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleAddTag}
            >
              추가
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          정보 수정 완료
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
