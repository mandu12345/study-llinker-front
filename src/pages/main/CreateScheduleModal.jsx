import React, { useState } from "react";
import api from "../../api/axios";

const CreateScheduleModal = ({ groupId, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    content: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.date || !form.startTime || !form.endTime) {
      alert("제목, 날짜, 시작/종료 시간은 필수 입력 항목입니다.");
      return;
    }

    const startDateTime = `${form.date}T${form.time}`;
    const endDateTime = `${form.date}T${form.endTime}`;

    const body = {
      groupId: Number(groupId),
      title: form.title,
      description: form.content || "",
      start_time: startDateTime,
      end_time: endDateTime,
      location: "", // 사용 안함, 기본 빈 값
    };

    try {
      const res = await api.post("/study-schedules", body);
      console.log("일정 생성 성공:", res.data);

      if (onSave) onSave(res.data); // 백엔드가 반환하는 일정 데이터 상위로 전달
      onClose();
    } catch (err) {
      console.error("일정 생성 오류:", err);
      alert("일정 생성 실패!");
    }
  };

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">새 일정 등록</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              {/* 제목 */}
              <input
                type="text"
                name="title"
                className="form-control mb-2"
                placeholder="제목 (30자 이내)"
                value={form.title}
                onChange={handleChange}
                maxLength={30}
              />

              {/* 날짜 */}
              <input
                type="date"
                name="date"
                className="form-control mb-2"
                value={form.date}
                onChange={handleChange}
              />

              {/* 시작 시간 */}
              <input
                type="time"
                name="startTime"
                className="form-control mb-2"
                value={form.startTime}
                onChange={handleChange}
              />

              {/* 종료 시간 */}
              <input
                type="time"
                name="endTime"
                className="form-control mb-2"
                value={form.endTime}
                onChange={handleChange}
              />

              {/* 내용 */}
              <textarea
                name="content"
                className="form-control mb-2"
                rows="3"
                placeholder="내용"
                value={form.content}
                onChange={handleChange}
              />
              <button type="submit" className="btn btn-success w-100">
                등록
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateScheduleModal;