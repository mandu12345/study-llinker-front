// src/pages/admin/SystemManagement.jsx

import React from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import NotificationManager from "./NotificationManager";
import api from "../../api/axios";

// -----------------------------------------------------------------
// 시스템 운영 컴포넌트
// -----------------------------------------------------------------
const SystemOperator = () => {

    const handleBackup = async () => {
        try {
            await api.post("/system/backup");
            alert("백업 스냅샷 생성 완료!");
        } catch (err) {
            console.error(err);
            alert("백업 스냅샷 생성 실패");
        }
    };

    const handleCacheInvalidate = async () => {
        try {
            await api.post("/system/cache/clear");
            alert("캐시 무효화 완료!");
        } catch (err) {
            console.error(err);
            alert("캐시 무효화 실패");
        }
    };

    return (
        <div className="card">
            <div className="card-header">시스템 운영</div>
            <div className="card-body d-flex flex-column">
                <p className="text-muted">시스템 운영에 필요한 기능들입니다.</p>

                <button className="btn btn-warning mb-3" onClick={handleBackup}>
                    백업 스냅샷 관리
                </button>

                <button className="btn btn-danger" onClick={handleCacheInvalidate}>
                    캐시 무효화 버튼
                </button>
            </div>
        </div>
    );
};

// -----------------------------------------------------------------
// 시스템 관리 메인 컴포넌트
// -----------------------------------------------------------------
const SystemManagement = () => {
    const location = useLocation();

    const getActiveLinkClass = (pathSegment) => {
        return location.pathname.includes(pathSegment) ? "active" : "";
    };

    return (
        <div className="system-management">
            <h2>⚙️ 시스템 관리</h2>

            {/* 탭 네비게이션 */}
            <ul className="nav nav-tabs mb-4">

                <li className="nav-item">
                    <Link
                        to="/admin/system/system-op"
                        className={`nav-link ${getActiveLinkClass("system-op")}`}
                    >
                        시스템 운영
                    </Link>
                </li>

                <li className="nav-item">
                    <Link
                        to="/admin/system/notifications"
                        className={`nav-link ${getActiveLinkClass("notifications")}`}
                    >
                        알림 관리
                    </Link>
                </li>

            </ul>

            {/* 라우팅 */}
            <Routes>

                {/* ⭐ index일 때 자동으로 /system-op 로 이동 ⭐ */}
                <Route index element={<Navigate to="system-op" replace />} />

                <Route path="system-op" element={<SystemOperator />} />
                <Route path="notifications" element={<NotificationManager />} />
            </Routes>
        </div>
    );
};

export default SystemManagement;
