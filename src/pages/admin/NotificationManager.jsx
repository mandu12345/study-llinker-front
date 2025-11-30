import React, { useState, useEffect } from 'react';
import api from "../../api/axios";

const NotificationManager = () => {
    // ⭐ 테스트용 더미 알림 데이터
    const dummyAlerts = [
        {
            notificationId: 1,
            userId: 1,
            message: "테스트 알림 1",
            type: "SYSTEM",
            isRead: false,
            createdAt: "2025-01-01T10:00:00"
        },
        {
            notificationId: 2,
            userId: 2,
            message: "스터디 일정이 변경되었습니다.",
            type: "SCHEDULE",
            isRead: true,
            createdAt: "2025-01-02T12:30:00"
        },
        {
            notificationId: 3,
            userId: 3,
            message: "가입 요청이 도착했습니다.",
            type: "REQUEST",
            isRead: false,
            createdAt: "2025-01-03T15:20:00"
        }
    ];

    const [alerts, setAlerts] = useState(dummyAlerts); // 초기값 = 더미 데이터
    const [messageInput, setMessageInput] = useState('');
    const [targetUser, setTargetUser] = useState('all');

    // ----------------------------
    // ✅ 알림 전체 조회 (GET /api/notifications)
    // ----------------------------
    useEffect(() => {
        api.get('/notifications')
            .then(res => {
                if (Array.isArray(res.data) && res.data.length > 0) {
                    setAlerts(res.data);
                } else {
                    console.warn("백엔드 알림이 비어 있음 → 더미 유지");
                }
            })
            .catch(err => {
                console.error("알림 조회 실패 → 더미데이터 유지:", err);
            });
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleString("ko-KR");
    };

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
            userId: targetUser === "all" ? 1 : Number(targetUser),
            message: messageInput
        };

        api.post('/notifications', newAlert)
            .then(res => {
                setAlerts([res.data, ...alerts]);
                alert("알림 발송 완료!");
                setMessageInput("");
                setTargetUser("all");
            })
            .catch(err => console.error("알림 생성 실패:", err));
    };

    // ----------------------------
    // 👁 읽음 처리
    // ----------------------------
    const markAsRead = (notificationId) => {
    api.patch(`/notifications/${notificationId}/read`)
        .then((res) => {
            const updated = res.data; // 백엔드 응답 NotificationResponse

            setAlerts(prev =>
                prev.map(a =>
                    a.notificationId === notificationId ? updated : a
                )
            );
        })
        .catch(err => console.error("읽음 처리 실패:", err));
};

    // ----------------------------
    // 🗑 삭제
    // ----------------------------
    const deleteAlert = (notificationId) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        api.delete(`/notifications/${notificationId}`)
            .then(() => {
                setAlerts(alerts.filter(a => a.notificationId !== notificationId));
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
                            <option value="all">전체 사용자(더미)</option>
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

            {/* 2. 알림 목록 */}
            <div className="card shadow-sm">
                <div className="card-header fw-bold">알림 목록 조회</div>
                <div className="card-body">
                    <table className="table table-sm table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>유형</th>
                                <th>대상(userId)</th>
                                <th>메시지</th>
                                <th>날짜</th>
                                <th>상태</th>
                                <th>액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.map(a => (
                                <tr key={a.notificationId}>
                                    <td>{a.notificationId}</td>
                                    <td>{getTypeLabel(a.type)}</td>
                                    <td>{a.userId}</td>
                                    <td>{a.message}</td>
                                    <td>{formatDate(a.createdAt)}</td>
                                    <td>{a.isRead ? "읽음" : "안 읽음"}</td>
                                    <td>
                                        {!a.isRead && (
                                            <button
                                                className="btn btn-secondary btn-sm me-2"
                                                onClick={() => markAsRead(a.notificationId)}
                                            >
                                                읽음 처리
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => deleteAlert(a.notificationId)}
                                        >
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* 비어 있을 경우 대비 */}
                    {alerts.length === 0 && (
                        <p className="text-muted">알림이 없습니다. (더미 사용됨)</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationManager;
