// src/components/ScheduleCreateModal.jsx
import React, { useState, useEffect } from "react";
import api from "../api/axios";

const ScheduleCreateModal = ({
  mode,               // "study" | "personal" | "update"
  groupId = null,
  baseDate = null,    // YYYY-MM-DD
  scheduleData = null,
  onClose,
  onSuccess,
}) => {

  const isUpdate = mode === "update";

  // 🔥 수정: group_id 대신 camelCase groupId 도 체크
  const isStudyMode =
    mode === "study" || (isUpdate && (scheduleData?.group_id || scheduleData?.groupId));

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const [date, setDate] = useState(baseDate || "");
  const [time, setTime] = useState("");

  // -------------------------------
  // 🔥 수정 모드일 때 기존 일정 값 세팅 (camelCase 대응)
  // -------------------------------
  useEffect(() => {
    if (isUpdate && scheduleData) {
      const start =
        scheduleData.start_time ?? // snake_case 지원
        scheduleData.startTime ??  // camelCase 지원
        null;

      setTitle(scheduleData.title);
      setDescription(scheduleData.description || "");
      setLocation(scheduleData.location || "");
      setDate(start ? start.slice(0, 10) : "");
      setTime(start ? start.slice(11, 16) : "");
    }
  }, [isUpdate, scheduleData]);

  // -------------------------------
  // 저장(등록·수정)
  // -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !date) {
      alert("제목과 날짜를 입력하세요.");
      return;
    }

    const finalTime = time || "00:00";
    const startTime = `${date}T${finalTime}`;
    const endTime = `${date}T${finalTime}`;

    const body = {
      title,
      description,
      location,
      startTime,
      endTime,
    };

    try {
      // -------------------------------
      // 🔥 UPDATE 모드
      // -------------------------------
      if (isUpdate) {
        // 🔥 FIX: ID가 scheduleId(camelCase)로 오므로 보정
        const id =
          scheduleData.schedule_id ??
          scheduleData.scheduleId ??
          scheduleData.id;

        if (!id) {
          console.error("❌ 일정 수정 실패: schedule ID 없음 → scheduleData:", scheduleData);
          alert("수정할 일정 ID를 찾을 수 없습니다.");
          return;
        }

        await api.put(`/study-schedules/${id}`, body);
        alert("일정 수정 완료");
      }

      // -------------------------------
      // CREATE — 스터디 일정
      // -------------------------------
      else if (isStudyMode) {
        await api.post(`/study-groups/${groupId}/schedules`, body);
        alert("스터디 일정 등록 완료");
      }

      // -------------------------------
      // CREATE — 개인 일정
      // -------------------------------
      else {
        await api.post(`/study-schedules`, body);
        alert("개인 일정 등록 완료");
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("일정 저장 실패:", err);
      alert("일정 저장 실패");
    }
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
      <div className="modal-dialog">
        <form className="modal-content" onSubmit={handleSubmit}>
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              {isUpdate
                ? "일정 수정"
                : isStudyMode
                ? "새 스터디 일정 등록"
                : "새 일정 등록"}
            </h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body">

            <input
              className="form-control mb-2"
              value={title}
              placeholder="제목"
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <input
              type="date"
              className="form-control mb-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            {isStudyMode && (
              <input
                type="time"
                className="form-control mb-2"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            )}

            <input
              className="form-control mb-2"
              value={location}
              placeholder="장소"
              onChange={(e) => setLocation(e.target.value)}
            />

            <textarea
              className="form-control mb-2"
              rows={3}
              value={description}
              placeholder="설명"
              onChange={(e) => setDescription(e.target.value)}
            />

          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              취소
            </button>
            <button className="btn btn-success btn-sm" type="submit">
              {isUpdate ? "수정 완료" : "등록"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ScheduleCreateModal;
