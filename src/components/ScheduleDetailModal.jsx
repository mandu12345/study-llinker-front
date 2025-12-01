// src/components/ScheduleDetailModal.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import AttendanceModal from "./AttendanceModal";

const ScheduleDetailModal = ({ scheduleId, onClose, userId }) => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  // ===================================================
  // 1) 일정 상세 데이터 불러오기
  // ===================================================
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/study-schedules/${scheduleId}`);
        setSchedule(res.data);
      } catch (e) {
        console.error("일정 상세 불러오기 실패:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [scheduleId]);

  if (loading || !schedule) return null;

  // ===================================================
  // 2) 일정 종류 판별
  // ===================================================
  const isStudySchedule =
    schedule.group_id !== null && schedule.group_id !== 0;

  const isLeader = schedule.group_leader_id === userId;

  const isPersonal = !isStudySchedule;

  // ===================================================
  // 3) 일정 삭제
  // ===================================================
  const handleDelete = async () => {
    if (!window.confirm("정말 이 일정을 삭제하시겠습니까?")) return;

    try {
      await api.delete(`/study-schedules/${scheduleId}`);
      alert("일정이 삭제되었습니다.");
      onClose(true); // reload 일정 목록
    } catch (e) {
      console.error(e);
      alert("일정 삭제 실패");
    }
  };

  // ===================================================
  // 4) 개인 일정 완료 처리
  // ===================================================
  const handleComplete = async () => {
    try {
      await api.patch(`/study-schedules/${scheduleId}/status`, {
        status: "COMPLETED",
      });
      alert("일정이 완료되었습니다.");
      onClose(true);
    } catch (e) {
      console.error(e);
      alert("일정 완료 처리 실패");
    }
  };

  // ===================================================
  // 5) 일정 수정 (등록 모달 재사용)
  // ===================================================
  const handleUpdate = () => {
    // 부모(MainPage)에게 update 요청 전달
    onClose("update", schedule);
  };

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.35)" }}>
      <div className="modal-dialog">
        <div className="modal-content">

          {/* HEADER */}
          <div className="modal-header">
            <h5 className="modal-title">일정 상세 정보</h5>
            <button className="btn-close" onClick={() => onClose()}></button>
          </div>

          {/* BODY */}
          <div className="modal-body">
            <h5>{schedule.title}</h5>

            <p>
              <strong>날짜:</strong>{" "}
              {schedule.start_time ? schedule.start_time.slice(0, 10) : "-"}
            </p>

            {schedule.description && (
              <p>
                <strong>내용:</strong> {schedule.description}
              </p>
            )}

            {schedule.location && (
              <p>
                <strong>장소:</strong> {schedule.location}
              </p>
            )}

            {isStudySchedule && (
              <>
                <p className="mt-2"><strong>📚 스터디 일정</strong></p>
                <p>
                  <strong>리더:</strong> {schedule.group_leader_name}
                </p>
              </>
            )}

            {isPersonal && <p><strong>👤 개인 일정</strong></p>}
          </div>

          {/* FOOTER */}
          <div className="modal-footer d-flex justify-content-between">

            {/* ===========================
                스터디 일정 + 리더(관리 가능)
               =========================== */}
            {isStudySchedule && isLeader && (
              <>
                <button
                  className="btn btn-success"
                  onClick={() => setShowAttendanceModal(true)}
                >
                  출석 체크
                </button>

                <button className="btn btn-primary" onClick={handleUpdate}>
                  일정 수정
                </button>

                <button className="btn btn-danger" onClick={handleDelete}>
                  일정 삭제
                </button>
              </>
            )}

            {/* ===========================
                스터디 일정 + 일반 사용자
                버튼 없음
               =========================== */}
            {isStudySchedule && !isLeader && (
              <p className="text-muted m-auto">
                리더가 아닐 경우 관리 기능이 없습니다.
              </p>
            )}

            {/* ===========================
                개인 일정
               =========================== */}
            {isPersonal && (
              <>
                <button className="btn btn-primary" onClick={handleUpdate}>
                  일정 수정
                </button>

                <button className="btn btn-danger" onClick={handleDelete}>
                  일정 삭제
                </button>

                <button className="btn btn-secondary" onClick={handleComplete}>
                  완료하기
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 출석 모달 */}
      {showAttendanceModal && (
        <AttendanceModal
          scheduleId={scheduleId}
          onClose={() => setShowAttendanceModal(false)}
        />
      )}
    </div>
  );
};

export default ScheduleDetailModal;
