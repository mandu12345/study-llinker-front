import React, { useState } from "react";

const CreateScheduleModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    content: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title || !form.date) {
      alert("제목과 날짜는 필수 입력 항목입니다.");
      return;
    }

    const newSchedule = {
      id: Date.now(),
      title: form.title,
      date: new Date(form.date + "T" + (form.time || "00:00")),
      location: form.location || "미정",
      content: form.content || "내용 없음",
      isJoined: true,
      leader: "홍길동",
    };

    onSave(newSchedule);
    onClose();
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
              <input
                type="text"
                name="title"
                className="form-control mb-2"
                placeholder="제목 (30자 이내)"
                value={form.title}
                onChange={handleChange}
                maxLength={30}
              />
              <input
                type="date"
                name="date"
                className="form-control mb-2"
                value={form.date}
                onChange={handleChange}
              />
              <input
                type="time"
                name="time"
                className="form-control mb-2"
                value={form.time}
                onChange={handleChange}
              />
              <input
                type="text"
                name="location"
                className="form-control mb-2"
                placeholder="장소"
                value={form.location}
                onChange={handleChange}
              />
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