// src/pages/components/AttendanceModal.jsx

import React, { useEffect, useState } from "react";
import api from "../api/axios";

const AttendanceModal = ({ schedule, onClose }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 스터디 멤버 조회
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const res = await api.get(`/study-groups/${schedule.groupId}/members`);
        const approved = res.data.filter((m) => m.status === "APPROVED");
        setMembers(approved);
      } catch (err) {
        console.error("멤버 조회 실패:", err);
      }
      setLoading(false);
    };
    loadMembers();
  }, [schedule.groupId]);

  // 출석 요청
  const markAttendance = async (userId, status) => {
    try {
      await api.post("/attendance", {
        scheduleId: schedule.id,
        userId,
        status
      });
      alert("출석 기록 완료");
    } catch (err) {
      console.error("출석 실패:", err);
      alert("출석 실패");
    }
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">

          <div className="modal-header bg-success text-white">
            <h5 className="modal-title">{schedule.title} 출석체크</h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {loading && <p>로딩 중...</p>}

            {!loading &&
              members.map((m) => (
                <div key={m.user_id} className="d-flex justify-content-between align-items-center mb-2">
                  <span>{m.name}</span>

                  <div>
                    <button
                      className="btn btn-sm btn-success me-1"
                      onClick={() => markAttendance(m.user_id, "PRESENT")}
                    >
                      출석
                    </button>
                    <button
                      className="btn btn-sm btn-warning me-1"
                      onClick={() => markAttendance(m.user_id, "LATE")}
                    >
                      지각
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => markAttendance(m.user_id, "ABSENT")}
                    >
                      결석
                    </button>
                  </div>
                </div>
              ))}
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary btn-sm" onClick={onClose}>닫기</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;
