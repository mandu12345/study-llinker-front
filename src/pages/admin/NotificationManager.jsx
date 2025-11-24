import React, { useState } from 'react';

const dummyAlerts = [
    { id: 1, type: "SCHEDULE", user: "testuser", message: "스터디 일정이 곧 시작됩니다.", date: "2025-10-29", isRead: false },
    { id: 2, type: "SYSTEM", user: "all", message: "서버 점검 예정 안내.", date: "2025-10-28", isRead: true },
    { id: 3, type: "REQUEST", user: "admin", message: "그룹 승인 요청이 도착했습니다.", date: "2025-10-27", isRead: false },
];

const NotificationManager = () => {
    const [alerts, setAlerts] = useState(dummyAlerts);
    const [messageInput, setMessageInput] = useState('');
    const [targetUser, setTargetUser] = useState('all'); // 대상 사용자 선택 (all 또는 user ID)

    // 알림 유형 한글 변환
    const getTypeLabel = (type) => {
        switch (type) {
            case 'SCHEDULE': return '일정';
            case 'SYSTEM': return '시스템';
            case 'REQUEST': return '요청';
            default: return '일반';
        }
    };

    // F-S-AM-002: 강제 알림 발송 (Alert 대신 콘솔 로그 사용)
    const handleSendNotification = () => {
        if (!messageInput.trim()) {
            alert('발송할 메시지를 입력해주세요.');
            return;
        }

        const newAlert = {
            id: Date.now(),
            type: 'SYSTEM',
            user: targetUser === 'all' ? '전체' : targetUser,
            message: messageInput,
            date: new Date().toLocaleDateString(),
            isRead: false,
        };

        // 목록에 추가 (더미)
        setAlerts([newAlert, ...alerts]); 
        
        // 실제로는 백엔드 API 호출하여 DB에 저장 및 발송
        alert(`✅ 알림 발송 완료! 대상: ${targetUser === 'all' ? '전체 사용자' : targetUser}`);
        setMessageInput('');
        setTargetUser('all');
    };

    return (
        <div className="notification-manager">
            <h3>🔔 알림 발송 및 관리</h3>
            
            {/* 1. 알림 발송 영역 (F-S-AM-002) */}
            <div className="card mb-4 shadow-sm">
                <div className="card-header fw-bold">강제 알림 발송</div>
                <div className="card-body">
                    <div className="mb-3">
                        <label className="form-label">메시지 내용</label>
                        <textarea 
                            className="form-control" 
                            rows="2" 
                            placeholder="사용자에게 보낼 시스템 알림 내용을 입력하세요."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                        />
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="w-50 me-3">
                            <label className="form-label">발송 대상</label>
                            <select 
                                className="form-select"
                                value={targetUser}
                                onChange={(e) => setTargetUser(e.target.value)}
                            >
                                <option value="all">전체 사용자</option>
                                <option value="user1">user1 (개별 사용자)</option>
                                <option value="userA">userA (개별 사용자)</option>
                            </select>
                        </div>
                        <button className="btn btn-primary mt-3" onClick={handleSendNotification}>
                            알림 즉시 발송
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. 알림 목록 조회 영역 (F-S-AM-001) */}
            <div className="card shadow-sm">
                <div className="card-header fw-bold">알림 목록 조회</div>
                <div className="card-body">
                    <table className="table table-sm table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>유형</th>
                                <th>대상</th>
                                <th>메시지</th>
                                <th>발송일</th>
                                <th>읽음 여부</th>
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
                                    <td>{a.isRead ? '✅ 읽음' : '❌ 안 읽음'}</td>
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
