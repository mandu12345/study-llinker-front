// src/pages/main/ScheduleCard.jsx

import React from "react";

const ScheduleCard = ({ schedule, isLeader, onDelete, onOpenAttendance }) => {
  const isStudySchedule = schedule.groupId !== null;

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        <h5 className="card-title">{schedule.title}</h5>
        {isStudySchedule && (
          <p className="card-text">리더: {schedule.leaderName || "-"}</p>
        )}

        <p className="card-text">장소: {schedule.location || "미정"}</p>
        <p className="card-text">내용: {schedule.content}</p>
        <p className="card-text text-muted">{schedule.date.toDateString()}</p>

        {/* 스터디 일정 + 리더일 때만 출석체크 */}
        {isLeader && isStudySchedule && (
          <button
            className="btn btn-success btn-sm me-2"
            onClick={onOpenAttendance}
          >
            출석체크
          </button>
        )}

        <button className="btn btn-danger btn-sm" onClick={onDelete}>
          일정 삭제
        </button>
      </div>
    </div>
  );
};

export default ScheduleCard;
