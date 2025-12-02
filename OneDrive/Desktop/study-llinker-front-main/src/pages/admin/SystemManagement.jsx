// src/pages/admin/SystemManagement.jsx

import React from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import NotificationManager from "./NotificationManager";
import api from "../../api/axios";
import { FaDatabase, FaBroom } from "react-icons/fa";

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
        <div className="card shadow-sm">
            <div className="card-header fw-bold">시스템 운영</div>

            <div className="card-body">

                <p className="text-muted mb-4">시스템 관리 작업을 수행할 수 있습니다.</p>

                <div className="row g-3">

                    {/* 백업 스냅샷 */}
                    <div className="col-md-6">
                        <div className="p-3 border rounded d-flex align-items-center justify-content-between bg-light">
                            <div>
                                <h6 className="mb-1 fw-bold">백업 스냅샷</h6>
                                <small className="text-muted">전체 시스템 백업 생성</small>
                            </div>
                            <button
                                className="btn btn-outline-primary"
                                onClick={handleBackup}
                            >
                                <FaDatabase size={18} className="me-1" />
                                실행
                            </button>
                        </div>
                    </div>

                    {/* 캐시 무효화 */}
                    <div className="col-md-6">
                        <div className="p-3 border rounded d-flex align-items-center justify-content-between bg-light">
                            <div>
                                <h6 className="mb-1 fw-bold">캐시 무효화</h6>
                                <small className="text-muted">시스템 전체 캐시 초기화</small>
                            </div>
                            <button
                                className="btn btn-outline-danger"
                                onClick={handleCacheInvalidate}
                            >
                                <FaBroom size={18} className="me-1" />
                                실행
                            </button>
                        </div>
                    </div>

                </div>
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
