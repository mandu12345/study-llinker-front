// src/components/ScheduleCreateModal.jsx
import React, { useState, useEffect } from "react";
import api from "../api/axios";

const ScheduleCreateModal = ({
  mode,               // "study" | "personal" | "update"
  groupId = null,     // study 일정인 경우 필요
  baseDate = null,    // 캘린더에서 선택한 날짜 (YYYY-MM-DD)
  scheduleData = null,// update일 때 기존 일정 데이터
  onClose,
  onSuccess,
}) => {
  const isUpdate = mode === "update";

  // 기존 일정이 스터디 일정인지 판별
  const isStudyMode =
    mode === "study" || (isUpdate && scheduleData?.group_id);

  // ================================
  // 1) form 상태
  // ================================
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(baseDate || ""); // YYYY-MM-DD
  const [startTime, setStartTime] = useState("");   // HH:mm
  const [endTime, setEndTime] = useState("");       // HH:mm

  // ================================
  // 2) 수정 모드: 기존 값 채우기
  // ================================
  useEffect(() => {
    if (isUpdate && scheduleData) {
      setTitle(scheduleData.title);
      setDescription(scheduleData.description || "");
      setLocation(scheduleData.location || "");
      setDate(scheduleData.start_time.slice(0, 10));

      if (scheduleData.group_id) {
        // 스터디 일정 → 시간 포함
        setStartTime(scheduleData.start_time.slice(11, 16));
        setEndTime(scheduleData.end_time.slice(11, 16));
      }
    }
  }, [isUpdate, scheduleData]);

  // ================================
  // 3) 일정 저장 처리
  // ================================
  const handleSubmit = async () => {
    if (!title || !date) {
      alert("제목과 날짜는 필수입니다.");
      return;
    }

    let finalStart = null;
    let finalEnd = null;

    // ---------------------------
    // 스터디 일정 (create or update)
    // ---------------------------
    if (isStudyMode) {
      if (!startTime || !endTime) {
        alert("시작 시간과 종료 시간을 입력하세요.");
        return;
      }
      finalStart = `${date}T${startTime}:00`;
      finalEnd = `${date}T${endTime}:00`;
    }
    // ---------------------------
    // 개인 일정
    // ---------------------------
    else {
      finalStart = `${date}T00:00:00`;
      finalEnd = `${date}T23:59:59`;
    }

    // ---------------------------
    // body 생성 (update 포함)
    // ---------------------------
    const body = {
      title,
      description,
      location,
      start_time: finalStart,
      end_time: finalEnd,
      group_id: isStudyMode
        ? (isUpdate ? scheduleData.group_id : groupId)
        : null,
    };

    try {
      // -------------------------
      // UPDATE (PUT)
      // -------------------------
      if (isUpdate) {
        await api.put(`/study-schedules/${scheduleData.schedule_id}`, body);
        alert("일정이 수정되었습니다.");
      }
      // -------------------------
      // CREATE (스터디 일정)
      // -------------------------
      else if (isStudyMode) {
        await api.post(`/study-groups/${groupId}/schedules`, body);
        alert("스터디 일정이 생성되었습니다.");
      }
      // -------------------------
      // CREATE (개인 일정)
      // -------------------------
      else {
        await api.post(`/study-schedules`, body);
        alert("개인 일정이 생성되었습니다.");
      }

      onClose();
      if (onSuccess) onSuccess(); // 일정 리로드
    } catch (err) {
      console.error(err);
      alert("일정 저장 중 오류가 발생했습니다.");
    }
  };

  // ================================
  // 4) 모달 제목
  // ================================
  const modalTitle = isUpdate
    ? "일정 수정"
    : isStudyMode
    ? "새 스터디 일정 등록"
    : "새 일정 등록";

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="modal-dialog">
        <div className="modal-content">

          {/* HEADER */}
          <div className="modal-header">
            <h5 className="modal-title">{modalTitle}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          {/* BODY */}
          <div className="modal-body">

            {/* 제목 */}
            <label className="form-label">제목</label>
            <input
              className="form-control mb-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 스터디 발표 준비"
            />

            {/* 날짜 */}
            <label className="form-label">날짜</label>
            <input
              type="date"
              className="form-control mb-3"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            {/* 스터디 일정이면 시간 입력 */}
            {isStudyMode && (
              <>
                <label className="form-label">시작 시간</label>
                <input
                  type="time"
                  className="form-control mb-3"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />

                <label className="form-label">종료 시간</label>
                <input
                  type="time"
                  className="form-control mb-3"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </>
            )}

            {/* 설명 */}
            <label className="form-label">내용</label>
            <textarea
              className="form-control mb-3"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="메모 또는 설명을 입력하세요"
            />

            {/* 위치 */}
            <label className="form-label">장소 (선택)</label>
            <input
              className="form-control mb-3"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예: 서울 강남구 ..."
            />
          </div>

          {/* FOOTER */}
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              닫기
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {isUpdate ? "수정 완료" : "등록"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ScheduleCreateModal;
