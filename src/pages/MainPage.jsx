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
  const location = useLocation();

  // Kakao Maps SDK 로딩 (최초 1회)
  useEffect(() => {
    if (!document.getElementById("kakao-map-sdk")) {
      const script = document.createElement("script");
      script.id = "kakao-map-sdk";
      script.src =
        "//dapi.kakao.com/v2/maps/sdk.js?appkey=카카오API키&autoload=false&libraries=services";
      script.onload = () => {
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(() => {});
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  // 사용자 현재 위치 가져오기
  const [userLocation, setUserLocation] = useState(null);
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

  // 리더 여부 (임시)
  const [isLeader] = useState(true);

  // 일정 등록 모달
  const [showCreateModal, setShowCreateModal] = useState(false);

  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // 🧩 1) 로그인한 사용자 정보 불러오기 (GET /api/users/profile)
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const res = await api.get("/users/profile");
        const u = res.data; // { user_id, username, email, name, ... }

        setUsername(u.name);
        setUserId(u.user_id);
      } catch (err) {
        console.error("유저 정보 불러오기 실패:", err);
      }
    };

    loadUserInfo();
  }, []);

  // 🧩 2) 알림 목록 불러오기 (GET /api/notifications)
  useEffect(() => {
    if (!userId) return; // 토큰 기반이라 userId 없어도 되지만, 로딩 타이밍 맞추려고 의존성만 유지

    const loadNotifications = async () => {
      try {
        const res = await api.get("/notifications");

        // 백엔드 스키마: notification_id, message, type, is_read, created_at ...
        const mapped = (res.data || []).map((n) => ({
          id: n.notification_id,
          message: n.message,
          type: n.type,          // "SCHEDULE" | "REQUEST" | "SYSTEM"
          isRead: n.is_read,
        }));

        setNotifications(mapped);
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

  // 알림 읽음 처리 API (PATCH /api/notifications/{id}/read)
  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("알림 읽음 처리 실패:", err);
    }
  };

  // 리더 전용 일정 등록 함수
  // 실제 일정 생성은 CreateScheduleModal 내부에서 API 호출한다고 가정,
  // 여기서는 성공 후 전달받은 newSchedule을 상태에 반영만 함.
  const handleCreateSchedule = (newSchedule) => {
    setSchedules((prev) => [...prev, newSchedule]);
    setShowCreateModal(false);
    alert(`${newSchedule.title} 일정이 등록되었습니다.`);
  };

  // 일정 삭제 (StudyLinker 스펙 완전 반영)
const handleRemoveSchedule = async (scheduleId) => {
  if (!isLeader) {
    alert("리더만 일정을 삭제할 수 있습니다.");
    return;
  }

  if (!window.confirm("정말 이 일정을 삭제하시겠습니까?")) return;

  try {
    // 1) 서버에 일정 삭제 요청
    await api.delete(`/study-schedules/${scheduleId}`);

    // 2) 프론트에서 일정 제거
    setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));

    alert("일정이 정상적으로 삭제되었습니다.");

  } catch (err) {
    console.error("일정 삭제 실패:", err);
    alert("일정 삭제 중 오류가 발생했습니다.");
  }
};

  // 🧩 3) 내 일정 조회 (GET /api/study-schedules/me) + 그룹 정보 보강 (GET /api/study-groups/{groupId})
  useEffect(() => {
    if (!userId) return;

    const loadSchedules = async () => {
      try {
        // 1) 내 일정 전체 조회
        const schRes = await api.get("/study-schedules/me");
        const raw = schRes.data || []; // [{ schedule_id, group_id, title, description, start_time, end_time, location, ... }]

        // 2) 사용된 group_id만 unique로 모으기
        const groupIds = [
          ...new Set(
            raw
              .map((s) => s.group_id)
              .filter((gid) => gid !== null && gid !== undefined)
          ),
        ];

        // 3) 각 그룹 정보 조회 → 좌표, 리더 정보 등
        const groupMap = {};
        await Promise.all(
          groupIds.map(async (gid) => {
            try {
              const gRes = await api.get(`/study-groups/${gid}`);
              groupMap[gid] = gRes.data; // { group_id, title, latitude, longitude, leader_id, ... }
            } catch (err) {
              console.error(`그룹(${gid}) 정보 불러오기 실패:`, err);
            }
          })
        );

        // 4) UI에서 쓰기 좋게 매핑
        const formatted = raw.map((s) => {
          const group = groupMap[s.group_id] || {};
          return {
            id: s.schedule_id,
            title: s.title,
            content: s.description,
            date: new Date(s.start_time),
            location: s.location,
            leader: group.leader_id ?? "", // 필요하면 나중에 leader_name으로 확장
            isJoined: true,
            lat: group.latitude ?? null,
            lng: group.longitude ?? null,
          };
        });

        setSchedules(formatted);
      } catch (err) {
        console.error("일정 불러오기 실패:", err);
      }
    };

    loadSchedules();
  }, [userId]);

  // 지도 표시 (HOME 페이지에서만)
  useEffect(() => {
    if (location.pathname !== "/main") return;
    if (!window.kakao || !window.kakao.maps) return;

    window.kakao.maps.load(() => {
      const container = document.getElementById("map");
      if (!container) return;

      // 지도 초기화
      container.innerHTML = "";
      const map = new window.kakao.maps.Map(container, {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 6,
      });
      mapRef.current = map;

      // 마커 초기화
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      // 🔵 사용자 위치 마커
      if (userLocation) {
        const uMarker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(
            userLocation.lat,
            userLocation.lng
          ),
          map,
        });
        markersRef.current.push(uMarker);
        map.setCenter(
          new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng)
        );
      }

      // 🔴 그룹(스터디) 위치 마커 - 그룹 좌표 있는 일정만
      schedules.forEach((sch) => {
        if (!sch.lat || !sch.lng) return;

        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(sch.lat, sch.lng),
          map,
        });
        markersRef.current.push(marker);

        const info = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;">${sch.title}</div>`,
        });
        window.kakao.maps.event.addListener(marker, "click", () =>
          info.open(map, marker)
        );
      });
    });
  }, [location.pathname, userLocation, schedules]);

  // 선택한 날짜의 일정
  const schedulesForDate = schedules.filter(
    (s) =>
      s.date.getFullYear() === date.getFullYear() &&
      s.date.getMonth() === date.getMonth() &&
      s.date.getDate() === date.getDate()
  );

  // UI 부분
  return (
    <div className="mainpage-wrapper">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark shadow-sm navbar-custom">
        <a className="navbar-brand" href="/">
          <img
            src="/logo.png"
            alt="StudyApp Logo"
            style={{ height: "70px", marginLeft: "30px" }}
          />
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
              <li className="list-group-item">
                <Link to="/main" className="nav-link">
                  HOME
                </Link>
              </li>
              <li className="list-group-item">
                <Link to="/main/list" className="nav-link">
                  스터디 목록
                </Link>
              </li>
              <li className="list-group-item">
                <Link to="/main/recommend" className="nav-link">
                  추천 그룹
                </Link>
              </li>
              <li className="list-group-item">
                <Link to="/main/board" className="nav-link">
                  게시판
                </Link>
              </li>
              <li className="list-group-item">
                <Link to="/main/mypage" className="nav-link">
                  내 프로필
                </Link>
              </li>
            </ul>
          </div>

          {/* Content */}
          <div className="col-9 p-4">
            {/* 라우팅 컴포넌트 */}
            <Routes>
              {/* HOME 페이지에서만 달력+지도+대시보드 표시 */}
              <Route
                index
                element={
                  <div className="row">
                    <div className="col-md-6">
                      <h2>스터디 일정</h2>
                      <br />
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
                      <p className="mt-2">
                        선택한 날짜: {date.toDateString()}
                      </p>
                      {schedulesForDate.length > 0 ? (
                        schedulesForDate.map((s) => (
                          <div
                            key={s.id}
                            className="card schedule-card mb-2 shadow-sm"
                          >
                            <div className="card-body">
                              <h6 className="card-title">{s.title}</h6>
                              <p className="card-text">
                                리더: {s.leader || "-"} <br />
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
                      <div
                        id="map"
                        style={{
                          width: "100%",
                          height: "400px",
                          marginTop: "20px",
                        }}
                      ></div>
                    </div>

                    {/* UserBasicDashboard */}
                    <div className="mt-4">
                      <UserBasicDashboard />
                    </div>
                  </div>
                }
              />
              <Route path="list" element={<StudyList />} />
              <Route
                path="recommend"
                element={
                  <RecommendGroups onAddSchedule={handleCreateSchedule} />
                }
              />
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
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div
              className="modal-content"
              style={{ borderRadius: "12px", overflow: "hidden" }}
            >
              <div
                className="modal-header"
                style={{ backgroundColor: "#4a90e2", color: "#fff" }}
              >
                <h5 className="modal-title">🔔 알림</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowNotifications(false)}
                  aria-label="Close"
                />
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
                        style={{
                          borderRadius: "8px",
                          cursor: "pointer",
                          transition: "0.2s",
                        }}
                      >
                        <span>
                          {n.type === "SCHEDULE" ? "📅 " : "📝 "}
                          {n.message}
                        </span>
                        {!n.isRead && (
                          <span className="badge bg-warning text-dark">
                            새 알림
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>알림이 없습니다.</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowNotifications(false)}
                  style={{ borderRadius: "8px" }}
                >
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
