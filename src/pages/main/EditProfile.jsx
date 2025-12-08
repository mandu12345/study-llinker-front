// src/pages/main/EditProfile.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const EditProfile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. 사용자 정보 불러오기
  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/profile");
      const data = res.data;

      setUser({
        userId: data.userId,
        username: data.username,
        email: data.email,
        name: data.name,
        role: data.role,
        latitude: data.latitude,
        longitude: data.longitude,
        password: "",
        interestTags: data.interestTags || [],
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

  if (loading || !user) {
    return <div className="container mt-4">로딩중...</div>;
  }

  // 2. 태그 추가
  const handleAddTag = () => {
    if (newTag && !user.interestTags.includes(newTag)) {
      setUser({
        ...user,
        interestTags: [...user.interestTags, newTag],
      });
    }
    setNewTag("");
  };

  // 3. 태그 제거
  const handleRemoveTag = (tag) => {
    setUser({
      ...user,
      interestTags: user.interestTags.filter((t) => t !== tag),
    });
  };

  // 4. 정보 수정 요청
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const passwordToSend =
        user.password && user.password.trim() !== "" ? user.password : null;

      await api.put(`/users/${user.userId}`, {
        username: user.username,
        email: user.email,
        name: user.name,
        interestTags: user.interestTags,
        latitude: user.latitude,
        longitude: user.longitude,
        role: user.role,
        password: passwordToSend, 
      });

      alert("정보 수정이 완료되었습니다!");
      navigate("/main/mypage");
    } catch (err) {
      console.error("정보 수정 오류:", err);
      alert("정보 수정에 실패했습니다. 서버 상태를 확인하세요.");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4"><strong>내 정보 수정</strong></h2>

      <form onSubmit={handleSubmit} className="mt-3">

        {/* 아이디 */}
        <div className="mb-3">
          <label className="form-label text-start w-100">아이디</label>
          <input
            className="form-control"
            value={user.username}
            readOnly
            style={{ backgroundColor: "#e9ecef" }}
          />
        </div>

        {/* 이메일 */}
        <div className="mb-3">
          <label className="form-label text-start w-100">이메일</label>
          <input
            className="form-control"
            value={user.email}
            readOnly
            style={{ backgroundColor: "#e9ecef" }}
          />
        </div>

        {/* 이름 */}
        <div className="mb-3">
          <label className="form-label text-start w-100">이름</label>
          <input
            className="form-control"
            value={user.name}
            onChange={(e) =>
              setUser({
                ...user,
                name: e.target.value,
              })
            }
          />
        </div>

        {/* 새 비밀번호 */}
        <div className="mb-3">
          <label className="form-label text-start w-100">새 비밀번호</label>
          <input
            type="password"
            className="form-control"
            placeholder="변경할 비밀번호 입력 (미입력 시 변경 안 됨)"
            value={user.password}
            onChange={(e) =>
              setUser({
                ...user,
                password: e.target.value,
              })
            }
          />
        </div>

        {/* 관심사 태그 */}
        <div className="mb-3">
          <label className="form-label text-start w-100">관심사 태그</label>

          <div className="mb-2 text-start w-100">
            {user.interestTags.map((tag, i) => (
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

        {/* 수정 버튼 */}
        <button
          type="submit"
          className="btn"
          style={{
            backgroundColor: "#a78bfa",
            color: "white",
            fontWeight: "bold",
          }}
        >
          정보 수정 완료
        </button>

      </form>
    </div>
  );
};

export default EditProfile;
