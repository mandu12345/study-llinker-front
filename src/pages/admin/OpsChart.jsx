import React, { useState } from "react";
import OpsChartContent from "./OpsChartContent";  // ⭐ 핵심

// -----------------------------------------------------------------
// 💡 데이터 내보내기 모달
// -----------------------------------------------------------------
const ExportModal = ({ show, onClose, onConfirm }) => {
    if (!show) return null;

    return (
        <div 
            className="modal show" 
            tabIndex="-1" 
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">📊 통계 데이터 내보내기</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p>통계 데이터를 CSV 파일로 다운로드하시겠습니까?</p>
                        <small className="text-muted">실제 다운로드 기능은 여기서 구현됩니다.</small>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>취소</button>
                        <button className="btn btn-primary" onClick={onConfirm}>확인</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
// -----------------------------------------------------------------


const OpsChart = () => {
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // F-S-DA-001: 주요 통계 조회 데이터 (이것도 API로 대체 예정)
    const totalUsers = 1250;
    const activeStudies = 120;
    const newSignups = 55;

    const handleConfirmExport = () => {
        setIsExportModalOpen(false);
        alert("✅ 통계 데이터 다운로드를 시작합니다!");
    };

    return (
        <div>
            <h2>📊 운영 대시보드</h2>

            {/* 상단 요약 정보 */}
            <div className="alert alert-info d-flex justify-content-between mb-4">
                <p className="mb-0">총 회원: <strong>{totalUsers}명</strong></p>
                <p className="mb-0">활성 스터디: <strong>{activeStudies}개</strong></p>
                <p className="mb-0">신규 가입 (오늘): <strong>{newSignups}명</strong></p>

                <button className="btn btn-sm btn-primary" onClick={() => setIsExportModalOpen(true)}>
                    📥 데이터 내보내기
                </button>
            </div>

            {/* ⭐ 차트는 OpsChartContent 에서 렌더링됨 */}
            <OpsChartContent />

            {/* 모달 */}
            <ExportModal
                show={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onConfirm={handleConfirmExport}
            />
        </div>
    );
};

export default OpsChart;
