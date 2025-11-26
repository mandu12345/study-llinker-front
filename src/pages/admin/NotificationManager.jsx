import React, { useState, useEffect } from 'react';
import api from "../../api/axios";

const NotificationManager = () => {
    const [alerts, setAlerts] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [targetUser, setTargetUser] = useState('all');

    // ----------------------------
    // ✅ 알림 전체 조회 (GET /notifications)
    // ----------------------------
    useEffect(() => {
        api.get('/notifications')
            .then(res => setAlerts(res.data))
            .catch(err => console.error("알림 조회 실패:", err));
    }, []);

    // ----------------------------
    // 📨 알림 발송 (POST /notifications)
    // ----------------------------
    const handleSendNotification = () => {
        if (!messageInput.trim()) {
            alert('발송할 메시지를 입력해주세요.');
            return;
        }

        const newAlert = {
            type: "SYSTEM",
            user: targetUser,
            message: messageInput
        };

        api.post('/notifications', newAlert)
            .then(res => {
                setAlerts([res.data, ...alerts]); // 새 알림 추가
                alert("알림 발송 완료!");
                setMessageInput("");
                setTargetUser("all");
            })
            .catch(err => console.error("알림 생성 실패:", err));
    };

    // ----------------------------
    // 👁 읽음 처리 (PATCH /notifications/{id}/read)
    // ----------------------------
    const markAsRead = (id) => {
        api.patch(`/notifications/${id}/read`)
            .then(() => {
                setAlerts(alerts.map(a =>
                    a.id === id ? { ...a, isRead: true } : a
                ));
            })
            .catch(err => console.error("읽음 처리 실패:", err));
    };

    // ----------------------------
    // 🗑 삭제 (DELETE /notifications/{id})
    // ----------------------------
    const deleteAlert = (id) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        api.delete(`/notifications/${id}`)
            .then(() => {
                setAlerts(alerts.filter(a => a.id !== id));
            })
            .catch(err => console.error("알림 삭제 실패:", err));
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'SCHEDULE': return '일정';
            case 'SYSTEM': return '시스템';
            case 'REQUEST': return '요청';
            default: return '일반';
        }
    };

    return (
        <div className="notification-manager">
            <h3>🔔 알림 발송 및 관리</h3>

            {/* 1. 강제 알림 발송 */}
            <div className="card mb-4 shadow-sm">
                <div className="card-header fw-bold">강제 알림 발송</div>
                <div className="card-body">
                    <textarea
                        className="form-control mb-3"
                        rows="2"
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
                            <option value="userA">userA</option>
                            <option value="user1">user1</option>
                        </select>

                        <button className="btn btn-primary" onClick={handleSendNotification}>
                            알림 즉시 발송
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. 알림 목록 */}
            <div className="card shadow-sm">
                <div className="card-header fw-bold">알림 목록 조회</div>
                <div className="card-body">
                    <table className="table table-sm table-striped">
                        <thead>
                            <tr>
                                <th>ID</th><th>유형</th><th>대상</th>
                                <th>메시지</th><th>날짜</th><th>상태</th><th>액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.map(a => (
                                <tr key={a.id}>
                                    <td>{a.id}</td>
                                    <td>{getTypeLabel(a.type)}</td>
                                    <td>{a.user}</td>
                                    <td>{a.message}</td>
                                    <td>{a.date}</td>
                                    <td>{a.isRead ? "읽음" : "안 읽음"}</td>
                                    <td>
                                        {!a.isRead && (
                                            <button
                                                className="btn btn-success btn-sm me-2"
                                                onClick={() => markAsRead(a.id)}
                                            >
                                                읽음 처리
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => deleteAlert(a.id)}
                                        >
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default NotificationManager;
