// src/pages/main/RecommendGroups.jsx
import React, { useState, useEffect } from "react";

// 거리 계산 (Haversine)
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const RecommendGroups = () => {
  const currentUser = "홍길동"; // 로그인 사용자
  const [algorithm, setAlgorithm] = useState("locationNLP");
  const [groups, setGroups] = useState([]);
  const [sortOption, setSortOption] = useState("near");
  const [userLocation, setUserLocation] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");

  // 더미 데이터
  const dummyData = {
    locationNLP: [
      { id: 1, title: "Java 스터디", description: "기초부터 배우는 Java", leader: "홍길동", members: 5, max: 10, category: ["Java", "Spring"], latitude: 37.4496, longitude: 127.1278, rating: 4.5 },
      { id: 2, title: "AI 스터디", description: "머신러닝, 딥러닝 입문", leader: "이호주", members: 8, max: 10, category: ["AI", "딥러닝"], latitude: 37.4509, longitude: 127.1264, rating: 4.8 },
      { id: 3, title: "Python  스터디", description: "파이썬 함께해요", leader: "박지수", members: 6, max: 10, category: ["데이터분석"], latitude: 37.44, longitude: 127.11, rating: 4.7 },
    ],
    collaborative: [
      { id: 3, title: "React 스터디", description: "리액트 프로젝트 실습", leader: "김철수", members: 6, max: 10, category: ["React", "JS"], latitude: 37.4512, longitude: 127.128, rating: 4.7 },
      { id: 4, title: "Node.js 스터디", description: "Express 기반 서버 실습", leader: "박민수", members: 7, max: 10, category: ["Node", "Express"], latitude: 37.452, longitude: 127.125, rating: 4.6 },
    ],
    popular: [
      { id: 5, title: "Spring Boot 스터디", description: "서버개발 실무 준비반", leader: "정예린", members: 10, max: 10, category: ["Spring Boot"], latitude: 37.449, longitude: 127.129, rating: 4.9 },
      { id: 6, title: "Python 데이터 분석", description: "Pandas와 Matplotlib 배우기", leader: "홍길동", members: 4, max: 10, category: ["Python", "Data"], latitude: 37.447, longitude: 127.13, rating: 4.7 },
    ],
  };

  // 사용자 현재 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.error("위치 가져오기 실패:", err)
      );
    }
  }, []);

  // 알고리즘 선택 시 데이터 갱신
  useEffect(() => {
    let updated = dummyData[algorithm].map((g) => {
      if (userLocation) {
        g.distance = getDistance(userLocation.lat, userLocation.lng, g.latitude, g.longitude);
      } else {
        g.distance = null;
      }
      return g;
    });
    setGroups(updated);
  }, [algorithm, userLocation]);

  // 정렬
  const sortedGroups = [...groups].sort((a, b) => {
    if (sortOption === "near") return a.distance - b.distance;
    if (sortOption === "far") return b.distance - a.distance;
    if (sortOption === "popular") return b.rating - a.rating;
    return 0;
  });

  // 참여신청
  const handleJoin = (id) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === id
          ? g.members < g.max
            ? { ...g, members: g.members + 1 }
            : (alert("최대 인원을 초과했습니다."), g)
          : g
      )
    );
    alert("참여 신청이 완료되었습니다! (PENDING)");
  };

  // 지도 표시
  useEffect(() => {
    if (window.kakao && sortedGroups.length > 0) {
      const container = document.getElementById("recommend-map");
      const options = {
        center: new window.kakao.maps.LatLng(sortedGroups[0].latitude, sortedGroups[0].longitude),
        level: 5,
      };
      const map = new window.kakao.maps.Map(container, options);

      sortedGroups.forEach((g) => {
        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(g.latitude, g.longitude),
          map,
        });
        const info = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;">${g.title}<br/>${g.category.join(", ")}</div>`,
        });
        window.kakao.maps.event.addListener(marker, "click", () => info.open(map, marker));
      });
    }
  }, [sortedGroups]);

  // 상세보기 모달 열릴 때 주소 변환
  useEffect(() => {
    if (selectedGroup && window.kakao && window.kakao.maps) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      const coord = new window.kakao.maps.LatLng(
        selectedGroup.latitude,
        selectedGroup.longitude
      );

      geocoder.coord2Address(
        coord.getLng(),
        coord.getLat(),
        (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            // 지번주소(road_address가 없을 수도 있음)
            const road = result[0].road_address ? result[0].road_address.address_name : "";
            const jibun = result[0].address ? result[0].address.address_name : "";
            // 최종 주소 문자열 구성
            const fullAddress = road ? `${road} (${jibun})` : jibun;
            setSelectedAddress(fullAddress);
          }
        }
      );
    }
  }, [selectedGroup]);


  return (
    <div>
      <h2>스터디 추천 시스템</h2><br></br>

      {/* 알고리즘 선택 */}
      <div className="mb-3">
        <label className="form-label fw-bold me-2">추천 방식 선택:</label>
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          className="form-select d-inline-block w-auto"
        >
          <option value="locationNLP">위치·자연어 기반 추천</option>
          <option value="collaborative">협업 필터링 기반 추천</option>
          <option value="popular">인기 기반 추천</option>
        </select>
      </div>

      {/* 정렬 기준 */}
      <div className="mb-3">
        <label className="form-label fw-bold me-2">정렬 기준:</label>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="form-select d-inline-block w-auto"
        >
          <option value="near">가까운 순</option>
          <option value="far">먼 순</option>
          <option value="popular">인기순</option>
        </select>
      </div>

      {/* 지도 */}
      <div id="recommend-map" style={{ width: "100%", height: "400px", marginBottom: "20px" }}></div>

      {/* 추천 스터디 리스트 */}
      <div className="row">
        {sortedGroups.map((group) => (
          <div key={group.id} className="col-md-6 mb-3">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{group.title}</h5>
                <p className="card-text">
                  {group.description} <br />
                  태그:{" "}
                  {group.category.map((tag, idx) => (
                    <span key={idx} className="badge bg-secondary me-1">
                      #{tag}
                    </span>
                  ))}
                  <br />
                  거리:{" "}
                  {group.distance ? group.distance.toFixed(1) + " km" : "위치 정보 없음"} <br />
                  평점: ⭐ {group.rating}
                </p>

                <div className="d-flex justify-content-between">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => {
                      setSelectedGroup(group);
                      setShowModal(true);
                    }}
                  >
                    상세보기
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => handleJoin(group.id)}>
                    참여 신청
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {sortedGroups.length === 0 && <p>추천 결과가 없습니다.</p>}
      </div>

      {/* 상세보기 모달 */}
      {showModal && selectedGroup && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">{selectedGroup.title}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p><strong>리더:</strong> {selectedGroup.leader}</p>
                <p><strong>설명:</strong> {selectedGroup.description}</p>
                <p>
                  <strong>태그:</strong>{" "}
                  {selectedGroup.category.map((tag, idx) => (
                    <span key={idx} className="badge bg-info text-dark me-1">
                      #{tag}
                    </span>
                  ))}
                </p>
                <p>
                  <strong>위치:</strong>{" "}
                  {selectedAddress? selectedAddress : `${selectedGroup.latitude}, ${selectedGroup.longitude}`}
                </p>
                <p>
                  <strong>인원:</strong> {selectedGroup.members}/{selectedGroup.max}
                </p>
                <p><strong>평점:</strong> ⭐ {selectedGroup.rating}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendGroups;