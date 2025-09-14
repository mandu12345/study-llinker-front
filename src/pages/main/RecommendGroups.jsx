// src/pages/main/RecommendGroups.jsx
import React, { useState } from "react";
import axios from "axios";

const RecommendGroups = ({ onAddSchedule }) => {
  const [groups, setGroups] = useState([]); // 백엔드에서 받은 추천 그룹
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 위치 기반 추천 그룹 불러오기
  const fetchRecommendedGroups = () => {
    setLoading(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            // 백엔드 API 호출 (예: GET /api/study-groups/recommend?lat=...&lng=...)
            const res = await axios.get("http://localhost:8080/api/study-groups/recommend", {
              params: { lat, lng },
            });
            setGroups(res.data); // API 결과 배열 저장
          } catch (err) {
            console.error(err);
            setError("추천 그룹을 불러오는 중 오류가 발생했습니다.");
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.error(err);
          setError("위치 정보를 가져올 수 없습니다.");
          setLoading(false);
        }
      );
    } else {
      setError("브라우저에서 위치 정보를 지원하지 않습니다.");
    }
  };

  return (
    <div>
      <h3>추천 그룹</h3>
      <button className="btn btn-primary mb-3" onClick={fetchRecommendedGroups}>
        내 위치 기반 추천 그룹 가져오기
      </button>

      {loading && <p>로딩 중...</p>}
      {error && <p className="text-danger">{error}</p>}

      <div className="row">
        {groups.length > 0 &&
          groups.map((g) => (
            <div key={g.groupId} className="col-md-6 mb-3">
              <div className="card border-success shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{g.title}</h5>
                  <p className="card-text">
                    카테고리: {g.category} <br />
                    거리: {g.distance.toFixed(1)} km
                  </p>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() =>
                      onAddSchedule({
                        title: g.title,
                        leader: "미정",
                        date: new Date(), // 서버에서 날짜 내려주면 그걸 쓰면 됨
                        location: g.category,
                        content: `거리: ${g.distance.toFixed(1)} km`,
                        lat: g.latitude,
                        lng: g.longitude,
                        members: 1,
                        max: 10,
                      })
                    }
                  >
                    달력/지도에 추가
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default RecommendGroups;
