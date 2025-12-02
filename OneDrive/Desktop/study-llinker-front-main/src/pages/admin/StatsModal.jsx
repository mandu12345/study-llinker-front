import React from 'react';
import OpsChartContent from './OpsChartContent';

const StatsModal = ({ show, onClose }) => {
    if (!show) return null;

    // 모달 UI는 Bootstrap Modal 스타일을 가정합니다.
    return (
        <div 
            className="modal show" 
            tabIndex="-1" 
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
            {/* 모달 크기를 크게 설정 (modal-lg) */}
            <div className="modal-dialog modal-xl"> 
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">그룹 운영 상세 통계 (OpsChart 통합)</h5>
                        <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        {/* OpsChartContent 컴포넌트를 모달 내부에 렌더링 */}
                        <OpsChartContent /> 
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>닫기</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsModal;
