// src/pages/MainPage.jsx

import React, { useEffect, useState, useRef } from "react";
import { Link, Routes, Route, useLocation } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Mainpage.css";

import api from "../api/axios";

// 기존 네 프로젝트 파일들
import StudyList from "./main/StudyList";
import RecommendGroups from "./main/RecommendGroups";
import UserBasicDashboard from "./main/UserBasicDashboard";
import Board from "./main/Board";
import BoardWrite from "./main/BoardWrite";
import MyPage from "./main/MyPage";
import EditProfile from "./main/EditProfile";

// 새 컴포넌트들
import ScheduleCard from "./main/ScheduleCard";
import {
  CreateLeaderScheduleModal,
  CreateUserScheduleModal,
} from "./main/ScheduleModals";
import AttendanceModal from "./main/AttendanceModal";

const sidebarStyles = {
  link: {
    color: "#000",
    textDecoration: "none",
    fontWeight: "500",
  },
};

const MainPage = () => {
  const location = useLocation();

  // 사용자 정보
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");

  // 리더 여부
  const [isLeader, setIsLeader] = useState(false);

  // 일정
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 지도 관련
  // ⭐ [변경] userLocation 상태 제거
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // 모달
  const [openLeaderModal, setOpenLeaderModal] = useState(false);
  const [openUserModal, setOpenUserModal] = useState(false);
  const [openAttendanceModal, setOpenAttendanceModal] = useState(null);

  // 알림
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // ------------------------------
  // 1) 로그인 사용자 정보 불러오기 (로직 변경 없음)
  // ------------------------------
  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log("[MainPage] /users/profile 요청 시작");
        const res = await api.get("/users/profile");
        console.log("[MainPage] /users/profile 응답:", res.data);

        setUserId(res.data.userId);
        setUsername(res.data.username);

        // ✅ 반드시 추가 (Dashboard에서 localStorage 쓰는 경우를 위해)
        localStorage.setItem("userId", res.data.userId);
        console.log(
          "[MainPage] userId 상태/로컬스토리지 설정 완료:",
          res.data.userId
        );
      } catch (err) {
        console.error("[MainPage] 유저 정보 실패:", err);
      }
    };
    loadUser();
  }, []);

  // ------------------------------
  // 2) 리더 여부 확인 (로직 변경 없음)
  // ------------------------------
  useEffect(() => {
    if (!userId) {
      console.log("[MainPage] 리더 여부 확인 생략: userId 없음");
      return;
    }

    const checkLeader = async () => {
      try {
        console.log("[MainPage] 리더 여부 확인 요청, userId =", userId);
        const res = await api.get(
          `/study-groups?leaderId=${userId}&page=0&size=50`
        );
        console.log("[MainPage] 리더 여부 확인 응답:", res.data);
        setIsLeader(res.data.groups?.length > 0);
      } catch (err) {
        console.error("[MainPage] 리더 확인 실패:", err);
      }
    };
    checkLeader();
  }, [userId]);

  // ------------------------------
  // 3) 내 일정 조회 (로직 변경 없음)
  // ------------------------------
  useEffect(() => {
    if (!userId) {
      console.log("[MainPage] 일정 조회 생략: userId 없음");
      return;
    }

    const loadSchedules = async () => {
      try {
        const res = await api.get("/study-schedules/me");
        console.log("[MainPage] /study-schedules/me 응답:", res.data);

        const processed = await Promise.all(
          res.data.map(async (s) => {
            // 백엔드 DTO 필드 이름에 따라 맞춰 사용 (scheduleId, groupId 등 유연하게 처리)
            const scheduleId = s.scheduleId ?? s.schedule_id;
            const groupId = s.groupId ?? s.group_id ?? null;

            let group = null;

            // 🔹 groupId가 있을 때만 그룹 단건 조회
            if (groupId != null) {
              try {
                console.log("[MainPage] 그룹 단건 조회 요청, gid =", groupId);
                const groupRes = await api.get(`/study-groups/${groupId}`);
                group = groupRes.data;
              } catch (err) {
                console.error("[MainPage] 그룹 단건 조회 실패 (gid=" + groupId + "):", err);
              }
            } else {
              console.log("[MainPage] 이 일정은 개인 일정이라 groupId 없음, 그룹 API 호출 스킵");
            }

            return {
              id: scheduleId,
              groupId,
              title: s.title,
              content: s.description,
              location: s.location,
              date: new Date(s.startTime ?? s.start_time),
              isJoined: true,
              lat: group?.latitude ?? null,
              lng: group?.longitude ?? null,
              leaderName: group?.leaderName || group?.leader_id || "", // leaderName 추가
            };
          })
        );

        console.log("[MainPage] 가공된 일정 데이터:", processed);
        setSchedules(processed);
      } catch (e) {
        console.error("[MainPage] 일정 조회 실패:", e);
      }
    };

    loadSchedules();
  }, [userId]);

// ------------------------------
  // ⭐ [변경] 4) 지도 객체 최초 생성 (HOME일 때만, userLocation에 의존하지 않음)
  // ------------------------------
  useEffect(() => {
    if (location.pathname !== "/main") return;
    if (!window.kakao || !window.kakao.maps) return;

    // mapRef.current가 없으면 최초 생성
    if (!mapRef.current) {
        window.kakao.maps.load(() => {
            const container = document.getElementById("map");
            if (!container) return;
            
            // 지도 초기화 ★ 중요 (이전 코드에서 가져옴)
            container.innerHTML = "";

            // 지도 생성: 기본 좌표(서울) 사용
            mapRef.current = new window.kakao.maps.Map(container, {
                center: new window.kakao.maps.LatLng(37.5665, 126.978),
                level: 6,
            });
            console.log("[MainPage] 카카오맵 최초 생성 (중심: 서울)");
        });
    }

  }, [location.pathname]);

  // ------------------------------
  // ⭐ [변경] 5) 스터디 마커만 갱신 (schedules에만 의존)
  // ------------------------------
  useEffect(() => {
    if (location.pathname !== "/main") return;
    if (!mapRef.current) return;

    // 기존 마커 삭제
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    
    // 사용자 위치 마커 제거 (userLocation 상태가 없으므로)

    // 스터디 마커만 갱신
    schedules.forEach((s) => {
      if (!s.lat || !s.lng) return;

      const marker = new window.kakao.maps.Marker({
        map: mapRef.current, // mapRef.current 사용
        position: new window.kakao.maps.LatLng(s.lat, s.lng),
      });
      markersRef.current.push(marker);

      const info = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:5px;font-size:12px;">${s.title}</div>`,
      });

      window.kakao.maps.event.addListener(marker, "click", () =>
        info.open(mapRef.current, marker)
      );
    });
    console.log(`[MainPage] 마커 갱신: 스터디 ${schedules.length}개`);
  }, [location.pathname, schedules]);

  // ------------------------------
  // ⭐ [제거] 현재 사용자 위치 가져오기 useEffect 삭제
  // ------------------------------

  // 달력 하이라이트 (로직 변경 없음)
  const highlightScheduleDates = ({ date }) => {
    const found = schedules.find(
      (s) =>
        s.date.getFullYear() === date.getFullYear() &&
        s.date.getMonth() === date.getMonth() &&
        s.date.getDate() === date.getDate()
    );
    return found ? "highlight" : "";
  };

  // 날짜 선택 일정들 (로직 변경 없음)
  const schedulesForDate = schedules.filter(
    (s) =>
      s.date.getFullYear() === selectedDate.getFullYear() &&
      s.date.getMonth() === selectedDate.getMonth() &&
      s.date.getDate() === selectedDate.getDate()
  );

  // 일정 삭제 (로직 변경 없음)
  const deleteSchedule = async (scheduleId) => {
    try {
      console.log("[MainPage] 일정 삭제 요청, scheduleId =", scheduleId);
      await api.delete(`/study-schedules/${scheduleId}`);
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
      alert("일정 삭제됨");
    } catch (err) {
      console.error("[MainPage] 삭제 실패:", err);
    }
  };

  // 알림 조회 (로직 변경 없음)
  useEffect(() => {
    if (!userId) {
      console.log("[MainPage] 알림 조회 생략: userId 없음");
      return;
    }

    const loadNotifications = async () => {
      try {
        console.log("[MainPage] /notifications 요청 시작");
        const res = await api.get("/notifications");
        console.log("[MainPage] /notifications 응답:", res.data);

        const mapped = res.data.map((n) => ({
          id: n.notification_id,
          message: n.message,
          type: n.type,
          isRead: n.is_read,
        }));
        setNotifications(mapped);
      } catch (err) {
        console.error("[MainPage] 알림 실패:", err);
      }
    };
    loadNotifications();
  }, [userId]);

  const markAsRead = async (id) => {
    try {
      console.log("[MainPage] 알림 읽음 처리 요청, id =", id);
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("[MainPage] 읽음 실패:", err);
    }
  };

  return (
    <div className="mainpage-wrapper">
      {/* NAVBAR (로직 변경 없음) */}
      <nav className="navbar navbar-expand-lg navbar-dark shadow-sm navbar-custom">
        <a className="navbar-brand" href="/">
          <img
            src="/logo.png"
            alt="logo"
            style={{ height: "70px", marginLeft: "30px" }}
          />
        </a>

        <div className="ml-auto d-flex align-items-center">
          <span className="me-3">{username}님</span>
          <button
            className="btn btn-sm btn-outline-light"
            onClick={() => setShowNotifications(true)}
          >
            🔔 알림
          </button>
        </div>
      </nav>

      {/* LAYOUT (로직 변경 없음) */}
      <div className="container-fluid">
        <div className="row">
          {/* SIDEBAR (로직 변경 없음) */}
          <div className="col-3 bg-light vh-100 p-3 border-right">
            <ul className="list-group">
              <li className="list-group-item">
                <Link to="/main" className="nav-link" style={sidebarStyles.link}>
                  HOME
                </Link>
              </li>

              <li className="list-group-item">
                <Link
                  to="/main/list"
                  className="nav-link"
                  style={sidebarStyles.link}
                >
                  스터디 목록
                </Link>
              </li>

              <li className="list-group-item">
                <Link
                  to="/main/recommend"
                  className="nav-link"
                  style={sidebarStyles.link}
                >
                  추천 그룹
                </Link>
              </li>

              <li className="list-group-item">
                <Link
                  to="/main/board"
                  className="nav-link"
                  style={sidebarStyles.link}
                >
                  게시판
                </Link>
              </li>

              <li className="list-group-item">
                <Link
                  to="/main/mypage"
                  className="nav-link"
                  style={sidebarStyles.link}
                >
                  내 프로필
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTENT (로직 변경 없음) */}
          <div className="col-9 p-4">
            <Routes>
              {/* HOME */}
              <Route
                index
                element={
                  <div>
                    <div className="row">
                      {/* 달력 영역 (로직 변경 없음) */}
                      <div className="col-md-6">
                        <h2>스터디 일정</h2>
                        <br />

                        {isLeader && (
                          <button
                            className="btn btn-primary btn-sm mb-3"
                            onClick={() => setOpenLeaderModal(true)}
                          >
                            + 새 스터디 일정 등록
                          </button>
                        )}

                        <button
                          className="btn btn-success btn-sm mb-3 ms-2"
                          onClick={() => setOpenUserModal(true)}
                        >
                          + 일정 추가
                        </button>

                        <Calendar
                          onChange={setSelectedDate}
                          value={selectedDate}
                          tileClassName={highlightScheduleDates}
                        />

                        <p className="mt-2">
                          선택한 날짜: {selectedDate.toDateString()}
                        </p>

                        {schedulesForDate.length > 0 ? (
                          schedulesForDate.map((s) => (
                            <ScheduleCard
                              key={s.id}
                              schedule={s}
                              isLeader={isLeader}
                              onDelete={() => deleteSchedule(s.id)}
                              onOpenAttendance={() => setOpenAttendanceModal(s)}
                            />
                          ))
                        ) : (
                          <p>등록된 일정이 없습니다.</p>
                        )}
                      </div>

                      {/* 지도 영역 (로직 변경 없음) */}
                      <div className="col-md-6">
                        <div
                          id="map"
                          style={{
                            width: "100%",
                            height: "400px",
                            borderRadius: "10px",
                            backgroundColor: "#eee",
                            marginTop: "25px",
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* 사용자 대시보드 (로직 변경 없음) */}
                    <div className="mt-4">
                      {/* ✅ userId를 Dashboard에 넘겨줌 */}
                      <UserBasicDashboard currentUserId={userId} />
                    </div>
                  </div>
                }
              />

              <Route path="list" element={<StudyList />} />
              <Route path="recommend" element={<RecommendGroups />} />
              <Route path="board" element={<Board />} />
              <Route path="board/write" element={<BoardWrite />} />
              <Route path="mypage" element={<MyPage />} />
              <Route path="edit-profile" element={<EditProfile />} />
            </Routes>
          </div>
        </div>
      </div>

      {/* 일정 생성 모달 (로직 변경 없음) */}
      {openLeaderModal && (
        <CreateLeaderScheduleModal
          onClose={() => setOpenLeaderModal(false)}
          onCreated={(newSch) => setSchedules((prev) => [...prev, newSch])}
        />
      )}
      {openUserModal && (
        <CreateUserScheduleModal
          onClose={() => setOpenUserModal(false)}
          onCreated={(newSch) => setSchedules((prev) => [...prev, newSch])}
        />
      )}

      {/* 출석 체크 모달 (로직 변경 없음) */}
      {openAttendanceModal && (
        <AttendanceModal
          schedule={openAttendanceModal}
          onClose={() => setOpenAttendanceModal(null)}
        />
      )}

      {/* 알림 모달 (로직 변경 없음) */}
      {showNotifications && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">🔔 알림</h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowNotifications(false)}
                ></button>
              </div>

              <div className="modal-body">
                {notifications.length === 0 && <p>알림이 없습니다.</p>}

                <ul className="list-group">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={`list-group-item d-flex justify-content-between 
											${n.isRead ? "read-notification" : "unread-notification"}`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <span>{n.message}</span>
                      {!n.isRead && (
                        <span className="badge bg-warning text-dark">
                          새 알림
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowNotifications(false)}
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