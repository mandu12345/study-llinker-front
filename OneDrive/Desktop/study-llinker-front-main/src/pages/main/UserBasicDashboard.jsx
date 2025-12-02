// src/pages/main/UserBasicDashboard.jsx

import React, { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";
import "react-calendar/dist/Calendar.css";
import api from "../../api/axios";

// ✅ currentUserId를 Prop으로 받습니다.
const UserBasicDashboard = ({ currentUserId }) => {
  const [schedules, setSchedules] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);

  // ✅ Prop으로 받은 currentUserId를 사용
  const userId = currentUserId;

  const loadData = async () => {
    try {
      console.log("[Dashboard] loadData 호출, userId =", userId);

      if (!userId) {
        console.error("[Dashboard] userId 없음! Dashboard 데이터 로드를 중단합니다.");
        setLoading(false);
        return;
      }

      console.log("[Dashboard] /study-schedules/me 요청 시작");
      const scheduleRes = await api.get("/study-schedules/me");
      console.log("[Dashboard] /study-schedules/me 응답:", scheduleRes.data);
      setSchedules(scheduleRes.data);

      console.log("[Dashboard] /attendance/user/" + userId + " 요청 시작");
      const attendanceRes = await api.get(`/attendance/user/${userId}`);
      console.log("[Dashboard] /attendance/user 응답:", attendanceRes.data);
      setAttendance(attendanceRes.data);
    } catch (err) {
      console.error("[Dashboard] 대시보드 데이터 로드 실패:", err);
      alert("대시보드 데이터를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ currentUserId가 유효할 때만 loadData를 호출합니다.
  useEffect(() => {
    console.log("[Dashboard] useEffect 실행, currentUserId =", currentUserId);
    if (currentUserId) {
      loadData();
    }
  }, [currentUserId]);

  // 2) 출석 현황 계산
  const attendanceStats = {
    present: attendance.filter((a) => a.status === "PRESENT").length,
    late: attendance.filter((a) => a.status === "LATE").length,
    absent: attendance.filter((a) => a.status === "ABSENT").length,
  };

  // 3) 월별 참여 횟수 계산
  const monthMap = {};
  schedules.forEach((s) => {
    const m = new Date(s.start_time).getMonth() + 1;
    monthMap[m] = (monthMap[m] || 0) + 1;
  });

  const dynamicLabels = Object.keys(monthMap).map((m) => `${m}월`);
  const dynamicData = Object.values(monthMap);

  // 4) 이번 주 날짜 계산
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const weeklySchedules = schedules.filter((s) => {
    const d = new Date(s.start_time);
    return d >= startOfWeek && d <= endOfWeek;
  });

  // 5) 목표 달성률 계산
  const target = weeklySchedules.length;
  const done = weeklySchedules.filter(
    (s) => new Date(s.end_time) < new Date()
  ).length;

  const goalPercent = target > 0 ? (done / target) * 100 : 0;

  // 6) 차트 렌더링
  useEffect(() => {
    if (loading) {
      console.log("[Dashboard] 로딩 중 → 차트 렌더링 스킵");
      return;
    }

    console.log("[Dashboard] 차트 렌더링 시작");

    const ctx1 = document.getElementById("attendanceRatioChart");
    if (ctx1) {
      if (pieChartRef.current) {
        pieChartRef.current.destroy();
      }

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

    const ctx2 = document.getElementById("participationCountChart");
    if (ctx2) {
      if (barChartRef.current) {
        barChartRef.current.destroy();
      }

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
  }, [loading, schedules]);

  useEffect(() => {
    return () => {
      if (pieChartRef.current) pieChartRef.current.destroy();
      if (barChartRef.current) barChartRef.current.destroy();
    };
  }, []);

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
                <div className="card-header bg-primary text-white">출석/참여 현황</div>
                <div className="card-body">
                  <div className="chart-wrap" style={{ height: "320px" }}>
                    <canvas id="attendanceRatioChart"></canvas>
                  </div>
                </div>
              </div>
            </div>

            {/* 월별 참여 횟수 */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header bg-success text-white">월별 참여 횟수</div>
                <div className="card-body">
                  <div className="chart-wrap" style={{ height: "320px" }}>
                    <canvas id="participationCountChart"></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 이번 주 일정 + 목표 달성률 */}
          <div className="row g-4 mt-1">
            <div className="col-lg-8">
              <div className="card">
                <div className="card-header bg-warning text-dark">이번 주 내 스케줄</div>
                <div className="card-body">
                  <ul className="list-group">
                    {weeklySchedules.length > 0 ? (
                      weeklySchedules.map((s) => (
                        <li
                          key={s.schedule_id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <div className="fw-semibold">{s.title}</div>
                            <div className="text-muted small">
                              {s.start_time.slice(0, 10)} · {s.location}
                            </div>
                          </div>

                          <span className="badge text-bg-primary">
                            D-
                            {Math.max(
                              0,
                              Math.ceil(
                                (new Date(s.start_time) - new Date()) /
                                  (1000 * 60 * 60 * 24)
                              )
                            )}
                          </span>
                        </li>
                      ))
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
                <div className="card-header bg-info text-dark">학습 목표 달성률</div>
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