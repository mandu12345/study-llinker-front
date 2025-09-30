import React, { useState, useEffect } from "react";

// 거리 계산 함수 (Haversine formula)
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // km 단위
}

// 더미 데이터 (백엔드 연결 전 테스트용)
const dummyGroups = [
  {
    id: 1,
    title: "Java 스터디",
    description: "기초부터 배우는 Java",
    leader: "홍길동",
    members: 5,
    max: 10,
    latitude: 37.4496,
    longitude: 127.1278,
  },
  {
    id: 2,
    title: "AI 스터디",
    description: "머신러닝, 딥러닝 입문",
    leader: "이호주",
    members: 8,
    max: 10,
    latitude: 37.4509,
    longitude: 127.1264,
  },
  {
    id: 3,
    title: "Spring Boot 스터디",
    description: "실전 백엔드 프로젝트",
    leader: "김철수",
    members: 3,
    max: 10,
    latitude: 37.4488,
    longitude: 127.1300,
  },
];

// 더미 추천 태그 (나중에 API 연동 가능)
const dummyTags = ["파이썬", "자바", "딥러닝", "Spring Boot", "AI"];

const StudyList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  // 사용자 현재 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.error("위치 가져오기 실패:", err);
        }
      );
    }
  }, []);

  // 검색 + 거리 계산 + 정렬
  const filteredGroups = dummyGroups
    .filter(
      (g) =>
        g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((g) => {
      if (userLocation) {
        g.distance = getDistance(
          userLocation.lat,
          userLocation.lng,
          g.latitude,
          g.longitude
        );
      } else {
        g.distance = null;
      }
      return g;
    })
    .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

  return (
    <div>
      <h3>스터디 목록</h3>

      {/* 검색창 */}
      <input
        type="text"
        className="form-control mb-2"
        placeholder="스터디를 검색하세요..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* 해시태그 추천 */}
      <div className="mb-3">
        {dummyTags.map((tag, idx) => (
          <span
            key={idx}
            className="badge bg-secondary me-2"
            style={{ cursor: "pointer" }}
            onClick={() => setSearchTerm(tag)}
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* 스터디 카드 목록 */}
      <div className="row">
        {filteredGroups.map((group) => (
          <div key={group.id} className="col-md-6 mb-3">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{group.title}</h5>
                <p className="card-text">
                  {group.description} <br />
                  리더: {group.leader} <br />
                  참여: {group.members}/{group.max} <br />
                  거리:{" "}
                  {group.distance
                    ? group.distance.toFixed(1) + " km"
                    : "위치 정보 없음"}
                </p>
                <button className="btn btn-primary btn-sm">참여 신청</button>
              </div>
            </div>
          </div>
        ))}
        {filteredGroups.length === 0 && <p>검색 결과가 없습니다.</p>}
      </div>
    </div>
  );
};

export default StudyList;
