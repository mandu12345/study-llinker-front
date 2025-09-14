import React, { useState } from "react";
import axios from "axios";

const RecommendGroups = ({ onAddSchedule }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = () => {
    if (!navigator.geolocation) {
      alert("브라우저가 위치 정보를 지원하지 않습니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setLoading(true);
      try {
        const res = await axios.get("http://localhost:8080/api/study-groups/recommend", {
          params: { lat, lng, interest: "AI" }, // 관심사 선택 가능
        });
        setGroups(res.data);
      } catch (err) {
        console.error(err);
        alert("추천 그룹을 가져오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div>
      <h3>추천 그룹</h3>
      <button className="btn btn-primary mb-3" onClick={fetchRecommendations}>
        {loading ? "불러오는 중..." : "내 위치 기반 추천 그룹 가져오기"}
      </button>

      <div className="row">
        {groups.map((g) => (
          <div key={g.groupId} className="col-md-6 mb-3">
            <div className="card border-success shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{g.title}</h5>
                <p className="card-text">
                  카테고리: {g.category} <br />
                  거리: {g.distance.toFixed(2)} km
                </p>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() =>
                    onAddSchedule({
                      title: g.title,
                      date: new Date(), // 백엔드에서 날짜를 보내면 그걸로
                      leader: "미정",
                      location: "추천 그룹 위치",
                      content: g.category,
                      lat: g.latitude,
                      lng: g.longitude,
                    })
                  }
                >
                  일정 추가
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
