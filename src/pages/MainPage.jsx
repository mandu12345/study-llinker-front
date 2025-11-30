// src/pages/MainPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, Routes, Route, useLocation } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Mainpage.css";
import api from "../api/axios";

import StudyList from "./main/StudyList";
import RecommendGroups from "./main/RecommendGroups";
import UserBasicDashboard from "./main/UserBasicDashboard";
import Board from "./main/Board";
import BoardWrite from "./main/BoardWrite";
import CreateScheduleModal from "./main/CreateScheduleModal";
import MyPage from "./main/MyPage";
import EditProfile from "./main/EditProfile";

const MainPage = () => {
  // Kakao Maps Script 로딩 (전역 1회)
  useEffect(() => {
    if (document.getElementById("kakao-map-sdk")) return;

    const script = document.createElement("script");
    script.id = "kakao-map-sdk";
    script.src =
      "//dapi.kakao.com/v2/maps/sdk.js?appkey=카카오API키&autoload=false&libraries=services";
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        console.log("Kakao Maps SDK Loaded");
      });
    };

    document.head.appendChild(script);
  }, []);

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


  // 사용자 정보
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");

  // 날짜 / 일정 / 알림
  const [date, setDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // 위치
  const [userLocation, setUserLocation] = useState(null);

  // 리더 여부 (임시)
  const [isLeader, setIsLeader] = useState(true);

  // 일정 등록 모달
  const [showCreateModal, setShowCreateModal] = useState(false);

  const mapRef = useRef(null);
  const markersRef = useRef([]);

    // 🧩 1) 로그인한 사용자 정보 불러오기
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const res = await api.get("/users/profile");
        const u = res.data.user;

        setUsername(u.name);   // 화면 표시용
        setUserId(u.userId);   // 이후 그룹/알림/일정 조회용 (state로 하나 추가 필요)

      } catch (err) {
        console.error("유저 정보 불러오기 실패:", err);
      }
    };

    loadUserInfo();
  }, []);


  // 🧩 2) 알림 목록 불러오기
  useEffect(() => {
    if (!userId) return; // userId가 로딩되기 전에는 실행 안 함

    const loadNotifications = async () => {
      try {
        const res = await api.get(`/notifications?userId=${userId}`);
        // 백엔드 OUT 형식이 배열 형태이므로 그대로 저장
        setNotifications(res.data);

      } catch (err) {
        console.error("알림 불러오기 실패:", err);
      }
    };

    loadNotifications();
  }, [userId]);


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

  // 알림 읽음 처리 API
  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`, {
        userid: userId
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n
        )
      );

    } catch (err) {
      console.error("알림 읽음 처리 실패:", err);
    }
  };

  // 리더 전용 일정 등록 함수
  const handleCreateSchedule = (newSchedule) => {
    setSchedules((prev) => [...prev, newSchedule]);
    setShowCreateModal(false);
    alert(`${newSchedule.title} 일정이 등록되었습니다.`);
  };

  // 일정 삭제
  const handleRemoveSchedule = (id) => {
    if (!isLeader) {
      alert("리더만 일정을 삭제할 수 있습니다.");
      return;
    }
    if (window.confirm("정말 이 일정을 삭제하시겠습니까?")) {
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      alert("일정이 삭제되었습니다.");
    }
  };
  // 🧩 3) 내가 가입한 그룹 목록 → 각 그룹의 일정들 불러오기
  useEffect(() => {
    if (!userId) return; // userId가 준비되기 전 실행 금지

    const loadSchedules = async () => {
      try {
        // ① 내가 가입한 그룹 목록
        const groupsRes = await api.get(`/users/${userId}/groups`);
        const groups = groupsRes.data.groups; // groups 배열 추출

        let mergedSchedules = [];

        // ② 각 그룹별 일정 조회
        for (const g of groups) {
          const from = "2025-01-01T00:00:00";
          const to = "2030-12-31T23:59:59"; // 전체 기간 조회용

          const schRes = await api.get(
            `/study-groups/${g.groupId}/schedules`,
            {
              params: {
                groupId: g.groupId,
                from,
                to
              }
            }
          );

          const list = schRes.data.schedules;

          // ③ 스케줄에 그룹 좌표를 붙여주기
          const formatted = list.map((s) => ({
            id: s.scheduleId,
            title: s.title,
            content: s.description,
            date: new Date(s.startAt),
            location: s.location,
            leader: g.leaderId, // BE에서 이름 제공 안 하므로 ID로 표시
            isJoined: true,

            // ⚠ 스케줄 자체에는 좌표 없음 → 그룹 좌표 사용
            lat: g.latitude,
            lng: g.longitude
          }));

          mergedSchedules = [...mergedSchedules, ...formatted];
        }

        setSchedules(mergedSchedules);

      } catch (err) {
        console.error("일정 불러오기 실패:", err);
      }
    };

    loadSchedules();
  }, [userId]);  
  
    // 지도 표시
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) return;

    window.kakao.maps.load(() => {
      const container = document.getElementById("map");
      if (!container) return;

      // HOME 다시 올 때 기존 지도 제거
      container.innerHTML = "";

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
    });
  }, [userLocation, schedules]);


  const schedulesForDate = schedules.filter(
    (s) =>
      s.date.getFullYear() === date.getFullYear() &&
      s.date.getMonth() === date.getMonth() &&
      s.date.getDate() === date.getDate()
  );

  // -------------------------------------------------------------------------
  // UI 부분 (수정 없음!!)
  // -------------------------------------------------------------------------
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
              <span
                className="badge bg-danger position-absolute top-0 start-100 translate-middle"
                style={{ fontSize: "0.7rem" }}
              >
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
              <li className="list-group-item"><Link to="/main" className="nav-link">HOME</Link></li>
              <li className="list-group-item"><Link to="/main/list" className="nav-link">스터디 목록</Link></li>
              <li className="list-group-item"><Link to="/main/recommend" className="nav-link">추천 그룹</Link></li>
              <li className="list-group-item"><Link to="/main/board" className="nav-link">게시판</Link></li>
              <li className="list-group-item"><Link to="/main/mypage" className="nav-link">내 프로필</Link></li>
            </ul>
          </div>

          {/* Content */}
          <div className="col-9 p-4">
            {/* 라우팅 컴포넌트 */}
          <Routes>
              {/* HOME 페이지에서만 달력+지도 표시 */}
              <Route
                index
                element={
                  <div className="row">
                    <div className="col-md-6">
                      <h2>스터디 일정</h2><br></br>
                      {isLeader && (
                        <button
                          className="btn btn-primary btn-sm mb-3"
                          onClick={() => setShowCreateModal(true)}
                        >
                          + 새 일정 등록
                        </button>
                      )}
                      <Calendar
                        onChange={setDate}
                        value={date}
                        tileClassName={highlightScheduleDates}
                      />
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
                              {isLeader && (
                                <button
                                  className="btn btn-danger btn-sm mt-2"
                                  onClick={() => handleRemoveSchedule(s.id)}
                                >
                                  일정 삭제
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

                    {/* UserBasicDashboard */}
                    <div className="mt-4">
                      <UserBasicDashboard />
                    </div>
                  </div>
                }
              />
              <Route path="list" element={<StudyList />} />
              <Route path="recommend" element={<RecommendGroups onAddSchedule={handleCreateSchedule} />} />
              <Route path="board" element={<Board />} />
              <Route path="board/write" element={<BoardWrite />} />
              <Route path="mypage" element={<MyPage />} />
              <Route path="edit-profile" element={<EditProfile />} />

            </Routes>
          </div>
        </div>
      </div>

      {/* 일정 등록 모달 (리더만) */}
      {showCreateModal && isLeader && (
        <CreateScheduleModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateSchedule}
        />
      )}

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