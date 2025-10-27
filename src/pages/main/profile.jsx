import React, { useState } from "react";
// import React, { useState, useEffect } from "react";
// import api from "../api/axios";
// -> API 연결시
import Map from "../../components/Map";

const Profile = () => {
  const [profile, setProfile] = useState({
    username: "testuser",
    name: "홍길동",
    email: "test@example.com",
    interestTags: ["Java", "AI"],
    latitude: null,
    longitude: null,
  });

  // 현재 위치 가져오기
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setProfile((prev) => ({
            ...prev,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }));
        },
        (err) => {
          console.error(err);
          alert("위치 정보를 가져올 수 없습니다.");
        }
      );
    }
  };

  // 관심 태그 추가
  const [newTag, setNewTag] = useState("");
  const handleAddTag = () => {
    if (newTag && !profile.interestTags.includes(newTag)) {
      setProfile((prev) => ({
        ...prev,
        interestTags: [...prev.interestTags, newTag],
      }));
    }
    setNewTag("");
  };

  // 저장 (백엔드 연동 준비)
  const handleSave = async () => {
    try {
      // 지금은 console.log로만 확인
      console.log("저장할 데이터:", profile);

      // 실제 API 연동 시:
      // await api.put("/users/me", profile);

      alert("프로필이 저장되었습니다!");
    } catch (err) {
      console.error(err);
      alert("저장 실패!");
    }
  };

  return (
    <div className="container mt-4">
      <h2>내 프로필</h2>

      <div className="mb-3">
        <label className="form-label">아이디</label>
        <input type="text" className="form-control" value={profile.username} disabled />
      </div>

      <div className="mb-3">
        <label className="form-label">이름</label>
        <input
          type="text"
          className="form-control"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">이메일</label>
        <input
          type="email"
          className="form-control"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">관심 태그</label>
        <div>
          {profile.interestTags.map((tag, i) => (
            <span key={i} className="badge bg-primary me-2">
              {tag}
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
          <button className="btn btn-outline-secondary" onClick={handleAddTag}>
            추가
          </button>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">위치</label>
        <p>
          {profile.latitude && profile.longitude
            ? `(${profile.latitude.toFixed(4)}, ${profile.longitude.toFixed(4)})`
            : "위치가 설정되지 않았습니다."}
        </p>
        <button className="btn btn-sm btn-success" onClick={handleGetLocation}>
          내 위치 가져오기
        </button>
      </div>

        {profile.latitude && profile.longitude && (
            <div className="mt-3">
            <Map latitude={profile.latitude} longitude={profile.longitude} />
            </div>
        )}

      <button className="btn btn-primary mt-3" onClick={handleSave}>
        저장
      </button>
    </div>
  );
};

export default Profile;
