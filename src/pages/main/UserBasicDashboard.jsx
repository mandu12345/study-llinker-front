// src/pages/main/UserBasicDashboard.jsx

import React, { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";
import "react-calendar/dist/Calendar.css";
import api from "../../api/axios";

const UserBasicDashboard = () => {
  const [userId, setUserId] = useState(null); // 🔹 userId를 상태로 관리
  const [schedules, setSchedules] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);

  // --------------------------
  //   snake_case / camelCase 대응 헬퍼
  // --------------------------
  const getStart = (s) => s.startTime ?? s.start_time;
  const getEnd = (s) => s.endTime ?? s.end_time;
  const getId = (s) => s.scheduleId ?? s.schedule_id;

  // --------------------------
  //   userId 변화 감지 (localStorage 기반)
  // --------------------------
  useEffect(() => {
    const detectUserId = () => {
      const stored = localStorage.getItem("userId");
      if (stored && Number(stored) !== userId) {
        console.log("[Dashboard] userId 감지됨 →", stored);
        setUserId(Number(stored));
      }
    };

    // 최초 체크
    detectUserId();

    // 0.3초 간격 체크
    const interval = setInterval(detectUserId, 300);

    return () => clearInterval(interval);
  }, [userId]);

  // --------------------------
  //   실제 데이터 로딩
  // --------------------------
  const loadData = async () => {
    try {
      console.log("[Dashboard] 데이터 로드 시작");

      // 일정 조회
      const scheduleRes = await api.get("/study-schedules/me");
      console.log("[Dashboard] /study-schedules/me =", scheduleRes.data);
      setSchedules(scheduleRes.data || []);

      // 출석 조회
      const attendanceRes = await api.get(`/attendance/user/${userId}`);
      console.log("[Dashboard] /attendance/user =", attendanceRes.data);
      setAttendance(attendanceRes.data || []);
    } catch (err) {
      console.error("[Dashboard] 대시보드 데이터 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  //   userId 준비 후 실행
  // --------------------------
  useEffect(() => {
    if (!userId) {
      console.log("[Dashboard] userId 없음 → loadData 실행 안 함");
      return;
    }

    console.log("[Dashboard] userId 준비됨 → loadData 실행");
    loadData();
  }, [userId]);

  // --------------------------------------------------------
  //   출석 통계 / 월별 참여도 / 이번 주 일정 / 목표 달성률 계산
  // --------------------------------------------------------
  const attendanceStats = {
    present: attendance.filter((a) => a.status === "PRESENT").length,
    late: attendance.filter((a) => a.status === "LATE").length,
    absent: attendance.filter((a) => a.status === "ABSENT").length,
  };

// --------------------------------------------------------
//   월별 참여 횟수 계산 (스터디 일정 + 출석 PRESENT/LATE 만 카운트)
// --------------------------------------------------------

  const monthMap = {};

  // 1) 참석한 출석 데이터만 필터링
  const attended = attendance.filter(
    (a) => a.status === "PRESENT" || a.status === "LATE"
  );

  // 2) 참석한 일정만 월별 카운트
  attended.forEach((att) => {
    // 해당 attendance 의 schedule 정보 찾기
    const schedule = schedules.find((s) => {
      const sid = s.schedule_id ?? s.scheduleId;
      return sid === att.schedule_id;
    });

    if (!schedule) return;

    // 개인 일정 제외
    const groupId = schedule.group_id ?? schedule.groupId;
    if (!groupId) return;

    const start = getStart(schedule);
    if (!start) return;

    const month = new Date(start).getMonth() + 1;
    monthMap[month] = (monthMap[month] || 0) + 1;
  });

  // 최종 그래프 데이터 생성
  const dynamicLabels = Object.keys(monthMap).map((m) => `${m}월`);
  const dynamicData = Object.values(monthMap);


  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const weeklySchedules = schedules.filter((s) => {
    const start = getStart(s);
    if (!start) return false;
    const d = new Date(start);
    return d >= startOfWeek && d <= endOfWeek;
  });

  const target = weeklySchedules.length;
  const done = weeklySchedules.filter((s) => {
    const end = getEnd(s);
    if (!end) return false;
    return new Date(end) < new Date();
  }).length;

  const goalPercent = target > 0 ? (done / target) * 100 : 0;

  // --------------------------------------------------------
  //   차트 렌더링
  // --------------------------------------------------------
  useEffect(() => {
    if (loading) return;

    // --- 파이 차트 (출석 비율) ---
    const ctx1 = document.getElementById("attendanceRatioChart");
    if (ctx1) {
      if (pieChartRef.current) pieChartRef.current.destroy();
      pieChartRef.current = new Chart(ctx1, {
        type: "pie",
        data: {
          labels: ["출석", "지각", "결석"],
          datasets: [
            {
              data: [
                attendanceStats.present,
                attendanceStats.late,
                attendanceStats.absent,
              ],
              backgroundColor: ["#0d6efd", "#ffc107", "#dc3545"],
            },
          ],
        },
      });
    }

    // --- 바 차트 (월별 참여 횟수) ---
    const ctx2 = document.getElementById("participationCountChart");
    if (ctx2) {
      if (barChartRef.current) barChartRef.current.destroy();
      barChartRef.current = new Chart(ctx2, {
        type: "bar",
        data: {
          labels: dynamicLabels,
          datasets: [
            {
              label: "참여 횟수",
              data: dynamicData,
              backgroundColor: "#198754",
            },
          ],
        },
      });
    }
  }, [loading, schedules, attendance]);

  // --------------------------------------------------------
  //   차트 제거 (언마운트)
  // --------------------------------------------------------
  useEffect(() => {
    return () => {
      if (pieChartRef.current) pieChartRef.current.destroy();
      if (barChartRef.current) barChartRef.current.destroy();
    };
  }, []);

  // --------------------------------------------------------
  //   UI (전체 유지)
  // --------------------------------------------------------
  return (
    <div className="container mb-4">
      <h2 className="dashboard-title text-center my-4">사용자 대시보드</h2>

      {loading && <p className="text-center mt-4">데이터 불러오는 중...</p>}

      {!loading && (
        <>
          {/* 출석/참여 현황 */}
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header bg-primary text-white">
                  출석/참여 현황
                </div>
                <div className="card-body">
                  <div className="chart-wrap" style={{ height: "320px" }}>
                    <canvas id="attendanceRatioChart"></canvas>
                  </div>
                </div>
              </div>
            </div>

            {/* 월별 참여 */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header bg-success text-white">
                  월별 참여 횟수
                </div>
                <div className="card-body">
                  <div className="chart-wrap" style={{ height: "320px" }}>
                    <canvas id="participationCountChart"></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 이번 주 일정 & 목표 달성률 */}
          <div className="row g-4 mt-1">
            <div className="col-lg-8">
              <div className="card">
                <div className="card-header bg-warning text-dark">
                  이번 주 내 스케줄
                </div>
                <div className="card-body">
                  <ul className="list-group">
                    {weeklySchedules.length > 0 ? (
                      weeklySchedules.map((s) => {
                        const start = getStart(s);
                        const startDateStr = start
                          ? String(start).slice(0, 10)
                          : "-";

                        const dday = start
                          ? Math.max(
                              0,
                              Math.ceil(
                                (new Date(start) - new Date()) /
                                  (1000 * 60 * 60 * 24)
                              )
                            )
                          : "-";

                        return (
                          <li
                            key={getId(s)}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            <div>
                              <div className="fw-semibold">{s.title}</div>
                              <div className="text-muted small">
                                {startDateStr} · {s.location}
                              </div>
                            </div>

                            <span className="badge text-bg-primary">
                              D-{dday}
                            </span>
                          </li>
                        );
                      })
                    ) : (
                      <p className="text-muted small">
                        이번 주 예정된 일정이 없어요.
                      </p>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* 목표 달성률 */}
            <div className="col-lg-4">
              <div className="card">
                <div className="card-header bg-info text-dark">
                  학습 목표 달성률
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-end mb-2">
                    <div className="small text-muted">이번 주 목표</div>
                    <div className="fw-semibold">
                      {done}/{target} 회
                    </div>
                  </div>

                  <div className="progress mb-2">
                    <div
                      className="progress-bar progress-bar-striped"
                      role="progressbar"
                      style={{ width: `${goalPercent}%` }}
                    >
                      {goalPercent.toFixed(0)}%
                    </div>
                  </div>

                  <small className="text-muted">
                    이번 주 일정 {target}개 중 {done}개 완료됨
                  </small>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserBasicDashboard;
