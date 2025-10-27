// src/pages/MainPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, Routes, Route, useLocation } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Mainpage.css";

import StudyList from "./main/StudyList";
import JoinedGroups from "./main/JoinedGroups";
import RecommendGroups from "./main/RecommendGroups";
import UserBasicDashboard from "./main/UserBasicDashboard";
import UserServiceDashboard from "./main/UserServiceDashboard";
import Board from "./main/Board";
import BoardWrite from "./main/BoardWrite";

// 더미 일정 + 위치(좌표)
const initialSchedules = [
  {
    id: 1,
    title: "Java 스터디",
    date: new Date(2025, 7, 31),
    leader: "홍길동",
    location: "가천대 중앙도서관",
    content: "Java 기초 스터디",
    isJoined: true,
    members: 5,
    max: 10,
    lat: 37.449613,
    lng: 127.127877,
  },
  {
    id: 2,
    title: "AI 스터디",
    date: new Date(2025, 8, 1),
    leader: "이호주",
    location: "가천대역",
    content: "AI 모델 학습",
    isJoined: false,
    members: 3,
    max: 10,
    lat: 37.450908,
    lng: 127.126498,
  },
  {
    id: 3,
    title: "Spring Boot 스터디",
    date: new Date(2025, 8, 5),
    leader: "김철수",
    location: "가천대 AI공학관",
    content: "Spring Boot 프로젝트",
    isJoined: false,
    members: 2,
    max: 10,
    lat: 37.448834,
    lng: 127.130092,
  },
];

// 더미 알림 데이터
const dummyNotifications = [
  { id: 1, type: "일정", message: "Java 스터디가 8월 31일에 있습니다.", isRead: false },
  { id: 2, type: "참여요청", message: "AI 스터디에 참여 요청이 있습니다.", isRead: true },
  { id: 3, type: "공지", message: "Spring Boot 스터디 공지가 등록되었습니다.", isRead: true },
];

const MainPage = () => {
  const username = "홍길동";
  const [date, setDate] = useState(new Date());
  const [schedules, setSchedules] = useState(initialSchedules);
  const [notifications, setNotifications] = useState(dummyNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const location = useLocation();
  // 게시판 경로일 때는 달력/지도 숨기기
  const hideDashboard = location.pathname.startsWith("/main/board");

  // 사용자 현재 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.error(err)
      );
    }
  }, []);

  // 달력 하이라이트
  const highlightScheduleDates = ({ date: d, view }) => {
    if (view === "month") {
      const found = schedules.find(
        (s) =>
          s.isJoined &&
          s.date.getFullYear() === d.getFullYear() &&
          s.date.getMonth() === d.getMonth() &&
          s.date.getDate() === d.getDate()
      );
      if (found) return "highlight";
    }
  };

  // 알림 읽음 처리
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  // 스케줄 추가
  const handleAddSchedule = (group) => {
    const alreadyJoined = schedules.some(
      (s) => s.title === group.title && s.isJoined
    );
    if (alreadyJoined) {
      alert("이미 신청된 스터디입니다.");
      return;
    }
    const newSchedule = {
      id: schedules.length + 1,
      title: group.title,
      date: group.date || new Date(),
      leader: group.leader,
      location: group.location || "미정",
      content: group.content || "스터디 내용 없음",
      isJoined: true,
      members: group.members || 1,
      max: group.max || 10,
      lat: group.lat || 37.5665,
      lng: group.lng || 126.978,
    };
    setSchedules((prev) => [...prev, newSchedule]);
    alert(`${group.title} 일정이 달력에 추가되었습니다!`);
  };

  // 스케줄 삭제
  const handleRemoveSchedule = (id) => {
    if (window.confirm("정말 이 일정을 취소하시겠습니까?")) {
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      alert("일정이 취소되었습니다.");
    }
  };

  // 지도 초기화 + 마커
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      const container = document.getElementById("map");
      if (!container) return;

      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 6,
      };
      const map = new window.kakao.maps.Map(container, options);
      mapRef.current = map;

      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      if (userLocation) {
        const userMarker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
        });
        userMarker.setMap(map);
        markersRef.current.push(userMarker);

        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;">내 위치</div>`,
        });
        infowindow.open(map, userMarker);
        map.setCenter(new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng));
      }

      const groupMarkerImage = new window.kakao.maps.MarkerImage(
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
        new window.kakao.maps.Size(24, 35)
      );

      schedules.forEach((group) => {
        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(group.lat, group.lng),
          image: groupMarkerImage,
        });
        marker.setMap(map);
        markersRef.current.push(marker);

        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;">${group.title}</div>`,
        });

        window.kakao.maps.event.addListener(marker, "click", () => {
          infowindow.open(map, marker);
        });
      });
    }
  }, [userLocation, schedules]);

  const schedulesForDate = schedules.filter(
    (s) =>
      s.date.getFullYear() === date.getFullYear() &&
      s.date.getMonth() === date.getMonth() &&
      s.date.getDate() === date.getDate()
  );

  return (
    <div className="mainpage-wrapper">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark shadow-sm navbar-custom">
        <a className="navbar-brand" href="/">
          <img src="/logo.png" alt="StudyApp Logo" style={{ height: "70px", marginLeft: "30px" }} />
        </a>
        <div className="ml-auto d-flex align-items-center">
          <span className="mr-4 me-3">{username}님</span>
          <button
            className="btn btn-sm btn-outline-light position-relative"
            onClick={() => setShowNotifications(true)}
          >
            🔔 알림
            {notifications.some((n) => !n.isRead) && (
              <span className="badge bg-danger position-absolute top-0 start-100 translate-middle"
                style={{ fontSize: "0.7rem" }}>
                {notifications.filter((n) => !n.isRead).length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Sidebar + Content */}
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-3 bg-light vh-100 p-3 border-right">
            <ul className="list-group list-group-flush">
              <li className="list-group-item"><Link to="/main" className="nav-link">내 대시보드</Link></li>
              <li className="list-group-item"><Link to="/main/list" className="nav-link">스터디 목록</Link></li>
              <li className="list-group-item"><Link to="/main/joined" className="nav-link">참여한 그룹</Link></li>
              <li className="list-group-item"><Link to="/main/recommend" className="nav-link">추천 그룹</Link></li>
              <li className="list-group-item"><Link to="/main/service-dashboard" className="nav-link">서비스 대시보드</Link></li>
              <li className="list-group-item"><Link to="/main/board" className="nav-link">게시판</Link></li>
              <li className="list-group-item"><Link to="/main/profile" className="nav-link">내 프로필</Link></li>
            </ul>
          </div>

          {/* Content */}
          <div className="col-9 p-4">
            {/* 달력+지도는 게시판 페이지가 아닐 때만 보여줌 */}
            {!hideDashboard && (
              <div className="row">
                {/* 달력 */}
                <div className="col-md-6">
                  <h5>스터디 일정</h5>
                  <Calendar onChange={setDate} value={date} tileClassName={highlightScheduleDates} />
                  <p className="mt-2">선택한 날짜: {date.toDateString()}</p>
                  {schedulesForDate.length > 0 ? (
                    schedulesForDate.map((s) => (
                      <div key={s.id} className="card schedule-card mb-2 shadow-sm">
                        <div className="card-body">
                          <h6 className="card-title">{s.title}</h6>
                          <p className="card-text">
                            리더: {s.leader} <br />
                            장소: {s.location} <br />
                            내용: {s.content} <br />
                            날짜: {s.date.toDateString()}
                          </p>
                          {s.isJoined && (
                            <button
                              className="btn btn-danger btn-sm mt-2"
                              onClick={() => handleRemoveSchedule(s.id)}
                            >
                              참여 취소
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>등록된 일정이 없습니다.</p>
                  )}
                </div>

                {/* 지도 */}
                <div className="col-md-6">
                  <div id="map" style={{ width: "100%", height: "400px", marginTop: "20px" }}></div>
                </div>
              </div>
            )}

            {/* 라우팅 컴포넌트 */}
            <Routes>
              <Route index element={<UserBasicDashboard />} />
              <Route path="list" element={<StudyList />} />
              <Route path="joined" element={<JoinedGroups schedules={schedules} />} />
              <Route path="recommend" element={<RecommendGroups onAddSchedule={handleAddSchedule} />} />
              <Route path="service-dashboard" element={<UserServiceDashboard />} />
              <Route path="board" element={<Board />} />
              <Route path="board/write" element={<BoardWrite />} />
            </Routes>
          </div>
        </div>
      </div>

      {/* 알림 모달 */}
      {showNotifications && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content" style={{ borderRadius: "12px", overflow: "hidden" }}>
              <div className="modal-header" style={{ backgroundColor: "#4a90e2", color: "#fff" }}>
                <h5 className="modal-title">🔔 알림</h5>
                <button type="button" className="btn-close btn-close-white"
                  onClick={() => setShowNotifications(false)} aria-label="Close" />
              </div>
              <div className="modal-body">
                {notifications.length > 0 ? (
                  <ul className="list-group">
                    {notifications.map((n) => (
                      <li
                        key={n.id}
                        className={`list-group-item mb-2 d-flex justify-content-between align-items-center
                          ${n.isRead ? "read-notification" : "unread-notification"}`}
                        onClick={() => markAsRead(n.id)}
                        style={{ borderRadius: "8px", cursor: "pointer", transition: "0.2s" }}
                      >
                        <span>{n.type === "일정" ? "📅 " : "📝 "}{n.message}</span>
                        {!n.isRead && <span className="badge bg-warning text-dark">새 알림</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>알림이 없습니다.</p>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm"
                  onClick={() => setShowNotifications(false)}
                  style={{ borderRadius: "8px" }}>
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

export default MainPage;
