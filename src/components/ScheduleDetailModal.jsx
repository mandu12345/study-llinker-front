// src/components/ScheduleDetailModal.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import AttendanceModal from "./AttendanceModal";

const ScheduleDetailModal = ({ scheduleId, onClose, userId }) => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  // 헬퍼: snake_case / camelCase 모두 대응
  const get = (obj, ...keys) => {
    for (const k of keys) {
      if (obj[k] !== undefined && obj[k] !== null) return obj[k];
    }
    return null;
  };

  // 일정 상세 조회
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/study-schedules/${scheduleId}`);
        setSchedule(res.data);
      } catch (err) {
        console.error("상세조회 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [scheduleId]);

  if (loading || !schedule) return null;

  // camelCase / snakeCase 대응
  const groupId = get(schedule, "groupId", "group_id");
  const leaderId = get(schedule, "groupLeaderId", "group_leader_id");
  const leaderName = get(schedule, "groupLeaderName", "group_leader_name");

  const isStudySchedule = groupId !== null;
  const isLeader = leaderId === userId;

  // 삭제
  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await api.delete(`/study-schedules/${scheduleId}`);
      alert("일정 삭제 완료");
      onClose(true);
    } catch (err) {
      console.error("삭제 오류:", err);
      alert("삭제 실패");
    }
  };

  const handleComplete = async () => {
    try {
      await api.patch(`/study-schedules/${scheduleId}/status`, {
        status: "COMPLETED",
      });
      alert("완료 처리됨");
      onClose(true);
    } catch (err) {
      console.error("완료 오류:", err);
    }
  };

  const handleUpdate = () => {
    onClose("update", schedule);
  };

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.35)" }}>
      <div className="modal-dialog">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">일정 상세 정보</h5>
            <button className="btn-close" onClick={() => onClose()}></button>
          </div>

          <div className="modal-body">
            <h5>{schedule.title}</h5>

            <p>
              <strong>날짜:</strong>{" "}
              {get(schedule, "startTime", "start_time")?.slice(0, 10)}
            </p>

            {schedule.description && (
              <p><strong>내용:</strong> {schedule.description}</p>
            )}

            {schedule.location && (
              <p><strong>장소:</strong> {schedule.location}</p>
            )}

            {isStudySchedule ? (
              <>
                <p className="mt-2"><strong>📚 스터디 일정</strong></p>
                <p><strong>리더:</strong> {leaderName || "정보 없음"}</p>
              </>
            ) : (
              <p><strong>👤 개인 일정</strong></p>
            )}
          </div>

          <div className="modal-footer d-flex justify-content-between">

            {isStudySchedule && isLeader && (
              <>
                <button
                  className="btn btn-success"
                  onClick={() => setShowAttendanceModal(true)}
                >
                  출석 체크
                </button>
                <button className="btn btn-primary" onClick={handleUpdate}>
                  수정
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  삭제
                </button>
              </>
            )}

            {isStudySchedule && !isLeader && (
              <p className="text-muted">리더만 관리할 수 있는 일정입니다.</p>
            )}

            {!isStudySchedule && (
              <>
                <button className="btn btn-primary" onClick={handleUpdate}>
                  수정
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  삭제
                </button>
                <button className="btn btn-secondary" onClick={handleComplete}>
                  완료
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showAttendanceModal && (
        <AttendanceModal
          schedule={{
            id: scheduleId,
            title: schedule.title,
            groupId,
          }}
          onClose={() => setShowAttendanceModal(false)}
        />
      )}
    </div>
  );
};

export default ScheduleDetailModal;
