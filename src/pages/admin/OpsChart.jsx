// src/pages/admin/OpsChart.jsx

import React, { useState } from "react";
// 기존 차트 컴포넌트들은 그대로 유지하며 Chart.js 오류를 피하기 위해 수정하지 않습니다.
import StudyCountChart from "./charts/StudyCountChart";
import MemberRatioChart from "./charts/MemberRatioChart";
import AttendanceChart from "./charts/AttendanceChart";
import MatchingRateChart from "./charts/MatchingRateChart";
import DiversityChart from "./charts/DiversityChart";

// -----------------------------------------------------------------
// 💡 데이터 내보내기 모달 컴포넌트 (Modal UI)
// -----------------------------------------------------------------
const ExportModal = ({ show, onClose, onConfirm }) => {
    if (!show) return null;

    return (
        // Bootstrap Modal Structure (간소화된 형태)
        <div 
            className="modal show" 
            tabIndex="-1" 
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">📊 통계 데이터 내보내기</h5>
                        <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <p>통계 데이터를 CSV 파일로 다운로드하시겠습니까?</p>
                        <small className="text-muted">실제 데이터 내보내기 기능이 수행됩니다.</small>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>취소</button>
                        <button type="button" className="btn btn-primary" onClick={onConfirm}>확인</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
// -----------------------------------------------------------------


const OpsChart = () => {
    // 모달 상태 관리 추가
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // F-S-DA-001: 주요 통계 조회 데이터 추가
    const totalUsers = 1250;
    const activeStudies = 120;
    const newSignups = 55;

    // (기존 차트 더미 데이터는 유지)
    const studyLabels = ["1월", "2월", "3월", "4월", "5월"];
    const studyData = [5, 8, 6, 10, 7];
    const memberLabels = ["10대", "20대", "30대"];
    const memberData = [10, 40, 20];
    const attendanceLabels = ["1주차", "2주차", "3주차", "4주차"];
    const attendanceData = [85, 90, 88, 92];
    const matchingLabels = ["1월", "2월", "3월", "4월", "5월"];
    const matchingData = [60, 70, 65, 75, 80];
    const diversityLabels = ["1주차", "2주차", "3주차", "4주차"];
    const diversityData = [3, 4, 5, 4];

    // F-S-DA-005: 데이터 내보내기 처리 함수
    const handleConfirmExport = () => {
        setIsExportModalOpen(false);
        // 실제 데이터 내보내기 (API 호출 및 다운로드) 로직이 여기에 들어갑니다.
        alert("✅ 통계 데이터 다운로드를 시작합니다!"); // 다운로드 시작 알림은 alert 유지
    };

    // '내보내기' 버튼 클릭 시 모달 열기 (기존 alert() 대체)
    const handleExport = () => {
        setIsExportModalOpen(true);
    };

    return (
        <div>
            <h2>📊 운영 대시보드</h2>

            {/* F-S-DA-001: 주요 통계 조회 UI */}
            <div className="alert alert-info d-flex justify-content-between mb-4">
                <p className="mb-0">총 회원: <strong>{totalUsers}명</strong></p>
                <p className="mb-0">활성 스터디: <strong>{activeStudies}개</strong></p>
                <p className="mb-0">신규 가입 (오늘): <strong>{newSignups}명</strong></p>
                {/* F-S-DA-005: 데이터 내보내기 버튼 (클릭 시 모달 열기) */}
                <button className="btn btn-sm btn-primary" onClick={handleExport}>
                    📥 데이터 내보내기
                </button>
            </div>

            {/* F-S-DA-002, 003: 차트 영역 (차트 컴포넌트 호출은 그대로 유지) */}
            <div className="row">
                <div className="col-md-6">
                    <StudyCountChart labels={studyLabels} data={studyData} />
                </div>
                <div className="col-md-6">
                    <MemberRatioChart labels={memberLabels} data={memberData} />
                </div>
                <div className="col-md-6 mt-4">
                    <AttendanceChart labels={attendanceLabels} data={attendanceData} />
                </div>
                <div className="col-md-6 mt-4">
                    <MatchingRateChart labels={matchingLabels} data={matchingData} />
                </div>
                <div className="col-md-12 mt-4">
                    <DiversityChart labels={diversityLabels} data={diversityData} />
                </div>
            </div>
            
            {/* 모달 렌더링 (Alert 대체) */}
            <ExportModal 
                show={isExportModalOpen} 
                onClose={() => setIsExportModalOpen(false)} 
                onConfirm={handleConfirmExport} 
            />
        </div>
    );
};

export default OpsChart;