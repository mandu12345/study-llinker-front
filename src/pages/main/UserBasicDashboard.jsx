// src/pages/main/UserBasicDashboard.jsx
import React, { useEffect } from "react";
import Chart from "chart.js/auto";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const UserBasicDashboard = () => {
  // 더미 데이터
  const dummyAttendance = { present: 12, late: 2, absent: 1 };
  const dummyParticipation = { monthly: [5, 7, 9], weekly: [2, 3, 4] };
  const dummySchedules = [
    { id: 1, title: "Java 스터디", date: "2025-09-15", place: "중앙도서관" },
    { id: 2, title: "AI 스터디", date: "2025-09-16", place: "가천대역" },
  ];
  const dummyGoal = { done: 3, target: 5, updatedAt: "2025-09-14" };

  // 차트 렌더링
  useEffect(() => {
    // 출석/참여 현황 (Pie)
    const ctx1 = document.getElementById("attendanceRatioChart");
    if (ctx1) {
      new Chart(ctx1, {
        type: "pie",
        data: {
          labels: ["출석", "지각", "결석"],
          datasets: [
            {
              data: [
                dummyAttendance.present,
                dummyAttendance.late,
                dummyAttendance.absent,
              ],
              backgroundColor: ["#0d6efd", "#ffc107", "#dc3545"],
            },
          ],
        },
      });
    }

    // 학습/참여 횟수 (Bar, 월별 기준)
    const ctx2 = document.getElementById("participationCountChart");
    if (ctx2) {
      new Chart(ctx2, {
        type: "bar",
        data: {
          labels: ["1월", "2월", "3월"],
          datasets: [
            {
              label: "참여 횟수",
              data: dummyParticipation.monthly,
              backgroundColor: "#198754",
            },
          ],
        },
      });
    }
  }, []);

  return (
    <div className="container mb-4">
      <h2 className="dashboard-title text-center my-4">사용자 대시보드</h2>

      {/* 출석/참여 현황 + 학습/참여 횟수 */}
      <div className="row g-4">
        {/* 출석/참여 현황 */}
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

        {/* 학습/참여 횟수 */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-success text-white">
              학습/참여 횟수
            </div>
            <div className="card-body">
              <div className="chart-wrap" style={{ height: "320px" }}>
                <canvas id="participationCountChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 이번 주 내 스케줄 + 학습 목표 달성률 */}
      <div className="row g-4 mt-1">
        {/* 이번 주 내 스케줄 */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header bg-warning text-dark">
              이번 주 내 스케줄
            </div>
            <div className="card-body">
              <ul className="list-group">
                {dummySchedules.length > 0 ? (
                  dummySchedules.map((s) => (
                    <li
                      key={s.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div className="fw-semibold">{s.title}</div>
                        <div className="text-muted small">
                          {s.date} · {s.place}
                        </div>
                      </div>
                      <span className="badge text-bg-primary">D-2</span>
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

        {/* 학습 목표 달성률 */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header bg-info text-dark">학습 목표 달성률</div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-end mb-2">
                <div className="small text-muted">이번 주 목표</div>
                <div className="fw-semibold">
                  {dummyGoal.done}/{dummyGoal.target} 회
                </div>
              </div>

              <div className="progress mb-2">
                <div
                  className="progress-bar progress-bar-striped"
                  role="progressbar"
                  style={{
                    width: `${(dummyGoal.done / dummyGoal.target) * 100 || 0}%`,
                  }}
                >
                  {((dummyGoal.done / dummyGoal.target) * 100 || 0).toFixed(0)}%
                </div>
              </div>

              <small className="text-muted">
                마지막 갱신: {dummyGoal.updatedAt}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBasicDashboard;
