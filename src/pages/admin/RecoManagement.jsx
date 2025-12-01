// src/pages/admin/RecoManagement.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const TEST_MODE = true; // 🔥 API 연결 전 테스트 = true, 실제 서버 연동 = false

// -------------------------
// 🔥 더미 데이터 정의
// -------------------------
const dummyPopular = [
  {
    groupId: 1,
    title: "Java 알고리즘 스터디",
    distanceKm: 1.2,
    popScore: 0.85,
    distanceScore: 0.7,
    finalScore: 0.78,
    category: ["Java", "Algorithm"],
  },
  {
    groupId: 2,
    title: "Spring Boot 공부 모임",
    distanceKm: 2.5,
    popScore: 0.6,
    distanceScore: 0.5,
    finalScore: 0.55,
    category: ["Spring", "Backend"],
  },
];

const dummyTag = [
  {
    studyGroupId: 3,
    name: "React 프론트엔드 스터디",
    distanceKm: 1.8,
    tagSimilarity: 0.75,
    distanceScore: 0.8,
    finalScore: 0.77,
    category: ["React", "Frontend"],
  },
  {
    studyGroupId: 4,
    name: "Node.js API 개발",
    distanceKm: 3.0,
    tagSimilarity: 0.6,
    distanceScore: 0.45,
    finalScore: 0.53,
    category: ["Node.js", "Backend"],
  },
];

const RecoManagement = () => {
  const [lat, setLat] = useState(37.5665);
  const [lng, setLng] = useState(126.9780);
  const [radius, setRadius] = useState(5);

  // 가중치 설정
  const [popWeight, setPopWeight] = useState(0.7);
  const [distanceWeight, setDistanceWeight] = useState(0.3);
  const [alpha, setAlpha] = useState(0.5);
  const [beta, setBeta] = useState(0.5);

  // 추천 결과
  const [popularData, setPopularData] = useState([]);
  const [tagData, setTagData] = useState([]);

  // 모니터링 라인차트
  const [history, setHistory] = useState([]);

  // -------------------------
  // 1) 인기 기반 API (또는 더미)
  // -------------------------
  const loadPopular = async () => {
    if (TEST_MODE) {
      setPopularData(dummyPopular);
      return dummyPopular;
    }

    const res = await api.get("/groups/popular", {
      params: {
        lat,
        lng,
        radiusKm: radius,
        popWeight,
        distanceWeight,
        limit: 10,
      },
    });

    setPopularData(res.data.groups || []);
    return res.data.groups || [];
  };

  // -------------------------
  // 2) 태그 기반 API (또는 더미)
  // -------------------------
  const loadTag = async () => {
    if (TEST_MODE) {
      setTagData(dummyTag);
      return dummyTag;
    }

    const res = await api.get("/recommend/tag", {
      params: {
        userId: 1,
        lat,
        lng,
        radiusKm: radius,
        limit: 10,
        alpha,
        beta,
      },
    });

    setTagData(res.data || []);
    return res.data || [];
  };

  // -------------------------
  // 3) 두 알고리즘 비교 + 기록 저장
  // -------------------------
  const refreshAll = async () => {
    const pop = await loadPopular();
    const tag = await loadTag();

    const newItem = {
      time: new Date().toLocaleTimeString(),
      popScore: avg(pop.map((g) => g.finalScore)),
      tagScore: avg(tag.map((g) => g.finalScore)),
    };

    setHistory((prev) => [...prev.slice(-9), newItem]);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const avg = (arr) =>
    arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0;

  // -------------------------
  // 바 차트 데이터
  // -------------------------
  const barData = [
    {
      name: "그룹 수",
      popular: popularData.length,
      tag: tagData.length,
    },
    {
      name: "평균 점수",
      popular: avg(popularData.map((g) => g.finalScore)),
      tag: avg(tagData.map((g) => g.finalScore)),
    },
    {
      name: "평균 거리",
      popular: avg(popularData.map((g) => g.distanceKm)),
      tag: avg(tagData.map((g) => g.distanceKm)),
    },
    {
      name: "다양성(태그 종류)",
      popular: diversity(popularData),
      tag: diversity(tagData),
    },
  ];

  function diversity(arr) {
    const tags = new Set();
    arr.forEach((g) => g.category?.forEach((t) => tags.add(t)));
    return tags.size;
  }

  // -------------------------
  // 레이더 차트 데이터
  // -------------------------
  const radarData = [
    {
      metric: "거리점수",
      popular: avg(popularData.map((g) => g.distanceScore || 0)),
      tag: avg(tagData.map((g) => g.distanceScore || 0)),
    },
    {
      metric: "인기점수",
      popular: avg(popularData.map((g) => g.popScore || 0)),
      tag: 0,
    },
    {
      metric: "태그유사도",
      popular: 0,
      tag: avg(tagData.map((g) => g.tagSimilarity || 0)),
    },
    {
      metric: "최종점수",
      popular: avg(popularData.map((g) => g.finalScore)),
      tag: avg(tagData.map((g) => g.finalScore)),
    },
  ];

  return (
    <div>
      <h2 className="mb-3">💡 추천 알고리즘 관리 / 모니터링</h2>

      {/* =============================== */}
{/* 🎨 가중치 설정 패널 */}
{/* =============================== */}
<div className="card p-4 mb-4 shadow-sm">

  <h5 className="fw-bold mb-3">⚙️ 추천 알고리즘 가중치 설정</h5>

  <div className="row g-4">

    {/* ---------------------------- */}
    {/* 🟦 인기 기반 설정 카드 */}
    {/* ---------------------------- */}
    <div className="col-md-6">
      <div className="p-3 border rounded shadow-sm bg-light">
        <h6 className="fw-bold mb-3 text-primary">🔥 인기 기반 추천 설정</h6>

        <div className="mb-3">
          <label className="form-label">📈 인기 가중치(popWeight)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={popWeight}
            onChange={(e) => setPopWeight(parseFloat(e.target.value))}
            className="form-control"
          />
        </div>

        <div className="mb-2">
          <label className="form-label">📍 거리 가중치(distanceWeight)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={distanceWeight}
            onChange={(e) => setDistanceWeight(parseFloat(e.target.value))}
            className="form-control"
          />
        </div>
      </div>
    </div>

    {/* ---------------------------- */}
    {/* 🟧 태그 기반 설정 카드 */}
    {/* ---------------------------- */}
    <div className="col-md-6">
      <div className="p-3 border rounded shadow-sm bg-light">
        <h6 className="fw-bold mb-3 text-danger">🧩 태그 기반 추천 설정</h6>

        <div className="mb-3">
          <label className="form-label">📍 거리 점수 가중치(alpha)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={alpha}
            onChange={(e) => setAlpha(parseFloat(e.target.value))}
            className="form-control"
          />
        </div>

        <div className="mb-2">
          <label className="form-label">🏷️ 태그 유사도 가중치(beta)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={beta}
            onChange={(e) => setBeta(parseFloat(e.target.value))}
            className="form-control"
          />
        </div>
      </div>
    </div>

  </div>

  <button className="btn btn-primary mt-4 px-4" onClick={refreshAll}>
    🔄 새로고침 / 재계산
  </button>

</div>

      {/* 라인 차트 */}
      <div className="card p-3 mb-4 shadow-sm">
        <h5>📈 점수 변화 모니터링</h5>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time"/>
              <YAxis/>
              <Tooltip/>
              <Legend/>
              <Line type="monotone" dataKey="popScore" stroke="#007BFF" name="인기 기반"/>
              <Line type="monotone" dataKey="tagScore" stroke="#FF5722" name="태그 기반"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 바 차트 */}
      <div className="card p-3 mb-4 shadow-sm">
        <h5>📊 핵심 지표 비교</h5>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name"/>
              <YAxis/>
              <Tooltip/>
              <Legend/>
              <Bar dataKey="popular" fill="#007BFF" name="인기 기반"/>
              <Bar dataKey="tag" fill="#FF5722" name="태그 기반"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 레이더 차트 */}
      <div className="card p-3">
        <h5>🧭 알고리즘 특성 레이더 비교</h5>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <RadarChart data={radarData}>
              <PolarGrid/>
              <PolarAngleAxis dataKey="metric"/>
              <PolarRadiusAxis angle={90} domain={[0, 1]}/>
              <Radar name="Popular" dataKey="popular" stroke="#007BFF" fill="#007BFF" fillOpacity={0.6}/>
              <Radar name="Tag" dataKey="tag" stroke="#FF5722" fill="#FF5722" fillOpacity={0.6}/>
              <Legend/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default RecoManagement;
