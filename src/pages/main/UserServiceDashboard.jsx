import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const UserServiceDashboard = () => {
  // 더미 데이터
  const dummyTop5Groups = [
    { id: 1, title: "Java 스터디", distance: 0.8, category: "프로그래밍", lat: 37.449613, lng: 127.127877 },
    { id: 2, title: "AI 스터디", distance: 1.2, category: "AI/ML", lat: 37.450908, lng: 127.126498 },
    { id: 3, title: "토익 스터디", distance: 2.1, category: "어학", lat: 37.448834, lng: 127.130092 },
    { id: 4, title: "Spring Boot 스터디", distance: 3.5, category: "백엔드", lat: 37.447500, lng: 127.128500 },
    { id: 5, title: "취업 스터디", distance: 4.8, category: "취업", lat: 37.446200, lng: 127.125000 },
  ];

  const dummyScores = [
    { title: "Java 스터디", distanceScore: 40, interestScore: 30 },
    { title: "AI 스터디", distanceScore: 35, interestScore: 40 },
    { title: "토익 스터디", distanceScore: 25, interestScore: 50 },
  ];

  const dummyCategoryDist = {
    "프로그래밍": 3,
    "AI/ML": 2,
    "어학": 2,
    "취업": 1,
  };

  const dummyDistanceDist = {
    "0~1km": 2,
    "1~3km": 3,
    "3~5km": 2,
  };

  // 카테고리/거리 차트
  useEffect(() => {
    // 카테고리 분포 (Pie)
    const ctx1 = document.getElementById("categoryChart");
    if (ctx1) {
      new Chart(ctx1, {
        type: "pie",
        data: {
          labels: Object.keys(dummyCategoryDist),
          datasets: [
            {
              data: Object.values(dummyCategoryDist),
              backgroundColor: ["#0d6efd", "#198754", "#ffc107", "#dc3545"],
            },
          ],
        },
      });
    }

    // 거리 분포 (Bar)
    const ctx2 = document.getElementById("distanceChart");
    if (ctx2) {
      new Chart(ctx2, {
        type: "bar",
        data: {
          labels: Object.keys(dummyDistanceDist),
          datasets: [
            {
              label: "그룹 수",
              data: Object.values(dummyDistanceDist),
              backgroundColor: "#6610f2",
            },
          ],
        },
      });
    }
  }, []);

  // 지도 표시
  const mapRef = useRef(null);

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      const container = document.getElementById("serviceMap");
      const options = {
        center: new window.kakao.maps.LatLng(37.449613, 127.127877),
        level: 5,
      };
      const map = new window.kakao.maps.Map(container, options);
      mapRef.current = map;

      // 마커 추가
      dummyTop5Groups.forEach((g) => {
        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(g.lat, g.lng),
          map: map,
        });

        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;">${g.title}</div>`,
        });

        window.kakao.maps.event.addListener(marker, "click", () => {
          infowindow.open(map, marker);
        });
      });
    }
  }, []);

  return (
    <div className="container mb-4">
      <h2 className="dashboard-title text-center my-4">서비스 사용자 대시보드</h2>

      {/* Top 5 그룹 */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">내 주변 스터디 그룹 Top 5</div>
        <div className="card-body">
          <ul className="list-group">
            {dummyTop5Groups.map((g) => (
              <li key={g.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold">{g.title}</div>
                  <div className="text-muted small">
                    {g.category} · {g.distance} km
                  </div>
                </div>
                <button className="btn btn-sm btn-outline-primary">달력/지도에 추가</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 추천 점수 */}
      <div className="card mb-4">
        <div className="card-header bg-success text-white">추천 그룹 점수 (거리 + 관심사)</div>
        <div className="card-body">
          <ul className="list-group">
            {dummyScores.map((s, idx) => (
              <li key={idx} className="list-group-item">
                <strong>{s.title}</strong>
                <div className="small text-muted">
                  거리 점수: {s.distanceScore} / 관심사 점수: {s.interestScore} / 합계:{" "}
                  {s.distanceScore + s.interestScore}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 카테고리 분포 + 거리 분포 */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-warning">내 주변 스터디 카테고리 분포</div>
            <div className="card-body">
              <canvas id="categoryChart" height="300"></canvas>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-info">거리별 그룹 개수 분포</div>
            <div className="card-body">
              <canvas id="distanceChart" height="300"></canvas>
            </div>
          </div>
        </div>
      </div>

      {/* 지도 */}
      <div className="card">
        <div className="card-header bg-dark text-white">내 주변 스터디 지도</div>
        <div className="card-body">
          <div id="serviceMap" style={{ width: "100%", height: "400px" }}></div>
        </div>
      </div>
    </div>
  );
};

export default UserServiceDashboard;
