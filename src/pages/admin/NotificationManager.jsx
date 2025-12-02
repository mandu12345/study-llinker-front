import React, { useState } from 'react';
import api from "../../api/axios";

const NotificationManager = () => {

    // 메시지 입력
    const [messageInput, setMessageInput] = useState('');
    const [targetUser, setTargetUser] = useState('all');

    // ----------------------------
    // 📨 알림 발송 (POST /api/notifications)
    // ----------------------------
    const handleSendNotification = () => {
        if (!messageInput.trim()) {
            alert('발송할 메시지를 입력해주세요.');
            return;
        }

        const newAlert = {
            type: "SYSTEM",
            userId: targetUser === "all" ? null : Number(targetUser),
            message: messageInput
        };

        api.post('/notifications', newAlert)
            .then(() => {
                alert("알림 발송 완료!");
                setMessageInput("");
                setTargetUser("all");
            })
            .catch(err => console.error("알림 생성 실패:", err));
    };

    return (
        <div className="notification-manager">
            <h3>🔔 알림 발송</h3>

            {/* 1. 강제 알림 발송 */}
            <div className="card mb-4 shadow-sm">
                <div className="card-header fw-bold">강제 알림 발송</div>
                <div className="card-body">
                    <textarea
                        className="form-control mb-3"
                        rows="2"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="발송할 알림 내용을 입력하세요"
                    />

                    <div className="d-flex justify-content-between align-items-center">
                        <select
                            className="form-select w-50 me-3"
                            value={targetUser}
                            onChange={(e) => setTargetUser(e.target.value)}
                        >
                            <option value="all">전체 사용자</option>
                            <option value="1">userId 1</option>
                            <option value="2">userId 2</option>
                            <option value="3">userId 3</option>
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
