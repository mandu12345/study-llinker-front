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
import BoardDetail from "./main/BoardDetail";

// 모달들
import ScheduleCreateModal from "../components/ScheduleCreateModal";
import AttendanceModal from "../components/AttendanceModal";
import ScheduleDetailModal from "../components/ScheduleDetailModal";

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
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // 일정 등록 모달
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroupId] = useState(null);
  const [createMode, setCreateMode] = useState(null);  

  // 출석 모달
  const [openAttendanceModal, setOpenAttendanceModal] = useState(null);

  // 일정 상세 모달
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [detailScheduleId, setDetailScheduleId] = useState(null);

  // 일정 수정 모달
  const [editScheduleData, setEditScheduleData] = useState(null);
  const [modalMode, setModalMode] = useState("create"); // "create" | "update"


  // 알림
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

        // Dashboard 등에서 userId를 localStorage로도 쓰는 경우 대비
        localStorage.setItem("userId", res.data.userId);
        console.log(
          "[MainPage] userId 상태/로컬스토리지 설정 완료:",
          res.data.userId
        );
      } catch (err) {
        console.error("유저 정보 실패:", err);
      }
    };
    loadUser();
  }, []);

  // ------------------------------
  // 2) 리더 여부 확인 (로직 변경 없음)
  // ------------------------------
  const loadSchedules = async () => {
    try {
      const res = await api.get("/study-schedules/me");
      console.log("[MainPage] /study-schedules/me 응답:", res.data);

      const processed = await Promise.all(
        res.data.map(async (s) => {
          // ✅ 백엔드 DTO 기준: MyScheduleResponse (scheduleId, groupId, startTime, ...)
          const scheduleId = s.scheduleId;
          const groupId = s.groupId ?? null;

          let group = null;

          // 🔹 groupId가 있을 때만 그룹 단건 조회
          if (groupId != null) {
            try {
              console.log("[MainPage] 그룹 단건 조회 요청, gid =", groupId);
              const groupRes = await api.get(`/study-groups/${groupId}`);
              group = groupRes.data;
            } catch (err) {
              console.error(
                "[MainPage] 그룹 단건 조회 실패 (gid=" + groupId + "):",
                err
              );
            }
          } else {
            console.log(
              "[MainPage] 이 일정은 개인 일정이라 groupId 없음, 그룹 API 호출 스킵"
            );
          }

          return {
            id: scheduleId,
            groupId,
            title: s.title,
            content: s.description, // DTO에는 없을 수 있지만 기존 코드 유지
            location: s.location,
            date: new Date(s.startTime), // ✅ MyScheduleResponse.startTime (LocalDateTime/Timestamp)
            isJoined: true,
            lat: group?.latitude ?? null,
            lng: group?.longitude ?? null,
            leaderName: group?.leaderName || "", // ✅ DTO 기준: leaderName 사용
          };
        })
      );

      console.log("[MainPage] 가공된 일정 데이터:", processed);
      setSchedules(processed);
    } catch (e) {
      console.error("[MainPage] 일정 조회 실패:", e);
    }
  };

  useEffect(() => {
    if (!userId) {
      console.log("[MainPage] 일정 조회 생략: userId 없음");
      return;
    }
    console.log("[MainPage] 일정 조회 시작 (userId:", userId, ")");
    loadSchedules();
  }, [userId]); 

  // ------------------------------
  // 2-A) 리더 여부 확인 + 상세 디버깅 로그
  // ------------------------------
  useEffect(() => {
    if (!userId) return;

    const checkLeader = async () => {
      try {
        const res = await api.get("/study-groups");
        const groups = res.data || [];

        const amLeader = groups.some(g => g.leaderId === userId);

        console.log("📌 리더 여부:", amLeader);
        setIsLeader(amLeader);
      } catch (e) {
        console.error("리더 여부 체크 실패:", e);
      }
    };

    checkLeader();
  }, [userId]);

  // ------------------------------
  // 4) 지도 초기화 (Kakao Map)
  // ------------------------------
  useEffect(() => {
    if (!window.kakao || mapRef.current) return;

    window.kakao.maps.load(() => {
      const container = document.getElementById("map");
      if (!container) return;

      mapRef.current = new window.kakao.maps.Map(container, {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 6,
      });
    });
  }, []);

  // ⛳ 5) 마커 갱신 — 위치 or 일정 바뀔 때만
  useEffect(() => {
    if (!mapRef.current) return;

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // 사용자 위치 마커
    if (userLocation) {
      const marker = new window.kakao.maps.Marker({
        map: mapRef.current,
        position: new window.kakao.maps.LatLng(
          userLocation.lat,
          userLocation.lng
        ),
      });
      markersRef.current.push(marker);
      mapRef.current.setCenter(
        new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng)
      );
    }

    // 스터디 위치 마커
    schedules.forEach((s) => {
      if (!s.lat || !s.lng) return;
      const marker = new window.kakao.maps.Marker({
        map: mapRef.current,
        position: new window.kakao.maps.LatLng(s.lat, s.lng),
      });
      markersRef.current.push(marker);
    });
  }, [userLocation, schedules]);

  // 사용자 위치 가져오기
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => console.error("위치 실패:", err)
    );
  }, []);

  // 날짜 하이라이트
  const highlightScheduleDates = ({ date }) => {
    const found = schedules.find(
      (s) =>
        s.date.getFullYear() === date.getFullYear() &&
        s.date.getMonth() === date.getMonth() &&
        s.date.getDate() === date.getDate()
    );
    return found ? "highlight" : "";
  };

  // 선택한 날짜의 일정
  const schedulesForDate = schedules.filter(
    (s) =>
      s.date.getFullYear() === selectedDate.getFullYear() &&
      s.date.getMonth() === selectedDate.getMonth() &&
      s.date.getDate() === selectedDate.getDate()
  );

  // ------------------------------
  // 알림 조회
  // ------------------------------  
  useEffect(() => {
    if (!userId) return;

    const loadNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        const mapped = res.data.map((n) => ({
          id: n.notification_id,
          message: n.message,
          type: n.type,
          isRead: n.is_read, // ✅ DTO 필드명 is_read 기준으로 매핑
        }));
        setNotifications(mapped);
      } catch (err) {
        console.error("알림 실패:", err);
      }
    };

    loadNotifications();

    // 읽지 않은 알림 개수
    loadUnreadCount();
  }, [userId]);

  // 읽지 않은 알림 수만
  const loadUnreadCount = async () => {
    try {
      const res = await api.get("/notifications/unread");
      setUnreadCount(res.data.length || 0); // unread 배열 길이
    } catch (err) {
      console.error("읽지 않은 알림 로딩 실패:", err);
    }
  };

  // 알림 읽음 처리
    const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                isRead: true,
              }
            : n
        )
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("읽음 실패:", err);
    }
  };

  // 알림 삭제
  const deleteNotification = async (id) => {
    if (!window.confirm("이 알림을 삭제하시겠습니까?")) return;

    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));

      // unread 상태였으면 감소
      const target = notifications.find((n) => n.id === id);
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (err) {
      console.error("알림 삭제 실패:", err);
    }
  };

  // 모든 알림 삭제
  const deleteAllNotifications = async () => {
    if (!window.confirm("모든 알림을 삭제하시겠습니까?")) return;

    try {
      await api.delete("/notifications/all");
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("알림 전체 삭제 실패:", err);
    }
  };

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <div className="mainpage-wrapper">
      {/* NAVBAR */}
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
            className="btn btn-sm btn-outline-light position-relative"
            onClick={() => setShowNotifications(true)}
          >
            🔔 알림
            {unreadCount > 0 && (
              <span
                className="badge bg-danger position-absolute top-0 start-100 translate-middle"
                style={{ fontSize: "0.75rem" }}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* LAYOUT */}
      <div className="container-fluid">
        <div className="row">
          {/* SIDEBAR */}
          <div className="col-3 bg-light vh-100 p-3 border-right">
            <ul className="list-group">
              <li className="list-group-item">
                <Link to="/main" className="nav-link" style={sidebarStyles.link}>
                  HOME
                </Link>
              </li>
              <li className="list-group-item">
                <Link to="/main/list" className="nav-link" style={sidebarStyles.link}>
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
                <Link to="/main/board" className="nav-link" style={sidebarStyles.link}>
                  게시판
                </Link>
              </li>
              <li className="list-group-item">
                <Link to="/main/mypage" className="nav-link" style={sidebarStyles.link}>
                  내 프로필
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTENT */}
          <div className="col-9 p-4">
            <Routes>
              {/* HOME */}
              <Route
                index
                element={
                  <div>
                    <div className="row">
                      {/* 달력 영역 */}
                      <div className="col-md-6">
                        <h2>스터디 일정</h2>
                        <br />

                        {/* 리더용 버튼 */}
                        {isLeader && (
                          <button
                            className="btn btn-primary btn-sm mb-3"
                            onClick={() => {
                              setCreateMode("study");
                              setShowCreateModal(true);
                            }}
                          >
                            + 새 스터디 일정 등록
                          </button>
                        )}

                        <button
                          className="btn btn-success btn-sm mb-3 ms-2"
                          onClick={() => {
                            setCreateMode("personal");
                            setShowCreateModal(true);
                          }}
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

                        {/* 일정 리스트 */}
                        {schedulesForDate.length > 0 ? (
                          schedulesForDate.map((s) => (
                            <div
                              className="p-2 border rounded mb-2 schedule-item"
                              style={{ cursor: "pointer" }}
                              key={s.id}
                              onClick={() => {
                                setDetailScheduleId(s.id);
                                setOpenDetailModal(true);
                              }}
                            >
                              <strong>{s.title}</strong>
                            </div>
                          ))
                        ) : (
                          <p>등록된 일정이 없습니다.</p>
                        )}
                      </div>

                      {/* 지도 영역 */}
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

                    {/* 사용자 대시보드 */}
                    <div className="mt-4">
                      <UserBasicDashboard currentUserId={userId} />
                    </div>
                  </div>
                }
              />

                {/* 스터디 목록 */}
                <Route path="list" element={<StudyList />} />

                {/* 추천 그룹 */}
                <Route path="recommend" element={<RecommendGroups />} />

                {/* 게시판 목록 */}
                <Route path="board" element={<Board />} />

                {/* 게시글 작성 */}
                <Route path="board/write" element={<BoardWrite />} />

                {/* 게시글 상세 */}
                <Route path="board/detail/:postId" element={<BoardDetail />} />

                {/* 게시글 수정 */}
                <Route path="board/edit/:postId" element={<BoardWrite />} />

                {/* 마이페이지 */}
                <Route path="mypage" element={<MyPage />} />

                {/* 프로필 수정 */}
                <Route path="edit-profile" element={<EditProfile />} />
            </Routes>
          </div>
        </div>
      </div>

      {/* 일정 생성 모달 */}
      {showCreateModal && (
        <ScheduleCreateModal
          mode={modalMode}                       // ← 수정 모드 반영
          groupId={selectedGroupId}
          baseDate={
            modalMode === "update"
              ? null 
              : selectedDate.toLocaleDateString("en-CA")
          }
          scheduleData={editScheduleData}        // ← ★ 핵심! 반드시 넘겨야 함 ★
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadSchedules();
          }}
        />
      )}
      {/* 일정 상세 모달 */}
      {openDetailModal && detailScheduleId && (
        <ScheduleDetailModal
          scheduleId={detailScheduleId}
          userId={userId}
          onClose={(mode, schedule) => {
            setOpenDetailModal(false);

            // ⭐ 삭제 후 목록 새로고침
            if (mode === "deleted") {
              loadSchedules();    // ← 일정 목록 다시 불러오기
              return;
            }

            if (mode === "update") {
              console.log("수정할 schedule:", schedule);
              setEditScheduleData(schedule);               // 수정할 데이터 저장
              setModalMode("update");                      // 수정 모드 설정
              setCreateMode(schedule.group_id ? "study" : "personal");
              setShowCreateModal(true);
            }
          }}
        />
      )}
      {/* 출석 모달 */}
      {openAttendanceModal && (
        <AttendanceModal
          scheduleId={openAttendanceModal}
          onClose={() => setOpenAttendanceModal(null)}
        />
      )}

      {/* 알림 모달 */}
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
                    className={`list-group-item d-flex justify-content-between align-items-center 
                    ${n.isRead ? "read-notification" : "unread-notification"}`}
                  >
                    <div onClick={() => markAsRead(n.id)} style={{ cursor: "pointer", flex: 1 }}>
                      <span>{n.message}</span>
                      {!n.isRead && (
                        <span className="badge bg-warning text-dark ms-2">새 알림</span>
                      )}
                    </div>

                    <button
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => deleteNotification(n.id)}
                    >
                      🗑
                    </button>
                  </li>
                  ))}
                </ul>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-danger btn-sm me-auto"
                  onClick={deleteAllNotifications}
                >
                  전체 삭제
                </button>

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
