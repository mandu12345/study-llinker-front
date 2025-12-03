import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const NotificationManager = () => {

  const [messageInput, setMessageInput] = useState("");
  const [targetUser, setTargetUser] = useState("all");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api
      .get("/admin/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("사용자 목록 불러오기 실패:", err));
  }, []);

  const handleSendNotification = () => {
    if (!messageInput.trim()) {
      alert("발송할 메시지를 입력해주세요.");
      return;
    }

    const payload = {
      type: "SYSTEM",
      message: messageInput,
      userIds: targetUser === "all" ? [] : [Number(targetUser)],
    };

    api
      .post('/admin/notifications', payload)
      .then(() => {
        alert("알림 발송 완료!");
        setMessageInput("");
        setTargetUser("all");
      })
      .catch((err) => console.error("알림 생성 실패:", err));
  };

  return (
    <div className="notification-manager">
      <h3>🔔 알림 발송</h3>

      <div className="card mb-4 shadow-sm">
        <div className="card-header fw-bold">강제 알림 발송</div>
        <div className="card-body">

          <textarea
            className="form-control mb-3"
            rows="2"
            placeholder="발송할 알림 내용을 입력하세요"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />

          <div className="d-flex justify-content-between align-items-center">

            <select
              className="form-select w-50 me-3"
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
            >
              <option value="all">전체 사용자</option>

              {users.map((u) => (
                <option key={u.userId} value={u.userId}>
                  {u.name} (ID: {u.userId})
                </option>
              ))}
            </select>

            <button className="btn btn-primary" onClick={handleSendNotification}>
              알림 즉시 발송
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationManager;
