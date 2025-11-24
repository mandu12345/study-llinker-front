import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Map from "../../components/Map";

const EditProfile = () => {
  const navigate = useNavigate();

  // 더미 사용자 데이터
  const [user, setUser] = useState({
    user_id: 1,
    username: "superuser",
    email: "superuser@example.com",
    name: "관리자",
    password: "",
    interest_tags: ["Java", "React", "AI"],
    latitude: 37.4496,
    longitude: 127.1278,
  });

  const [newTag, setNewTag] = useState("");

  // 페이지 진입 시 콘솔 확인 (테스트용)
  useEffect(() => {
    console.log("현재 사용자:", user.username);
  }, []);

  // 태그 추가
  const handleAddTag = () => {
    if (newTag && !user.interest_tags.includes(newTag)) {
      setUser({ ...user, interest_tags: [...user.interest_tags, newTag] });
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

  // 더미 정보 수정 완료
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("정보 수정 완료 (테스트 모드)\n서버 연결 시 실제 반영됩니다!");
    navigate("/main/mypage");
  };

  return (
    <div className="container mt-4">
      <h2>내 정보 수정</h2>
      <form onSubmit={handleSubmit} className="mt-3">
        {/* 아이디 (수정 불가) */}
        <div className="mb-3">
          <label className="form-label">아이디</label>
          <input
            className="form-control"
            value={user.username}
            readOnly
            style={{ backgroundColor: "#e9ecef" }}
          />
        </div>

        {/* 이메일 (수정 불가) */}
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
            onChange={(e) => setUser({ ...user, name: e.target.value })}
          />
        </div>

        {/* 비밀번호 */}
        <div className="mb-3">
          <label className="form-label">새 비밀번호</label>
          <input
            type="password"
            className="form-control"
            placeholder="변경할 비밀번호 입력"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
          />
          <small className="text-muted">비밀번호는 6자 이상이어야 합니다.</small>
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

        {/* 위치 */}
        <div className="mb-3">
          <label className="form-label">위치</label>
          <p>
            ({user.latitude.toFixed(4)}, {user.longitude.toFixed(4)})
          </p>
          <Map latitude={user.latitude} longitude={user.longitude} />
          <small className="text-muted">
            현재 위치는 수정 불가 (테스트 모드)
          </small>
        </div>

        <button type="submit" className="btn btn-primary">
          정보 수정 완료
        </button>
      </form>
    </div>
  );
};

export default EditProfile;