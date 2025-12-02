// src/pages/main/ScheduleModals.jsx

import React, { useState } from "react";
import api from "../../api/axios";

// ---------------------------
// 리더용 스터디 일정 생성 모달
// ---------------------------
export const CreateLeaderScheduleModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    groupId: "",
    title: "",
    date: "",
    time: "",
    description: "",
    location: ""
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post(
        `/study-groups/${form.groupId}/schedules`,
        {
          title: form.title,
          description: form.description,
          start_time: form.date + "T" + (form.time || "00:00"),
          end_time: form.date + "T" + (form.time || "00:00"),
          location: form.location
        }
      );

      onCreated({
        id: res.data.schedule_id,
        groupId: form.groupId,
        title: form.title,
        content: form.description,
        location: form.location,
        date: new Date(res.data.start_time),
        lat: null,
        lng: null,
        isJoined: true
      });
      onClose();
    } catch (err) {
      console.error("등록 실패:", err);
    }
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
      <div className="modal-dialog">
        <form className="modal-content" onSubmit={submit}>
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">새 스터디 일정 등록</h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <input
              name="groupId"
              className="form-control mb-2"
              placeholder="그룹 ID"
              onChange={handleChange}
              required
            />
            <input
              name="title"
              className="form-control mb-2"
              placeholder="제목"
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="date"
              className="form-control mb-2"
              onChange={handleChange}
              required
            />
            <input
              type="time"
              name="time"
              className="form-control mb-2"
              onChange={handleChange}
            />
            <input
              name="location"
              className="form-control mb-2"
              placeholder="장소"
              onChange={handleChange}
            />
            <textarea
              name="description"
              className="form-control mb-2"
              placeholder="설명"
              rows={3}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary btn-sm" onClick={onClose}>취소</button>
            <button className="btn btn-success btn-sm" type="submit">등록</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------
// 일반 일정 생성 모달
// ---------------------------
export const CreateUserScheduleModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    description: "",
    location: ""
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/study-schedules", {
        title: form.title,
        description: form.description,
        start_time: form.date + "T" + (form.time || "00:00"),
        end_time: form.date + "T" + (form.time || "00:00"),
        location: form.location
      });

      onCreated({
        id: res.data.schedule_id,
        groupId: null,
        title: form.title,
        content: form.description,
        location: form.location,
        date: new Date(res.data.start_time),
        isJoined: true,
        lat: null,
        lng: null
      });

      onClose();
    } catch (err) {
      console.error("일정 추가 실패:", err);
    }
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
      <div className="modal-dialog">
        <form className="modal-content" onSubmit={submit}>
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title">새 일정 추가</h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <input
              name="title"
              className="form-control mb-2"
              placeholder="제목"
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="date"
              className="form-control mb-2"
              onChange={handleChange}
              required
            />
            <input
              type="time"
              name="time"
              className="form-control mb-2"
              onChange={handleChange}
            />
            <input
              name="location"
              className="form-control mb-2"
              placeholder="장소"
              onChange={handleChange}
            />
            <textarea
              name="description"
              className="form-control mb-2"
              placeholder="내용"
              rows={3}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary btn-sm" onClick={onClose}>취소</button>
            <button className="btn btn-success btn-sm" type="submit">등록</button>
          </div>
        </form>
      </div>
    </div>
  );
};
