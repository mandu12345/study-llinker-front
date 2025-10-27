// src/pages/admin/RecoManagement.jsx

import React, { useState } from "react";

const RecoManagement = () => {
    const [algorithm, setAlgorithm] = useState('CF_V1');
    const [monitoringData, setMonitoringData] = useState({ successRate: '75%', diversity: '4.2', usersMonitored: 500 });

    const handleAlgorithmChange = (e) => {
        setAlgorithm(e.target.value);
        alert("F-S-RM-001: 추천 알고리즘을 변경하고 저장합니다.");
        // 실제로는 API 호출 로직 추가
    };

    const handleMonitorRefresh = () => {
        // F-S-RM-002: 모니터링 데이터 새로고침
        setMonitoringData({ successRate: '78%', diversity: '4.5', usersMonitored: 520 });
        alert("F-S-RM-002: 추천 결과 모니터링 데이터를 새로 고침했습니다.");
    };

    return (
        <div className="reco-management">
            <h2>💡 추천 관리 </h2>

            {/* F-S-RM-001: 추천 알고리즘 설정 */}
            <div className="card mb-4">
                <div className="card-header">추천 알고리즘 설정</div>
                <div className="card-body">
                    <p>현재 적용 알고리즘: <strong>{algorithm}</strong></p>
                    <label className="form-label">새 알고리즘 선택 </label>
                    <select className="form-select w-50" value={algorithm} onChange={handleAlgorithmChange}>
                        <option value="CF_V1">협업 필터링 </option>
                        <option value="Hybrid_V2">하이브리드 모델 (Hybrid_V2)</option>
                        <option value="Popularity">인기 기반 (Popularity)</option>
                    </select>
                </div>
            </div>

            {/* F-S-RM-002: 추천 결과 모니터링 */}
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    추천 결과 모니터링 
                    <button className="btn btn-sm btn-outline-secondary" onClick={handleMonitorRefresh}>
                        새로 고침
                    </button>
                </div>
                <div className="card-body">
                    <p>매칭 성공률: <strong>{monitoringData.successRate}</strong></p>
                    <p>추천 다양성 지표: <strong>{monitoringData.diversity}</strong></p>
                    <p>모니터링 대상 사용자 수: <strong>{monitoringData.usersMonitored}명</strong></p>
                </div>
            </div>
        </div>
    );
};

export default RecoManagement;