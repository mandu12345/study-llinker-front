// src/pages/main/UserBasicDashboard.jsx

import React, { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";
import "react-calendar/dist/Calendar.css";
import api from "../../api/axios";

const UserBasicDashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);

  // 🔹 공통 헬퍼: 백엔드 응답이 snake_case / camelCase 섞여도 대응
  const getStart = (s) => s.startTime ?? s.start_time;
  const getEnd = (s) => s.endTime ?? s.end_time;
  const getId = (s) => s.scheduleId ?? s.schedule_id;

  const loadData = async () => {
    try {
      console.log("[Dashboard] 데이터 로드 시작");

      // ✅ 내 일정 조회
      const scheduleRes = await api.get("/study-schedules/me");
      console.log("[Dashboard] /study-schedules/me =", scheduleRes.data);

      // 그대로 저장 (필드 이름은 헬퍼로 처리)
      setSchedules(scheduleRes.data || []);

      // ✅ 내 출석 조회
      const attendanceRes = await api.get("/attendance/me");
      console.log("[Dashboard] /attendance/me =", attendanceRes.data);
      setAttendance(attendanceRes.data || []);
    } catch (err) {
      console.error("[Dashboard] 대시보드 데이터 로드 실패:", err);
      alert("대시보드 데이터를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) 출석 현황 계산
  const attendanceStats = {
    present: attendance.filter((a) => a.status === "PRESENT").length,
    late: attendance.filter((a) => a.status === "LATE").length,
    absent: attendance.filter((a) => a.status === "ABSENT").length,
  };

  // 3) 월별 참여 횟수 계산
  const monthMap = {};
  schedules.forEach((s) => {
    const start = getStart(s);
    if (!start) return;

    const m = new Date(start).getMonth() + 1;
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
    const start = getStart(s);
    if (!start) return false;

    const d = new Date(start);
    return d >= startOfWeek && d <= endOfWeek;
  });

  // 5) 이번 주 목표 달성률 계산
  const target = weeklySchedules.length;
  const done = weeklySchedules.filter((s) => {
    const end = getEnd(s);
    if (!end) return false;
    return new Date(end) < new Date();
  }).length;

  const goalPercent = target > 0 ? (done / target) * 100 : 0;

  // 6) 차트 렌더링
  useEffect(() => {
    if (loading) return;

    // ---- 파이 차트 (출석/지각/결석 비율) ----
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

    // ---- 막대 차트 (월별 참여 횟수) ----
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
  }, [loading, schedules, attendance]); // eslint-disable-line react-hooks/exhaustive-deps

  // 언마운트 시 차트 정리
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

            {/* 월별 참여 횟수 */}
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

          {/* 이번 주 일정 + 목표 달성률 */}
          <div className="row g-4 mt-1">
            {/* 이번 주 내 스케줄 */}
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

            {/* 학습 목표 달성률 */}
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